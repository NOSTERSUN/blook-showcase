/* BLOOK — branded Instagram Story image + share helper.
   window.bkIgStory(imgUrl, text, url):
     builds an on-brand 1080x1920 Story image (cream bg, gold image border, gold+black text),
     opens a guide popup with a preview, step-by-step instructions, and Share / Save / Open-IG buttons.
   The shareable file is prepared up-front so navigator.share() runs inside the button's
   user-gesture (this is what makes sharing reliable on mobile). */
(function(){
  var GOLD='#A0784A', GOLDL='#C9A96E', BLACK='#1A0F08', CREAM='#F6F0E6';

  function sameOrigin(src){
    try{ var u=new URL(src, location.href); return (u.origin===location.origin)? u.href : u.pathname.replace(/^\//,''); }
    catch(e){ return src; }
  }
  function prettyUrl(u){ try{ return (u||'https://blookliving.com').replace(/^https?:\/\//,'').replace(/\/+$/,''); }catch(e){ return 'blookliving.com'; } }
  function rr(x,X,Y,w,h,r){ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+w,Y,X+w,Y+h,r); x.arcTo(X+w,Y+h,X,Y+h,r); x.arcTo(X,Y+h,X,Y,r); x.arcTo(X,Y,X+w,Y,r); x.closePath(); }
  function cover(x,img,X,Y,w,h){
    var ir=img.width/img.height, tr=w/h, sw,sh,sx,sy;
    if(ir>tr){ sh=img.height; sw=sh*tr; sx=(img.width-sw)/2; sy=0; }
    else { sw=img.width; sh=sw/tr; sx=0; sy=(img.height-sh)/2; }
    x.drawImage(img,sx,sy,sw,sh,X,Y,w,h);
  }
  function spaced(x,str,cx,y,sp){
    var w=[],tot=0,i; for(i=0;i<str.length;i++){ var ww=x.measureText(str[i]).width; w.push(ww); tot+=ww+sp; } tot-=sp;
    var sx=cx-tot/2, a=x.textAlign; x.textAlign='left';
    for(i=0;i<str.length;i++){ x.fillText(str[i],sx,y); sx+=w[i]+sp; }
    x.textAlign=a;
  }
  function wrapBottom(x,text,cx,bottomY,maxW,lh,maxLines){
    var words=(text||'').split(/\s+/), line='', lines=[], i;
    for(i=0;i<words.length;i++){ var t=line?line+' '+words[i]:words[i]; if(x.measureText(t).width>maxW && line){ lines.push(line); line=words[i]; } else line=t; }
    if(line) lines.push(line);
    if(maxLines && lines.length>maxLines){ lines=lines.slice(0,maxLines); lines[maxLines-1]=lines[maxLines-1]+'…'; }
    var startY=bottomY-(lines.length-1)*lh;
    for(i=0;i<lines.length;i++){ x.fillText(lines[i],cx,startY+i*lh); }
  }

  function build(img,text,url){
    var W=1080,H=1920, c=document.createElement('canvas'); c.width=W; c.height=H; var x=c.getContext('2d');
    // cream background
    var g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#F8F2E8'); g.addColorStop(1,'#ECE0CC');
    x.fillStyle=g; x.fillRect(0,0,W,H);
    // soft gold glow
    var rgl=x.createRadialGradient(W/2,250,40,W/2,250,760); rgl.addColorStop(0,'rgba(160,120,74,.10)'); rgl.addColorStop(1,'rgba(160,120,74,0)');
    x.fillStyle=rgl; x.fillRect(0,0,W,860);
    // gold outer frame
    x.strokeStyle=GOLD; x.lineWidth=3; rr(x,38,38,W-76,H-76,26); x.stroke();
    x.strokeStyle='rgba(160,120,74,.45)'; x.lineWidth=1; rr(x,50,50,W-100,H-100,20); x.stroke();
    // wordmark (gold) + subtitle (black)
    x.textAlign='center';
    x.fillStyle=GOLD; x.font='italic 600 132px Fraunces, Georgia, serif'; x.fillText('BLOOK',W/2,238);
    x.fillStyle=BLACK; x.font='600 30px Inter, Arial, sans-serif'; spaced(x,'THE CLASS OF CALM',W/2,292,10);
    // product card with thick gold border
    var cx=120,cy=340,cw=W-240,ch=940,rad=26;
    x.save(); rr(x,cx,cy,cw,ch,rad); x.clip();
    if(img){ cover(x,img,cx,cy,cw,ch); } else { x.fillStyle='#E5D8C2'; x.fillRect(cx,cy,cw,ch); }
    x.restore();
    x.strokeStyle=GOLD; x.lineWidth=10; rr(x,cx+5,cy+5,cw-10,ch-10,rad-3); x.stroke();
    x.strokeStyle=GOLDL; x.lineWidth=2; rr(x,cx+12,cy+12,cw-24,ch-24,rad-6); x.stroke();
    // title (black) below card
    x.fillStyle=BLACK; x.font='600 50px "IBM Plex Sans Thai", Fraunces, serif';
    wrapBottom(x,text||'BLOOK LIVING',W/2,cy+ch+118,cw-40,64,2);
    // CTA pill (gold bg, black text) with URL
    var pw=660,ph=110,px=(W-pw)/2,py=1545;
    var pg=x.createLinearGradient(px,0,px+pw,0); pg.addColorStop(0,'#C9A96E'); pg.addColorStop(1,'#A0784A');
    x.fillStyle=pg; rr(x,px,py,pw,ph,ph/2); x.fill();
    x.fillStyle=BLACK; x.textAlign='center';
    x.font='700 27px Inter, Arial, sans-serif'; spaced(x,'เยี่ยมชมเว็บไซต์ · SHOP NOW',W/2,py+44,1.5);
    x.font='600 37px Inter, Arial, sans-serif'; x.fillText(prettyUrl(url),W/2,py+88);
    // handle
    x.fillStyle='#6B5A45'; x.font='600 28px Inter, Arial, sans-serif'; x.fillText('@blookliving',W/2,1760);
    return c;
  }

  // ---- guide popup ----
  var injected=false, modal, prevImg, urlSpan, _file=null, _blob=null, _url='';
  function injectUI(){
    if(injected) return; injected=true;
    var css='#bk-story{position:fixed;inset:0;z-index:10050;background:rgba(20,14,8,.72);backdrop-filter:blur(5px);display:none;align-items:center;justify-content:center;padding:18px;font-family:Inter,"IBM Plex Sans Thai",sans-serif}'
      +'#bk-story.open{display:flex}'
      +'#bk-story .bkst-card{background:#F6F0E6;border:1px solid rgba(160,120,74,.4);border-radius:20px;max-width:430px;width:100%;max-height:94vh;overflow:auto;box-shadow:0 24px 60px rgba(0,0,0,.5);position:relative}'
      +'#bk-story .bkst-x{position:absolute;top:10px;right:12px;width:34px;height:34px;border-radius:50%;border:none;background:rgba(26,15,8,.55);color:#fff;font-size:1.3rem;line-height:1;cursor:pointer;z-index:2}'
      +'#bk-story .bkst-prev{padding:18px 18px 6px;text-align:center}'
      +'#bk-story .bkst-prev img{max-height:246px;width:auto;max-width:100%;border-radius:12px;box-shadow:0 8px 22px rgba(120,90,40,.28)}'
      +'#bk-story .bkst-body{padding:6px 22px 22px}'
      +'#bk-story h3{font-family:Fraunces,serif;font-size:1.18rem;color:#1A0F08;margin:6px 0 4px;text-align:center}'
      +'#bk-story .bkst-tag{font-size:.78rem;color:#8B7355;text-align:center;margin-bottom:14px}'
      +'#bk-story ol{margin:0 0 16px;padding-left:20px;color:#3A2C1C}'
      +'#bk-story ol li{font-size:.86rem;line-height:1.55;margin-bottom:7px}'
      +'#bk-story ol li b{color:#1A0F08}'
      +'#bk-story #bkst-url{color:#A0784A;font-weight:700;word-break:break-all}'
      +'#bk-story .bkst-btns{display:flex;flex-direction:column;gap:9px}'
      +'#bk-story .bkst-b{display:flex;align-items:center;justify-content:center;gap:8px;padding:13px;border-radius:11px;border:1px solid rgba(160,120,74,.4);background:#fff;color:#3A2C1C;font-family:inherit;font-size:.9rem;font-weight:600;cursor:pointer;text-decoration:none}'
      +'#bk-story .bkst-b.primary{background:linear-gradient(90deg,#C9A96E,#A0784A);color:#1A0F08;border-color:transparent}'
      +'#bk-story .bkst-b svg{width:18px;height:18px;fill:currentColor}';
    var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
    modal=document.createElement('div'); modal.id='bk-story';
    modal.innerHTML='<div class="bkst-card">'
      +'<button class="bkst-x" aria-label="ปิด">&times;</button>'
      +'<div class="bkst-prev"><img id="bkst-img" alt="ตัวอย่างรูป Story"></div>'
      +'<div class="bkst-body">'
        +'<h3>แชร์ลง Instagram Story</h3>'
        +'<p class="bkst-tag">รูปแบรนด์พร้อมลิงก์ — ทำตาม 4 ขั้นตอน</p>'
        +'<ol>'
          +'<li>กด <b>"แชร์รูป"</b> แล้วเลือก <b>Instagram</b> &nbsp;(หรือกด <b>"บันทึกรูป"</b> เพื่อเซฟลงเครื่องก่อน)</li>'
          +'<li>เปิดแอป <b>Instagram</b> → สร้าง <b>Story</b> → เลือกรูปนี้</li>'
          +'<li>แตะไอคอน <b>สติกเกอร์</b> → เลือก <b>"ลิงก์ / Link"</b> → วาง <span id="bkst-url"></span></li>'
          +'<li>โพสต์ได้เลย 🎉</li>'
        +'</ol>'
        +'<div class="bkst-btns">'
          +'<button id="bkst-share" class="bkst-b primary"><svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>แชร์รูป</button>'
          +'<button id="bkst-save" class="bkst-b"><svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>บันทึกรูป</button>'
          +'<a id="bkst-ig" class="bkst-b" href="https://www.instagram.com/" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.93 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.41-10.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/></svg>เปิด Instagram</a>'
        +'</div>'
      +'</div></div>';
    document.body.appendChild(modal);
    prevImg=modal.querySelector('#bkst-img'); urlSpan=modal.querySelector('#bkst-url');
    modal.querySelector('.bkst-x').addEventListener('click',closeModal);
    modal.addEventListener('click',function(e){ if(e.target===modal) closeModal(); });
    modal.querySelector('#bkst-share').addEventListener('click',doShareFile);
    modal.querySelector('#bkst-save').addEventListener('click',doSave);
  }
  function openModal(){ modal.classList.add('open'); document.body.style.overflow='hidden'; }
  function closeModal(){ modal.classList.remove('open'); document.body.style.overflow=''; }

  function doShareFile(){
    // runs inside a fresh user gesture; _file is already prepared
    if(_file && navigator.share && navigator.canShare && navigator.canShare({files:[_file]})){
      navigator.share({files:[_file], text:document.title+' · '+prettyUrl(_url)}).then(closeModal).catch(function(err){
        if(err && err.name==='AbortError') return; doSave();
      });
    } else {
      alert('อุปกรณ์นี้แชร์รูปเข้าแอปโดยตรงไม่ได้ — กด "บันทึกรูป" แล้วอัปโหลดใน Instagram Story เองได้เลยค่ะ');
      doSave();
    }
  }
  function doSave(){
    if(!_blob) return;
    var u=URL.createObjectURL(_blob);
    try{ var a=document.createElement('a'); a.href=u; a.download='blook-story.jpg'; document.body.appendChild(a); a.click(); a.remove(); }catch(e){}
    // mobile browsers often ignore download → also open the image so it can be long-pressed & saved
    setTimeout(function(){ try{ window.open(u,'_blank'); }catch(e){} setTimeout(function(){URL.revokeObjectURL(u);},8000); },150);
  }

  window.bkIgStory=function(imgUrl,text,url){
    injectUI();
    _url=url||location.href; _file=null; _blob=null;
    if(urlSpan) urlSpan.textContent=prettyUrl(_url);
    var src=sameOrigin(imgUrl||'assets/catalog/sofa-overview-1.jpg');
    var ready=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
    ready.then(function(){
      var img=new Image(); img.crossOrigin='anonymous';
      var built=false;
      function go(im){
        if(built) return; built=true;
        var canvas=build(im,text,_url);
        try{ prevImg.src=canvas.toDataURL('image/jpeg',0.9); }catch(e){}
        canvas.toBlob(function(b){
          _blob=b;
          try{ _file=new File([b],'blook-story.jpg',{type:'image/jpeg'}); }catch(e){ _file=null; }
        },'image/jpeg',0.92);
        openModal();
      }
      img.onload=function(){ go(img); };
      img.onerror=function(){ go(null); };
      img.src=src;
      setTimeout(function(){ if(!built) go(null); },4500);
    });
  };
  window.bkBuildStoryCanvas=build; // for preview/testing
})();
