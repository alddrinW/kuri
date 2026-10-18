"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, User, Store, ScanLine } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Credenciales incorrectas");
        return;
      }

      if (data.user.role === "SUPER_ADMIN") {
        router.push("/admin/dashboard");
      } else if (data.user.role === "STORE_OWNER" || data.user.role === "STORE_STAFF") {
        router.push("/store/dashboard");
      } else {
        router.push("/wallet");
      }
      router.refresh();
    } catch {
      setError("Error de conexión al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleFastLogin = (em: string, pw: string) => {
    setEmail(em);
    setPassword(pw);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50/50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-8 shadow-card">
        
        {/* Encabezado */}
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Iniciar Sesión</h1>
          <p className="mt-1 text-xs text-slate-500">Accede a tu billetera KURI o panel de administración</p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@kuri.app"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
          >
            <span>{loading ? "Accediendo..." : "Ingresar a KURI"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Acceso Rápido a Roles Preconfigurados */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
            Cuentas Demo Preconfiguradas
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleFastLogin("sofia@gmail.com", "cliente123")}
              className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 text-left transition hover:border-amber-300 hover:bg-amber-50"
            >
              <User className="h-4 w-4 text-amber-700 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">Cliente</div>
                <div className="text-[10px] text-slate-500">Sofía (4 Oro)</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleFastLogin("carlos@cafeandino.com", "kuri2026")}
              className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 text-left transition hover:border-amber-300 hover:bg-amber-50"
            >
              <Store className="h-4 w-4 text-amber-700 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">Comercio</div>
                <div className="text-[10px] text-slate-500">Dueño Café</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleFastLogin("barista@cafeandino.com", "kuri2026")}
              className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 text-left transition hover:border-amber-300 hover:bg-amber-50"
            >
              <ScanLine className="h-4 w-4 text-amber-700 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">Caja POS</div>
                <div className="text-[10px] text-slate-500">Mateo Barista</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleFastLogin("admin@kuri.app", "admin123")}
              className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 text-left transition hover:border-amber-300 hover:bg-amber-50"
            >
              <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">Admin</div>
                <div className="text-[10px] text-slate-500">SuperAdmin</div>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          ¿Tienes un Kuri nuevo?{" "}
          <Link href="/register" className="font-semibold text-slate-900 hover:underline">
            Actívalo aquí
          </Link>
        </div>

      </div>
    </div>
  );
}
