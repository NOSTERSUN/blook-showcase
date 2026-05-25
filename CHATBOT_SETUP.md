# 🤖 BLOOK Chatbot Setup Guide

## วิธีตั้งค่า Chatbot (Claude AI)

### ขั้นตอนที่ 1: สมัคร Anthropic API
1. ไปที่ https://console.anthropic.com
2. สมัคร / Login
3. ไปที่ **API Keys** → สร้าง key ใหม่
4. คัดลอก API key (เริ่มด้วย `sk-ant-...`)

**ค่าใช้จ่าย:** Claude Haiku 4.5
- Input: $0.25/1M tokens
- Output: $1.25/1M tokens
- ประมาณการ: 100 ข้อความ/วัน = **~$3-5/เดือน**

---

### ขั้นตอนที่ 2: Deploy บน Vercel (ฟรี)

#### Option A: ผ่าน Vercel Website (ง่ายสุด)
1. ไปที่ https://vercel.com
2. Sign up ด้วย GitHub
3. คลิก **"Import Project"**
4. เลือก repo `NOSTERSUN/blook-showcase`
5. ที่ **Environment Variables** เพิ่ม:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (API key จาก step 1)
6. คลิก **Deploy**

#### Option B: ผ่าน CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd "C:\Users\PC\Desktop\BLOOK DEV"
vercel

# Add API key
vercel env add ANTHROPIC_API_KEY
# Paste your API key when prompted

# Deploy production
vercel --prod
```

---

### ขั้นตอนที่ 3: เชื่อม Domain
1. ใน Vercel Dashboard → Project → **Settings** → **Domains**
2. เพิ่ม `blookliving.com`
3. ตั้งค่า DNS ที่ Squarespace:
   - Type: `A` → `76.76.21.21`
   - หรือ CNAME ไป `cname.vercel-dns.com`

---

## 🎯 ฟีเจอร์ของ Chatbot:

### ✅ ตอนนี้ทำงานได้แล้ว (Local Fallback):
- ตอบคำถามทั่วไปเกี่ยวกับสินค้า
- รองรับภาษาไทย + อังกฤษ (auto-detect)
- มี suggestion buttons
- ไม่ต้องใช้ API key

### 🚀 หลัง Deploy บน Vercel:
- ตอบคำถามได้ทุกเรื่องด้วย Claude AI
- จำบทสนทนาเก่าได้
- ตอบแบบ context-aware
- ตอบแนะนำสินค้าได้ฉลาดขึ้น

---

## 📊 Test Chatbot

ตัวอย่างคำถาม:
- "แนะนำสินค้าหน่อย"
- "หมอน Argo ราคาเท่าไหร่"
- "กลิ่นไหนหอมที่สุด"
- "ติดต่อยังไง"
- "Recommend products"
- "What's the best scent?"

---

## 🛠️ Customize Chatbot

### แก้ไข System Prompt
แก้ไฟล์ `api/chat.js` → `systemPrompt` variable

### เปลี่ยนสี / Style
แก้ไฟล์ `index.html` → CSS section `/* -- CHATBOT -- */`

### เปลี่ยน Suggestion Buttons
แก้ไฟล์ `index.html` → element `.chat-suggestions`

---

## ❓ FAQ

**Q: ใช้งานได้ทันทีไหม?**
A: ใช่! ตอนนี้มี local fallback responses ทำงานแล้ว แค่ไม่มี Claude AI

**Q: ค่าใช้จ่ายเท่าไหร่?**
A: Vercel ฟรี (Hobby plan), Claude API ~$3-5/เดือนสำหรับ traffic ปานกลาง

**Q: ปรับ system prompt ได้ไหม?**
A: ได้ครับ แก้ใน `api/chat.js`

**Q: ใช้ Claude หรือ GPT?**
A: ใช้ Claude (Anthropic) เพราะตอบภาษาไทยดีกว่าและเข้าใจ context ของแบรนด์ luxury ดีกว่า

---

**Author**: BLOOK Living Team
**Version**: 1.0
