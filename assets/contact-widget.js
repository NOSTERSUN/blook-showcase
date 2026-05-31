/* BLOOK floating Contact + Share widget — include on any page:
   <script src="assets/contact-widget.js"></script>  (path may be ../assets/... if nested) */
(function(){
  var GOLD='#B8860B', GOLDD='#8B6914';
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
  #bk-share .close{margin-top:20px;width:100%;padding:13px;border:1px solid rgba(184,134,11,.2);background:#FAF8F5;border-radius:10px;font-family:inherit;font-size:.85rem;color:#5C4E46;cursor:pointer}`;
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  var fab=document.createElement('div'); fab.className='contact-fab'; fab.id='bk-fab';
  fab.innerHTML=`
    <div class="fab-actions">
      <a class="fab-item" href="tel:+66937364796"><span class="fab-tag">Call</span><span class="fab-icon fab-call"><svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg></span></a>
      <a class="fab-item" href="https://line.me/R/ti/p/@blookliving" target="_blank" rel="noopener"><span class="fab-tag">Line</span><span class="fab-icon fab-line"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.64 2 10.14c0 4.03 3.57 7.4 8.4 8.52.33.07.77.22.88.5.1.26.07.66.03.92l-.14.87c-.04.26-.2 1.01.88.55s5.87-3.46 8.01-5.93C21.94 13.38 22 11.74 22 10.14 22 5.64 17.52 2 12 2z"/></svg></span></a>
      <a class="fab-item" href="https://m.me/61587451205315" target="_blank" rel="noopener"><span class="fab-tag">Facebook</span><span class="fab-icon fab-fb"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.13 2 11.23c0 2.9 1.36 5.49 3.5 7.19V22l3.2-1.76c.85.24 1.76.36 2.7.36 5.52 0 10-4.13 10-9.23S17.52 2 12 2zm1.01 12.43l-2.55-2.72-4.97 2.72 5.47-5.81 2.61 2.72 4.91-2.72-5.47 5.81z"/></svg></span></a>
    </div>
    <button class="fab-toggle" aria-label="ติดต่อเรา"><svg class="fab-open-ic" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg><svg class="fab-close-ic" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
    <button class="fab-share" aria-label="แชร์" title="แชร์"><svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg></button>`;
  document.body.appendChild(fab);

  var sheet=document.createElement('div'); sheet.id='bk-share';
  sheet.innerHTML=`<div class="sp"><h4>แชร์ BLOOK LIVING</h4><p class="sub">เลือกช่องทางที่ต้องการ</p><div class="grid" id="bk-share-grid"></div><button class="close">ปิด</button></div>`;
  document.body.appendChild(sheet);

  var toggle=fab.querySelector('.fab-toggle');
  toggle.addEventListener('click',function(){ fab.classList.toggle('open'); });
  fab.querySelector('.fab-share').addEventListener('click',shareSite);
  sheet.querySelector('.close').addEventListener('click',closeShare);
  sheet.addEventListener('click',function(e){ if(e.target.id==='bk-share') closeShare(); });
  window.addEventListener('scroll',function(){ if(fab.classList.contains('open')) fab.classList.remove('open'); },{passive:true});

  var CH=[
    {k:'line',l:'LINE',c:'#06C755',s:'<path d="M12 2C6.48 2 2 5.64 2 10.14c0 4.03 3.57 7.4 8.4 8.52.33.07.77.22.88.5.1.26.07.66.03.92l-.14.87c-.04.26-.2 1.01.88.55s5.87-3.46 8.01-5.93C21.94 13.38 22 11.74 22 10.14 22 5.64 17.52 2 12 2z"/>',u:function(u,t){return 'https://social-plugins.line.me/lineit/share?url='+u+'&text='+t;}},
    {k:'fb',l:'Facebook',c:'#1877F2',s:'<path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/>',u:function(u){return 'https://www.facebook.com/sharer/sharer.php?u='+u;}},
    {k:'msg',l:'Messenger',c:'#0084FF',s:'<path d="M12 2C6.48 2 2 6.13 2 11.23c0 2.9 1.36 5.49 3.5 7.19V22l3.2-1.76c.85.24 1.76.36 2.7.36 5.52 0 10-4.13 10-9.23S17.52 2 12 2zm1.01 12.43l-2.55-2.72-4.97 2.72 5.47-5.81 2.61 2.72 4.91-2.72-5.47 5.81z"/>',u:function(u){return 'https://www.facebook.com/dialog/send?app_id=140586622674265&link='+u+'&redirect_uri='+u;}},
    {k:'ig',l:'Instagram',c:'linear-gradient(45deg,#f09433,#dc2743,#bc1888)',s:'<path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.93 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.41-10.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/>',copy:true},
    {k:'tt',l:'TikTok',c:'#111',s:'<path d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>',copy:true},
    {k:'wa',l:'WhatsApp',c:'#25D366',s:'<path d="M.06 24l1.68-6.13A11.86 11.86 0 01.16 11.9C.16 5.34 5.5 0 12.06 0a11.82 11.82 0 018.41 3.49 11.82 11.82 0 013.48 8.42c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 01-5.69-1.45L.06 24zM6.6 20.13c1.68.99 3.28 1.59 5.4 1.59 5.45 0 9.89-4.43 9.89-9.88a9.86 9.86 0 00-9.88-9.89c-5.46 0-9.89 4.43-9.89 9.88 0 2.23.65 3.9 1.74 5.65l-.99 3.63 3.73-.98zm11.36-5.55c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-1.7-.85-2.82-1.52-3.94-3.45-.3-.51.3-.47.85-1.57.09-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49 2.4 1.04 2.4.69 2.83.65.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.42z"/>',u:function(u,t){return 'https://wa.me/?text='+t+'%20'+u;}},
    {k:'mail',l:'Email',c:'#8B6B3D',s:'<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>',u:function(u,t){return 'mailto:?subject='+t+'&body='+u;}}
  ];
  var ctx={url:'https://blookliving.com',text:'BLOOK LIVING — The Class of Calm'};
  function openShare(url,text){
    ctx={url:url||ctx.url,text:text||ctx.text};
    var g=document.getElementById('bk-share-grid'),h='';
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
    var ch=CH.find(function(c){return c.k===k;});
    if(ch.copy){ navigator.clipboard&&navigator.clipboard.writeText(ctx.url); alert('คัดลอกลิงก์แล้ว — เปิด '+ch.l+' แล้ววางเพื่อแชร์'); closeShare(); return; }
    window.open(ch.u(u,t),'_blank','noopener'); closeShare();
  }
  function shareSite(){
    if(navigator.share){ navigator.share({title:'BLOOK LIVING',text:ctx.text,url:ctx.url}).catch(function(){}); return; }
    openShare(ctx.url,ctx.text);
  }
  window.bkOpenShare=openShare;
})();
