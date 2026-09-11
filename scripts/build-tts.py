#!/usr/bin/env python3
"""Generate the Foundation course narration with ElevenLabs and build the course
media from it. Runs in GitHub Actions (.github/workflows/build-tts.yml) with the
ELEVENLABS_API_KEY secret. Reads the voice and settings from .github/tts.json
and every script from foundation/narration-scripts.js (MV_NARR for the page,
tab, card and situation clips; MV_VIDEO_NARR for the six videos).

Raw ElevenLabs files are kept in assets/audio/foundation/source/ with a hash of
the text and settings in .github/tts-cache.json, so a re-run only pays for
clips whose script or voice changed. The processed course files come from
scripts/build-media.py, fed a manifest whose sources are the raw files."""
import hashlib, json, os, subprocess, sys, time, urllib.request, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = json.load(open(os.path.join(ROOT, '.github', 'tts.json')))
MAN = json.load(open(os.path.join(ROOT, '.github', 'media-urls.json')))
CACHE_P = os.path.join(ROOT, '.github', 'tts-cache.json')
SRC = os.path.join(ROOT, 'assets', 'audio', 'foundation', 'source')
os.makedirs(SRC, exist_ok=True)
KEY = os.environ.get('ELEVENLABS_API_KEY', '').strip()

def scripts():
    js = "const vm=require('vm'),fs=require('fs');const w={};vm.runInNewContext(fs.readFileSync(%r,'utf8'),{window:w});console.log(JSON.stringify({narr:w.MV_NARR||{},video:w.MV_VIDEO_NARR||{}}))" % os.path.join(ROOT, 'foundation', 'narration-scripts.js')
    return json.loads(subprocess.run(['node', '-e', js], check=True, stdout=subprocess.PIPE, text=True).stdout)

def sig(text):
    return hashlib.sha256(json.dumps([CFG['voice_id'], CFG['model_id'], CFG.get('output_format'), CFG.get('voice_settings'), text], sort_keys=True).encode()).hexdigest()

def speak(text, dest):
    if not KEY: raise SystemExit('ELEVENLABS_API_KEY is not set. Add it as a repository secret (Settings > Secrets and variables > Actions).')
    url = 'https://api.elevenlabs.io/v1/text-to-speech/%s?output_format=%s' % (CFG['voice_id'], CFG.get('output_format', 'mp3_44100_192'))
    body = json.dumps({'text': text, 'model_id': CFG['model_id'], 'voice_settings': CFG.get('voice_settings') or {}}).encode()
    req = urllib.request.Request(url, data=body, headers={'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=180) as r, open(dest, 'wb') as f: f.write(r.read())
            if os.path.getsize(dest) > 1000: return
        except urllib.error.HTTPError as e:
            msg = e.read()[:400].decode('utf-8', 'replace')
            if e.code in (401, 403): raise SystemExit('ElevenLabs refused the key (%d): %s' % (e.code, msg))
            if e.code == 402 or 'quota' in msg.lower(): raise SystemExit('ElevenLabs quota exhausted: ' + msg)
            sys.stderr.write('attempt %d failed (%d): %s\n' % (attempt + 1, e.code, msg))
        except Exception as e:
            sys.stderr.write('attempt %d failed: %s\n' % (attempt + 1, e))
        time.sleep(3 * (attempt + 1))
    raise SystemExit('could not generate ' + dest)

S = scripts()
cache = json.load(open(CACHE_P)) if os.path.exists(CACHE_P) else {}
jobs = [('audio', k.replace('/', '-'), t) for k, t in S['narr'].items()] + [('video', n, S['video'][n]) for n in MAN.get('videos', {}) if n in S['video']]
made, kept = [], []
for kind, key, text in jobs:
    fname = ('video-' + key if kind == 'video' else key) + '.mp3'
    dest = os.path.join(SRC, fname)
    h = sig(text)
    if cache.get(fname) == h and os.path.isfile(dest): kept.append(fname); continue
    speak(text, dest); cache[fname] = h; made.append(fname)
    time.sleep(0.5)
json.dump(cache, open(CACHE_P, 'w'), indent=1, sort_keys=True)
print('generated %d, unchanged %d' % (len(made), len(kept)))
for f in made: print('  new', f)

# hand the raw files to the media build through a manifest whose sources are local paths
m = json.loads(json.dumps(MAN))
for kind, key, text in jobs:
    if kind == 'audio': m['audio'][key] = os.path.join(SRC, key + '.mp3')
    else: m['videos'][key]['narration'] = os.path.join(SRC, 'video-' + key + '.mp3')
m['audio_filter'] = CFG.get('audio_filter', '')
for k in list(m['audio']):
    if not (m['audio'][k].startswith('https://') or os.path.isfile(m['audio'][k])): del m['audio'][k]
mp = os.path.join(tempfile.mkdtemp(prefix='mv-tts-'), 'manifest.json')
json.dump(m, open(mp, 'w'))
env = dict(os.environ, MV_MANIFEST=mp)
subprocess.run([sys.executable, os.path.join(ROOT, 'scripts', 'build-media.py')], check=True, env=env)
