/* BLOOK floating Contact + Share widget — include on any page:
   <script src="assets/contact-widget.js"></script>  (path may be ../assets/... if nested) */
(function(){
  var GOLD='#B8860B', GOLDD='#8B6914';
  // Google Analytics (GA4) — โหลด analytics.js (Measurement ID อยู่ในไฟล์เดียว) ครอบคลุมทุกหน้าที่ฝังวิดเจ็ตนี้
  try{ var _cs=document.currentScript, _base=(_cs&&_cs.src)?_cs.src.replace(/contact-widget\.js.*$/,''):'assets/'; var _ga=document.createElement('script'); _ga.src=_base+'analytics.js'; document.head.appendChild(_ga); }catch(e){}
  // โหลดตัวสร้างรูป IG Story แบรนด์ BLOOK (window.bkIgStory)
  // เปลี่ยน v= ทุกครั้งที่อัปเดต share-story.js เพื่อบังคับให้เบราว์เซอร์โหลดเวอร์ชันใหม่
  try{ var _ss=document.createElement('script'); _ss.src=(_base||'assets/')+'share-story.js?v=20260606-1'; document.head.appendChild(_ss); }catch(e){}
  var css = `
  .contact-fab{position:fixed;right:26px;bottom:26px;z-index:9000;display:flex;flex-direction:column;align-items:flex-end;gap:12px;font-family:'Inter','IBM Plex Sans Thai',sans-serif}
  .contact-fab .fab-actions{display:flex;flex-direction:column;gap:10px;opacity:0;transform:translateY(10px) scale(.9);pointer-events:none;transition:all .3s cubic-bezier(.34,1.56,.64,1)}
  .contact-fab.open .fab-actions{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}
  .contact-fab .fab-item{display:flex;align-items:center;gap:10px;text-decoration:none;justify-content:flex-end}
  .contact-fab .fab-tag{background:#fff;color:#1A0F08;font-size:.78rem;font-weight:500;padding:7px 12px;border-radius:8px;box-shadow:0 4px 14px rgba(0,0,0,.12);white-space:nowrap}
  .contact-fab .fab-icon{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(0,0,0,.2);flex-shrink:0;transition:transform .2s}
  .contact-fab .fab-icon:hover{transform:scale(1.1)}
  .contact-fab .fab-icon svg{width:23px;height:23px;fill:#fff}
  .contact-fab .fab-call{background:#2E7D32}.contact-fab .fab-line{background:#06C755}.contact-fab .fab-fb{background:#0084FF}
  .contact-fab .fab-toggle{width:60px;height:60px;border-radius:50%;background:${GOLD};border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(184,134,11,.4);transition:all .3s}
  .contact-fab .fab-toggle:hover{background:${GOLDD}}
  .contact-fab .fab-toggle svg{width:28px;height:28px;fill:#fff}
  .contact-fab.open .fab-toggle{background:#1A0F08}
  .contact-fab.open .fab-toggle .fab-open-ic{display:none}.contact-fab .fab-close-ic{display:none}.contact-fab.open .fab-toggle .fab-close-ic{display:block}
  .contact-fab .fab-share{width:46px;height:46px;border-radius:50%;background:#fff;border:1px solid rgba(184,134,11,.35);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(0,0,0,.12);transition:all .3s;align-self:flex-end;margin-right:7px}
  .contact-fab .fab-share:hover{background:${GOLD};transform:scale(1.08)}
  .contact-fab .fab-share svg{width:20px;height:20px;fill:${GOLD};transition:fill .3s}
  .contact-fab .fab-share:hover svg{fill:#fff}
  .contact-fab .fab-row{display:flex;align-items:center;gap:8px;justify-content:flex-end;background:rgba(255,255,255,.97);padding:8px 10px;border-radius:16px;box-shadow:0 6px 18px rgba(0,0,0,.16)}
  .contact-fab .fab-row-label{font-size:.7rem;font-weight:700;color:#5C4E46;margin-right:2px;white-space:nowrap;letter-spacing:.05em}
  .contact-fab .fab-row #bk-order-mini{display:flex;gap:8px}
  .contact-fab .fab-mini{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;border:none;text-decoration:none;transition:transform .2s;padding:0}
  .contact-fab .fab-mini:hover{transform:scale(1.12)}
  .contact-fab .fab-mini svg{width:21px;height:21px;fill:#fff}
  #bk-share{position:fixed;inset:0;z-index:10001;background:rgba(10,8,6,.6);backdrop-filter:blur(4px);display:none;align-items:flex-end;justify-content:center}
  #bk-share.open{display:flex}
  #bk-share .sp{background:#fff;width:100%;max-width:460px;border-radius:18px 18px 0 0;padding:22px 24px 30px;animation:bkUp .3s cubic-bezier(.34,1.3,.64,1)}
  @keyframes bkUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
  #bk-share h4{font-family:'Fraunces',serif;font-size:1.1rem;color:#1A0F08;margin:0 0 4px}
  #bk-share .sub{font-size:.78rem;color:#8B7D74;margin-bottom:18px}
  #bk-share .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  #bk-share .it{display:flex;flex-direction:column;align-items:center;gap:7px;background:none;border:none;cursor:pointer;font-family:inherit;font-size:.72rem;color:#5C4E46}
  #bk-share .ic{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center}
  #bk-share .ic svg{width:26px;height:26px;fill:#fff}
  #bk-share .close{margin-top:20px;width:100%;padding:13px;border:1px solid rgba(184,134,11,.2);background:#FAF8F5;border-radius:10px;font-family:inherit;font-size:.85rem;color:#5C4E46;cursor:pointer}
  .lang-m{display:none;align-items:center;gap:5px;background:none;border:1px solid rgba(160,120,74,.45);color:#A0784A;font-family:inherit;font-size:.72rem;font-weight:600;letter-spacing:.06em;padding:6px 11px;border-radius:20px;cursor:pointer}
  .lang-m svg{fill:currentColor}
  @media(max-width:768px){ nav .lang-m{display:inline-flex;margin-left:auto;margin-right:10px} }`;
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  var fab=document.createElement('div'); fab.className='contact-fab'; fab.id='bk-fab';
  fab.innerHTML=`
    <div class="fab-actions">
      <div class="fab-row">
        <span class="fab-row-label">สั่งซื้อ</span>
        <span id="bk-order-mini"></span>
      </div>
      <div class="fab-row">
        <span class="fab-row-label">ติดต่อ</span>
        <a class="fab-mini" style="background:#2E7D32" href="tel:+66937364796" title="โทร" aria-label="โทร"><svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg></a>
        <a class="fab-mini" style="background:#06C755" href="https://line.me/R/ti/p/@blookliving" target="_blank" rel="noopener" title="LINE" aria-label="LINE"><svg viewBox="0 0 24 24" fill-rule="evenodd"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.63V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg></a>
        <a class="fab-mini" style="background:#0084FF" href="https://m.me/61587451205315" target="_blank" rel="noopener" title="Facebook" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.13 2 11.23c0 2.9 1.36 5.49 3.5 7.19V22l3.2-1.76c.85.24 1.76.36 2.7.36 5.52 0 10-4.13 10-9.23S17.52 2 12 2zm1.01 12.43l-2.55-2.72-4.97 2.72 5.47-5.81 2.61 2.72 4.91-2.72-5.47 5.81z"/></svg></a>
      </div>
    </div>
    <button class="fab-share" id="bk-fab-sharebtn" aria-label="แชร์" title="แชร์"><svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg></button>
    <button class="fab-toggle" aria-label="แชท และ สั่งซื้อ" title="แชท & สั่งซื้อ"><svg class="fab-open-ic" viewBox="0 0 24 24"><path d="M2.8 2.2h6.8A1.6 1.6 0 0111.2 3.8v3.2A1.6 1.6 0 019.6 8.6H5.9L3.1 10.7V8.6H2.8A1.6 1.6 0 011.2 7V3.8A1.6 1.6 0 012.8 2.2z"/><g transform="translate(9.6 10) scale(0.56)"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></g></svg><svg class="fab-close-ic" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>`;
  document.body.appendChild(fab);

  // #7: ปุ่มเปลี่ยนภาษา TH/EN ในแถบ header (มือถือ) — proxy ไปยัง #lang-toggle เดิมในเมนู
  try{
    var navToggle=document.getElementById('nav-toggle'), langT=document.getElementById('lang-toggle');
    if(navToggle && langT && navToggle.parentNode){
      var lm=document.createElement('button'); lm.type='button'; lm.className='lang-m'; lm.setAttribute('aria-label','เปลี่ยนภาษา');
      lm.innerHTML='<svg viewBox="0 0 24 24" width="15" height="15"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm6.93 6h-2.95a15.7 15.7 0 00-1.38-3.56A8.03 8.03 0 0118.93 8zM12 4c.83 1.2 1.48 2.53 1.91 4h-3.82c.43-1.47 1.08-2.8 1.91-4zM4.26 14a7.96 7.96 0 010-4h3.38a16.6 16.6 0 000 4H4.26zm.81 2h2.95c.32 1.25.78 2.45 1.38 3.56A8.03 8.03 0 015.07 16zm2.95-8H5.07a8.03 8.03 0 014.33-3.56A15.7 15.7 0 008.02 8zM12 20c-.83-1.2-1.48-2.53-1.91-4h3.82A13.6 13.6 0 0112 20zm2.34-6H9.66a14.7 14.7 0 010-4h4.68a14.7 14.7 0 010 4zm.27 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 01-4.33 3.56zM16.36 14a16.6 16.6 0 000-4h3.38a7.96 7.96 0 010 4h-3.38z"/></svg><span class="lm-txt">EN</span>';
      var _lmTxt=lm.querySelector('.lm-txt');
      function _syncLm(){ if(_lmTxt && langT) _lmTxt.textContent=(langT.textContent||'EN').trim(); }
      _syncLm();
      lm.addEventListener('click', function(){ langT.click(); setTimeout(_syncLm,0); });
      try{ new MutationObserver(_syncLm).observe(langT,{childList:true,characterData:true,subtree:true}); }catch(e){}
      navToggle.parentNode.insertBefore(lm, navToggle);
    }
  }catch(e){}

  var sheet=document.createElement('div'); sheet.id='bk-share';
  sheet.innerHTML=`<div class="sp"><h4 id="bk-sheet-title">แชร์ BLOOK LIVING</h4><p class="sub" id="bk-sheet-sub">เลือกช่องทางที่ต้องการ</p><div class="grid" id="bk-share-grid"></div><button class="close">ปิด</button></div>`;
  document.body.appendChild(sheet);

  var toggle=fab.querySelector('.fab-toggle');
  toggle.addEventListener('click',function(e){ e.stopPropagation(); fab.classList.toggle('open'); });
  var _sb=fab.querySelector('#bk-fab-sharebtn'); if(_sb) _sb.addEventListener('click',shareSite);
  // กดปุ่มย่อยใดๆ → ปิด FAB
  fab.querySelector('.fab-actions').addEventListener('click',function(e){ if(e.target.closest('.fab-mini')) fab.classList.remove('open'); });
  sheet.querySelector('.close').addEventListener('click',closeShare);
  sheet.addEventListener('click',function(e){ if(e.target.id==='bk-share') closeShare(); });
  // คลิกที่อื่น / เลื่อนจอ → ซ่อนปุ่มย่อยกลับ
  document.addEventListener('click',function(e){ if(fab.classList.contains('open') && !fab.contains(e.target)) fab.classList.remove('open'); });
  window.addEventListener('scroll',function(){ if(fab.classList.contains('open')) fab.classList.remove('open'); },{passive:true});

  var CH=[
    {k:'line',l:'LINE',c:'#06C755',s:'<path d="M12 2C6.48 2 2 5.64 2 10.14c0 4.03 3.57 7.4 8.4 8.52.33.07.77.22.88.5.1.26.07.66.03.92l-.14.87c-.04.26-.2 1.01.88.55s5.87-3.46 8.01-5.93C21.94 13.38 22 11.74 22 10.14 22 5.64 17.52 2 12 2z"/>',u:function(u,t){return 'https://social-plugins.line.me/lineit/share?url='+u+'&text='+t;}},
    {k:'fb',l:'Facebook',c:'#1877F2',s:'<path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/>',u:function(u){return 'https://www.facebook.com/sharer/sharer.php?u='+u;}},
    {k:'ig',l:'Instagram',c:'linear-gradient(45deg,#f09433,#dc2743,#bc1888)',s:'<path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.93 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.41-10.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/>',copy:true},
    {k:'tt',l:'TikTok',c:'#111',s:'<path d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>',copy:true},
    {k:'wa',l:'WhatsApp',c:'#25D366',s:'<path d="M.06 24l1.68-6.13A11.86 11.86 0 01.16 11.9C.16 5.34 5.5 0 12.06 0a11.82 11.82 0 018.41 3.49 11.82 11.82 0 013.48 8.42c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 01-5.69-1.45L.06 24zM6.6 20.13c1.68.99 3.28 1.59 5.4 1.59 5.45 0 9.89-4.43 9.89-9.88a9.86 9.86 0 00-9.88-9.89c-5.46 0-9.89 4.43-9.89 9.88 0 2.23.65 3.9 1.74 5.65l-.99 3.63 3.73-.98zm11.36-5.55c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-1.7-.85-2.82-1.52-3.94-3.45-.3-.51.3-.47.85-1.57.09-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49 2.4 1.04 2.4.69 2.83.65.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.42z"/>',u:function(u,t){return 'https://wa.me/?text='+t+'%20'+u;}},
    {k:'mail',l:'Email',c:'#8B6B3D',s:'<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>',u:function(u,t){return 'mailto:?subject='+t+'&body='+u;}}
  ];
  var ctx={url:'https://blookliving.com',text:'BLOOK LIVING — The Class of Calm',image:'https://blookliving.com/assets/catalog/sofa-overview-1.jpg'};
  var IGGLYPH='<path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.93 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.41-10.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/>';
  function openShare(url,text,image){
    ctx={url:url||ctx.url,text:text||ctx.text,image:image||ctx.image};
    var _t=document.getElementById('bk-sheet-title'); if(_t)_t.textContent='แชร์ BLOOK LIVING';
    var _s=document.getElementById('bk-sheet-sub'); if(_s)_s.textContent='เลือกช่องทางที่ต้องการ';
    var g=document.getElementById('bk-share-grid'),h='';
    h+='<button class="it" data-k="igstory"><span class="ic" style="background:linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf)"><svg viewBox="0 0 24 24">'+IGGLYPH+'</svg></span>IG Story</button>';
    CH.forEach(function(c){ h+='<button class="it" data-k="'+c.k+'"><span class="ic" style="background:'+c.c+'"><svg viewBox="0 0 24 24">'+c.s+'</svg></span>'+c.l+'</button>'; });
    h+='<button class="it" data-k="copy"><span class="ic" style="background:#5C4E46"><svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg></span>คัดลอกลิงก์</button>';
    g.innerHTML=h;
    g.querySelectorAll('.it').forEach(function(b){ b.addEventListener('click',function(){ shareVia(b.dataset.k); }); });
    sheet.classList.add('open');
  }
  function closeShare(){ sheet.classList.remove('open'); }
  function shareVia(k){
    var u=encodeURIComponent(ctx.url), t=encodeURIComponent(ctx.text);
    if(k==='copy'){ navigator.clipboard&&navigator.clipboard.writeText(ctx.url); alert('คัดลอกลิงก์แล้ว'); closeShare(); return; }
    if(k==='igstory'){ closeShare(); if(window.bkIgStory){ window.bkIgStory(ctx.image, ctx.text, ctx.url); } else { alert('กำลังเตรียมรูป Story… ลองอีกครั้งนะคะ'); } return; }
    var ch=CH.find(function(c){return c.k===k;});
    if(ch.copy){ navigator.clipboard&&navigator.clipboard.writeText(ctx.url); alert('คัดลอกลิงก์แล้ว — เปิด '+ch.l+' แล้ววางเพื่อแชร์'); closeShare(); return; }
    window.open(ch.u(u,t),'_blank','noopener'); closeShare();
  }
  // #4 อ่านข้อมูล "หน้าปัจจุบัน" เพื่อให้แชร์หน้านั้น ๆ (ไม่ใช่หน้าแรกเสมอ)
  function currentCtx(){
    var cu=(document.querySelector('link[rel="canonical"]')||{}).href||location.href;
    var ot=document.querySelector('meta[property="og:title"]'); var tt=(ot&&ot.content)||document.title||ctx.text;
    var oi=document.querySelector('meta[property="og:image"]'); var im=(oi&&oi.content)||ctx.image;
    return {url:cu,text:tt,image:im};
  }
  // แชร์หน้าปัจจุบัน: ใช้ "ชีตแชร์ของเครื่อง" ก่อน (1 แตะ เห็นทุกแอปที่ติดตั้ง — FB/Messenger/LINE ใช้ได้จริง)
  // ถ้าเบราว์เซอร์ไม่รองรับ (เดสก์ท็อปบางตัว) ค่อยเปิดชีตช่องทางเอง
  function shareSite(){
    var c=currentCtx(); ctx=c;
    if(navigator.share){
      navigator.share({title:'BLOOK LIVING', text:c.text, url:c.url}).catch(function(err){ if(err&&err.name==='AbortError')return; openShare(c.url,c.text,c.image); });
      return;
    }
    openShare(c.url,c.text,c.image);
  }
  var ORDER=[
    {l:'TikTok Shop',c:'#010101',u:'https://www.tiktok.com/@blookliving',s:'<path d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>'},
    {l:'Shopee',c:'#EE4D2D',u:'https://shopee.co.th/blookliving',s:'<path d="M12 1.5c-2.3 0-4.15 1.94-4.15 4.32 0 .13 0 .25.02.38H4.4a1.6 1.6 0 00-1.6 1.5l-.7 12.2A2.1 2.1 0 004.2 22.2h15.6a2.1 2.1 0 002.1-2.3l-.7-12.2a1.6 1.6 0 00-1.6-1.5h-3.47c.02-.13.02-.25.02-.38C16.15 3.44 14.3 1.5 12 1.5zm0 1.7c1.36 0 2.45 1.18 2.45 2.62 0 .13-.01.25-.03.38H9.58a3.1 3.1 0 01-.03-.38C9.55 4.38 10.64 3.2 12 3.2zm-.02 6.5c1.5 0 2.72.5 2.72 2.02 0 1.18-1 1.78-2.12 2.18-.86.3-1.3.53-1.3.98 0 .4.36.62.96.62.62 0 1.14-.2 1.6-.46l.5 1.34c-.5.3-1.26.56-2.16.56-1.54 0-2.74-.66-2.74-2.04 0-1.2 1-1.82 2.06-2.2.9-.32 1.36-.52 1.36-1 0-.4-.4-.58-.92-.58-.66 0-1.22.24-1.66.5l-.52-1.32c.54-.32 1.32-.6 2.22-.6z"/>'},
    {l:'Lazada',c:'#1A1A8C',u:'https://s.lazada.co.th/s.Z6Iput?c=b',s:'<path d="M12 3.1a.7.7 0 01.36.1l3.5 2.02 3.83 2.2c.2.12.31.33.31.56v6.55c0 .55-.29 1.05-.76 1.32l-6.86 3.96a.92.92 0 01-.92 0L4.56 15.85a1.53 1.53 0 01-.76-1.32V7.98c0-.23.12-.44.31-.56l3.83-2.2 3.5-2.02a.7.7 0 01.36-.1zm-5.3 5.93v5.07l4.6 2.66v-5.08L6.7 9.03zm10.6 0l-4.6 2.65v5.08l4.6-2.66V9.03zM12 4.86L8.1 7.11 12 9.36l3.9-2.25L12 4.86z"/>'},
    {l:'Etsy',c:'#F1641E',u:'https://www.etsy.com/people/8x3r7fi1d3zvgn4g',s:'<path d="M9.16 4.2v6.06s2.05.02 3.14-.06c.86-.13 1.02-.22 1.2-1.32h.62v3.96h-.62c-.18-1.1-.34-1.18-1.2-1.31-1.09-.09-3.14-.07-3.14-.07v4.88c0 .96.16 1.18 1.27 1.18h2.93c1.78 0 2.45-.34 3.4-2.27h.63c-.24 1.06-.7 3.07-.93 3.55 0 0-3.5-.08-5.16-.08H6.84l-2.6.08v-.6c1.74-.18 1.9-.3 1.9-1.55V6.7c0-1.25-.16-1.37-1.9-1.5v-.6l2.6.07h5.83c1.65 0 3.04-.07 3.04-.07s.04 1.27.13 3.15h-.6c-.43-1.86-.86-2.43-2.65-2.43H9.16z"/>'}
  ];
  function openOrder(){
    var ti=document.getElementById('bk-sheet-title'); if(ti)ti.textContent='สั่งซื้อสินค้า BLOOK';
    var su=document.getElementById('bk-sheet-sub'); if(su)su.textContent='เลือกช่องทางสั่งซื้อ';
    var g=document.getElementById('bk-share-grid'),h='';
    ORDER.forEach(function(o){ h+='<a class="it" href="'+o.u+'" target="_blank" rel="noopener" style="text-decoration:none"><span class="ic" style="background:'+o.c+'"><svg viewBox="0 0 24 24">'+o.s+'</svg></span>'+o.l+'</a>'; });
    g.innerHTML=h;
    sheet.classList.add('open');
  }
  // เติมปุ่มย่อย "สั่งซื้อ" (TikTok/Shopee/Lazada/Etsy) ลงในแถวสั่งซื้อของ FAB
  var _om=document.getElementById('bk-order-mini');
  if(_om) _om.innerHTML=ORDER.map(function(o){ return '<a class="fab-mini" style="background:'+o.c+'" href="'+o.u+'" target="_blank" rel="noopener" title="'+o.l+'" aria-label="'+o.l+'"><svg viewBox="0 0 24 24">'+o.s+'</svg></a>'; }).join('');
  window.bkOpenOrder=openOrder;
  window.bkOpenShare=openShare;
})();
