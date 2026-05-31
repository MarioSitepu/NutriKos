import React from "react";
import { Coffee, Flame, Heart, Sparkles, Smile } from "lucide-react";

interface FoodPreset {
  id: string;
  name: string;
  defaultPrice: number;
  localDesc: string;
  imagePreset: string; // keyword for backend matching / display helper
  sampleImageUrl: string;
  difficulty: "Kritis" | "Sedang" | "Sempurna";
}

const PRESETS: FoodPreset[] = [
  {
    id: "preset-mie",
    name: "Mie Instan Double + Telor + Nasi",
    defaultPrice: 12000,
    localDesc: "Menu andalan akhir bulan anak kos, karbohidrat berlapis penunda lapar berat.",
    imagePreset: "mie",
    sampleImageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60",
    difficulty: "Kritis"
  },
  {
    id: "preset-geprek",
    name: "Nasi Ayam Geprek Level 10",
    defaultPrice: 15000,
    localDesc: "Porsi kenyang protein hewani melimpah dengan ulekan minyak cabai rawit pedas.",
    imagePreset: "geprek",
    sampleImageUrl: "https://images.unsplash.com/photo-1562967914-6cda0dbbecfd?w=500&auto=format&fit=crop&q=60",
    difficulty: "Sedang"
  },
  {
    id: "preset-gorengan",
    name: "Nasi + Gorengan 3 Biji",
    defaultPrice: 8000,
    localDesc: "Murah meriah kenyang, siap-siap mengantuk berat 1 jam kemudian di kelas dosen.",
    imagePreset: "gorengan",
    sampleImageUrl: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=500&auto=format&fit=crop&q=60",
    difficulty: "Kritis"
  },
  {
    id: "preset-warteg",
    name: "Nasi Campur Warteg (Telur + Sayur + Tempe)",
    defaultPrice: 11000,
    localDesc: "Pilihan terbaik penunjang daya tahan tubuh, bersahabat untuk gizi dan isi dompet.",
    imagePreset: "warteg",
    sampleImageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
    difficulty: "Sempurna"
  }
];

interface FoodSuggestionsProps {
  onSelectPreset: (preset: { name: string; price: number; imageUrl: string; presetKeyword: string }) => void;
}

export default function FoodSuggestions({ onSelectPreset }: FoodSuggestionsProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold text-slate-800 text-lg">Simulasi Menu Populer Anak Kos</h3>
      </div>
      
      <p className="text-slate-500 text-sm mb-5">
        Tidak punya foto makanan saat ini? Ketuk salah satu menu makanan favorit mahasiswa di bawah ini untuk melihat contoh analisis gizi dan kecocokan budget secara instan!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset({
              name: preset.name,
              price: preset.defaultPrice,
              imageUrl: preset.sampleImageUrl,
              presetKeyword: preset.imagePreset
            })}
            className="flex gap-4 p-3 rounded-xl border border-slate-100 hover:border-violet-300 hover:bg-violet-50/20 text-left transition-all duration-200 group relative overflow-hidden"
          >
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
              <img
                src={preset.sampleImageUrl}
                alt={preset.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-1 left-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm text-white ${
                  preset.difficulty === "Kritis" ? "bg-rose-500" :
                  preset.difficulty === "Sedang" ? "bg-amber-500" :
                  "bg-emerald-500"
                }`}>
                  {preset.difficulty}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-between py-0.5">
              <div>
                <h4 className="font-medium text-slate-800 text-sm group-hover:text-violet-600 transition-colors line-clamp-1">
                  {preset.name}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 font-sans leading-relaxed">
                  {preset.localDesc}
                </p>
              </div>
              <p className="text-xs font-mono font-bold text-violet-600 mt-1">
                Rp {preset.defaultPrice.toLocaleString("id-ID")}
              </p>
            </div>
            
            <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Smile className="w-4 h-4 text-violet-500" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
