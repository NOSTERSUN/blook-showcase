// Vercel Serverless Function for BLOOK Chatbot
// Deploy to Vercel and set ANTHROPIC_API_KEY in environment variables

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { messages = [], lang = 'th' } = req.body;

    // System prompt with BLOOK Living knowledge
    const systemPrompt = `You are the BLOOK Living AI Assistant — a warm, refined, and helpful customer service agent for BLOOK Living, a premium Thai furniture and home fragrance brand. Your tone embodies "The Class of Calm" — elegant, calm, and graceful.

LANGUAGE: Respond in the user's language automatically. If user writes in Thai, respond in Thai. If English, respond in English. Always use ค่ะ/นะคะ (polite female particles) in Thai responses.

BRAND IDENTITY:
- Name: BLOOK Living (บลู๊ค ลิฟวิ่ง)
- Tagline: "The Class of Calm"
- Concept: A sanctuary of refined calm — products for a relaxed, luxurious life

PRODUCTS:

1. Reed Diffuser 250ml — "Luxury Hotel Collection"
   - 4 scents: Marriott, Sheraton, Four Seasons, Shangri-La
   - Lasts 4-5 months, covers 40-50 sqm
   - Premium amber bottle
   - Hypoallergenic, safe formula

2. Reed Diffuser 50ml — "Pocket Hotel Collection"
   - Same 4 luxury hotel scents
   - Lasts 4-5 weeks, covers 20-30 sqm
   - Matte black bottle, portable
   - Great for travel or trial

3. The Gift Set
   - 2x 50ml bottles in magnetic gift box
   - Mix and match scents
   - Perfect for special gifts

4. BLOOK Argo Pillow
   - Ergonomic health pillow
   - Premium breathable fabric
   - 1-year structure warranty
   - Premium gift box included

5. TOGO SOFA
   - 4 colors: Brown, Orange, White, Yellow
   - Premium fabric / Pocket Spring structure
   - 3-year structure warranty
   - Ergonomic design

CONTACT:
- Phone: 093-736-4796
- Email: info@blookliving.com
- LINE OA: @blookliving
- Shopee: shopee.co.th/blookliving
- Instagram: @blook.living
- Facebook: BLOOK Living
- Head Office: 3/134 Bang Samak, Bang Pakong, Chachoengsao 24180
- Tax ID: 0245568003791

GUIDELINES:
- Keep responses concise (under 100 words usually)
- Use 1-2 emojis tastefully (🌸 🛏️ 🛋️ 🎁 ✨ 💰 📞)
- For specific pricing, direct customers to LINE OA or Shopee
- Always end Thai responses politely with ค่ะ
- Reflect the calm, refined brand voice
- If asked about something outside BLOOK products, gently steer back to our offerings`;

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 500,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        }))
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      return res.status(500).json({ error: 'AI service error', details: errorText });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'ขออภัยค่ะ มีข้อผิดพลาดในการตอบกลับ';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: error.message });
  }
}
