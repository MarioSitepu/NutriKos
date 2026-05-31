import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

export const dynamic = 'force-dynamic';

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

function getFallbackAnalysis(harga: number, filename?: string): any {
  const lowername = filename?.toLowerCase() || "";
  if (lowername.includes("mie") || lowername.includes("ramen") || lowername.includes("instant")) {
    return {
      nama_makanan: "Mie Instan dengan Kuah",
      kalori_estimasi: 380,
      protein_gram: 7,
      status_gizi: "Terlalu banyak karbohidrat kosong dan sodium tinggi. Sangat minim protein dan serat untuk mendukung stamina nugas panjang.",
      evaluasi_budget: `Harga Rp ${harga.toLocaleString("id-ID")} ini murah, tapi tidak sepadan jika dikonsumsi terus-menerus karena berisiko menurunkan imun. Alternatif terbaik: Coba nasi setengah porsi + telur dadar/ceplok + potongan sayur sup di Warteg (total Rp 9.000 - Rp 12.000) yang jauh lebih tinggi tinggi protein.`
    };
  } else if (lowername.includes("goreng") || lowername.includes("tempe") || lowername.includes("bakwan")) {
    return {
      nama_makanan: "Nasi Lauk Gorengan & Orek Tempe",
      kalori_estimasi: 520,
      protein_gram: 10,
      status_gizi: "Kadar minyak gorengan berlebih menghasilkan asam lemak jenuh tinggi. Lemak jahat ini membuat cepat mengantuk dan lesu saat belajar.",
      evaluasi_budget: `Budget Rp ${harga.toLocaleString("id-ID")} cukup murah. Alternatif lauk warteg: Ganti 2 gorengan dengan 1 butir Telur Masak Kecap atau Telur Asin (+ Rp 3.000) untuk meningkatkan porsi asam amino berkualitas tanpa kelebihan lemak jenuh.`
    };
  } else if (lowername.includes("geprek") || lowername.includes("chicken") || lowername.includes("ayam")) {
    return {
      nama_makanan: "Nasi Ayam Geprek Cabe Ijo/Merah",
      kalori_estimasi: 680,
      protein_gram: 28,
      status_gizi: "Protein sangat melimpah dari daging ayam, berkhasiat membangun jaringan tubuh. Namun berhati-hatilah dengan minyak ulek sambal geprek dan tepung goreng tebalnya.",
      evaluasi_budget: `Harga Rp ${harga.toLocaleString("id-ID")} sangat pas dan sepadan dengan nilai protein tinggi (28g). Alternatif lebih hemat: Beralih ke Ayam Bakar Kosan tanpa digoreng tepung (+ sayur kubis segar) untuk memangkas kalori minyak goreng berlebih.`
    };
  } else if (lowername.includes("nasi") && lowername.includes("sayur")) {
    return {
      nama_makanan: "Nasi Campur Warteg (Telur + Sayur Kangkung)",
      kalori_estimasi: 420,
      protein_gram: 14,
      status_gizi: "Sangat baik dan berimbang! Protein telur dadar/bulat sangat berkualitas lengkap dengan vitamin mineral yang optimal dari sayuran hijau.",
      evaluasi_budget: `Harga Rp ${harga.toLocaleString("id-ID")} sangat sepadan dan merupakan pola hidup sehat ideal untuk anak kos. Pertahankan lauk ini untuk performa otak prima masa perkuliahan!`
    };
  }

  return {
    nama_makanan: "Nasi Lauk Campur Anak Kos",
    kalori_estimasi: 480,
    protein_gram: 12,
    status_gizi: "Nutrisi sedang. Tercukupi karbohidrat namun protein dan mikronutrien harian masih perlu dioptimalkan agar tidak mudah lemas.",
    evaluasi_budget: `Untuk harga Rp ${harga.toLocaleString("id-ID")}, kombinasi ini lumayan rasional. Sebagai rekomendasi alternatif, ganti kerupuk dengan tempe bacem atau telur puyuh tusuk di angkringan terdekat yang seharga Rp 2.000 - Rp 3.000 tapi tinggi zat besi & protein.`
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image, mimeType, harga, filename } = body;

    if (!harga || isNaN(Number(harga))) {
      return NextResponse.json({ error: "Anda harus memasukkan harga makanan yang valid." }, { status: 400 });
    }

    const priceNum = Number(harga);

    try {
      const ai = getGeminiClient();

      if (!image || !mimeType) {
        return NextResponse.json({ error: "Harap lampirkan foto makanan terlebih dahulu." }, { status: 400 });
      }

      const cleanBase64 = image.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

      const userPrompt = `Analisis makanan dalam foto ini yang harganya Rp ${priceNum.toLocaleString("id-ID")}. Hubungkan kandungan energinya dengan harga tersebut untuk mengevaluasi apakah sepadan dan memberikan alternatif makanan sehat yang lebih hemat bagi anak kos.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: userPrompt
          }
        ],
        config: {
          systemInstruction: `Kamu adalah asisten ahli gizi dan penasihat keuangan mikro hiper-lokal yang dirancang khusus untuk mahasiswa dan anak kos di Indonesia. Tugas utamamu adalah menganalisis foto makanan yang diunggah pengguna, mengestimasi kandungan nutrisinya, dan memberikan saran kelangsungan hidup anak kos yang berimbang antara kesehatan (agar tidak mudah sakit) dan penghematan biaya.

Konteks Pengguna:
Pengguna adalah mahasiswa dengan budget terbatas yang sering kali mengorbankan gizi demi berhemat (misalnya sering makan mi instan, gorengan, atau nasi dengan kuah saja). Mereka membutuhkan evaluasi instan apakah makanan yang akan mereka makan ini sepadan harganya dan cukup menunjang daya tahan tubuh mereka untuk mengerjakan tugas kuliah.

Hubungkan analisis dengan harga makanan sebesar Rp [harga_makanan] yang diinputkan pengguna.

Berikan respons Anda dalam format model terstruktur JSON yang berisi properti berikut:
- nama_makanan: Nama makanan spesifik asal Indonesia yang terdeteksi secara cermat.
- kalori_estimasi: Estimasi asupan kalori total yang realistis (sebagai nominal integer, misal 420).
- protein_gram: Estimasi kandungan protein total dalam gram (sebagai nominal integer, misal 14).
- status_gizi: Deskripsi ketat singkat jernih dalam bahasa Indonesia mengenai keseimbangan gizi (terutama apakah cukup menyokong kesehatan daya tahan tubuh anak kos untuk begadang/kuliah dibanding karbohidrat/lemak jenuh berlebih).
- evaluasi_budget: Evaluasi keuangan mikro apakah harga tersebut sepadan (worth it) atas gizi yang diterima, dan berikan satu opsi alternatif menu lauk warteg/kosan nyata yang lebih murah namun lebih tinggi protein/gizi (misal: nasi sup + telur rebus + tempe bacem) jika makanan saat ini dinilai kurang sehat atau kurang rasional.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nama_makanan: {
                type: Type.STRING,
                description: "Nama makanan Indonesia yang terdeteksi"
              },
              kalori_estimasi: {
                type: Type.INTEGER,
                description: "Estimasi total kalori dalam nominal integer"
              },
              protein_gram: {
                type: Type.INTEGER,
                description: "Estimasi protein dalam gram (nominal integer)"
              },
              status_gizi: {
                type: Type.STRING,
                description: "Analisis singkat nutrisi dan stamina"
              },
              evaluasi_budget: {
                type: Type.STRING,
                description: "Evaluasi harga dan alternatif menu warteg sehat murah"
              }
            },
            required: ["nama_makanan", "kalori_estimasi", "protein_gram", "status_gizi", "evaluasi_budget"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Gemini tidak mengembalikan respons teks.");
      }

      const parsedResult = JSON.parse(responseText.trim());
      return NextResponse.json(parsedResult);

    } catch (err: any) {
      console.warn("Gemini API call failed or is unconfigured. Using smart local simulator. Error details:", err?.message || err);
      
      const fallback = getFallbackAnalysis(priceNum, filename);
      return NextResponse.json({
        ...fallback,
        simulated: true,
        simulationNotice: "Mode demonstrasi sedang aktif. Menampilkan hasil prediksi kepantasan gizi dan harga yang wajar sesuai profil anak kos."
      });
    }
  } catch (err) {
    return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 });
  }
}
