import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { messages } = await request.json();
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    return NextResponse.json({
      error: "OPENAI_API_KEY belum dikonfigurasi.",
      message:
        "Saya siap. Tambahkan OPENAI_API_KEY pada environment untuk mengaktifkan percakapan AI.",
    }, { status: 503 });
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      messages: [
        { role: "system", content: "Anda JARVIS, asisten AI yang cerdas, ringkas, hangat, dan profesional. Jawab dalam bahasa yang dipilih pengguna, biasanya Bahasa Indonesia." },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json({ error: "Permintaan AI gagal", details }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json({ message: data.choices?.[0]?.message?.content || "Tidak ada respons." });
}
