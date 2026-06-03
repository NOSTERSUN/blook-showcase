/* BLOOK LIVING — Google Analytics 4 (GA4) tracking
   ============================================================
   👉 วิธีเปิดใช้งาน: เปลี่ยน GA_ID ด้านล่างเป็น Measurement ID จริงจาก Google Analytics
      (รูปแบบ G-XXXXXXXXXX) แล้ว push ขึ้น GitHub — เท่านี้ทุกหน้าเริ่มเก็บข้อมูลทันที
      (ผู้เข้าชม · เพศ · อายุ · ที่อยู่ · หน้าที่เข้า ฯลฯ ดูได้ที่ analytics.google.com)
   - ตราบใดที่ยังเป็น 'G-XXXXXXXXXX' สคริปต์จะ "ไม่ทำงาน" (ปลอดภัย ไม่กระทบเว็บ)
   - ไฟล์นี้ถูกเรียกจากทุกหน้าสาธารณะ (ไม่รวม admin)
   ============================================================ */
(function(){
  var GA_ID = 'G-XXXXXXXXXX'; // <<< เปลี่ยนเป็น Measurement ID จริงของคุณ

  if(!GA_ID || GA_ID.indexOf('G-') !== 0 || GA_ID === 'G-XXXXXXXXXX') return; // ยังไม่ตั้งค่า → ไม่โหลด

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });
})();
