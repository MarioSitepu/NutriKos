import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  return NextResponse.json({
    configured: hasKey,
    message: hasKey 
      ? "AI Tersambung: Siap menganalisis makanan secara akurat." 
      : "Mode Showcase: Berjalan dengan simulasi prediksi pintar untuk demonstrasi."
  });
}
