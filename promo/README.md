# Manager Voyage promo: motion-graphics build

Typography and motion only, no footage. `build.py` reads the narration word
timings (`words.json`, produced by Whisper from the Emmett narration) and
writes `index.html`, a 1920 by 1080 page where every element sits on the
narration's timeline and `window.seek(t)` scrubs it. `render.js` drives
headless Chromium through the page one frame at a time at 30 fps; ffmpeg then
muxes the frames with the narration (offset 2.5 s).

```
python3 build.py
NODE_PATH=/usr/local/lib/node_modules node render.js all 95.84
ffmpeg -framerate 30 -i frames/f%05d.jpg -i narration.wav \
  -filter_complex "[1:a]adelay=2500|2500,aresample=48000,apad,afade=t=out:st=94.6:d=1.2[a]" \
  -map 0:v -map "[a]" -t 95.84 -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k motion.mp4
```

Fonts expected beside `index.html`: Playfair Display (upright and italic),
Oswald, Inter, all OFL. The script and scene plan are in
`docs/PROMO-VIDEO-BRIEF.md`.
