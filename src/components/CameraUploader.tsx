import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, Trash2, Video, RefreshCw, AlertCircle } from "lucide-react";

interface CameraUploaderProps {
  onImageSelected: (base64Data: string, mimeType: string, filename?: string) => void;
  selectedImageUrl: string | null;
  onClear: () => void;
  onPreAction?: () => boolean;
}

export default function CameraUploader({ onImageSelected, selectedImageUrl, onClear, onPreAction }: CameraUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Handle stream attachment and cleanup
  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    
    return () => {
      if (stream && !cameraActive) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream, cameraActive]);

  const handleStartCamera = async () => {
    if (onPreAction && !onPreAction()) return;
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } }, // prefer rear camera, fallback to front on PC
        audio: false,
      });
      
      setStream(mediaStream);
      setCameraActive(true);
      // The stream is attached via useEffect once the video element mounts
    } catch (err: any) {
      console.error("Gagal mengakses kamera:", err);
      setCameraError(
        "Kamera tersumbat atau izin ditolak. Silakan unggah foto dari galeri Anda sebagai alternatif!"
      );
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Data = canvas.toDataURL("image/jpeg");
        onImageSelected(base64Data, "image/jpeg", "makanan_kamera.jpg");
        
        // Stop stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
        setCameraActive(false);
      }
    }
  };

  const handleStopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Jenis file yang diunggah harus berupa gambar (JPG, PNG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onImageSelected(reader.result, file.type, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (onPreAction && !onPreAction()) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (onPreAction && !onPreAction()) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* If captured/loaded image exists */}
      {selectedImageUrl && !cameraActive ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-100 shadow-xs max-h-80 bg-slate-50 flex items-center justify-center">
          <img
            src={selectedImageUrl}
            alt="Makanan"
            className="w-full max-h-80 object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={() => {
                onClear();
                handleStartCamera();
              }}
              className="p-2 bg-white/95 rounded-xl shadow-md text-slate-600 hover:text-violet-600 hover:scale-105 transition-all"
              title="Ambil Ulang"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClear}
              className="p-2 bg-white/95 rounded-xl shadow-md text-slate-600 hover:text-rose-600 hover:scale-105 transition-all"
              title="Hapus Foto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : cameraActive ? (
        /* Video frame track */
        <div className="relative rounded-2xl overflow-hidden border-4 border-black bg-black aspect-video max-h-80 flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          <div className="absolute inset-x-0 bottom-0 p-4 bg-black/60 border-t-4 border-black flex justify-between items-center z-10">
            <button
              onClick={handleStopCamera}
              className="px-4 py-2 border-2 border-black bg-white text-black hover:bg-slate-100 font-black uppercase text-[10px] tracking-wider rounded-xl transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
            >
              Tutup
            </button>

            <button
              onClick={handleCapture}
              className="p-4 bg-[#FF4F00] text-white hover:bg-[#e04500] rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-3 border-black active:translate-x-1 active:translate-y-1 transition-all"
              title="Ambil Foto Makanan"
            >
              <Camera className="w-6 h-6" />
            </button>

            <div className="w-16"></div> {/* Spacer for symmetry */}
          </div>
        </div>
      ) : (
        /* Drag & Drop uploader layout */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-violet-500 bg-violet-50/30 scale-99"
              : "border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50/50"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-full bg-violet-50 text-violet-600">
              <Upload className="w-7 h-7" />
            </div>

            <div>
              <p className="font-semibold text-slate-700 text-sm md:text-base">
                Tarik foto makanan Anda ke sini, atau <span className="text-violet-600 underline">klik untuk mencari</span>
              </p>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Mendukung gambar JPG, JPEG, PNG, atau WEBP hingga 15MB.
              </p>
            </div>

            {/* Optional Mobile Camera quick activator */}
            <div className="flex gap-2.5 pt-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handleStartCamera}
                className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-md transition-all duration-200"
              >
                <Camera className="w-3.5 h-3.5" />
                Ambil lewat Kamera Kost
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera failure alert */}
      {cameraError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-orange-50/50 border border-orange-100 text-orange-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
          <p className="leading-relaxed">{cameraError}</p>
        </div>
      )}
    </div>
  );
}
