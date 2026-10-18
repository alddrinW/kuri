"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Image as ImageIcon, Loader2, Check, X, Cloud, AlertCircle } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  currentUrl?: string;
  onImageUploaded: (url: string) => void;
  folder?: string;
  aspectRatio?: "square" | "wide" | "any";
  description?: string;
}

export default function ImageUploader({
  label,
  currentUrl = "",
  onImageUploaded,
  folder = "kuri/uploads",
  aspectRatio = "any",
  description,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<{ configured: boolean; cloudName: string | null } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar previsualización si cambia la URL externa
  useEffect(() => {
    setPreviewUrl(currentUrl);
  }, [currentUrl]);

  // Verificar estado del backend de Cloudinary
  useEffect(() => {
    async function checkCloudStatus() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
        const res = await fetch(`${apiUrl}/upload/status`);
        if (res.ok) {
          const data = await res.json();
          setCloudStatus(data);
        }
      } catch (err) {
        // En caso de fallo de red en la comprobación
        setCloudStatus({ configured: false, cloudName: null });
      }
    }
    checkCloudStatus();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP, GIF o SVG)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("El archivo supera el límite de 10 MB");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", folder);

      const response = await fetch(`${apiUrl}/upload/image`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Error al subir la imagen");
      }

      const uploadedUrl = data.secure_url || data.url;
      setPreviewUrl(uploadedUrl);
      onImageUploaded(uploadedUrl);
      setSuccessMessage("Imagen subida a Cloudinary con éxito");
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      console.error("Error al procesar subida:", err);
      setErrorMessage(err.message || "No se pudo subir la imagen. Verifica tu conexión o credenciales.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreviewUrl("");
    onImageUploaded("");
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label}
        </label>
        {cloudStatus && (
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${
              cloudStatus.configured
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}
          >
            <Cloud className="w-3 h-3" />
            {cloudStatus.configured ? "Cloudinary Activo" : "Requiere API Keys"}
          </span>
        )}
      </div>

      {description && <p className="text-xs text-slate-400">{description}</p>}

      {/* Área interactiva de Dropzone / Vista Previa */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden p-4 ${
          isDragging
            ? "border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/10"
            : previewUrl
            ? "border-slate-700 bg-slate-900/60 hover:border-slate-600"
            : "border-slate-800 bg-slate-950/40 hover:border-amber-400/40 hover:bg-slate-900/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        {previewUrl ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div
              className={`relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 ${
                aspectRatio === "wide"
                  ? "w-full sm:w-48 h-28"
                  : aspectRatio === "square"
                  ? "w-20 h-20"
                  : "w-28 h-24"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Vista previa"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p className="text-xs font-medium text-slate-200 truncate">
                {previewUrl.startsWith("http") ? previewUrl : "Imagen cargada"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Haz clic para cambiar imagen o arrastra un nuevo archivo
              </p>
              <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Quitar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-5 text-center">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-xs font-medium text-amber-300">
                  Optimizando y subiendo a Cloudinary...
                </p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  Arrastra tu archivo aquí o{" "}
                  <span className="text-amber-400 underline decoration-amber-400/30">
                    explora tu equipo
                  </span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Formatos soportados: JPG, PNG, WEBP, SVG hasta 10 MB
                </p>
              </>
            )}
          </div>
        )}

        {/* Overlay de carga si está subiendo sobre imagen existente */}
        {isUploading && previewUrl && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
            <p className="text-xs font-medium text-amber-300">
              Subiendo nueva versión a Cloudinary...
            </p>
          </div>
        )}
      </div>

      {/* Entrada manual alternativa / feedback */}
      <div className="flex items-center gap-2">
        <input
          type="url"
          value={previewUrl}
          onChange={(e) => {
            const val = e.target.value;
            setPreviewUrl(val);
            onImageUploaded(val);
          }}
          placeholder="O ingresa una URL directa (https://...)"
          className="flex-1 bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-600"
        />
      </div>

      {/* Mensajes de Éxito / Error */}
      {successMessage && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
          <Check className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
