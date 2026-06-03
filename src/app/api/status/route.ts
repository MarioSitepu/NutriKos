import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  
  let dbStatus = "Checking...";
  try {
    // Attempt a simple query to verify database connection
    await prisma.user.findFirst();
    dbStatus = "Connected successfully to Neon Database!";
  } catch (error: any) {
    dbStatus = `Database connection failed: ${error.message}`;
  }

  return NextResponse.json({
    configured: hasKey,
    database_status: dbStatus,
    message: hasKey 
      ? "AI Tersambung: Siap menganalisis makanan secara akurat." 
      : "Mode Showcase: Berjalan dengan simulasi prediksi pintar untuk demonstrasi."
  });
}
