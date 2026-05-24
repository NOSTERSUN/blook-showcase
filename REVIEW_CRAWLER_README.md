# BLOOK Living - Review Crawler Guide

Python script ที่ช่วยดึง review/รูปภาพจาก Shopee และ TikTok มาบันทึกไว้ใน folder `Customer Review`

## 🚀 Installation

```bash
# Install dependencies
pip install requests pillow yt-dlp selenium

# Optional (for advanced Selenium crawling)
pip install pyppeteer
```

## 📖 Quick Start

### 1. Setup Folder Structure
```bash
python crawl_reviews.py --setup
```
สร้าง folder ดังนี้:
- `Customer Review/Reed Diffuser/`
- `Customer Review/Pillow/`
- `Customer Review/Sofa/`
- `Customer Review/Gift Set/`
- `Customer Review/TikTok Reviews/`

### 2. Show Instructions
```bash
python crawl_reviews.py --instructions
```

### 3. Add Reviews Manually
```bash
python crawl_reviews.py --add-folder "Pillow" --images "image1.jpg" "image2.jpg" "image3.jpg"
```

## 🛍️ วิธี Crawl Shopee Reviews

### วิธี 1: Manual Screenshot (ง่ายสุด)
1. เข้า https://shopee.co.th/blookliving
2. เลือกสินค้า (เช่น Reed Diffuser, Pillow, Sofa)
3. Scroll ลงไปที่ "ความเห็นของผู้ซื้อ" (Reviews)
4. คลิกขวา → Save image as
5. บันทึกไปที่ `C:\Users\PC\Desktop\BLOOK DEV\Customer Review\[ProductName]\`

### วิธี 2: Selenium Crawler (อัตโนมัติ)
```bash
python crawl_reviews.py --shopee "https://shopee.co.th/product/123456789"
```

**หมายเหตุ:** Shopee ใช้ JavaScript rendering ทำให้ต้องใช้ Selenium

---

## 🎵 วิธี Crawl TikTok Reviews

### วิธี 1: yt-dlp (Recommended)
```bash
# Download TikTok video
yt-dlp "https://www.tiktok.com/@blookliving/video/..." -o "%(title)s.%(ext)s"

# Extract first frame as image
ffmpeg -i video.mp4 -ss 00:00:01 -vframes 1 output.jpg
```

### วิธี 2: Online Tool
- ไปที่ https://ssstiktok.com
- ใส่ URL ของ TikTok
- Download video/image

### วิธี 3: Selenium Script
```bash
python crawl_reviews.py --tiktok "https://www.tiktok.com/@blookliving"
```

---

## 📁 Folder Structure

```
C:\Users\PC\Desktop\BLOOK DEV\Customer Review\
├── Reed Diffuser/
│   ├── review_1.jpg
│   ├── review_2.jpg
│   └── ...
├── Pillow/
│   ├── pillow_1.jpg
│   ├── pillow_2.jpg
│   └── ...
├── Sofa/
│   ├── sofa_1.jpg
│   └── ...
├── Gift Set/
│   └── ...
└── TikTok Reviews/
    ├── tiktok_1.jpg
    └── ...
```

---

## 🔗 สินค้า Links

### Shopee
- **Reed Diffuser 250ml (Yellow)**: https://th.shp.ee/WvMa5M6U
- **Reed Diffuser 250ml (Orange)**: https://th.shp.ee/42hMtUi3
- **Reed Diffuser 250ml (Brown)**: https://th.shp.ee/fp1JoZEJ
- **Reed Diffuser 250ml (White)**: https://th.shp.ee/RASAPpQx
- **Pillow**: https://th.shp.ee/hZPmxns2

### TikTok
- **Channel**: @blookliving
- **URL**: https://www.tiktok.com/@blookliving

---

## 💡 Tips & Tricks

### 1. Batch Add Reviews
```bash
python crawl_reviews.py --add-folder "Sofa" --images img1.jpg img2.jpg img3.jpg
```

### 2. ครอบคลุม Multiple Products
```bash
# Reed Diffuser
python crawl_reviews.py --add-folder "Reed Diffuser" --images reed_1.jpg reed_2.jpg

# Pillow
python crawl_reviews.py --add-folder "Pillow" --images pillow_1.jpg pillow_2.jpg

# Sofa
python crawl_reviews.py --add-folder "Sofa" --images sofa_1.jpg sofa_2.jpg
```

### 3. Image Processing
ใช้ online tools เพื่อ crop/enhance รูป:
- https://pixlr.com (free editor)
- https://www.photopea.com
- Adobe Express

---

## ⚠️ Important Notes

1. **Anti-Bot Protection**: Shopee และ TikTok มี protection ต่อ crawling
2. **Manual is Safest**: การ manual screenshot ปลอดภัยและเรียบง่ายสุด
3. **Image Quality**: เลือกรูปที่ชัดเจนและมีคุณภาพ
4. **Naming Convention**: บันทึกชื่อให้เป็น sequential (review_1, review_2, etc.)

---

## 🐛 Troubleshooting

### Error: "Module not found"
```bash
pip install requests pillow yt-dlp
```

### Error: "Folder not found"
ตรวจสอบว่า folder มีอยู่:
```bash
python crawl_reviews.py --setup
```

### TikTok ดาวน์โหลดไม่ได้
- ลองใช้ online tool: https://ssstiktok.com
- หรือติดตั้ง FFmpeg สำหรับ processing video

---

## 📝 Example Usage

```bash
# 1. Setup first
python crawl_reviews.py --setup

# 2. Add Pillow reviews (from local files)
python crawl_reviews.py --add-folder "Pillow" --images "C:\Downloads\pillow_1.jpg" "C:\Downloads\pillow_2.jpg"

# 3. Add Reed Diffuser reviews
python crawl_reviews.py --add-folder "Reed Diffuser" --images "reed1.jpg" "reed2.jpg" "reed3.jpg"

# 4. Add Sofa reviews
python crawl_reviews.py --add-folder "Sofa" --images "sofa1.jpg" "sofa2.jpg"

# 5. Add TikTok reviews
python crawl_reviews.py --add-folder "TikTok Reviews" --images "tiktok1.jpg" "tiktok2.jpg"
```

---

## 🎯 Next Steps

1. ✅ ดาวน์โหลดและ organize รูป reviews
2. ✅ บันทึกลง `Customer Review` folder
3. ✅ เมื่อรูปอัพเดท ก็สามารถ push ขึ้น GitHub ได้
4. ✅ เว็บจะแสดงรูปใหม่โดยอัตโนมัติ

---

**Author**: BLOOK Living Team  
**Version**: 1.0  
**Updated**: 2026-05-25
