#!/usr/bin/env python3
"""Builds launch/index.html, the web edition of the launch plan, from docs/launch-plan/index.html:
asset paths, section ids, a sticky navigation bar, screen layout on top of the print layout,
and Beacon, the chat guide. Run from the repo root: python3 scripts/build-launch-site.py"""
import re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'docs', 'launch-plan', 'index.html')
OUT = os.path.join(ROOT, 'launch', 'index.html')
AGENT = sys.argv[1] if len(sys.argv) > 1 else 'AGENT_ID'
s = open(SRC, encoding='utf-8').read()
s = s.replace('../../assets/', '../assets/')
s = s.replace('<title>Manager Voyage launch plan</title>', '<title>Manager Voyage launch plan</title>\n<link rel="icon" href="../assets/img/favicon.svg">')

# section ids, in page order
IDS = ['cover', 'glance', 'components', 'program', 'objectives', 'audience', 'journey', 'journey-map', 'funnel', 'timeline', 'cascade', 'calendar',
       'msg-c1', 'msg-c2', 'msg-c5', 'msg-m1', 'msg-m2', 'msg-m4', 'teams', 'teams-posts', 'data', 'data-rules', 'data-setup',
       'enrollment', 'delivery', 'pilot', 'measurement', 'success', 'horizons', 'roles', 'next', 'back']
i = 0
def add_id(m):
    global i
    sid = IDS[i] if i < len(IDS) else 'page-' + str(i + 1); i += 1
    return '<section id="' + sid + '" ' + m.group(1)
s = re.sub(r'<section (class="pg[^"]*")', add_id, s)
assert i == len(IDS), 'expected %d pages, found %d' % (len(IDS), i)

SCREEN_CSS = """
/* ===== the web edition: fluid sections on screen, the paged layout stays for print ===== */
@media screen{
  html{ scroll-behavior:smooth; scroll-padding-top:64px; }
  html, body{ background:var(--vu-black); }
  .two > *, .grid > *, .cascade > *, .funnel > *, .mail-wrap > *, .tier > *{ min-width:0; }
  .pg{ width:auto; height:auto; min-height:0; overflow:visible; margin:0; page-break-after:auto; break-after:auto; padding:52px max(20px, calc(50% - 590px)) 36px; }
  .pg.cover{ padding:0; min-height:min(86vh, 760px); }
  .cover .in{ padding:clamp(28px,6vw,64px) max(20px, calc(50% - 590px)) clamp(32px,6vw,64px); min-height:min(86vh, 760px); }
  .cover h1{ font-size:clamp(2.2rem, 5.6vw, 3.6rem); }
  .foot{ position:static; margin-top:26px; padding:10px 170px 0 0; border-top:1px solid var(--bd); }
  .foot .pn{ display:none; }
  .foot::after{ content:'Back to top'; }
  .back{ min-height:0; padding:64px 20px; }
  h1{ font-size:clamp(1.5rem, 3.2vw, 2.05rem); }
  .lede{ max-width:70ch; }
  .xs{ overflow-x:auto; -webkit-overflow-scrolling:touch; margin:0 -4px; padding:0 4px 6px; }
  .xs > .jm, .xs > .gantt, .xs > .tl, .xs > .flow{ min-width:860px; } .xs > table{ min-width:440px; }
  #topnav{ position:sticky; top:0; z-index:200; background:rgba(28,28,28,.96); backdrop-filter:blur(8px); border-bottom:1px solid rgba(207,174,112,.35); color:#fff; }
  #topnav .in{ display:flex; align-items:center; gap:18px; padding:0 max(20px, calc(50% - 590px)); height:60px; min-width:0; }
  #topnav img{ height:30px; }
  #topnav .ttl{ font-family:var(--cond); font-weight:700; font-size:.72rem; letter-spacing:.12em; text-transform:uppercase; color:#CFAE70; white-space:nowrap; }
  #topnav .ttl b{ color:#fff; font-weight:700; }
  #topnav ul{ list-style:none; margin:0 0 0 auto; padding:0; display:flex; gap:2px; overflow-x:auto; scrollbar-width:none; min-width:0; flex:0 1 auto; }
  #topnav ul::-webkit-scrollbar{ display:none; }
  #topnav a{ display:block; padding:8px 10px; color:rgba(255,255,255,.78); text-decoration:none; font-size:.8rem; white-space:nowrap; border-radius:4px; }
  #topnav a:hover{ color:#CFAE70; }
  #topnav ul.hub{ margin-left:0; flex:none; border-right:1px solid rgba(255,255,255,.18); padding-right:6px; }
  #topnav ul.hub a{ font-family:var(--cond); font-weight:700; font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.85); }
  #topnav ul.hub a.on{ color:#CFAE70; border-bottom:2px solid #CFAE70; border-radius:0; }
  @media (max-width:980px){ #topnav ul:not(.hub){ display:none; } }
  #topnav a.pdf{ border:1px solid #CFAE70; color:#CFAE70; font-family:var(--cond); font-weight:700; font-size:.68rem; letter-spacing:.1em; text-transform:uppercase; margin-left:6px; }
  @media (max-width:980px){ #topnav .ttl span{ display:none; } }
  @media (max-width:760px){
    .grid.c2, .grid.c3, .grid.c4, .grid.c5, .two, .cascade, .funnel, .mail-wrap.two, .phases, .tier, .probs, .obj, .hz{ grid-template-columns:1fr; }
    .std, .rules{ grid-template-columns:1fr 1fr; }
    .flow{ grid-template-columns:1fr; } .flow .bx::after{ content:none; } .flow .turn{ height:30px; }
    .chan div{ grid-template-columns:1fr; gap:4px; }
    .email .meta{ grid-template-columns:1fr; }
    .pg{ padding:40px 18px 28px; }
    .cover .vers{ margin-top:18px; }
  }
  @media (max-width:480px){ .std, .rules{ grid-template-columns:1fr; } }
  /* Beacon, the guide */
  #guideFab{ position:fixed; right:clamp(12px,2vw,24px); bottom:clamp(14px,3vh,28px); z-index:205; display:inline-flex; align-items:center; gap:8px; padding:11px 16px; border-radius:999px; border:1px solid #CFAE70; background:#1C1C1C; color:#CFAE70; font-family:var(--cond); font-weight:700; font-size:.76rem; letter-spacing:.08em; text-transform:uppercase; cursor:pointer; box-shadow:0 8px 28px rgba(0,0,0,.5); }
  #guideFab svg{ width:18px; height:18px; } #guideFab:hover, #guideFab[aria-expanded="true"]{ background:#CFAE70; color:#1C1C1C; }
  #guidePanel{ position:fixed; right:clamp(12px,2vw,24px); bottom:clamp(70px,3vh + 56px,84px); z-index:206; width:min(400px, calc(100vw - 24px)); max-height:min(600px, calc(100vh - 120px)); display:flex; flex-direction:column; background:#1f1f1f; border:1px solid rgba(255,255,255,.14); border-top:3px solid #CFAE70; border-radius:8px; box-shadow:0 16px 48px rgba(0,0,0,.65); color:#fff; font-family:var(--sans); }
  #guidePanel[hidden]{ display:none; }
  #guidePanel .mono{ font-family:var(--cond); font-weight:700; font-size:.7rem; letter-spacing:.08em; text-transform:uppercase; color:#CFAE70; display:block; }
  #guidePanel .g-head{ position:relative; padding:12px 44px 10px 14px; border-bottom:1px solid rgba(255,255,255,.12); }
  #guidePanel .g-head b{ display:block; font-family:var(--serif); font-weight:400; font-size:1.05rem; margin-top:2px; }
  #guidePanel .g-close{ position:absolute; right:8px; top:8px; width:30px; height:30px; border-radius:50%; border:1px solid rgba(255,255,255,.2); background:none; color:#fff; font-size:1.2rem; cursor:pointer; }
  #guidePanel .g-log{ flex:1 1 auto; min-height:180px; overflow:auto; padding:12px 14px; display:flex; flex-direction:column; gap:8px; }
  #guidePanel .g-line{ font-size:.92rem; line-height:1.45; padding:8px 11px; border-radius:4px; max-width:92%; }
  #guidePanel .g-line b{ display:block; font-family:var(--cond); font-weight:700; font-size:.66rem; letter-spacing:.08em; text-transform:uppercase; color:#CFAE70; margin-bottom:2px; }
  #guidePanel .g-line.you{ align-self:flex-end; background:rgba(207,174,112,.12); border:1px solid rgba(207,174,112,.35); }
  #guidePanel .g-line.guide{ align-self:flex-start; background:#121212; border:1px solid rgba(255,255,255,.12); }
  #guidePanel .g-state{ margin:0; padding:0 14px 6px; font-size:.8rem; color:rgba(255,255,255,.55); min-height:1em; }
  #guidePanel .g-form{ display:flex; gap:8px; padding:0 14px 10px; }
  #guidePanel .g-in{ flex:1; font:inherit; font-size:.92rem; padding:9px 11px; border-radius:6px; border:1px solid rgba(255,255,255,.2); background:#121212; color:#fff; }
  #guidePanel .g-send{ font-family:var(--cond); font-weight:700; font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; padding:8px 14px; border-radius:4px; border:0; background:#CFAE70; color:#1C1C1C; cursor:pointer; }
  #guidePanel .g-tips{ display:flex; flex-wrap:wrap; gap:6px; padding:0 14px 12px; }
  #guidePanel .g-tips button{ font:inherit; font-size:.78rem; padding:5px 10px; border-radius:999px; border:1px solid rgba(255,255,255,.2); background:none; color:rgba(255,255,255,.75); cursor:pointer; }
  #guidePanel .g-tips button:hover{ border-color:#CFAE70; color:#CFAE70; }
  @media (max-width:640px){ #guidePanel{ right:8px; left:8px; width:auto; } #guideFab span{ display:none; } #guideFab{ padding:11px; } }
}
@media print{ #topnav, #guideFab, #guidePanel{ display:none !important; } .xs{ overflow:visible; margin:0; padding:0; } .xs > *{ min-width:0 !important; } }
"""
s = s.replace('</style>', SCREEN_CSS + '</style>', 1)

NAV = """
<nav id="topnav" aria-label="Sections of the launch plan"><div class="in">
  <a href="../" aria-label="Manager Voyage home"><img src="../assets/img/vu-lockup-white.png" alt="Vanderbilt University"></a>
  <span class="ttl"><b>Manager Voyage</b> <span>&middot; Program Operations Hub</span></span>
  <ul class="hub"><li><a href="../ops/">Home</a></li><li><a class="on" href="#cover">Rollout</a></li><li><a href="../ops/#cohorts">Cohort ops</a></li><li><a href="../ops/#data">Data</a></li></ul>
  <ul>
    <li><a href="#glance">The plan</a></li><li><a href="#program">Overview</a></li><li><a href="#objectives">Objectives</a></li><li><a href="#journey">Journey</a></li><li><a href="#funnel">Funnel</a></li><li><a href="#timeline">Timeline</a></li><li><a href="#cascade">Cascade</a></li><li><a href="#msg-c1">Messages</a></li><li><a href="#teams">Teams</a></li><li><a href="#data">Data</a></li><li><a href="#enrollment">Enrollment</a></li><li><a href="#success">Success</a></li><li><a href="#next">Decisions</a></li>
    <li><a class="pdf" href="../docs/Manager-Voyage-Launch-Plan.pdf">PDF</a></li>
  </ul>
</div></nav>
"""
s = s.replace('<body>\n', '<body>\n' + NAV, 1)

GUIDE = """
<script>
/* the web edition: wide figures scroll sideways on narrow screens; footers link back to the top */
(function(){
  if(!window.matchMedia || !matchMedia('screen').matches) return;
  document.querySelectorAll('.jm, .gantt, .tl, .cal, .raci, table').forEach(function(el){ if(el.closest('.xs')) return; var w = document.createElement('div'); w.className = 'xs'; el.parentNode.insertBefore(w, el); w.appendChild(el); });
  document.querySelectorAll('.foot').forEach(function(f){ f.style.cursor = 'pointer'; f.addEventListener('click', function(){ window.scrollTo({ top:0, behavior:'smooth' }); }); });
})();
/* Beacon: the guide to the plan, a text chat on this page */
(function(){
  var AGENT = '__AGENT__', SDK = 'https://cdn.jsdelivr.net/npm/@elevenlabs/client/+esm';
  function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  var fab = document.createElement('button'); fab.type = 'button'; fab.id = 'guideFab'; fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'guidePanel'); fab.setAttribute('aria-label', 'Ask Beacon, the guide to the launch plan');
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/><path d="M9 12h6M9 9h4"/></svg><span>Ask Beacon</span>';
  var panel = document.createElement('aside'); panel.id = 'guidePanel'; panel.hidden = true; panel.setAttribute('aria-label', 'Beacon, the guide to the launch plan');
  panel.innerHTML = '<div class="g-head"><span class="mono">Beacon &middot; the launch plan guide</span><b>Ask about the launch, the dates, or who does what.</b><button type="button" class="g-close" aria-label="Close the guide">&times;</button></div>' +
    '<div class="g-log" aria-live="polite"></div><p class="g-state" role="status"></p>' +
    '<form class="g-form"><input type="text" class="g-in" placeholder="Type a question&hellip;" aria-label="Your question" autocomplete="off" maxlength="500" /><button type="submit" class="g-send">Send</button></form>' +
    '<div class="g-tips"><button type="button" data-q="What happens on March 2?">What happens on March 2?</button><button type="button" data-q="What does a manager\\'s manager have to do, and by when?">What do managers\\' managers do?</button><button type="button" data-q="How does the assessment data flow, and who sees it?">How does the assessment data flow?</button><button type="button" data-q="What does success look like, and how is it measured?">What does success look like?</button><button type="button" data-q="What is still undecided?">What is still undecided?</button></div>';
  document.body.appendChild(fab); document.body.appendChild(panel);
  var log = panel.querySelector('.g-log'), state = panel.querySelector('.g-state'), form = panel.querySelector('.g-form'), input = panel.querySelector('.g-in');
  var conv = null, starting = null, pending = [], current = 'the cover';
  function say(who, text){ var d = document.createElement('p'); d.className = 'g-line ' + who; d.innerHTML = '<b>' + (who === 'you' ? 'You' : 'Beacon') + '</b>' + esc(text); log.appendChild(d); log.scrollTop = log.scrollHeight; }
  function status(t){ state.textContent = t || ''; }
  function open(){ panel.hidden = false; fab.setAttribute('aria-expanded', 'true'); input.focus(); if(!conv && !starting) connect(); }
  function close(){ panel.hidden = true; fab.setAttribute('aria-expanded', 'false'); }
  function connect(){
    status('Connecting…');
    starting = import(SDK).then(function(mod){
      var Conversation = mod.Conversation || (mod.default && mod.default.Conversation); if(!Conversation) throw new Error('nosdk');
      return Conversation.startSession({
        agentId: AGENT, connectionType: 'websocket', textOnly: true,
        dynamicVariables: { page: current },
        onConnect: function(){ status(''); pending.splice(0).forEach(function(t){ send(t); }); },
        onDisconnect: function(){ conv = null; status('Beacon stepped away. Send a message to reconnect.'); },
        onMessage: function(m){ if(m && m.message && m.source !== 'user') say('guide', m.message); },
        onError: function(){ conv = null; status('Beacon could not connect. Try again in a moment.'); }
      });
    }).then(function(c){ conv = c; starting = null; return c; }).catch(function(){ starting = null; conv = null; status('Beacon is not available in this browser right now.'); });
    return starting;
  }
  function send(text){
    if(!text) return;
    if(conv && conv.sendUserMessage){ try{ conv.sendUserMessage(text); }catch(e){ status('Could not send that. Try again.'); } return; }
    pending.push(text); if(!starting) connect();
  }
  form.addEventListener('submit', function(e){ e.preventDefault(); var t = input.value.trim(); if(!t) return; say('you', t); input.value = ''; send(t); });
  panel.addEventListener('click', function(e){ var q = e.target.closest('button[data-q]'); if(q){ var t = q.getAttribute('data-q'); say('you', t); send(t); return; } if(e.target.closest('.g-close')) close(); });
  fab.addEventListener('click', function(){ if(panel.hidden) open(); else close(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !panel.hidden) close(); });
  /* the guide knows which section is on screen */
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if(!en.isIntersecting) return; var h = en.target.querySelector('h1'); var name = h ? h.textContent.replace(/\\s+/g, ' ').trim() : en.target.id; if(name === current) return; current = name; if(conv && conv.sendContextualUpdate){ try{ conv.sendContextualUpdate('The reader is now on the section: ' + name); }catch(e){} } }); }, { rootMargin:'-40% 0px -50% 0px' });
    document.querySelectorAll('section.pg').forEach(function(sec){ io.observe(sec); });
  }
})();
</script>
"""
s = s.replace('</body>', GUIDE.replace('__AGENT__', AGENT) + '</body>', 1)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write(s)
print('launch/index.html written, agent', AGENT)
