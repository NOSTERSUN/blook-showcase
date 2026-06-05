/* BLOOK — universal image lightbox + branded Story share (10 templates).
   - Click any content image → popup (image clickable → website) + "แชร์รูป" button.
   - "แชร์รูป" → branded 1080x1920 Story image. 10 varied templates (cream / black-gold /
     full-bleed / circle / split / polaroid …). Cycle with "เปลี่ยนดีไซน์".
   - Branding-only (logo + photo + domain), no sales copy.
   - File prepared up-front so navigator.share() runs in the button's user-gesture. */
(function(){
  var W=1080, H=1920;
  var GOLD='#A0784A', GOLD2='#C9A96E', GOLDLT='#D2AE71', DARK='#15110D', INK='#1A0F08';

  // base path of THIS script (so the logo loads correctly from / and /articles/)
  var _selfBase='assets/';
  try{ var _cs0=document.currentScript; if(_cs0&&_cs0.src) _selfBase=_cs0.src.replace(/share-story\.js.*$/,''); }catch(e){}
  var LOGO=new Image(), LOGO_OK=false; LOGO.crossOrigin='anonymous';
  LOGO.onload=function(){ LOGO_OK=true; }; LOGO.src=_selfBase+'blook-logo.png';

  function sameOrigin(src){ try{ var u=new URL(src, location.href); return (u.origin===location.origin)? u.href : u.pathname.replace(/^\//,''); }catch(e){ return src; } }
  function prettyUrl(u){ try{ return (u||'https://blookliving.com').replace(/^https?:\/\//,'').replace(/\/+$/,''); }catch(e){ return 'blookliving.com'; } }
  function rootDomain(u){ try{ return new URL(u, location.href).hostname.replace(/^www\./,'')||'blookliving.com'; }catch(e){ return 'blookliving.com'; } }
  function pageUrl(){ var c=document.querySelector('link[rel="canonical"]'); return (c&&c.href)||location.href.split('#')[0]; }
  function rr(x,X,Y,w,h,r){ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+w,Y,X+w,Y+h,r); x.arcTo(X+w,Y+h,X,Y+h,r); x.arcTo(X,Y+h,X,Y,r); x.arcTo(X,Y,X+w,Y,r); x.closePath(); }
  function cover(x,img,X,Y,w,h){ if(!img){ x.fillStyle='#DAD0C0'; x.fillRect(X,Y,w,h); return; } var ir=img.width/img.height, tr=w/h, sw,sh,sx,sy; if(ir>tr){ sh=img.height; sw=sh*tr; sx=(img.width-sw)/2; sy=0; } else { sw=img.width; sh=sw/tr; sx=0; sy=(img.height-sh)/2; } x.drawImage(img,sx,sy,sw,sh,X,Y,w,h); }
  function cardImg(x,img,X,Y,w,h,r,o){ o=o||{}; if(o.shadow){ x.save(); x.shadowColor=o.shadow; x.shadowBlur=o.blur||40; x.shadowOffsetY=o.oy||18; x.fillStyle='#fff'; rr(x,X,Y,w,h,r); x.fill(); x.restore(); } x.save(); rr(x,X,Y,w,h,r); x.clip(); cover(x,img,X,Y,w,h); x.restore(); if(o.border){ x.strokeStyle=o.border; x.lineWidth=o.bw||2.5; rr(x,X+1,Y+1,w-2,h-2,r); x.stroke(); } }
  function circleImg(x,img,cx,cy,r,ring){ x.save(); x.beginPath(); x.arc(cx,cy,r,0,Math.PI*2); x.closePath(); x.clip(); cover(x,img,cx-r,cy-r,2*r,2*r); x.restore(); if(ring){ x.strokeStyle=ring; x.lineWidth=4; x.beginPath(); x.arc(cx,cy,r,0,Math.PI*2); x.stroke(); } }
  function spacedLatin(x,str,cx,y,sp){ var w=[],tot=0,i; for(i=0;i<str.length;i++){ var ww=x.measureText(str[i]).width; w.push(ww); tot+=ww+sp; } tot-=sp; var sx=cx-tot/2, a=x.textAlign; x.textAlign='left'; for(i=0;i<str.length;i++){ x.fillText(str[i],sx,y); sx+=w[i]+sp; } x.textAlign=a; }
  function measureSpaced(x,str,sp){ var t=0,i; for(i=0;i<str.length;i++){ t+=x.measureText(str[i]).width+sp; } return t-sp; }

  // draw the BLOOK logo (square lockup). tint=null → original gold PNG; else recolour via source-in.
  function drawLogo(x,tint,cx,cy,w){
    if(!LOGO_OK||!LOGO.naturalWidth) return false;
    if(!tint){ x.drawImage(LOGO,cx-w/2,cy-w/2,w,w); return true; }
    var s=Math.max(2,Math.round(w)), oc=document.createElement('canvas'); oc.width=oc.height=s; var o=oc.getContext('2d');
    o.drawImage(LOGO,0,0,s,s); o.globalCompositeOperation='source-in'; o.fillStyle=tint; o.fillRect(0,0,s,s);
    x.drawImage(oc,cx-w/2,cy-w/2,w,w); return true;
  }
  // text fallback wordmark if the logo image isn't ready yet
  function wordmark(x,cx,topY,light){
    x.textAlign='center';
    var wm=x.createLinearGradient(0,topY,0,topY+110); wm.addColorStop(0, light?'#E7C98C':'#D2AE71'); wm.addColorStop(1, light?'#C9A96E':'#946C34');
    x.fillStyle=wm; x.font='600 104px Fraunces,"Cormorant Garamond",Georgia,serif'; spacedLatin(x,'BLOOK',cx,topY+86,18);
    x.fillStyle=light?'#E9DCC6':'#8B6B3D'; x.font='500 25px Inter,Arial,sans-serif';
    var tg='THE CLASS OF CALM', tw=measureSpaced(x,tg,10); spacedLatin(x,tg,cx,topY+140,10);
    x.strokeStyle=light?'rgba(230,210,170,.6)':'rgba(160,120,74,.5)'; x.lineWidth=1.5; var ly=topY+132,gap=tw/2+24,ln=50;
    x.beginPath();x.moveTo(cx-gap-ln,ly);x.lineTo(cx-gap,ly);x.stroke();
    x.beginPath();x.moveTo(cx+gap,ly);x.lineTo(cx+gap+ln,ly);x.stroke();
  }
  function brand(x,tint,cx,cy,w,light){ if(drawLogo(x,tint,cx,cy,w)) return; wordmark(x,cx,cy-w*0.30,light); }
  function dom(x,url,cx,y,color,size){ x.save(); x.textAlign='center'; x.fillStyle=color; x.font='600 '+size+'px Inter,Arial,sans-serif'; x.fillText(rootDomain(url),cx,y); x.restore(); }
  function vgrad(x,y0,c0,y1,c1){ var g=x.createLinearGradient(0,y0,0,y1); g.addColorStop(0,c0); g.addColorStop(1,c1); return g; }

  // ---------------- 10 TEMPLATES ----------------
  var TEMPLATES=[
    // 0 — Cream Card (classic)
    function(x,img,t,u){ x.fillStyle=vgrad(x,0,'#FAF5EC',H,'#EFE4D2'); x.fillRect(0,0,W,H);
      brand(x,null,W/2,300,470); cardImg(x,img,130,560,820,1010,28,{shadow:'rgba(70,48,18,.34)',blur:42,oy:20,border:GOLD,bw:2.5}); dom(x,u,W/2,1710,GOLD,46); },
    // 1 — Full-bleed light top/bottom
    function(x,img,t,u){ cover(x,img,0,0,W,H);
      x.fillStyle=vgrad(x,0,'rgba(250,245,236,.96)',520,'rgba(250,245,236,0)'); x.fillRect(0,0,W,520);
      x.fillStyle=vgrad(x,1440,'rgba(15,11,7,0)',H,'rgba(15,11,7,.82)'); x.fillRect(0,1440,W,H-1440);
      brand(x,null,W/2,250,430); dom(x,u,W/2,1850,'#fff',42); },
    // 2 — Black & Gold card
    function(x,img,t,u){ x.fillStyle='#15110D'; x.fillRect(0,0,W,H);
      var rg=x.createRadialGradient(W/2,300,40,W/2,300,760); rg.addColorStop(0,'rgba(201,169,110,.22)'); rg.addColorStop(1,'rgba(201,169,110,0)'); x.fillStyle=rg; x.fillRect(0,0,W,900);
      brand(x,GOLD2,W/2,300,460,true); cardImg(x,img,130,580,820,990,26,{shadow:'rgba(0,0,0,.5)',blur:50,oy:18,border:'rgba(201,169,110,.55)',bw:2}); dom(x,u,W/2,1720,GOLD2,46); },
    // 3 — Full dark overlay + centred logo
    function(x,img,t,u){ cover(x,img,0,0,W,H); x.fillStyle='rgba(16,11,7,.5)'; x.fillRect(0,0,W,H);
      x.fillStyle=vgrad(x,1400,'rgba(16,11,7,0)',H,'rgba(16,11,7,.7)'); x.fillRect(0,1400,W,H-1400);
      brand(x,'#FFFFFF',W/2,930,640,true); dom(x,u,W/2,1840,'#fff',42); },
    // 4 — Split editorial (image top / cream bottom)
    function(x,img,t,u){ cover(x,img,0,0,W,1175);
      x.fillStyle=vgrad(x,1175,'#F7F0E3',H,'#ECE0CD'); x.fillRect(0,1175,W,H-1175);
      x.strokeStyle=GOLD; x.lineWidth=3; x.beginPath(); x.moveTo(0,1177); x.lineTo(W,1177); x.stroke();
      brand(x,null,W/2,1460,400); dom(x,u,W/2,1740,GOLD,44); },
    // 5 — Polaroid print on gold
    function(x,img,t,u){ x.fillStyle=vgrad(x,0,'#CBB089',H,'#A8895C'); x.fillRect(0,0,W,H);
      var pX=150,pY=320,pW=780,pH=1060,b=30; x.save(); x.shadowColor='rgba(60,40,15,.42)'; x.shadowBlur=46; x.shadowOffsetY=22; x.fillStyle='#fff'; rr(x,pX,pY,pW,pH,10); x.fill(); x.restore();
      cardImg(x,img,pX+b,pY+b,pW-2*b,pH-2*b-66,4,{}); brand(x,'#FFFFFF',W/2,1600,360,true); dom(x,u,W/2,1830,'#FBF4E6',42); },
    // 6 — Minimal white
    function(x,img,t,u){ x.fillStyle='#FCFAF6'; x.fillRect(0,0,W,H);
      brand(x,null,W/2,270,360); cardImg(x,img,175,520,730,950,18,{shadow:'rgba(120,90,40,.16)',blur:38,oy:14}); dom(x,u,W/2,1640,GOLD,40); },
    // 7 — Circle image on cream
    function(x,img,t,u){ x.fillStyle=vgrad(x,0,'#F8F1E4',H,'#EFE3CF'); x.fillRect(0,0,W,H);
      brand(x,null,W/2,300,440); circleImg(x,img,W/2,1100,388,GOLD); dom(x,u,W/2,1700,GOLD,46); },
    // 8 — Gold frame full-bleed
    function(x,img,t,u){ cover(x,img,0,0,W,H);
      x.fillStyle=vgrad(x,0,'rgba(0,0,0,.4)',460,'rgba(0,0,0,0)'); x.fillRect(0,0,W,460);
      x.fillStyle=vgrad(x,1480,'rgba(0,0,0,0)',H,'rgba(0,0,0,.55)'); x.fillRect(0,1480,W,H-1480);
      x.strokeStyle='rgba(201,169,110,.9)'; x.lineWidth=3; rr(x,56,56,W-112,H-112,18); x.stroke();
      brand(x,'#FFFFFF',W/2,250,420,true); dom(x,u,W/2,1838,'#fff',42); },
    // 9 — Magazine bottom band
    function(x,img,t,u){ cover(x,img,0,0,W,1500); x.fillStyle='#15110D'; x.fillRect(0,1500,W,H-1500);
      x.strokeStyle=GOLD2; x.lineWidth=3; x.beginPath(); x.moveTo(0,1502); x.lineTo(W,1502); x.stroke();
      brand(x,GOLD2,W/2,1700,330,true); dom(x,u,W/2,1858,GOLD2,40); }
  ];
  function build(img,text,url,idx){ var c=document.createElement('canvas'); c.width=W; c.height=H; var x=c.getContext('2d'); (TEMPLATES[idx]||TEMPLATES[0])(x,img,text,url); return c; }
  window.bkBuildStoryCanvas=function(img,text,url,idx){ return build(img,text,url,idx||0); };

  // ---------------- shared styles ----------------
  var stylesDone=false;
  function injectStyles(){
    if(stylesDone) return; stylesDone=true;
    var css=
      '#bk-img-lb,#bk-story{position:fixed;inset:0;z-index:10040;display:none;align-items:center;justify-content:center;padding:18px;font-family:Inter,"IBM Plex Sans Thai",sans-serif}'
     +'#bk-img-lb.open,#bk-story.open{display:flex}'
     +'#bk-story{z-index:10060}'
     +'#bk-img-lb{background:rgba(18,12,7,.9);backdrop-filter:blur(4px)}'
     +'#bk-img-lb .bilb-card{display:flex;flex-direction:column;align-items:center;gap:16px;max-width:560px;width:100%}'
     +'#bk-img-lb .bilb-imgwrap{position:relative;max-width:100%;max-height:74vh;display:flex}'
     +'#bk-img-lb img{max-width:100%;max-height:74vh;object-fit:contain;border-radius:14px;box-shadow:0 24px 60px rgba(0,0,0,.55);cursor:pointer;display:block}'
     +'#bk-img-lb .bilb-share{display:inline-flex;align-items:center;gap:10px;border:none;cursor:pointer;font-family:inherit;font-size:1rem;font-weight:700;color:#1A0F08;background:linear-gradient(90deg,#C9A96E,#A0784A);padding:15px 30px;border-radius:30px;box-shadow:0 10px 26px rgba(160,120,74,.5)}'
     +'#bk-img-lb .bilb-share svg{width:20px;height:20px;fill:#1A0F08}'
     +'#bk-img-lb .bilb-x,#bk-story .bkst-x{position:absolute;top:16px;right:18px;width:42px;height:42px;border-radius:50%;border:none;background:rgba(0,0,0,.42);color:#fff;font-size:1.5rem;line-height:1;cursor:pointer;z-index:3}'
     +'#bk-img-lb .bilb-nav{position:absolute;top:50%;transform:translateY(-50%);width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.14);border:none;color:#fff;font-size:1.8rem;cursor:pointer;z-index:3}'
     +'#bk-img-lb .bilb-nav:hover{background:#A0784A}#bk-img-lb .bilb-prev{left:14px}#bk-img-lb .bilb-next{right:14px}'
     +'#bk-story{background:rgba(20,14,8,.74);backdrop-filter:blur(5px)}'
     +'#bk-story .bkst-card{background:#F7F1E7;border:1px solid rgba(160,120,74,.4);border-radius:20px;max-width:400px;width:100%;max-height:94vh;overflow:auto;box-shadow:0 24px 60px rgba(0,0,0,.5);position:relative;padding-bottom:18px}'
     +'#bk-story .bkst-prev{padding:18px 18px 10px;text-align:center;min-height:120px}'
     +'#bk-story .bkst-prev img{max-height:58vh;width:auto;max-width:100%;border-radius:12px;box-shadow:0 10px 26px rgba(120,90,40,.3);cursor:pointer}'
     +'#bk-story .bkst-btns{display:flex;flex-direction:column;gap:10px;padding:0 22px}'
     +'#bk-story .bkst-change{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px;border-radius:12px;border:1px dashed rgba(160,120,74,.65);background:transparent;color:#8B6B3D;font-family:inherit;font-size:.92rem;font-weight:700;cursor:pointer}'
     +'#bk-story .bkst-change svg{width:18px;height:18px;fill:currentColor}'
     +'#bk-story .bkst-b{display:flex;align-items:center;justify-content:center;gap:9px;padding:14px;border-radius:12px;border:1px solid rgba(160,120,74,.4);background:#fff;color:#3A2C1C;font-family:inherit;font-size:.95rem;font-weight:700;cursor:pointer}'
     +'#bk-story .bkst-b.primary{background:linear-gradient(90deg,#C9A96E,#A0784A);color:#1A0F08;border-color:transparent}'
     +'#bk-story .bkst-b svg{width:19px;height:19px;fill:currentColor}';
    var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  }

  // ---------------- Story modal ----------------
  var storyEl, storyImg, _file=null, _blob=null, _url='', _text='', _img=null, _tpl=0;
  function buildStoryUI(){
    if(storyEl) return; injectStyles();
    storyEl=document.createElement('div'); storyEl.id='bk-story';
    storyEl.innerHTML='<div class="bkst-card"><button class="bkst-x" aria-label="ปิด">&times;</button>'
      +'<div class="bkst-prev"><img id="bkst-img" alt="ตัวอย่างรูป Story"></div>'
      +'<div class="bkst-btns">'
        +'<button id="bkst-change" class="bkst-change"><svg viewBox="0 0 24 24"><path d="M12 6V3L8 7l4 4V8a5 5 0 11-5 5H5a7 7 0 107-7z"/></svg>เปลี่ยนดีไซน์ <span id="bkst-count"></span></button>'
        +'<button id="bkst-share" class="bkst-b primary"><svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>แชร์รูป</button>'
        +'<button id="bkst-fb" class="bkst-b primary"><svg viewBox="0 0 24 24"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>แชร์ลง Facebook Story</button>'
        +'<button id="bkst-save" class="bkst-b"><svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>บันทึกรูป</button>'
      +'</div></div>';
    document.body.appendChild(storyEl);
    storyImg=storyEl.querySelector('#bkst-img');
    storyEl.querySelector('.bkst-x').addEventListener('click',closeStory);
    storyEl.addEventListener('click',function(e){ if(e.target===storyEl) closeStory(); });
    storyImg.addEventListener('click',function(){ try{ window.open(_url||pageUrl(),'_blank'); }catch(e){} });
    storyEl.querySelector('#bkst-change').addEventListener('click',function(){ _tpl=(_tpl+1)%TEMPLATES.length; renderTpl(); });
    storyEl.querySelector('#bkst-share').addEventListener('click',shareFile);
    storyEl.querySelector('#bkst-fb').addEventListener('click',shareFB);
    storyEl.querySelector('#bkst-save').addEventListener('click',saveFile);
  }
  function renderTpl(){
    var canvas=build(_img,_text,_url,_tpl);
    try{ storyImg.src=canvas.toDataURL('image/jpeg',0.9); }catch(e){}
    _blob=null; _file=null;
    canvas.toBlob(function(b){ _blob=b; try{ _file=new File([b],'blook-story.jpg',{type:'image/jpeg'}); }catch(e){ _file=null; } },'image/jpeg',0.92);
    var cnt=document.getElementById('bkst-count'); if(cnt) cnt.textContent='('+(_tpl+1)+'/'+TEMPLATES.length+')';
  }
  function openStory(){ storyEl.classList.add('open'); document.body.style.overflow='hidden'; }
  function closeStory(){ storyEl.classList.remove('open'); document.body.style.overflow=''; }
  function shareFile(){
    if(_file && navigator.share && navigator.canShare && navigator.canShare({files:[_file]})){
      navigator.share({files:[_file]}).then(closeStory).catch(function(err){ if(err&&err.name==='AbortError')return; saveFile(); });
    } else { saveFile(); }
  }
  function shareFB(){
    if(_file && navigator.share && navigator.canShare && navigator.canShare({files:[_file]})){
      navigator.share({files:[_file]}).then(function(){ setTimeout(fbTip,400); }).catch(function(err){ if(err&&err.name==='AbortError')return; fbManual(); });
      return;
    }
    fbManual();
  }
  function fbTip(){ alert('ลง Facebook Story:\nเปิดแอป Facebook → แตะ “สตอรี่ของคุณ” (+) → เลือกรูปที่เพิ่งบันทึก'); }
  function fbManual(){
    if(!_blob){ alert('กำลังเตรียมรูป… รออีกสักครู่แล้วลองใหม่นะคะ'); return; }
    saveFile();
    setTimeout(function(){ alert('บันทึกรูปแล้ว 📥\n\nวิธีลง Facebook Story:\n1) เปิดแอป Facebook\n2) แตะ “สตอรี่ของคุณ” (เครื่องหมาย +)\n3) เลือกรูป blook-story.jpg ที่เพิ่งบันทึก'); }, 500);
  }
  function saveFile(){
    if(!_blob){ alert('กำลังเตรียมรูป… รออีกสักครู่แล้วลองใหม่นะคะ'); return; } var u=URL.createObjectURL(_blob);
    try{ var a=document.createElement('a'); a.href=u; a.download='blook-story.jpg'; document.body.appendChild(a); a.click(); a.remove(); }catch(e){}
    setTimeout(function(){ try{ window.open(u,'_blank'); }catch(e){} setTimeout(function(){URL.revokeObjectURL(u);},9000); },150);
  }
  function waitLogo(cb){ if(LOGO_OK) return cb(); var n=0,t=setInterval(function(){ if(LOGO_OK||++n>15){ clearInterval(t); cb(); } },120); }
  window.bkIgStory=function(imgUrl,text,url){
    buildStoryUI();
    _url=url||pageUrl(); _text=text||''; _file=null; _blob=null; _img=null;
    _tpl=Math.floor(Math.random()*TEMPLATES.length);
    if(storyImg) storyImg.removeAttribute('src');
    openStory();
    var src=sameOrigin(imgUrl||'assets/catalog/sofa-overview-1.jpg');
    var ready=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
    ready.then(function(){ waitLogo(function(){
      var img=new Image(); img.crossOrigin='anonymous'; var done=false;
      img.onload=function(){ if(done)return; done=true; _img=img; renderTpl(); };
      img.onerror=function(){ if(done)return; done=true; _img=null; renderTpl(); };
      img.src=src;
      setTimeout(function(){ if(!done){ done=true; _img=null; renderTpl(); } },4500);
    }); });
  };

  // ---------------- image lightbox ----------------
  var lbEl, lbImg, _list=[], _idx=0;
  function buildLbUI(){
    if(lbEl) return; injectStyles();
    lbEl=document.createElement('div'); lbEl.id='bk-img-lb';
    lbEl.innerHTML='<div class="bilb-card">'
      +'<div class="bilb-imgwrap">'
        +'<button class="bilb-x" aria-label="ปิด">&times;</button>'
        +'<button class="bilb-nav bilb-prev" aria-label="ก่อนหน้า">&#8249;</button>'
        +'<img id="bk-lb-img" alt="">'
        +'<button class="bilb-nav bilb-next" aria-label="ถัดไป">&#8250;</button>'
      +'</div>'
      +'<button class="bilb-share"><svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg><span>แชร์รูป</span></button>'
      +'</div>';
    document.body.appendChild(lbEl);
    lbImg=lbEl.querySelector('#bk-lb-img');
    lbEl.querySelector('.bilb-x').addEventListener('click',closeLb);
    lbEl.addEventListener('click',function(e){ if(e.target===lbEl) closeLb(); });
    lbImg.addEventListener('click',function(){ try{ window.open(pageUrl(),'_blank'); }catch(e){} });
    lbEl.querySelector('.bilb-prev').addEventListener('click',function(){ navLb(-1); });
    lbEl.querySelector('.bilb-next').addEventListener('click',function(){ navLb(1); });
    lbEl.querySelector('.bilb-share').addEventListener('click',function(){ window.bkIgStory(_list[_idx], document.title, pageUrl()); });
    document.addEventListener('keydown',function(e){ if(!lbEl.classList.contains('open'))return; if(e.key==='Escape')closeLb(); if(e.key==='ArrowLeft')navLb(-1); if(e.key==='ArrowRight')navLb(1); });
  }
  function showLb(){ lbImg.src=_list[_idx]; var multi=_list.length>1; lbEl.querySelector('.bilb-prev').style.display=multi?'block':'none'; lbEl.querySelector('.bilb-next').style.display=multi?'block':'none'; }
  function navLb(d){ _idx=(_idx+d+_list.length)%_list.length; showLb(); }
  function closeLb(){ lbEl.classList.remove('open'); document.body.style.overflow=''; }
  window.bkLightbox=function(src,alt,list,idx){ buildLbUI(); _list=(list&&list.length)?list:[src]; _idx=(typeof idx==='number'&&idx>=0)?idx:0; showLb(); lbEl.classList.add('open'); document.body.style.overflow='hidden'; };

  // ---------------- auto-attach: every content image is shareable ----------------
  function srcOf(im){ return im.currentSrc||im.getAttribute('src')||im.src; }
  function qualifies(im){
    if(!im||im.tagName!=='IMG') return false;
    if(im.closest('a,nav,footer,header,.contact-fab,#bk-story,#bk-img-lb,.lang-m,.nav-logo,.catalog,.page,[data-no-lb],.no-lb')) return false;
    var w=im.clientWidth||im.naturalWidth||0; if(w<80) return false;
    return !!srcOf(im);
  }
  document.addEventListener('click',function(e){
    if(!e.target||!e.target.closest) return;
    if(e.target.closest('#bk-img-lb,#bk-story,a,button')) return;
    var fig=e.target.closest('figure,.gov-tile,.rv-tile,picture');
    var img=e.target.closest('img') || (fig && fig.querySelector('img'));
    if(!img || !qualifies(img)) return;
    e.preventDefault(); e.stopPropagation();
    var all=[].slice.call(document.querySelectorAll('img')).filter(qualifies);
    var list=all.map(srcOf); var idx=all.indexOf(img);
    window.bkLightbox(srcOf(img), img.alt||'', list, idx<0?0:idx);
  },true);
})();
