#!/usr/bin/env python3
"""Builds index.html: a time-driven motion-graphics film for Manager Voyage.
Every element is placed on an absolute timeline (seconds of video) derived from
the narration word timings in words.json. window.seek(t) scrubs the page."""
import json, re, html

PRE = 2.5  # narration starts at 2.5 s of video
W = json.load(open("words.json"))
NORM = [re.sub(r"[^a-z0-9']", "", w[2].lower()) for w in W]

def at(phrase, nth=1, end=False):
    """Video time of the first word of `phrase` (transcript spelling)."""
    want = [re.sub(r"[^a-z0-9']", "", p.lower()) for p in phrase.split()]
    n = 0
    for i in range(len(NORM) - len(want) + 1):
        if NORM[i:i + len(want)] == want:
            n += 1
            if n == nth:
                return round((W[i + len(want) - 1][1] if end else W[i][0]) + PRE, 2)
    raise SystemExit("phrase not found: " + phrase)

NARR_END = round(W[-1][1] + PRE, 2)   # 88.64
END_CARD = round(NARR_END + 0.6, 2)   # 89.24
TOTAL = round(END_CARD + 6.6, 2)      # 95.84

parts = []
def add(s): parts.append(s)
def esc(s): return html.escape(s, quote=False)

def el(cls, text, d, o, tag="div", style="", anim=None):
    a = f' data-anim="{anim}"' if anim else ""
    return f'<{tag} class="a {cls}" style="--d:{d}s;--o:{o}s;{style}"{a}>{text}</{tag}>'

def eyebrow(text, d, o, style=""): return el("eyebrow", esc(text), d, o, style=style)
def words(sentence, times, o, cls="hero", gold=None):
    """One word per span, each entering at its own time."""
    out = []
    for i, w in enumerate(sentence.split()):
        g = ' gold' if gold and w.strip(".,?") == gold else ''
        out.append(f'<span class="a w{g}" style="--d:{times[i]}s;--o:{o}s">{esc(w)}</span>')
    return f'<p class="{cls}">' + " ".join(out) + "</p>"

def wtimes(phrase, count):
    """Start times of `count` consecutive words beginning at `phrase`."""
    want = [re.sub(r"[^a-z0-9']", "", p.lower()) for p in phrase.split()]
    for i in range(len(NORM)):
        if NORM[i:i + len(want)] == want:
            return [round(W[i + k][0] + PRE, 2) for k in range(count)]
    raise SystemExit("phrase not found: " + phrase)

# ───────────────────────── scenes ─────────────────────────
# S0 hook
t_lock = at("manager voyage is")
o0 = round(t_lock - 0.25, 2)
add('<section class="sc center">')
add(words("Nobody becomes a manager by accident.", wtimes("nobody becomes", 6), o0, cls="hero sm"))
add(words("But almost everyone becomes one without a map.", wtimes("but almost", 8), o0, cls="hero sm", gold="map"))
add('</section>')

# S1 lockup
o1 = round(at("it starts with") - 0.2, 2)
add('<section class="sc center">')
add(eyebrow("Vanderbilt University   ·   Futures Learning Hub", t_lock, o1))
add(f'<div class="lock">{el("lw", "Manager", t_lock, o1, tag="span", anim="scale")} {el("lg", "Voyage", round(t_lock+0.25,2), o1, tag="span", anim="scale")}</div>')
add(el("rule", "", round(t_lock + 0.5, 2), o1, anim="growx"))
add(el("sub", esc("Vanderbilt's standard for how we lead."), at("vanderbilt's standard"), o1))
add(el("sub dim", esc("Built with managers, for managers."), at("built with"), o1))
add('</section>')

# S2 question
o2 = round(at("four expectations") - 0.2, 2)
add('<section class="sc center">')
add(eyebrow("It starts with one question", at("it starts with"), o2))
add(f'<p class="hero big">{el("w", "What does your team", at("what does"), o2, tag="span")}<br>{el("w", "<em class=gold>need</em> from you?", at("need from"), o2, tag="span")}</p>')
add('</section>')

# S3 four expectations
o3 = round(at("from day one") - 0.2, 2)
rows = [("01", "Get the work done, through your team", at("get the work")),
        ("02", "Take care of your people", at("take care")),
        ("03", "Make things better", at("make things")),
        ("04", "Connect your team to the rest of Vanderbilt", at("and connect"))]
add('<section class="sc left">')
add(eyebrow("Four expectations of every manager", at("four expectations"), o3))
add(el("rail", "", rows[0][2], o3, anim="growy", style=f"--len:{rows[3][2]-rows[0][2]+0.8}s"))
add('<div class="rows">')
for no, tx, d in rows:
    add(f'<div class="row">{el("no", no, d, o3, tag="span", anim="slide")}{el("rt", esc(tx), round(d+0.08,2), o3, tag="span", anim="slide")}</div>')
add('</div></section>')

# S4 day one timeline
o4 = round(at("short micro") - 0.2, 2)
t4 = at("from day one")
add('<section class="sc left">')
add(eyebrow("From day one, you are enrolled", t4, o4))
add(f'<div class="tl">{el("tlline", "", round(t4+0.6,2), o4, anim="growx", style="--len:1.6s")}')
for k, (lab, sub) in enumerate([("Day 1", "Enrolled"), ("Day 7", "Foundations done"), ("Day 30", "Legal courses"), ("Day 60", "Cohort invited")]):
    add(f'<div class="stop" style="left:{8 + k*28}%">{el("dot", "", round(t4+0.8+k*0.35,2), o4, tag="i", anim="pop")}{el("sl", esc(lab), round(t4+0.9+k*0.35,2), o4, tag="b")}{el("ss", esc(sub), round(t4+1.0+k*0.35,2), o4, tag="span")}</div>')
add('</div>')
add(el("chip gold-chip", esc("Foundations course   ·   35 minutes"), at("a 35"), o4, anim="pop", style="left:17%;top:300px"))
tw = at("with live conversations")
add(f'<div class="wave" data-wave="{tw}" style="--d:{tw}s;--o:{o4}s">' + "".join('<i></i>' for _ in range(28)) + '</div>')
add(el("sub", esc("Live conversations. Held out loud. Scored."), round(tw + 0.3, 2), o4, style="top:760px"))
add('</section>')

# S5 micro courses
o5 = round(at("then the cohort") + 0.1, 2)
add('<section class="sc center">')
add(eyebrow("Micro courses, as each responsibility arrives", at("short micro"), o5))
chips = [("Leave", at("leave")), ("Timecards", at("time cards")), ("Hiring", at("hiring")), ("Performance", at("performance")),
         ("Expenses", round(at("performance")+0.5,2)), ("Accommodation", round(at("performance")+0.65,2)), ("Reporting to EOA", round(at("performance")+0.8,2))]
add('<div class="chips">' + "".join(el("chip", esc(c), d, o5, tag="span", anim="pop") for c, d in chips) + '</div>')
add('</section>')

# S6 cohort
o6 = round(at("you hold the hard") - 0.15, 2)
t6 = at("then the cohort")
add('<section class="sc center">')
add(eyebrow("Then, the cohort", round(t6+0.1,2), o6))
def numb(n, t): return '<b data-count="%s" data-start="%s">0</b>' % (n, t)
c1 = el("num", numb(4, at("four weeks")), at("four weeks"), o6, tag="span", anim="scale") + el("cl", "weeks", round(at("four weeks")+0.15,2), o6, tag="span")
c2 = el("num", numb(50, at("50 managers")), at("50 managers"), o6, tag="span", anim="scale") + el("cl", "managers", round(at("50 managers")+0.15,2), o6, tag="span")
add('<div class="counters"><div class="cnt">' + c1 + '</div><div class="cnt">' + c2 + '</div></div>')
tb = at("your own team")
add('<div class="weeks">' + "".join(el("wk" + (" v" if v else ""), f"<b>W{i+1}</b><span>{m}</span>", round(tb + i*0.12, 2), o6, tag="span", anim="pop") for i, (m, v) in enumerate([("Room", 0), ("Virtual", 1), ("Virtual", 1), ("Room", 0)])) + '</div>')
add(el("sub", esc("Your own team as the practice ground."), round(tb + 0.5, 2), o6))
add('</section>')

# S7 practice
o7 = round(at("you present") - 0.15, 2)
add('<section class="sc center">')
add(f'<p class="hero">{el("w", "You hold the <em class=gold>hard</em> conversation.", at("you hold the hard"), o7, tag="span")}</p>')
add(f'<p class="hero">{el("w", "You hand over a <em class=gold>real</em> decision.", at("you hand over"), o7, tag="span")}</p>')
add('</section>')

# S8 playbook and portal
o8 = round(at("you walk away") - 0.15, 2)
add('<section class="sc center">')
add(f'<p class="hero">{el("w", "You present your <em class=gold>Playbook</em>", at("you present"), o8, tag="span")}</p>')
add(el("sub dim", esc("to your peers, and to your leader."), at("to your peers"), o8))
tp = at("and the manager portal")
add(f'<div class="portal">{el("pbar", "", round(tp+0.2,2), o8, anim="growx", style="--len:1.4s")}{el("ptxt", esc("Manager Portal   ·   always live, from day one"), round(tp+0.6,2), o8, tag="span")}</div>')
add('</section>')

# S9 walk away
o9 = round(at("you are measured") - 0.15, 2)
add('<section class="sc left">')
add(eyebrow("You walk away with", at("you walk away"), o9))
items = [("Your Playbook, written by you", at("a playbook you")), ("A 1:1 cadence on the calendar", at("a one")),
         ("Three goals for every person", at("three goals")), ("The conversation you were putting off, <em class=gold>held</em>", at("and the conversation"))]
add('<div class="list">')
for tx, d in items:
    add(f'<div class="li"><svg class="a chk" style="--d:{d}s;--o:{o9}s" data-anim="draw" viewBox="0 0 40 40"><path d="M8 21l9 9 15-18"/></svg>{el("lt", tx, round(d+0.1,2), o9, tag="span", anim="slide")}</div>')
add('</div></section>')

# S10 measured
o10 = round(at("because a") - 0.15, 2)
tm = at("you are measured")
add('<section class="sc left">')
add(eyebrow("Measured, three times", tm, o10))
add(f'<div class="meas">{el("mline", "", round(tm+0.3,2), o10, anim="growx", style="--len:2.2s")}')
for k, (lab, sub, d) in enumerate([("Before", "the course", at("before")), ("After", "the capstone", at("after")), ("Three months on", "the re-up", at("and three months"))]):
    add(f'<div class="ms" style="left:{4 + k*38}%">{el("dia", "", d, o10, tag="i", anim="pop")}{el("sl", esc(lab), round(d+0.1,2), o10, tag="b")}{el("ss", esc(sub), round(d+0.2,2), o10, tag="span")}</div>')
add('</div>')
ts = at("so you can see")
add(f'<svg class="a spark" style="--d:{ts}s;--o:{o10}s" data-anim="draw" viewBox="0 0 600 160" preserveAspectRatio="none"><path d="M10 140 C120 120 180 125 240 95 S380 70 450 55 S560 30 590 18"/></svg>')
add(el("sub", "So you can <em class=gold>see yourself change.</em>", round(ts + 0.2, 2), o10, style="top:770px"))
add('</section>')

# S11 because, and the close
ob = round(at("and people stay") - 0.2, 2)
add('<section class="sc center">')
add(f'<p class="hero">{el("w", "A manager\u2019s output", at("because a"), ob, tag="span")}<br>{el("w", "is the <em class=gold>team\u2019s</em> output.", at("is the team's"), ob, tag="span")}</p>')
add('</section>')
op = round(at("the first cohort") - 0.2, 2)
add('<section class="sc center">')
add(f'<p class="hero">{el("w", "People stay for the manager", at("and people stay"), op, tag="span")}<br>{el("w", "who <em class=gold>notices</em> them.", at("who notices"), op, tag="span")}</p>')
add('</section>')
oj = round(END_CARD - 0.3, 2)
add('<section class="sc center">')
add(eyebrow("The first cohort sails in", at("the first cohort"), oj))
add(el("jan", "January 2027", at("in january"), oj, anim="scale"))
add(el("sub", esc("Fifty seats."), at("50 seats"), oj))
add(el("sub gold", esc("Your voyage starts now."), at("your voyage"), oj))
add('</section>')

# S12 end card
oe = TOTAL + 2
add('<section class="sc center">')
add(f'<div class="lock">{el("lw", "Manager", END_CARD, oe, tag="span", anim="scale")} {el("lg", "Voyage", round(END_CARD+0.2,2), oe, tag="span", anim="scale")}</div>')
add(el("rule", "", round(END_CARD + 0.5, 2), oe, anim="growx"))
add(eyebrow("Launching January 2027   ·   Fifty seats", round(END_CARD + 0.8, 2), oe))
add(el("sub dim", esc("Vanderbilt University   ·   Futures Learning Hub"), round(END_CARD + 1.1, 2), oe))
add('</section>')

CSS = """
@font-face{font-family:PF;src:url(playfair.ttf);font-weight:400 900}
@font-face{font-family:PF;src:url(playfair-italic.ttf);font-weight:400 900;font-style:italic}
@font-face{font-family:OS;src:url(oswald.ttf);font-weight:200 700}
@font-face{font-family:IN;src:url(inter.ttf);font-weight:100 900}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1920px;height:1080px;overflow:hidden;background:#1C1C1C}
#stage{position:relative;width:1920px;height:1080px;overflow:hidden;background:#1C1C1C;color:#fff;font-family:IN,sans-serif}
.bg{position:absolute;inset:-20%;background:radial-gradient(42% 38% at 22% 28%,rgba(207,174,112,.16),transparent 65%),radial-gradient(38% 34% at 80% 78%,rgba(207,174,112,.12),transparent 62%);animation:drift 40s ease-in-out infinite alternate;animation-play-state:paused}
.vig{position:absolute;inset:0;background:radial-gradient(80% 70% at 50% 50%,transparent 55%,rgba(0,0,0,.55))}
@keyframes drift{from{transform:translate(0,0) scale(1)}to{transform:translate(-4%,3%) scale(1.08)}}
.sc{position:absolute;inset:0;padding:0 160px}
.sc.center{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:26px}
.sc.left{padding-top:150px}
.gold{color:#CFAE70;font-style:italic}
.a{animation-name:enter,leave;animation-duration:.8s,.5s;animation-timing-function:cubic-bezier(.2,.7,.1,1),ease;animation-fill-mode:both,both;animation-delay:var(--d),var(--o);animation-play-state:paused,paused}
.a[data-anim=scale]{animation-name:enterScale,leave;animation-duration:.9s,.5s}
.a[data-anim=slide]{animation-name:enterSlide,leave}
.a[data-anim=pop]{animation-name:pop,leave;animation-duration:.5s,.4s;animation-timing-function:cubic-bezier(.3,1.5,.5,1),ease}
.a[data-anim=growx]{animation-name:growx,leave;animation-duration:var(--len,.9s),.5s;transform-origin:left center}
.a[data-anim=growy]{animation-name:growy,leave;animation-duration:var(--len,.9s),.5s;transform-origin:top center}
.a[data-anim=draw]{animation-name:draw,leave;animation-duration:.6s,.5s}
@keyframes enter{from{opacity:0;transform:translateY(34px);filter:blur(6px)}to{opacity:1;transform:none;filter:blur(0)}}
@keyframes enterScale{from{opacity:0;transform:scale(.86);filter:blur(10px)}to{opacity:1;transform:none;filter:blur(0)}}
@keyframes enterSlide{from{opacity:0;transform:translateX(-50px)}to{opacity:1;transform:none}}
@keyframes pop{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:none}}
@keyframes growx{from{opacity:1;transform:scaleX(0)}to{opacity:1;transform:scaleX(1)}}
@keyframes growy{from{opacity:1;transform:scaleY(0)}to{opacity:1;transform:scaleY(1)}}
@keyframes draw{from{opacity:1;stroke-dashoffset:var(--dash,100)}to{opacity:1;stroke-dashoffset:0}}
@keyframes leave{to{opacity:0;transform:translateY(-22px);filter:blur(4px)}}
.eyebrow{font-family:OS;font-weight:500;font-size:28px;letter-spacing:.32em;text-transform:uppercase;color:#CFAE70;white-space:pre}
.hero{font-family:PF;font-weight:400;font-size:96px;line-height:1.14;letter-spacing:-.01em;white-space:nowrap}
.hero.big{font-size:118px}
.hero.sm{font-size:80px}
.hero .w{display:inline-block}
.lock{font-family:PF;font-size:200px;line-height:1;letter-spacing:-.01em;white-space:nowrap}
.lock .lw{display:inline-block;color:#fff}.lock .lg{display:inline-block;color:#CFAE70;font-style:italic}
.rule{width:220px;height:3px;background:#CFAE70;box-shadow:0 0 18px rgba(236,183,72,.6)}
.sub{font-family:IN;font-weight:400;font-size:40px;color:#fff;letter-spacing:-.005em}
.sub.dim{color:#B8B8B8}.sub.gold{color:#CFAE70;font-style:normal}
.left .sub{position:absolute;left:160px}
.rail{position:absolute;left:160px;top:250px;width:3px;height:560px;background:linear-gradient(#946E24,#CFAE70,#ECB748)}
.rows{position:absolute;left:220px;top:230px;display:flex;flex-direction:column;gap:46px}
.row{display:flex;align-items:baseline;gap:34px}
.no{font-family:OS;font-weight:600;font-size:46px;color:#ECB748;display:inline-block;min-width:70px}
.rt{font-family:PF;font-size:70px;line-height:1.1;display:inline-block;white-space:nowrap}
.tl{position:absolute;left:160px;right:160px;top:420px;height:200px}
.tlline{position:absolute;left:0;right:0;top:40px;height:3px;background:linear-gradient(90deg,#946E24,#CFAE70 50%,#ECB748);box-shadow:0 0 16px rgba(207,174,112,.5)}
.stop{position:absolute;top:0;width:300px;margin-left:-11px}
.stop .dot{display:block;width:22px;height:22px;border-radius:50%;background:#1C1C1C;border:3px solid #ECB748;margin-top:30px;box-shadow:0 0 14px rgba(236,183,72,.8)}
.stop .sl{display:block;font-family:OS;font-weight:600;font-size:36px;letter-spacing:.12em;text-transform:uppercase;margin-top:26px}
.stop .ss{display:block;font-family:IN;font-size:30px;color:#B8B8B8;margin-top:6px}
.chip{display:inline-block;font-family:OS;font-weight:500;font-size:34px;letter-spacing:.14em;text-transform:uppercase;padding:16px 30px;border:2px solid rgba(207,174,112,.7);border-radius:999px;color:#fff;white-space:pre}
.chip.gold-chip{position:absolute;background:#CFAE70;color:#1C1C1C;border-color:#ECB748;box-shadow:0 0 24px rgba(236,183,72,.45)}
.chips{display:flex;flex-wrap:wrap;justify-content:center;gap:26px;max-width:1500px}
.wave{position:absolute;left:160px;top:660px;display:flex;align-items:center;gap:10px;height:80px;opacity:0}
.wave i{display:block;width:12px;height:6px;border-radius:6px;background:#CFAE70}
.counters{display:flex;gap:220px;align-items:flex-end}
.cnt{display:flex;flex-direction:column;align-items:center;gap:6px}
.num{font-family:PF;font-size:260px;line-height:1;color:#CFAE70;display:inline-block}
.cl{font-family:OS;font-weight:500;font-size:34px;letter-spacing:.3em;text-transform:uppercase;color:#fff}
.weeks{display:flex;gap:22px;margin-top:10px}
.wk{display:inline-flex;flex-direction:column;align-items:center;width:220px;padding:18px 0;border-radius:8px;background:#CFAE70;color:#1C1C1C;border:2px solid #ECB748}
.wk.v{background:rgba(207,174,112,.14);color:#fff;border:2px dashed rgba(207,174,112,.8)}
.wk b{font-family:PF;font-style:italic;font-size:44px}.wk span{font-family:IN;font-size:26px;opacity:.85}
.portal{position:relative;width:1400px;height:90px;margin-top:30px}
.pbar{position:absolute;inset:0;border-radius:8px;background:linear-gradient(90deg,rgba(207,174,112,.95),rgba(207,174,112,.45) 55%,rgba(207,174,112,.95));border:2px solid #ECB748;box-shadow:0 0 30px rgba(207,174,112,.4)}
.ptxt{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:OS;font-weight:600;font-size:34px;letter-spacing:.24em;text-transform:uppercase;color:#1C1C1C;white-space:pre}
.list{position:absolute;left:160px;top:270px;display:flex;flex-direction:column;gap:52px}
.li{display:flex;align-items:center;gap:36px}
.chk{--dash:100;width:64px;height:64px;flex:none}
.chk path{fill:none;stroke:#ECB748;stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:100;--dash:100}
.lt{font-family:PF;font-size:66px;line-height:1.1;white-space:nowrap}
.meas{position:absolute;left:160px;right:160px;top:400px;height:200px}
.mline{position:absolute;left:0;right:0;top:40px;border-top:2px dashed rgba(236,183,72,.7)}
.ms{position:absolute;top:0;width:420px;margin-left:-9px}
.ms .dia{display:block;width:20px;height:20px;background:#ECB748;transform:rotate(45deg);margin:30px 0 0 1px;box-shadow:0 0 14px rgba(236,183,72,.9)}
.ms .sl{display:block;font-family:OS;font-weight:600;font-size:40px;letter-spacing:.12em;text-transform:uppercase;margin-top:28px}
.ms .ss{display:block;font-family:IN;font-size:30px;color:#B8B8B8;margin-top:6px}
.spark{--dash:900;position:absolute;left:1180px;top:620px;width:580px;height:160px}
.spark path{fill:none;stroke:#CFAE70;stroke-width:4;stroke-linecap:round;stroke-dasharray:900;--dash:900;filter:drop-shadow(0 0 8px rgba(236,183,72,.6))}
.jan{font-family:PF;font-size:200px;line-height:1;color:#CFAE70;letter-spacing:-.01em}
"""

JS = """
const anims = () => document.getAnimations();
window.seek = function(t){
  for(const a of anims()){ a.currentTime = t*1000; }
  for(const b of document.querySelectorAll('[data-count]')){
    const s=+b.dataset.start, n=+b.dataset.count, p=Math.max(0,Math.min(1,(t-s)/0.7));
    b.textContent = Math.round(n*(1-Math.pow(1-p,3)));
  }
  for(const w of document.querySelectorAll('.wave')){
    const s=+w.dataset.wave, o=parseFloat(w.style.getPropertyValue('--o'));
    const on = t>=s && t<o; w.style.opacity = on ? Math.min(1,(t-s)/0.4) * (t>o-0.5?Math.max(0,(o-t)/0.5):1) : 0;
    [...w.children].forEach((bar,i)=>{ const x=(t-s)*3.1+i*0.55; const h = on ? 8+ 60*Math.abs(Math.sin(x)*Math.sin(x*0.37+1.3)) : 6; bar.style.height=h+'px'; });
  }
  return document.fonts.status;
};
"""

page = f"""<!doctype html><html><head><meta charset="utf-8"><title>Manager Voyage</title><style>{CSS}</style></head>
<body><div id="stage"><div class="bg"></div>{''.join(parts)}<div class="vig"></div></div><script>{JS}</script></body></html>"""
open("index.html", "w").write(page)
print("TOTAL", TOTAL, "END_CARD", END_CARD, "elements", page.count('class="a'))
