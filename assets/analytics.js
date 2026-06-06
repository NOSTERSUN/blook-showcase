/* BLOOK LIVING — Google Analytics 4 (GA4) tracking
   ============================================================
   👉 วิธีเปิดใช้งาน: เปลี่ยน GA_ID ด้านล่างเป็น Measurement ID จริงจาก Google Analytics
      (รูปแบบ G-XXXXXXXXXX) แล้ว push ขึ้น GitHub — เท่านี้ทุกหน้าเริ่มเก็บข้อมูลทันที
      (ผู้เข้าชม · เพศ · อายุ · ที่อยู่ · หน้าที่เข้า ฯลฯ ดูได้ที่ analytics.google.com)
   - ตราบใดที่ยังเป็น 'G-XXXXXXXXXX' สคริปต์จะ "ไม่ทำงาน" (ปลอดภัย ไม่กระทบเว็บ)
   - ไฟล์นี้ถูกเรียกจากทุกหน้าสาธารณะ (ไม่รวม admin)
   ============================================================ */
(function(){
  var GA_ID = 'G-HNK6B9LGPZ'; // <<< Measurement ID จริงของ BLOOK LIVING (GA4)

  if(!GA_ID || GA_ID.indexOf('G-') !== 0 || GA_ID === 'G-XXXXXXXXXX') return; // ยังไม่ตั้งค่า → ไม่โหลด

  // กรอง "เจ้าของ/พนักงาน" ออกจากสถิติ — เครื่องที่เคย login admin จะถูก mark localStorage 'bk-owner'='yes'
  // เปิด/ปิดได้ในแท็บ "สถิติ/SEO" ของ admin
  try{ if(localStorage.getItem('bk-owner')==='yes') return; }catch(e){}

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });

  /* ── Event tracking: วัดว่า traffic (รวมจาก SEO) กลายเป็น "ความสนใจ/ลูกค้า" จริงไหม ──
     เก็บอัตโนมัติเมื่อผู้ใช้: กดปุ่มสั่งซื้อร้านค้า · กดแชร์/Story · ดูแคตตาล็อก · กด LINE/โทร/แชต */
  function track(name, params){ try{ gtag('event', name, params||{}); }catch(e){} }
  function hostOf(href){ try{ return new URL(href, location.href).hostname.replace(/^www\./,''); }catch(e){ return ''; } }
  var SHOPS=/tiktok\.com|shopee\.|lazada\.|etsy\.com/i;

  document.addEventListener('click', function(e){
    var t = e.target && e.target.closest ? e.target.closest('a,button') : null;
    if(!t) return;
    var href = t.getAttribute && (t.getAttribute('href')||'');
    var label = (t.getAttribute && (t.getAttribute('aria-label')||t.getAttribute('title'))) || (t.textContent||'').trim().slice(0,60);

    // 1) คลิกออกไปร้านค้า/มาร์เก็ตเพลส = ตั้งใจซื้อ (conversion สำคัญสุด)
    if(href && SHOPS.test(href)){ track('shop_click', { shop: hostOf(href), link_url: href, link_text: label }); return; }
    // 2) ช่องทางติดต่อ
    if(href && /^tel:/i.test(href)){ track('contact_click', { method:'phone' }); return; }
    if(href && /line\.me|line\.naver/i.test(href)){ track('contact_click', { method:'line' }); return; }
    if(href && /m\.me|messenger\.com|facebook\.com\/(dialog|sharer)/i.test(href)){ track('contact_click', { method:'facebook' }); return; }
    // 3) ปุ่มแชร์ / Story
    if(t.matches && (t.matches('.fab-share,.bilb-share,#bk-fab-sharebtn,#bkst-share,#bkst-fb,#bkst-save') || /แชร์/.test(label))){
      track('share_click', { where: t.id || t.className || label });
      return;
    }
    // 4) ลิงก์ไปหน้าแคตตาล็อก
    if(href && /catalog\.html/i.test(href)){ track('view_catalog', {}); return; }
  }, true);

  // ดาวน์โหลด/ออกเอกสาร PDF (แคตตาล็อก/ใบเสนอราคา) — มัก dispatch ผ่านฟังก์ชันภายใน จึงดักจาก beforeunload ไม่ได้;
  // เปิดเผยตัวช่วยให้โค้ดหน้าอื่นเรียกได้ถ้าต้องการ
  window.bkTrack = track;
})();
