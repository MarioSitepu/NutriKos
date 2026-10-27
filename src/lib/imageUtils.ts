/**
 * Client-side Image Optimization & Compression Utility
 * 
 * Specifically designed for Vercel Serverless environment:
 * - Keeps payload well below Vercel's 4.5MB request body limit (typically reduces 5-15MB phone photos to ~150-350KB).
 * - Maintains aspect ratio and high fidelity for Gemini Vision AI analysis.
 * - Drastically reduces mobile bandwidth usage and improves upload speed.
 */

export interface CompressedImageResult {
  base64: string;
  mimeType: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
}

export async function compressImage(
  file: File,
  maxDimension = 1280,
  quality = 0.82
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File yang diunggah bukan merupakan gambar yang valid."));
      return;
    }

    const originalSizeBytes = file.size;
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Format gambar tidak valid."));
        return;
      }

      const img = new Image();

      img.onerror = () => reject(new Error("Gagal memuat gambar untuk dioptimalkan."));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while ensuring dimensions stay within maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // If canvas 2d context unavailable, fallback to original
          resolve({
            base64: reader.result as string,
            mimeType: file.type,
            originalSizeBytes,
            compressedSizeBytes: originalSizeBytes,
          });
          return;
        }

        // Draw and export as compressed JPEG
        ctx.drawImage(img, 0, 0, width, height);
        const outputMime = "image/jpeg";
        const compressedBase64 = canvas.toDataURL(outputMime, quality);

        // Approximate bytes from base64 string
        const base64Content = compressedBase64.split(",")[1] || "";
        const compressedSizeBytes = Math.round((base64Content.length * 3) / 4);

        resolve({
          base64: compressedBase64,
          mimeType: outputMime,
          originalSizeBytes,
          compressedSizeBytes,
        });
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}
