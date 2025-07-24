# Gerador de Artigos

API em Node.js com Express que gera artigos utilizando a API da OpenAI.

## Instalação

```bash
npm install
```

Copie `.env.example` para `.env` e informe sua `OPENAI_API_KEY`.

## Uso

```
POST /gerar-artigo
{
  "outline": "tópicos do artigo e número de palavras",
  "promptFile": "prompt-review.js"
}
```

O arquivo de prompt deve estar na pasta `prompts/`.

Para iniciar o servidor:

```bash
npm start
```
