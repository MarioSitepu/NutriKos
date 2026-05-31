"use client";
import React, { useState, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  Trash2, 
  Shield, 
  Flame, 
  Zap, 
  Sparkles, 
  Smile, 
  DollarSign, 
  History, 
  User, 
  Plus, 
  X, 
  Settings, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  RefreshCcw,
  BookOpen,
  LogIn,
  LogOut
} from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import CameraUploader from "../components/CameraUploader";
import FoodSuggestions from "../components/FoodSuggestions";
import MetricGauges from "../components/MetricGauges";
import { MealAnalysis, MealLog, StudentProfile } from "../types";

const STORAGE_LOGS_KEY = "nutrikos_meal_logs";
const STORAGE_PROFILE_KEY = "nutrikos_student_profile";

const DEFAULT_PROFILE: StudentProfile = {
  name: "Anak Kos Teladan",
  weeklyBudget: 200000, // Rp 200.000 per minggu
  targetDailyProtein: 55, // 55 gram protein harian
  targetDailyCalories: 2100 // 2100 kcal harian
};

export default function App() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  
  // Form input states
  const [harga, setHarga] = useState<number>(15000);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMime, setSelectedMime] = useState<string | null>(null);
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null);

  // App UI states
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<{ configured: boolean; message: string }>({
    configured: false,
    message: "Memeriksa kesiapan AI..."
  });
  const [analysisResult, setAnalysisResult] = useState<(MealAnalysis & { simulated?: boolean; simulationNotice?: string }) | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Setup standard profile editing states
  const [editName, setEditName] = useState(profile.name);
  const [editBudget, setEditBudget] = useState(profile.weeklyBudget);
  const [editProtein, setEditProtein] = useState(profile.targetDailyProtein);
  const [editCalories, setEditCalories] = useState(profile.targetDailyCalories);

  // Load from local storage
  useEffect(() => {
    const savedLogs = localStorage.getItem(STORAGE_LOGS_KEY);
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (err) {
        console.error("Gagal meload riwayat makanan:", err);
      }
    }

    const savedProfile = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        setEditName(parsed.name);
        setEditBudget(parsed.weeklyBudget);
        setEditProtein(parsed.targetDailyProtein);
        setEditCalories(parsed.targetDailyCalories);
      } catch (err) {
        console.error("Gagal meload profil:", err);
      }
    }

    // Check API availability
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      setApiStatus({
        configured: data.configured,
        message: data.message
      });
    } catch (err) {
      setApiStatus({
        configured: false,
        message: "Server luring atau dilarang akses. Simulasi pintar aktif."
      });
    }
  };

  const handlePresetSelect = (preset: { name: string; price: number; imageUrl: string; presetKeyword: string }) => {
    // Generate dummy image matching the request size limit
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#FF4F00";
      ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(preset.presetKeyword.toUpperCase(), 10, 50);
    }
    const sampleBase64 = canvas.toDataURL("image/jpeg");

    setSelectedImage(preset.imageUrl);
    setSelectedMime("image/jpeg");
    setSelectedFilename(`${preset.presetKeyword}_preset.jpg`);
    setHarga(preset.price);
    
    // Smooth scroll up to analyze actions on mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageSelected = (base64Data: string, mimeType: string, filename?: string) => {
    setSelectedImage(base64Data);
    setSelectedMime(mimeType);
    if (filename) setSelectedFilename(filename);
    setErrorMsg(null);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setSelectedMime(null);
    setSelectedFilename(null);
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      setErrorMsg("Harap unggah foto makanan Anda, ambil via kamera, atau pilih dari simulasi menu populer di bawah.");
      return;
    }
    if (!harga || harga < 0) {
      setErrorMsg("Masukkan estimasi harga pembelian dengan benar.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image: selectedImage,
          mimeType: selectedMime || "image/jpeg",
          harga: harga,
          filename: selectedFilename || "makanan.jpg"
        })
      });

      if (!response.ok) {
        throw new Error("Gagal melakukan analisis makanan. Harap periksa koneksi Anda.");
      }

      const result: MealAnalysis & { simulated?: boolean; simulationNotice?: string } = await response.json();
      setAnalysisResult(result);

      // Add to logs
      const newLog: MealLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        harga: harga,
        image: selectedImage,
        analysis: result
      };

      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(updatedLogs));

    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi gangguan server. Tidak dapat menganalisis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLog = (id: string) => {
    const updated = logs.filter(log => log.id !== id);
    setLogs(updated);
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(updated));
  };

  const handleClearAllLogs = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua riwayat kuliner dan reset sisa budget?")) {
      setLogs([]);
      localStorage.removeItem(STORAGE_LOGS_KEY);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StudentProfile = {
      name: editName || "Anak Kos Teladan",
      weeklyBudget: Number(editBudget) || 150000,
      targetDailyProtein: Number(editProtein) || 50,
      targetDailyCalories: Number(editCalories) || 2000
    };
    setProfile(updated);
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(updated));
    setShowProfileEdit(false);
  };

  // Finance calculations
  const totalSpent = logs.reduce((acc, curr) => acc + curr.harga, 0);
  const remainingBudget = profile.weeklyBudget - totalSpent;
  const budgetAlert = remainingBudget < (profile.weeklyBudget * 0.15); // under 15% is warning

  // Today's nutritional aggregation
  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayLogs = logs.filter(log => new Date(log.timestamp).toDateString() === today);
    const calories = todayLogs.reduce((acc, curr) => acc + curr.analysis.kalori_estimasi, 0);
    const protein = todayLogs.reduce((acc, curr) => acc + curr.analysis.protein_gram, 0);
    return { calories, protein, count: todayLogs.length };
  };
  const todayStats = getTodayStats();

  return (
    <div className="min-h-screen bg-[#FDFCF6] text-[#1A1A1A] font-sans flex flex-col selection:bg-[#FFD600]">
      {/* HEADER NAV - Neobrutalism Style block */}
      <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between border-b-4 border-black bg-white">
        <div className="flex items-center gap-4 px-6 md:px-10 py-5 border-b-4 md:border-b-0 md:border-r-4 border-black bg-[#FFD600] shrink-0">
          <div className="w-11 h-11 bg-[#FF4F00] border-3 border-black flex items-center justify-center font-black text-white text-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase">
            NK
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none flex items-center gap-1.5">
              NutriKos <span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded-xs tracking-normal font-mono font-bold align-middle">AI</span>
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-800 mt-1">Gizi Seimbang & Dompet Aman</p>
          </div>
        </div>

        {/* Dynamic Micro Finance Alert Widget */}
        <div className="flex-1 flex flex-wrap items-stretch justify-between p-4 md:p-6 gap-4">
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <div className="w-12 h-12 rounded-none border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden shrink-0 hidden sm:block bg-[#FFD600]">
                  {session.user?.image ? (
                    <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-black" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-black uppercase text-black bg-[#FFD600] px-2 py-0.5 border-2 border-black tracking-[0.05em] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Sobat Terverifikasi</span>
                    <button 
                      onClick={() => setShowProfileEdit(!showProfileEdit)}
                      className="text-[10px] font-black uppercase text-black bg-white hover:bg-slate-100 px-2 py-0.5 border-2 border-black tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" /> Target
                    </button>
                    <button 
                      onClick={() => signOut()}
                      className="text-[10px] font-black uppercase text-white bg-rose-500 hover:bg-rose-600 px-2 py-0.5 border-2 border-black tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" /> Keluar
                    </button>
                  </div>
                  <p className="font-extrabold text-lg text-black leading-tight uppercase tracking-tight">{session.user?.name || profile.name}</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-none border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden shrink-0 hidden sm:flex items-center justify-center bg-violet-300">
                  <User className="w-6 h-6 text-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-black uppercase text-black bg-violet-300 px-2 py-0.5 border-2 border-black tracking-[0.05em] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Sobat Anonim</span>
                    <button 
                      onClick={() => setShowProfileEdit(!showProfileEdit)}
                      className="text-[10px] font-black uppercase text-black bg-white hover:bg-slate-100 px-2 py-0.5 border-2 border-black tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" /> Target
                    </button>
                    <button 
                      onClick={() => signIn("google")}
                      className="text-[10px] font-black uppercase text-white bg-[#4285F4] hover:bg-[#3367d6] px-2 py-0.5 border-2 border-black tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1"
                    >
                      <LogIn className="w-3 h-3" /> G-Auth
                    </button>
                  </div>
                  <p className="font-extrabold text-lg text-black leading-tight uppercase tracking-tight">{profile.name}</p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Sisa Budget Mingguan Anda</p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <p className={`font-black text-xl md:text-2xl ${remainingBudget < 0 ? "text-rose-600 animate-pulse" : "text-[#EA580C]"}`}>
                  Rp {remainingBudget.toLocaleString("id-ID")}
                </p>
                <span className="text-xs text-slate-400 font-mono">/ Rp {profile.weeklyBudget.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className={`h-11 w-11 rounded-full border-3 border-black flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
              remainingBudget < 0 ? "bg-rose-500 text-white animate-bounce" : budgetAlert ? "bg-amber-400 text-black" : "bg-emerald-400 text-black"
            }`}>
              Rp
            </div>
          </div>
        </div>
      </header>

      {/* QUICK SYSTEM STATUS */}
      <div className="px-6 md:px-10 py-2.5 bg-black text-white/90 text-xs font-mono flex flex-wrap justify-between items-center gap-2 border-b-4 border-black">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="uppercase tracking-widest text-[9px] font-bold">JARINGAN: {apiStatus.configured ? "ONLINE GEMINI" : "MODE SHOWCASE"}</span>
        </div>
        <p className="text-[10px] truncate max-w-md italic">{apiStatus.message}</p>
        <div className="flex items-center gap-2 invisible md:visible">
          <Clock className="w-3.5 h-3.5 text-[#FFD600]" />
          <span>WIB: {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>

      {/* MODAL EDIT PROFIL */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-[#FDFCF6] border-4 border-black rounded-3xl w-full max-w-md overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-[#FF4F00] text-white p-5 border-b-4 border-black flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <h3 className="font-black uppercase text-lg tracking-tight">Atur Kebebasan Finansial & Gizi</h3>
              </div>
              <button 
                onClick={() => setShowProfileEdit(false)}
                className="p-1 bg-black rounded-lg text-white hover:bg-slate-800 transition-all border-2 border-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1.5">Nama Anak Kost</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:bg-amber-50/50"
                  placeholder="Contoh: Budi Survival"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1.5">Budget Makan Mingguan (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={editBudget}
                    onChange={(e) => setEditBudget(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border-3 border-black rounded-xl font-mono font-extrabold focus:outline-none"
                    min="1000"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-sans">Rata-rata anak kos: Rp 150.000 - 300.000 / minggu</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-700 mb-1.5">Target Kalori / Kali Makan</label>
                  <input
                    type="number"
                    value={editCalories}
                    onChange={(e) => setEditCalories(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border-3 border-black rounded-xl font-mono font-extrabold focus:outline-none"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-700 mb-1.5">Target Protein (gram)</label>
                  <input
                    type="number"
                    value={editProtein}
                    onChange={(e) => setEditProtein(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border-3 border-black rounded-xl font-mono font-extrabold focus:outline-none"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProfileEdit(false)}
                  className="flex-1 py-3 border-3 border-black bg-white hover:bg-slate-100 font-bold uppercase rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs active:translate-x-0.5 active:translate-y-0.5"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 border-3 border-black bg-[#10B981] text-white font-black uppercase rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs hover:bg-[#0d9c6d] active:translate-x-0.5 active:translate-y-0.5"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CORE HERO BANNER: WARTEG MEETS TECHNOLOGY */}
      <section className="bg-slate-900 text-white px-6 md:px-10 py-7 border-b-4 border-black relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=1000&auto=format&fit=crop')" }}></div>
        <div className="relative max-w-2xl z-10">
          <div className="inline-block bg-[#FF4F00] text-white px-3 py-1 font-mono text-[10px] uppercase tracking-widest mb-3 border border-white">
            MAHASISWA EXTRA HARD-MODE SURVIVAL
          </div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none mb-2">
            DETEKSI GIZI & <span className="text-[#FFD600]">EVALUASI KEUANGAN</span> SECARA INSTAN!
          </h2>
          <p className="text-sm text-slate-300 font-sans max-w-xl leading-relaxed">
            Foto gorengan, mie instan bungkus, ayam penyet, gulai, atau piring nasi wartegmu. Ketahui total kalori, protein vital, dan opsi lauk alternatif yang lebih murah & ramah imun agar tubuh sehat bebas lemas saat ujian.
          </p>
        </div>

        {/* Mini stats counters for today */}
        <div className="bg-black/80 border-2 border-white p-4 shrink-0 rounded-xl w-full md:w-auto grid grid-cols-3 md:flex md:flex-col gap-3 md:gap-2.5 z-10 font-mono text-center md:text-right">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-slate-400">Total Makan Hari ini</p>
            <p className="text-lg font-black text-[#FFD600]">{todayStats.count} Kali</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-slate-400">Konsumsi Energi</p>
            <p className="text-lg font-black text-orange-400">{todayStats.calories} <span className="text-[10px]">kcal</span></p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-slate-400">Protein Masuk</p>
            <p className="text-lg font-black text-emerald-400">{todayStats.protein} <span className="text-[10px]">g</span></p>
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* LEFT COLUMN: FOOD INGEST & PARAMETERS */}
        <section className="lg:col-span-6 p-6 md:p-8 lg:p-10 border-b-4 lg:border-b-0 lg:border-r-4 border-black space-y-8 bg-slate-50/50">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-8 h-8 rounded-lg bg-black text-white font-black flex items-center justify-center text-sm shadow-[2px_2px_0px_0px_rgba(255,214,0,1)]">1</span>
            <h3 className="text-xl font-black uppercase tracking-tight">Kamera / Unggah Foto Makanan</h3>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-6">
            {/* Camera Component */}
            <CameraUploader
              onImageSelected={handleImageSelected}
              selectedImageUrl={selectedImage}
              onClear={handleClearImage}
            />

            {/* Input price */}
            <div className="p-5 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <label htmlFor="harga-input" className="block text-xs font-black uppercase text-slate-800 tracking-wider mb-2">
                💰 Masukkan Harga Makanan yang Anda Beli (Rupiah) :
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl text-slate-900 border-r-2 border-slate-200 pr-3.5">Rp</span>
                <input
                  id="harga-input"
                  type="number"
                  value={harga || ""}
                  onChange={(e) => setHarga(Number(e.target.value))}
                  placeholder="Contoh: 15000"
                  className="w-full pl-17 pr-4 py-3 bg-white border-3 border-black text-xl font-mono font-extrabold text-slate-950 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 placeholder-slate-300"
                  min="0"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-sans">
                Uang yang Anda keluarkan di sini akan dipotong secara digital dari limit saldo mingguan agar keuangan terpantau sehat.
              </p>
            </div>

            {/* Error alerts */}
            {errorMsg && (
              <div className="p-4 bg-rose-50 border-3 border-rose-500 text-rose-800 rounded-xl flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm">Kesalahan Pengisian</h5>
                  <p className="text-xs mt-0.5 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* CTA Analyze Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 border-4 border-black bg-[#FF4F00] text-white font-black text-lg uppercase rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] tracking-tight transition-all duration-200 active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                isLoading ? "opacity-50 cursor-wait bg-slate-700" : "hover:bg-[#e04500]"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="animate-spin inline-block w-5 h-5 border-3 border-white border-t-transparent rounded-full" />
                  MENDETEKSI & MEMBACA GIZI MAKANAN...
                </span>
              ) : (
                "⚡ ANALISIS GIZI & EVALUASI BUDGET KOS!"
              )}
            </button>
          </form>

          {/* Preset templates for simulator */}
          <FoodSuggestions onSelectPreset={handlePresetSelect} />

        </section>

        {/* RIGHT COLUMN: REAL-TIME NUTRITIONAL ANALYSIS REPORT */}
        <section className="lg:col-span-6 p-6 md:p-8 lg:p-10 flex flex-col justify-between bg-white relative">
          <div>
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-black text-white font-black flex items-center justify-center text-sm shadow-[2px_2px_0px_0px_rgba(255,214,0,1)]">2</span>
                <h3 className="text-xl font-black uppercase tracking-tight">Hasil Rekomendasi Instan</h3>
              </div>
              <span className="bg-[#059669] text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest">
                Real-time
              </span>
            </div>

            {/* IF NO SCAN PERFORMED YET */}
            {!analysisResult && !isLoading && (
              <div className="border-4 border-dashed border-slate-200 rounded-3xl p-8 text-center bg-slate-50/35 flex flex-col items-center justify-center space-y-4 py-16">
                <div className="p-4 bg-slate-100 rounded-full text-slate-400">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-sm">Menunggu Unggahan Foto Anda</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-sans leading-relaxed">
                    Unggah piring warteg atau pilih produk instan di sebelah kiri. AI akan mendata nilai kalori, protein, kepantasan harga secara finansial, dan alternatif menu sehat di sini.
                  </p>
                </div>
              </div>
            )}

            {/* IF SCAN IS WAITING */}
            {isLoading && (
              <div className="border-4 border-black rounded-3xl p-8 bg-slate-50 relative overflow-hidden animate-pulse flex flex-col space-y-6">
                <div className="h-6 bg-slate-300 w-1/3 rounded-md" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-slate-300 rounded-xl" />
                  <div className="h-20 bg-slate-300 rounded-xl" />
                </div>
                <div className="h-10 bg-slate-300 rounded-xl" />
                <div className="h-24 bg-slate-300 rounded-xl" />
              </div>
            )}

            {/* REAL-TIME ANALYSIS CARD */}
            {analysisResult && !isLoading && (
              <div className="space-y-6">
                {/* Header detected menu */}
                <div className="p-5 bg-[#FFD600] border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-4">
                  <div className="p-2.5 bg-black text-white shrink-0 rounded-lg">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h5 className="text-[10px] uppercase font-mono font-bold text-slate-800 tracking-widest">Menu yang terdeteksi AI</h5>
                    <h4 className="text-xl md:text-2xl font-black text-black leading-tight uppercase mt-0.5">
                      {analysisResult.nama_makanan}
                    </h4>
                  </div>
                </div>

                {/* Simulated label banner */}
                {("simulated" in analysisResult) && (
                  <div className="p-3.5 bg-amber-50 border-2 border-dashed border-amber-400 text-amber-800 text-xs rounded-xl flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Info Mode Simulasi:</p>
                      <p className="text-[11px] leading-relaxed mt-0.5">
                        {analysisResult.simulationNotice || "Simulasi lokal mendata perkiraan gizi wajar. Anda dapat menambahkan GEMINI_API_KEY di menu sebelah kiri/Secrets untuk foto asli!"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Dashboard stats & gauges */}
                <MetricGauges
                  calories={analysisResult.kalori_estimasi}
                  protein={analysisResult.protein_gram}
                  price={harga}
                  targetCalories={profile.targetDailyCalories / 3}
                  targetProtein={profile.targetDailyProtein / 3}
                />

                {/* Status Gizi detail block */}
                <div className="space-y-4 pt-2">
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Evaluasi Nutrisi & Ketahanan Tubuh</h5>
                    <p className="text-lg md:text-xl font-bold leading-snug">
                      {analysisResult.status_gizi}
                    </p>
                  </div>

                  {/* Financial Evaluation callout bubble */}
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Rasio Nilai & Dompet (Pembelian: Rp {harga.toLocaleString("id-ID")})</h5>
                    <div className="bg-[#1A1A1A] text-[#FDFCF6] p-5 rounded-2xl border-2 border-black flex gap-3.5 items-start shadow-[4px_4px_0px_0px_rgba(234,88,12,1)]">
                      <div className="p-1.5 rounded-lg bg-slate-800 shrink-0 text-[#FFD600]">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium leading-relaxed italic">
                        &ldquo;{analysisResult.evaluasi_budget}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER TIPS DARI KOSAN */}
          <div className="border-t-3 border-black pt-6 mt-10 flex flex-col md:flex-row items-start gap-4">
            <div className="bg-[#EA580C] text-white px-2.5 py-1 text-xs font-black uppercase rotate-[-1deg] shrink-0 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Tips Kelangsungan Hidup
            </div>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              Mahasiswa butuh <span className="underline text-slate-800">50g protein</span> per hari untuk regenerasi otak. Ganti porsi mi ganda dengan ekstra telur bulat di warung atau rebus kangkung menggunakan rice-cooker kosan sebagai penyelamat stamina!
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER SECTION: HISTORY & PRESET LOG TRACKER */}
      <section className="bg-white border-t-4 border-black p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <History className="w-6 h-6 text-slate-700" />
              <h3 className="text-xl font-black uppercase tracking-tight">Koran Pengeluaran Malam & Analisis Gizi</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono font-bold">
                Makan Terdaftar: {logs.length} Kali
              </span>
              {logs.length > 0 && (
                <button
                  onClick={handleClearAllLogs}
                  className="px-3 py-1.5 border-2 border-black bg-rose-50 text-rose-700 hover:bg-rose-100 font-extrabold text-xs uppercase rounded-lg transition-all"
                >
                  Reset Koran & Budget
                </button>
              )}
            </div>
          </div>

          {/* Logs lists */}
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <p className="text-sm font-semibold">Belum ada koran makanan yang didata.</p>
              <p className="text-xs mt-1">Gunakan formulir deteksi di atas untuk merekrut makanan baru ke dalam jurnal mingguan Anda!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {logs.map((log) => {
                const date = new Date(log.timestamp);
                const readableTime = date.toLocaleDateString("id-ID", {
                  weekday: "short",
                  day: "numeric",
                  month: "short"
                }) + " (" + date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + ")";

                // Color of badges
                const pr = log.analysis.protein_gram;
                const badgeColor = pr < 8 ? "bg-rose-100 text-rose-800" : pr < 15 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800";

                return (
                  <div key={log.id} className="border-3 border-black bg-white rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-[10px] font-mono text-slate-400 font-bold">{readableTime}</span>
                        <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-sm uppercase ${badgeColor}`}>
                          Protein: {pr}g
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 uppercase">
                        {log.analysis.nama_makanan}
                      </h4>

                      <div className="flex gap-4 my-3 text-xs font-mono font-bold text-slate-600">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Energi</span>
                          <span className="text-sm text-slate-900">{log.analysis.kalori_estimasi} kcal</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Harga</span>
                          <span className="text-sm text-[#EA580C]">Rp {log.harga.toLocaleString("id-ID")}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-3 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        &rdquo;{log.analysis.status_gizi}&rdquo;
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-4">
                      {log.image ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-[10px] text-slate-400 font-mono">Disertakan Foto</span>
                        </div>
                      ) : (
                        <div className="w-4"></div>
                      )}
                      
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* SYSTEM BOTTOM BAR */}
      <footer className="bg-black text-white px-6 md:px-10 py-5 flex flex-col md:flex-row justify-between items-center gap-4 mt-auto border-t-4 border-black">
        <p className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Mode: Akhir Bulan / Hemat Gizi Terjamin</p>
        <p className="text-[10px] font-mono tracking-widest uppercase text-slate-400">NutriKos AI - @{new Date().getFullYear()} Dibuat untuk Mahasiswa Indonesia</p>
      </footer>
    </div>
  );
}
