import express from 'express';

const router = express.Router();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// contents: [{role, parts: [{text}]}] → messages: [{role, content}]
function toMessages(systemPrompt, contents) {
    const messages = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }
    for (const item of contents || []) {
        const text = item.parts?.map(p => p.text).join('') ?? '';
        messages.push({ role: item.role || 'user', content: text });
    }
    return messages;
}

router.post('/', async (req, res) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GROQ_API_KEY가 설정되지 않았습니다' });
    }

    const { system_prompt, contents } = req.body;
    const messages = toMessages(system_prompt, contents);

    try {
        const groqRes = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ model: GROQ_MODEL, messages }),
        });

        const data = await groqRes.json();

        if (!groqRes.ok) {
            return res.status(groqRes.status).json({ error: data.error?.message || 'GROQ API 오류' });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message || 'GROQ 요청 실패' });
    }
});

export default router;