import React from "react";
import { Flame, Shield, Award, Zap, ChevronRight, HelpCircle } from "lucide-react";

interface MetricGaugesProps {
  calories: number;
  protein: number;
  price: number;
  targetCalories?: number;
  targetProtein?: number;
}

export default function MetricGauges({
  calories,
  protein,
  price,
  targetCalories = 650, // Single meal target standard
  targetProtein = 18 // Single meal target standard
}: MetricGaugesProps) {
  const calPercent = Math.min(Math.round((calories / targetCalories) * 100), 150);
  const protPercent = Math.min(Math.round((protein / targetProtein) * 100), 150);

  // Gamified immunity index prediction based on protein ratio and cooking wellness
  let survivabilityScore = 50; // default medium
  let healthTitle = "";
  let healthDesc = "";
  let healthColorClass = "";
  let barColorClass = "";

  if (protein < 8) {
    survivabilityScore = 25;
    healthTitle = "⚠️ Stadium Kritis Akhir Bulan";
    healthDesc = "Asupan protein sangat kritis! Dominasi karbohidrat sederhana berisiko tinggi membuat sel otak lelah, gampang mengantuk di kelas, dan rentan terserang flu atau penyakit musiman.";
    healthColorClass = "text-rose-600 bg-rose-50 border-rose-100";
    barColorClass = "bg-rose-500";
  } else if (protein >= 8 && protein < 15) {
    survivabilityScore = 65;
    healthTitle = "⚖️ Bertahan Hidup Standard (Survival Mode)";
    healthDesc = "Cukup untuk ganjal perut saat kuliah pagi, tapi protein yang didapat pas-pasan. Pertimbangkan menambah potongan tahu/tempe agar kebutuhan regenerasi otot dan antibodi harian optimal.";
    healthColorClass = "text-amber-600 bg-amber-50 border-amber-100";
    barColorClass = "bg-amber-500";
  } else {
    survivabilityScore = 95;
    healthTitle = "💪 Siap Tempur SKS & Begadang Tugas";
    healthDesc = "Mantap! Protein melimpah ruah dan kalori seimbang siap menyuplai neurotransmiter otak agar fokus, tidak gampang masuk angin, dan berenergi menyapu bersih ujian matakuliah sulit!";
    healthColorClass = "text-emerald-600 bg-emerald-50 border-emerald-100";
    barColorClass = "bg-emerald-500";
  }

  // Budget efficiency score
  const energyPerRupiah = calories / (price || 1);
  let budgetScoreLabel = "Wajar";
  let budgetScoreDesc = "";
  let budgetBadgeClass = "bg-slate-100 text-slate-700";

  if (price <= 10000 && protein >= 12) {
    budgetScoreLabel = "🔥 Best Deal! (Warteg Master)";
    budgetScoreDesc = "Rasio protein tinggi dengan pengeluaran di bawah rata-rata. Dompet tersenyum lebar!";
    budgetBadgeClass = "bg-emerald-100 text-emerald-800";
  } else if (price > 18000 && protein < 10) {
    budgetScoreLabel = "💸 Kemahalan / Defisit Finansial";
    budgetScoreDesc = "Harga tidak sebanding dengan gizi yang diserap. Investasi kesehatan yang merugikan kantong.";
    budgetBadgeClass = "bg-rose-100 text-rose-800";
  } else {
    budgetScoreLabel = "👍 Sesuai Standard Mahasiswa";
    budgetScoreDesc = "Pengeluaran wajar dan umum untuk kantin kampus atau sekitar kost.";
    budgetBadgeClass = "bg-violet-100 text-violet-800";
  }

  return (
    <div className="space-y-6">
      {/* Imun & Survival Index Index */}
      <div className={`p-5 rounded-2xl border ${healthColorClass} transition-all`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2.5 items-center">
            <span className="p-1.5 rounded-lg bg-white/80 shadow-xs">
              <Shield className="w-5 h-5 text-current" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold opacity-75">Status Daya Tahan Tubuh</p>
              <h4 className="font-bold text-base leading-tight mt-0.5">{healthTitle}</h4>
            </div>
          </div>
          <span className="text-2xl font-black font-mono">{survivabilityScore}%</span>
        </div>

        {/* Custom Progress tracker */}
        <div className="w-full bg-slate-200/50 h-2.5 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full ${barColorClass} transition-all duration-500 ease-out`}
            style={{ width: `${survivabilityScore}%` }}
          />
        </div>

        <p className="text-xs leading-relaxed opacity-90">{healthDesc}</p>
      </div>

      {/* Grid for Calories & Protein and Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calorie Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-2 items-center">
              <div className="p-1.5 rounded-lg bg-orange-50">
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <h5 className="font-semibold text-slate-800 text-sm">Kalori Terdeteksi</h5>
                <p className="text-[10px] text-slate-400 font-mono">Target: {targetCalories} kcal / Porsi</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-slate-900 font-mono">{calories}</span>
              <span className="text-xs text-slate-400 font-sans ml-1">kcal</span>
            </div>
          </div>
          
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="bg-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${calPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>Pemenuhan energi porsi makan</span>
            <span className="font-bold font-mono">{calPercent}%</span>
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-2 items-center">
              <div className="p-1.5 rounded-lg bg-emerald-50">
                <Zap className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h5 className="font-semibold text-slate-800 text-sm">Kandungan Protein</h5>
                <p className="text-[10px] text-slate-400 font-mono">Target: {targetProtein}g / Porsi</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-slate-900 font-mono">{protein}</span>
              <span className="text-xs text-slate-400 font-sans ml-1">gram</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${protPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>Pemenuhan protein (asam amino jaringan)</span>
            <span className="font-bold font-mono">{protPercent}%</span>
          </div>
        </div>
      </div>

      {/* Budget efficiency meter */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hasil Evaluasi Harga & Budget</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${budgetBadgeClass}`}>
            {budgetScoreLabel}
          </span>
        </div>
        <p className="text-slate-700 text-sm font-medium leading-normal">
          {budgetScoreDesc}
        </p>
      </div>
    </div>
  );
}
