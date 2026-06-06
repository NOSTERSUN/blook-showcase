# 🛍️ Sale Assis — Config สำหรับแท็บ "ผู้ช่วยการขาย" ใน admin

> ทุกอย่างที่แท็บ "ผู้ช่วยการขาย" ใช้ — แพลตฟอร์ม / สัดส่วน / วัตถุประสงค์ / **เทศกาล** / สคริปต์ของ 3 ฝ่าย / แคปชันต้นแบบ / hashtags — รวมอยู่ในไฟล์เดียวคือ `config.json`
>
> Admin จะ `fetch('sale%20assis/config.json')` ตอนเปิดแท็บ → ถ้าโหลดไม่ได้จะ fallback ไปใช้ค่าเริ่มต้นในโค้ด

## ไฟล์
| ไฟล์ | สำหรับใคร | ใช้ทำอะไร |
|------|----------|----------|
| `config.json` | โค้ดอ่าน | source of truth ที่ JS ดึงไปใช้ |
| `festivals.csv` | คนแก้ | เปิดด้วย Excel/Google Sheets ได้เลย เปลี่ยนชื่อ/วันที่/อิโมจิ/สี/แคปชันแล้วเซฟ |

## วิธีเพิ่ม/แก้เทศกาล (3 ขั้น)
1. เปิด `festivals.csv` ใน Excel
2. แก้/เพิ่มแถว (key, label, badge, emoji, accent, month, day, th_headline, en_headline, hashtag)
3. คัดลอกค่าใหม่ไปอัปเดต `config.json` ในส่วน `"festivals"` (โครงสร้างเดียวกัน) → `git push`

> 💡 อนาคต: ทำ build-step ที่ generate `config.json` จาก `festivals.csv` อัตโนมัติได้ (ทำเมื่อมีหลายคนแก้บ่อยๆ)

## คอลัมน์ใน festivals.csv
| คอลัมน์ | ความหมาย | ตัวอย่าง |
|---------|---------|---------|
| key | id ไม่ซ้ำ (ใช้ภายในระบบ) | `6.6`, `christmas` |
| label | ชื่อที่คนเห็น | `6.6`, `คริสต์มาส` |
| badge | ข้อความบนป้ายในรูป | `6.6`, `CHRISTMAS` |
| emoji | ไอคอนหน้า badge | `🔥`, `🎄` |
| accent | สีป้าย (hex) | `#E4572E` |
| month / day | วันที่ — ใช้เรียงไทม์ไลน์และแนะนำเทศกาลที่จะถึง | `6` / `6` |
| th_headline / en_headline | บรรทัดเปิดของแคปชัน TH/EN | `🔥 ดีลเด็ดรับ 6.6 มาแล้ว!` |
| hashtag | hashtag เฉพาะของเทศกาล | `#6_6Sale` |

## หัวข้ออื่นใน config.json
- `platforms` — แพลตฟอร์ม + สัดส่วนแนะนำ + hashtag เฉพาะ (Facebook / Instagram / Lemon8 / TikTok / X)
- `aspects` — สัดส่วน canvas (1:1, 4:5, 3:4, 9:16, 16:9, 1.91:1)
- `purposes` — โหมด: `brand` (ภาพลักษณ์) vs `sale` (ขาย) — ตัวคุมว่าจะใช้ template/แคปชันชุดไหน
- `departments` — สคริปต์ของ 3 ฝ่าย (Graphic / Marketing / Director) — ป้อนเข้า AI เป็น system prompt; ถ้าไม่มี AI key ระบบใช้เทมเพลตที่ตามแนวเดียวกัน
- `captions_*` / `ctas_*` / `*_tags` — ชุดต้นแบบที่ใช้เมื่อไม่มี AI

## โหมดเจ้าของ AI (ออปชัน)
ในแท็บ "ผู้ช่วยการขาย" → กด **⚙️ AI** → วาง Claude API key → ระบบจะเรียก Anthropic API พร้อม system prompt ของ 3 ฝ่ายจาก `departments` นี้ → ได้แคปชันคุณภาพสูงสด
ถ้าไม่ใส่ key — ทำงานได้ปกติด้วยเทมเพลตที่ฝังในไฟล์เดียวกันนี้

_— BLOOK LIVING · Sale Assistant config_
