# BLOOK LIVING — Website Rules & Update Guide
คู่มือกฎเกณฑ์และวิธีอัปเดตเว็บไซต์ (อ่านก่อนแก้ไขทุกครั้ง)

เว็บนี้เป็น **static site** โฮสต์บน **GitHub Pages** (repo: `NOSTERSUN/blook-showcase`, branch `main`, โดเมน `blookliving.com`)
ไม่มี backend — ทุกอย่างคือไฟล์ HTML/CSS/JS + รูปใน `assets/`

---

## 🔄 วิธี Refresh / Deploy ขึ้นเว็บจริง
หลังแก้ไฟล์หรือเพิ่มรูปแล้ว สั่ง:
```
git add -A
git commit -m "อธิบายการเปลี่ยนแปลง"
git push origin main
```
GitHub Pages จะ build ใหม่อัตโนมัติ **ภายใน ~1–3 นาที** จากนั้น Hard refresh ที่เครื่อง (`Ctrl+Shift+R` / มือถือเปิด Private tab) เพื่อล้าง cache

---

## 📁 โครงสร้าง assets/ (1 โฟลเดอร์ = 1 ชุดรูป, ตั้งชื่อเป็นเลขลำดับ)
```
assets/
├── company-profile/   สไลด์ Company Profile  → 1.jpg, 2.jpg, ... N.jpg (เรียงตามลำดับสไลด์)
├── financial/          หน้างบการเงิน (render จาก PDF) → 1.jpg ... 12.jpg
├── diffuser_250/       Reed Diffuser 250ml → 1.png ... 8.png
├── diffuser_50/        Reed Diffuser 50ml  → 1.png ... 7.png
├── diffuser_gift/      Gift Set            → 1.png ... 8.png
├── Pillow/             Argo Pillow         → 1.jpg ... 5.jpg
├── Sofa/               3d-sofa-{brown,orange,white,yellow}.png + SOFA_OVERVIEW/sofa-overview-1..4.jpg
└── Brand/              โลโก้ / mood
```
**กฎการตั้งชื่อรูป:** ใช้ตัวเลขเรียงลำดับ `1, 2, 3, ...` (รูปแรก = รูปหลัก/master) เพื่อให้โค้ดวนลูปอ่านได้

---

## 🖼️ งานอัปเดตที่พบบ่อย

### 1) อัปเดตสไลด์ Company Profile (assets/company-profile/)
- วางรูปใหม่ตั้งชื่อ `1.jpg, 2.jpg, ... N.jpg` (แทนของเดิมหรือเพิ่มต่อ)
- **สำคัญ:** ถ้าจำนวนสไลด์เปลี่ยน → แก้ตัวเลขใน `admin.html`:
  ```js
  const PROFILE_PAGES = 13;   // ← เปลี่ยนให้ตรงจำนวนไฟล์
  ```
- ขนาดแนะนำ: กว้าง ~1920px, JPEG quality 85 (ไฟล์ ~150–350 KB/รูป)
- commit + push

### 2) เพิ่ม/เปลี่ยนรีวิวลูกค้า (index.html)
- รูปรีวิวอยู่ใน `Customer Review/<หมวด>/` (Reed Diffuser, Pillow, Sofa)
- เพิ่มการ์ดใน `index.html` ในส่วน `<div class="reviews-grid">`:
  ```html
  <div class="review-card">
    <img src="Customer%20Review/Pillow/ชื่อไฟล์.jpg" alt="รีวิว" loading="lazy">
    <div class="review-card-label"><span class="stars">★★★★★</span> Pillow</div>
  </div>
  ```
- รูปจะ fit อัตโนมัติ (object-fit:contain) พื้นที่เหลือเป็นครีมนวล — ไม่ต้อง crop รูปมาให้เท่ากัน

### 3) อัปเดตรูปสินค้า (assets/<product>/)
- แทนไฟล์เลขเดิม หรือเพิ่มเลขถัดไป
- ถ้าเพิ่มจำนวนรูป ต้องเพิ่ม `<img>` ใน:
  - `index.html` → carousel ของสินค้านั้น (และอาเรย์ `ALL_GALLERY` สำหรับแกลเลอรีรวม)
  - `catalog.html` → กริด `.gl-grid` ของสินค้านั้น

### 4) อัปเดตงบการเงิน (admin.html)
- ใส่ PDF ใหม่ใน `งบการเงิน/` แล้ว render เป็นรูปลง `assets/financial/`
- เพิ่มข้อมูลปีใหม่ใน object `FIN_YEARS` ใน `admin.html` (คัดลอกโครงปี 2568 มาแก้ตัวเลข) → ตาราง/กราฟ/สรุป 5 ปี อัปเดตเอง

---

## 🔑 รหัสผ่าน (admin.html)
- เข้าระบบ Admin Portal: **BK1M**
- ดาวน์โหลดไฟล์ (Company Profile / งบการเงิน): ต้องกรอก **BK2M** อีกชั้น

---

## 🧱 ไฟล์หลักของเว็บ
| ไฟล์ | หน้าที่ |
|------|--------|
| `index.html` | หน้าหลัก (สินค้า, แกลเลอรี, รีวิว, ช้อป, ติดต่อ, ปุ่มลอยติดต่อ/แชร์) |
| `about.html` | บทความ / เกี่ยวกับเรา |
| `catalog.html` | แคตตาล็อกสินค้า A4 (โชว์ + พิมพ์ PDF) |
| `admin.html` | Admin Portal: Company Profile · งบการเงิน · BKTAX เอกสาร · นามบัตรทีม |
| `assets/` | รูปทั้งหมด |
| `Customer Review/` | รูปรีวิวลูกค้า |
| `Line OA/` | QR LINE |

---

## 🎨 ดีไซน์ (อ้างอิงเวลาแก้)
- ฟอนต์หัวข้อ: **Fraunces** (+ Noto Serif Thai) · เนื้อหา: **Inter** + **IBM Plex Sans Thai**
- สีหลัก: primary `#1A0F08`, gold `#B8860B`, gold-light `#DAA520`, bg ครีม `#FAF8F5`/`#F2EDE6`
- คอนเซ็ปต์: **The Class of Calm** — หรูแบบร่วมสมัย เรียบ อ่านง่าย

---

_อัปเดตล่าสุด: 2025 · ดูแลโดย BLOOK LIVING_
