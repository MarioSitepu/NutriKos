import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const logs = await prisma.mealLog.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
    });

    // Map Prisma models back to frontend types
    const formattedLogs = logs.map(log => ({
      id: log.id,
      timestamp: log.timestamp.toISOString(),
      harga: log.harga,
      image: log.image,
      analysis: {
        nama_makanan: log.namaMakanan,
        kalori_estimasi: log.kaloriEstimasi,
        protein_gram: log.proteinGram,
        status_gizi: log.statusGizi,
        evaluasi_budget: log.evaluasiBudget,
      }
    }));

    return NextResponse.json(formattedLogs);
  } catch (error) {
    console.error("Logs GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { harga, image, analysis } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const newLog = await prisma.mealLog.create({
      data: {
        userId: user.id,
        harga: Number(harga),
        image: image || null,
        namaMakanan: analysis.nama_makanan,
        kaloriEstimasi: Number(analysis.kalori_estimasi),
        proteinGram: Number(analysis.protein_gram),
        statusGizi: analysis.status_gizi,
        evaluasiBudget: analysis.evaluasi_budget,
      }
    });

    return NextResponse.json(newLog);
  } catch (error) {
    console.error("Logs POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const id = req.nextUrl.searchParams.get("id");

    if (id) {
      await prisma.mealLog.delete({
        where: { id: id },
      });
    } else {
      await prisma.mealLog.deleteMany({
        where: { userId: user.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logs DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
