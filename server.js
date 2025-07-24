import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/gerar-artigo', async (req, res) => {
  const { outline, promptFile } = req.body;
  if (!outline || !promptFile) {
    return res.status(400).json({ error: 'outline e promptFile são obrigatórios' });
  }
  try {
    const promptPath = path.join(process.cwd(), 'prompts', promptFile);
    const promptTemplate = await import(`./prompts/${promptFile}`).then(m => m.default).catch(async () => {
      const data = await readFile(promptPath, 'utf8');
      return data;
    });

    const messages = [
      { role: 'system', content: promptTemplate },
      { role: 'user', content: outline }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages
    });

    const artigo = completion.choices[0].message.content.trim();
    res.json({ artigo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao gerar artigo' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
