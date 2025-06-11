import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import favicon from 'serve-favicon';

const app = express();

// ✅ Allow frontend (GH Pages)
app.use(cors({
  origin: 'http://localhost:5173', // replace with your actual GH Pages URL
}));

app.use(express.json());

// ⛳ Serve favicon (optional)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(favicon(path.join(__dirname, 'public', 'Image.webp')));

// ✅ POST route using Groq + LLaMA3
app.post('/api/repurpose', async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().startsWith('http')) {
    return res.status(400).json({ error: 'Please enter valid text content, not a URL.' });
  }

  const prompt = `
You are a content repurposing assistant.

Given the following content, do the following:
1. Summarize it into 3 concise bullet points.
2. Create 3 engaging social media posts based on this content.

Content:
${content}

Format your response clearly with sections titled "Summary" and "Social Media Posts".
`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer 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`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a content repurposing assistant." },
          { role: "user", content: prompt }
        ]
      }),
    });

    const data = await response.json();
    res.json({ repurposed: data.choices[0].message.content });
  } catch (err) {
    console.error('Groq error:', err);
    res.status(500).json({ error: 'Failed to generate repurposed content using Groq API' });
  }
});

app.get('/', (req, res) => {
  res.send('✅ Backend is live and connected to Groq + LLaMA3!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
