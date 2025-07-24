const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const promptBase = require('./prompt');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('frontend'));

app.post('/gerar-artigo', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();

  const { outline, keyword, customPrompt } = req.body;
  if (!outline || !keyword) {
    res.write(`data: ${JSON.stringify({ error: 'outline e keyword obrigatorios' })}\n\n`);
    return res.end();
  }

  const lines = outline.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let finalHtml = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(.*?)\((\d+)\)/);
    const title = match ? match[1].trim() : line;
    const words = match ? match[2] : '';
    const prompt = `${customPrompt || promptBase}\nTitulo: ${title}\nQuantidade de palavras: ${words}\nPalavra-chave: ${keyword}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
      const data = await response.json();
      const paragraph = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      finalHtml += `<p>${paragraph}</p>\n`;
      res.write(`data: ${JSON.stringify({ progress: i + 1, total: lines.length })}\n\n`);
    } catch (err) {
      res.write(`data: ${JSON.stringify({ error: 'Erro ao consultar API' })}\n\n`);
      return res.end();
    }
  }

  res.write(`data: ${JSON.stringify({ complete: true, html: finalHtml })}\n\n`);
  res.end();
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
