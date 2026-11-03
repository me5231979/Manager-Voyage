const {chromium}=require('playwright'); const fs=require('fs');
(async()=>{
  const mode=process.argv[2];
  const b=await chromium.launch({args:['--no-sandbox']});
  const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  await p.goto('file:///home/user/mv/index.html'); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(400);
  console.log('animations', await p.evaluate(()=>document.getAnimations().length), 'fonts', await p.evaluate(()=>[...document.fonts].map(f=>f.family+':'+f.status).join(',')));
  if(mode==='frames'){ for(const t of process.argv.slice(3).map(Number)){ await p.evaluate(t=>seek(t),t); await p.screenshot({path:`chk_${t}.jpg`,type:'jpeg',quality:85}); } }
  else { const fps=30,total=+process.argv[3]; const n=Math.ceil(total*fps); fs.mkdirSync('frames',{recursive:true});
    for(let i=0;i<n;i++){ await p.evaluate(t=>seek(t),i/fps); await p.screenshot({path:`frames/f${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:92}); if(i%300===0) console.log('frame',i,new Date().toISOString()); } console.log('done',n); }
  await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
