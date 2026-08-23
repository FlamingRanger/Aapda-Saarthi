import { useRef, useState } from "react";
import { compressImage } from "../../utils/imageCompression";

interface PhotoUploadProps {
  onChange: (file: File | null) => void;
}

export default function PhotoUpload({ onChange }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | null) {
    if (!file) {
      setPreview(null);
      onChange(null);
      return;
    }
    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      setPreview(URL.createObjectURL(compressed));
      onChange(compressed);
    } finally {
      setIsCompressing(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        capture="environment"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
      />
      {isCompressing && <p className="text-xs text-slate-500">Compressing photo…</p>}
      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Incident preview"
            className="h-32 w-32 rounded-md border border-slate-200 object-cover"
          />
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              handleFile(null);
            }}
            className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-xs shadow border border-slate-300"
            aria-label="Remove photo"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
