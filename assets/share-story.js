/* BLOOK — universal image lightbox + branded Instagram-Story share.
   - Click ANY content image  → popup (image is clickable → website) with a "แชร์ลง IG Story" button UNDER the image.
   - That button → branded 1080x1920 Story image (cream bg, THIN gold border + soft shadow, Thai rendered correctly)
     shown with only two actions: "แชร์รูป" (native file share) and "บันทึกรูป" (download).
   The shareable file is prepared up-front so navigator.share() runs inside the button's user-gesture. */
(function(){
  var GOLD='#A0784A', GOLDL='#C9A96E', BLACK='#1A0F08';

  function sameOrigin(src){ try{ var u=new URL(src, location.href); return (u.origin===location.origin)? u.href : u.pathname.replace(/^\//,''); }catch(e){ return src; } }
  function prettyUrl(u){ try{ return (u||'https://blookliving.com').replace(/^https?:\/\//,'').replace(/\/+$/,''); }catch(e){ return 'blookliving.com'; } }
  function pageUrl(){ var c=document.querySelector('link[rel="canonical"]'); return (c&&c.href)||location.href.split('#')[0]; }
  function rr(x,X,Y,w,h,r){ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+w,Y,X+w,Y+h,r); x.arcTo(X+w,Y+h,X,Y+h,r); x.arcTo(X,Y+h,X,Y,r); x.arcTo(X,Y,X+w,Y,r); x.closePath(); }
  function cover(x,img,X,Y,w,h){ var ir=img.width/img.height, tr=w/h, sw,sh,sx,sy; if(ir>tr){ sh=img.height; sw=sh*tr; sx=(img.width-sw)/2; sy=0; } else { sw=img.width; sh=sw/tr; sx=0; sy=(img.height-sh)/2; } x.drawImage(img,sx,sy,sw,sh,X,Y,w,h); }
  // letter-spacing helper — LATIN ONLY (never use on Thai: it breaks combining vowels/tone marks)
  function spacedLatin(x,str,cx,y,sp){ var w=[],tot=0,i; for(i=0;i<str.length;i++){ var ww=x.measureText(str[i]).width; w.push(ww); tot+=ww+sp; } tot-=sp; var sx=cx-tot/2, a=x.textAlign; x.textAlign='left'; for(i=0;i<str.length;i++){ x.fillText(str[i],sx,y); sx+=w[i]+sp; } x.textAlign=a; }
  function measureSpaced(x,str,sp){ var t=0,i; for(i=0;i<str.length;i++){ t+=x.measureText(str[i]).width+sp; } return t-sp; }
  function wrapBottom(x,text,cx,bottomY,maxW,lh,maxLines){ var words=(text||'').split(/\s+/), line='', lines=[], i; for(i=0;i<words.length;i++){ var t=line?line+' '+words[i]:words[i]; if(x.measureText(t).width>maxW && line){ lines.push(line); line=words[i]; } else line=t; } if(line) lines.push(line); if(maxLines && lines.length>maxLines){ lines=lines.slice(0,maxLines); lines[maxLines-1]=lines[maxLines-1]+'…'; } var startY=bottomY-(lines.length-1)*lh; for(i=0;i<lines.length;i++){ x.fillText(lines[i],cx,startY+i*lh); } }

  function build(img,text,url){
    var W=1080,H=1920, c=document.createElement('canvas'); c.width=W; c.height=H; var x=c.getContext('2d');
    // cream background
    var g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#FAF5EC'); g.addColorStop(1,'#EEE3D2');
    x.fillStyle=g; x.fillRect(0,0,W,H);
    // very subtle hairline frame (modern)
    x.strokeStyle='rgba(160,120,74,.28)'; x.lineWidth=1.5; rr(x,46,46,W-92,H-92,22); x.stroke();
    // wordmark (gold) + subtitle (black) — subtitle is Latin so letter-spacing is safe
    x.textAlign='center';
    // BLOOK wordmark — upright Fraunces 600 (a font weight the pages actually load) with a vertical gold gradient + wide tracking
    var _wm=x.createLinearGradient(0,120,0,236); _wm.addColorStop(0,'#D2AE71'); _wm.addColorStop(.5,'#B58E52'); _wm.addColorStop(1,'#946C34');
    x.fillStyle=_wm; x.font='600 118px Fraunces,"Cormorant Garamond",Georgia,serif';
    spacedLatin(x,'BLOOK',W/2,224,20);
    // tagline flanked by thin gold rules (editorial luxury look)
    x.fillStyle='#8B6B3D'; x.font='500 27px Inter,Arial,sans-serif';
    var _tag='THE CLASS OF CALM', _tw=measureSpaced(x,_tag,11);
    spacedLatin(x,_tag,W/2,292,11);
    x.strokeStyle='rgba(160,120,74,.5)'; x.lineWidth=1.5;
    var _ly=283, _gap=_tw/2+28, _len=58;
    x.beginPath(); x.moveTo(W/2-_gap-_len,_ly); x.lineTo(W/2-_gap,_ly); x.stroke();
    x.beginPath(); x.moveTo(W/2+_gap,_ly); x.lineTo(W/2+_gap+_len,_ly); x.stroke();
    // product card — soft shadow + THIN gold border
    var cx=130,cy=350,cw=820,ch=1000,rad=28;
    x.save(); x.shadowColor='rgba(70,48,18,.34)'; x.shadowBlur=42; x.shadowOffsetY=20; x.fillStyle='#fff'; rr(x,cx,cy,cw,ch,rad); x.fill(); x.restore();
    x.save(); rr(x,cx,cy,cw,ch,rad); x.clip(); if(img){ cover(x,img,cx,cy,cw,ch); } else { x.fillStyle='#E7DAC4'; x.fillRect(cx,cy,cw,ch); } x.restore();
    x.strokeStyle=GOLD; x.lineWidth=2.5; rr(x,cx+1,cy+1,cw-2,ch-2,rad); x.stroke();
    // title (Thai, plain) — strip the brand tagline so it doesn't crowd the page title
    var t=(text||'BLOOK LIVING').replace(/\s*[—\-–|]\s*The Class of Calm.*$/i,'').replace(/\s*\|\s*BLOOK LIVING\s*$/i,'').trim() || 'BLOOK LIVING';
    x.fillStyle=BLACK; x.font='500 38px "IBM Plex Sans Thai","Noto Sans Thai",sans-serif';
    wrapBottom(x,t,W/2,cy+ch+96,cw-30,50,2);
    // brand tagline (gold italic) — sits below the title, same vibe as the wordmark
    x.fillStyle=GOLD; x.font='italic 500 28px Fraunces, Georgia, serif';
    x.fillText('— The Class of Calm —', W/2, cy+ch+170);
    // domain (gold) — anchor at the bottom
    x.fillStyle=GOLD; x.font='600 42px Inter, Arial, sans-serif'; x.fillText('blookliving.com', W/2, 1740);
    return c;
  }

  // ---------- shared styles ----------
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
     +'#bk-story .bkst-prev{padding:18px 18px 12px;text-align:center}'
     +'#bk-story .bkst-prev img{max-height:60vh;width:auto;max-width:100%;border-radius:12px;box-shadow:0 10px 26px rgba(120,90,40,.3);cursor:pointer}'
     +'#bk-story .bkst-btns{display:flex;flex-direction:column;gap:10px;padding:0 22px}'
     +'#bk-story .bkst-b{display:flex;align-items:center;justify-content:center;gap:9px;padding:14px;border-radius:12px;border:1px solid rgba(160,120,74,.4);background:#fff;color:#3A2C1C;font-family:inherit;font-size:.95rem;font-weight:700;cursor:pointer}'
     +'#bk-story .bkst-b.primary{background:linear-gradient(90deg,#C9A96E,#A0784A);color:#1A0F08;border-color:transparent}'
     +'#bk-story .bkst-b svg{width:19px;height:19px;fill:currentColor}';
    var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  }

  // ---------- IG Story modal (stage 2): preview + 2 buttons only ----------
  var storyEl, storyImg, _file=null, _blob=null, _url='';
  function buildStoryUI(){
    if(storyEl) return; injectStyles();
    storyEl=document.createElement('div'); storyEl.id='bk-story';
    storyEl.innerHTML='<div class="bkst-card"><button class="bkst-x" aria-label="ปิด">&times;</button>'
      +'<div class="bkst-prev"><img id="bkst-img" alt="ตัวอย่างรูป Story"></div>'
      +'<div class="bkst-btns">'
        +'<button id="bkst-share" class="bkst-b primary"><svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>แชร์ลง IG Story</button>'
        +'<button id="bkst-fb" class="bkst-b primary"><svg viewBox="0 0 24 24"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>แชร์ลง Facebook Story</button>'
        +'<button id="bkst-save" class="bkst-b"><svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>บันทึกรูป</button>'
      +'</div></div>';
    document.body.appendChild(storyEl);
    storyImg=storyEl.querySelector('#bkst-img');
    storyEl.querySelector('.bkst-x').addEventListener('click',closeStory);
    storyEl.addEventListener('click',function(e){ if(e.target===storyEl) closeStory(); });
    storyImg.addEventListener('click',function(){ try{ window.open(_url||pageUrl(),'_blank'); }catch(e){} });
    storyEl.querySelector('#bkst-share').addEventListener('click',shareFile);
    storyEl.querySelector('#bkst-fb').addEventListener('click',shareFB);
    storyEl.querySelector('#bkst-save').addEventListener('click',saveFile);
  }
  function openStory(){ storyEl.classList.add('open'); document.body.style.overflow='hidden'; }
  function closeStory(){ storyEl.classList.remove('open'); document.body.style.overflow=''; }
  // IG Story: native file share → ผู้ใช้เลือก Instagram → Add to Story (วิธีที่ใช้ได้จริงบนเว็บมือถือ)
  function shareFile(){
    if(_file && navigator.share && navigator.canShare && navigator.canShare({files:[_file]})){
      navigator.share({files:[_file]}).then(closeStory).catch(function(err){ if(err&&err.name==='AbortError')return; saveFile(); });
    } else { saveFile(); }
  }
  // Facebook Story: เฟซบุ๊กไม่มีช่องทางให้โพสต์ลง Story โดยตรงจากเว็บ
  //   วิธีที่ได้ผล = บันทึกรูปลงคลังภาพ แล้วเปิดแอป Facebook → สร้างสตอรี่ → เลือกรูปนั้น
  //   มือถือ: เปิดชีตแชร์ (มีปุ่ม "บันทึกรูป"/Save Image ลงคลังภาพ) ก่อน
  function shareFB(){
    if(_file && navigator.share && navigator.canShare && navigator.canShare({files:[_file]})){
      navigator.share({files:[_file]})
        .then(function(){ setTimeout(fbTip,400); })
        .catch(function(err){ if(err&&err.name==='AbortError')return; fbManual(); });
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
  window.bkIgStory=function(imgUrl,text,url){
    buildStoryUI();
    _url=url||pageUrl(); _file=null; _blob=null;
    var src=sameOrigin(imgUrl||'assets/catalog/sofa-overview-1.jpg');
    var ready=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
    ready.then(function(){
      var img=new Image(); img.crossOrigin='anonymous'; var built=false;
      function go(im){ if(built)return; built=true; var canvas=build(im,text,_url);
        try{ storyImg.src=canvas.toDataURL('image/jpeg',0.9); }catch(e){}
        canvas.toBlob(function(b){ _blob=b; try{ _file=new File([b],'blook-story.jpg',{type:'image/jpeg'}); }catch(e){ _file=null; } },'image/jpeg',0.92);
        openStory();
      }
      img.onload=function(){ go(img); }; img.onerror=function(){ go(null); }; img.src=src;
      setTimeout(function(){ if(!built) go(null); },4500);
    });
  };
  window.bkBuildStoryCanvas=build;

  // ---------- image lightbox (stage 1): image clickable→web + share-below ----------
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

  // ---------- auto-attach: make every content image shareable ----------
  function srcOf(im){ return im.currentSrc||im.getAttribute('src')||im.src; }
  function qualifies(im){
    if(!im||im.tagName!=='IMG') return false;
    if(im.closest('a,nav,footer,header,.contact-fab,#bk-story,#bk-img-lb,.lang-m,.nav-logo,.catalog,.page,[data-no-lb],.no-lb')) return false;
    var w=im.clientWidth||0, nw=im.naturalWidth||0; if(w<56 && nw<240) return false; // skip tiny icons only
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
