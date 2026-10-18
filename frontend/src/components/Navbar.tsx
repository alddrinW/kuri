"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Sparkles, 
  Wallet, 
  Store, 
  ShieldCheck, 
  ScanLine, 
  LogOut, 
  User, 
  ChevronDown
} from "lucide-react";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  store?: { id: string; slug: string; name: string } | null;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  useEffect(() => {
    fetchSession();
  }, [pathname]);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const handleQuickSwitch = async (email: string, pass: string) => {
    setSwitcherOpen(false);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass }),
    });
    if (res.ok) {
      await fetchSession();
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Marca KURI */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900">KURI</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-amber-700">Cada visita vale oro</span>
            </div>
          </Link>

          {/* Enlaces Principales */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === "/" ? "text-slate-900 font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/store/cafe-andino"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname.startsWith("/store") ? "text-slate-900 font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Comercios
            </Link>

            {user?.role === "CUSTOMER" && (
              <Link
                href="/wallet"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === "/wallet" ? "bg-amber-50 text-amber-900 font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Wallet className="h-4 w-4 text-amber-600" />
                Mi Billetera
              </Link>
            )}

            {(user?.role === "STORE_OWNER" || user?.role === "STORE_STAFF") && (
              <>
                <Link
                  href="/store/dashboard"
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    pathname.startsWith("/store/dashboard") ? "bg-amber-50 text-amber-900 font-semibold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Store className="h-4 w-4 text-amber-600" />
                  Panel Comercio
                </Link>
                <Link
                  href="/pos/KURI-CAFE-001"
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    pathname.startsWith("/pos") ? "bg-amber-50 text-amber-900 font-semibold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ScanLine className="h-4 w-4 text-amber-600" />
                  Terminal de Caja
                </Link>
              </>
            )}

            {user?.role === "SUPER_ADMIN" && (
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin") ? "bg-slate-900 text-white font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                SuperAdmin
              </Link>
            )}
          </nav>
        </div>

        {/* Acciones de Usuario y Selector Rápido */}
        <div className="flex items-center gap-3">
          
          {/* Selector de Sesión de Prueba (Para evaluar cualquier flujo de inmediato) */}
          <div className="relative">
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{user ? user.name.split(" ")[0] : "Probar Rol"}</span>
              <ChevronDown className="h-3 w-3 text-slate-500" />
            </button>

            {switcherOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-elevated">
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Acceso Rápido a Roles Reales
                </div>
                <button
                  onClick={() => handleQuickSwitch("sofia@gmail.com", "cliente123")}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-900"
                >
                  <div>
                    <div className="font-semibold text-slate-900">Sofía Delgado</div>
                    <div className="text-[11px] text-slate-500">Cliente (Nivel Plata)</div>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-700">4 Oro</span>
                </button>
                <button
                  onClick={() => handleQuickSwitch("carlos@cafeandino.com", "kuri2026")}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <div>
                    <div className="font-semibold text-slate-900">Carlos Mendoza</div>
                    <div className="text-[11px] text-slate-500">Dueño Café Andino</div>
                  </div>
                  <span className="text-[10px] text-slate-400">Dueño</span>
                </button>
                <button
                  onClick={() => handleQuickSwitch("barista@cafeandino.com", "kuri2026")}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <div>
                    <div className="font-semibold text-slate-900">Mateo Barista</div>
                    <div className="text-[11px] text-slate-500">Staff / Terminal POS</div>
                  </div>
                  <span className="text-[10px] text-slate-400">Caja</span>
                </button>
                <button
                  onClick={() => handleQuickSwitch("admin@kuri.app", "admin123")}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <div>
                    <div className="font-semibold text-slate-900">Alddrin Administrador</div>
                    <div className="text-[11px] text-slate-500">SuperAdmin KURI</div>
                  </div>
                  <span className="text-[10px] text-slate-400">Admin</span>
                </button>
              </div>
            )}
          </div>

          {!loading && user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:text-slate-900"
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
              >
                Activar Kuri
              </Link>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
