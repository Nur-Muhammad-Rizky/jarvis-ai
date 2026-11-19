# JARVIS AI

AI assistant web app dengan tampilan sci-fi, chat, voice input/output, dan penyimpanan percakapan lokal.

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Konfigurasi AI

Tambahkan environment berikut pada `.env.local`:

```env
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

Dapat digunakan dengan provider OpenAI-compatible dengan mengubah `OPENAI_BASE_URL`.

## Fitur

- Antarmuka JARVIS sci-fi responsif
- Chat AI melalui API route server-side
- Voice input melalui Web Speech API
- Text-to-speech output
- Riwayat percakapan tersimpan di browser
- Safe-by-design: API key tidak dikirim ke browser
