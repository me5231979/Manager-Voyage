#!/usr/bin/env python3
"""Fetch the Runway-generated media for the Foundation course and build the
course files from it. Runs in GitHub Actions (.github/workflows/fetch-media.yml)
because the signed Runway URLs expire within a day and the session that
generates them cannot reach the CDN. Input: .github/media-urls.json.

  audio.<key>            -> assets/audio/foundation/<key>.mp3   (page narration)
  videos.<name>.clips[]  -> concatenated, narration muxed in     -> assets/video/foundation/<name>.mp4
  videos.<name>.narration, videos.<name>.text (captions)          assets/img/foundation/<name>-poster.jpg, assets/video/foundation/<name>.vtt

Needs ffmpeg and ffprobe on PATH. Safe to re-run: existing outputs are rebuilt
only for entries whose URL is present in the JSON (a placeholder that is not
an https URL is skipped)."""
import json, os, subprocess, sys, tempfile, urllib.request, time, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J = os.path.join(ROOT, '.github', 'media-urls.json')
AUD = os.path.join(ROOT, 'assets', 'audio', 'foundation')
VID = os.path.join(ROOT, 'assets', 'video', 'foundation')
IMG = os.path.join(ROOT, 'assets', 'img', 'foundation')
for d in (AUD, VID, IMG): os.makedirs(d, exist_ok=True)
TMP = tempfile.mkdtemp(prefix='mv-media-')

def run(*cmd):
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stdout[-4000:] + '\n'); raise SystemExit('command failed: ' + ' '.join(cmd[:3]))
    return r.stdout

def fetch(url, dest):
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'manager-voyage-media/1.0'})
            with urllib.request.urlopen(req, timeout=120) as r, open(dest, 'wb') as f:
                shutil.copyfileobj(r, f)
            if os.path.getsize(dest) > 1000: return True
        except Exception as e:
            sys.stderr.write('fetch failed (%s): %s\n' % (attempt + 1, e))
        time.sleep(2 ** attempt)
    return False

def duration(path):
    out = run('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', path)
    return float(out.strip())

def is_url(u): return isinstance(u, str) and u.startswith('https://')

data = json.load(open(J))
built, skipped = [], []

for key, url in (data.get('audio') or {}).items():
    if not is_url(url): skipped.append('audio ' + key); continue
    raw = os.path.join(TMP, key + '.raw.mp3')
    if not fetch(url, raw): skipped.append('audio ' + key + ' (download failed)'); continue
    out = os.path.join(AUD, key + '.mp3')
    # consistent loudness for the Listen button, small file
    run('ffmpeg', '-y', '-v', 'error', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', '-b:a', '96k', out)
    built.append('audio ' + key)

def vtt_time(t):
    h = int(t // 3600); m = int(t % 3600 // 60); sec = t % 60
    return '%02d:%02d:%06.3f' % (h, m, sec)

def write_captions(text, start, dur, path):
    """Split the narration into caption cues (sentence ends, then commas
    inside long sentences), 45 to 110 characters each, timed in proportion
    to their length across the measured narration duration."""
    import re
    sents = [p.strip() for p in re.split(r'(?<=[.!?])\s+', text.strip()) if p.strip()]
    chunks = []
    for snt in sents:
        if len(snt) <= 110: chunks.append(snt); continue
        buf = ''
        for piece in re.split(r'(?<=[,;:])\s+', snt):
            if buf and len(buf) + 1 + len(piece) > 110: chunks.append(buf); buf = piece
            else: buf = (buf + ' ' + piece).strip()
        if buf: chunks.append(buf)
    cues, buf = [], ''
    for c in chunks:
        if buf and len(buf) + 1 + len(c) <= 110 and len(buf) < 45: buf = buf + ' ' + c
        else:
            if buf: cues.append(buf)
            buf = c
    if buf: cues.append(buf)
    total = sum(len(c) for c in cues) or 1
    t = start
    with open(path, 'w') as f:
        f.write('WEBVTT\n\n')
        for i, c in enumerate(cues):
            d = dur * len(c) / total
            f.write('%d\n%s --> %s\n%s\n\n' % (i + 1, vtt_time(t), vtt_time(t + d - 0.05), c))
            t += d

for name, spec in (data.get('videos') or {}).items():
    clips = [c for c in (spec.get('clips') or [])]
    narr = spec.get('narration')
    if not clips or not all(is_url(c) for c in clips) or not is_url(narr):
        skipped.append('video ' + name + ' (urls incomplete)'); continue
    parts = []
    ok = True
    for i, c in enumerate(clips):
        p = os.path.join(TMP, '%s-%d.mp4' % (name, i))
        if not fetch(c, p): ok = False; break
        n = os.path.join(TMP, '%s-%d.norm.mp4' % (name, i))
        # fit every clip to 1280x720; a clip that is not 16:9 (a photo animated
        # from a square or 4:3 picture) sits on a blurred, enlarged copy of
        # itself instead of black bars, so the frame stays full
        run('ffmpeg', '-y', '-v', 'error', '-i', p, '-an', '-filter_complex',
            '[0:v]split=2[a][b];[a]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,boxblur=24:4,eq=brightness=-0.08[bg];[b]scale=1280:720:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,fps=24,format=yuv420p[v]',
            '-map', '[v]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', n)
        parts.append(n)
    npath = os.path.join(TMP, name + '.narr.mp3')
    if not ok or not fetch(narr, npath): skipped.append('video ' + name + ' (download failed)'); continue
    lst = os.path.join(TMP, name + '.txt')
    with open(lst, 'w') as f:
        for p in parts: f.write("file '%s'\n" % p)
    cat = os.path.join(TMP, name + '.cat.mp4')
    run('ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', cat)
    vd, nd = duration(cat), duration(npath)
    lead, tail = 0.8, 1.2
    total = nd + lead + tail
    # the narration is the spine. Footage never loops: the manifest carries enough
    # clips to cover it, an imperceptible slow-down (at most 8 percent) closes a
    # small gap, and if a video still falls short the last frame holds and the
    # build prints a warning so more clips get added.
    stretch = min(max(total / vd, 1.0), 1.08)
    if stretch > 1.005:
        slow = os.path.join(TMP, name + '.slow.mp4')
        run('ffmpeg', '-y', '-v', 'error', '-i', cat, '-vf', 'setpts=%.4f*PTS,fps=24' % stretch, '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', slow)
        cat = slow; vd = duration(cat)
    short = max(total - vd, 0)
    if short > 0.5:
        sys.stderr.write('WARNING: %s footage is %.1fs short of its narration; holding the last frame. Add a clip.\n' % (name, short))
    fade = max(total - 0.8, 0)
    out = os.path.join(VID, name + '.mp4')
    run('ffmpeg', '-y', '-v', 'error', '-i', cat, '-i', npath,
        '-filter_complex', '[1:a]adelay=%d|%d,loudnorm=I=-16:TP=-1.5:LRA=11,apad,afade=t=out:st=%.2f:d=0.8[a];[0:v]tpad=stop_mode=clone:stop_duration=%.2f,fade=t=in:d=0.6,fade=t=out:st=%.2f:d=0.8[v]' % (int(lead * 1000), int(lead * 1000), fade, short + 1.0, fade),
        '-map', '[v]', '-map', '[a]', '-t', '%.2f' % total,
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out)
    run('ffmpeg', '-y', '-v', 'error', '-ss', '1.5', '-i', out, '-frames:v', '1', '-q:v', '3', os.path.join(IMG, name + '-poster.jpg'))
    if spec.get('text'):
        write_captions(spec['text'], lead, nd, os.path.join(VID, name + '.vtt'))
    built.append('video %s (%.1fs narration, %d clip%s = %.0fs footage, x%.2f%s)' % (name, total, len(parts), '' if len(parts) == 1 else 's', vd / stretch, stretch, ', last frame held %.1fs' % short if short > 0.5 else ''))

shutil.rmtree(TMP, ignore_errors=True)
print('Built:\n  ' + '\n  '.join(built) if built else 'Built: nothing')
if skipped: print('Skipped:\n  ' + '\n  '.join(skipped))
