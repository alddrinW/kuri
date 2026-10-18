"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  QrCode, 
  ShieldCheck, 
  Store, 
  Wallet, 
  CheckCircle2, 
  Layers, 
  Smartphone,
  ExternalLink
} from "lucide-react";

interface StoreItem {
  id: string;
  slug: string;
  name: string;
  tagLine: string | null;
  category: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  _count: { products: number; rewards: number };
}

export default function HomePage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [activeTab, setActiveTab] = useState<"client" | "merchant" | "keychain">("keychain");

  useEffect(() => {
    fetch("/api/stores")
      .then((res) => res.json())
      .then((data) => {
        if (data.stores) setStores(data.stores);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            
            {/* Texto de Valor Principal */}
            <div className="flex flex-col gap-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-amber-200/80 bg-amber-50/60 px-3.5 py-1 text-xs font-semibold text-amber-900">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Fidelización física con QR permanente</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.1]">
                Cada visita de tus clientes <span className="bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">vale oro</span>
              </h1>

              <p className="max-w-xl text-lg text-slate-600 leading-relaxed">
                Reemplaza las tarjetas de sellos de papel por un llavero físico con QR que nunca cambia. Sin apps que descargar, con presencia digital incluida y control total de recompensas.
              </p>

              {/* Botones de Acción */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/store/cafe-andino"
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <Store className="h-4 w-4" />
                  <span>Explorar Tienda Real</span>
                </Link>

                <Link
                  href="/kuri/KURI-CAFE-001"
                  className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50/70 px-6 py-3.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                >
                  <QrCode className="h-4 w-4 text-amber-700" />
                  <span>Escanear Kuri Demo</span>
                </Link>
              </div>

              {/* Micro Puntos de Valor */}
              <div className="grid grid-cols-3 gap-6 border-t border-slate-100 pt-8">
                <div>
                  <div className="text-2xl font-bold text-slate-900">1 QR</div>
                  <div className="text-xs text-slate-500 font-medium">Permanente e inmutable</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">0 Apps</div>
                  <div className="text-xs text-slate-500 font-medium">Cámara nativa del móvil</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Control antifraude en caja</div>
                </div>
              </div>

            </div>

            {/* Tarjeta Visual Interactiva del Llavero "Tu Kuri" */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-sm rounded-3xl border border-slate-200/90 bg-slate-50/60 p-6 shadow-elevated">
                
                {/* Visual del Llavero Kuri */}
                <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-6 text-white shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-widest uppercase opacity-80">TU KURI OFICIAL</span>
                    <Sparkles className="h-4 w-4 text-amber-200" />
                  </div>

                  <div className="my-8 flex items-center justify-center">
                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white p-2 shadow-inner">
                      <QrCode className="h-full w-full text-slate-900" />
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[11px] font-medium opacity-80">Código Permanente</div>
                      <div className="font-mono text-sm font-bold tracking-wider">KURI-CAFE-001</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-medium opacity-80">Comercio</div>
                      <div className="text-xs font-semibold">Café Andino</div>
                    </div>
                  </div>
                </div>

                {/* Probador Rápido de Escaneo */}
                <div className="mt-5 space-y-2">
                  <div className="text-xs font-semibold text-slate-700">Prueba el escaneo directo en vivo:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Link
                      href="/kuri/KURI-CAFE-001"
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 font-medium transition hover:border-amber-400 hover:text-amber-800"
                    >
                      <span>Kuri de Sofía (4 Oro)</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    </Link>
                    <Link
                      href="/kuri/KURI-CAFE-003"
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 font-medium transition hover:border-amber-400 hover:text-amber-800"
                    >
                      <span>Kuri Sin Activar (+2)</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    </Link>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Demostración Interactiva del Sistema */}
      <section className="border-b border-slate-100 bg-slate-50/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Un solo QR. Cuatro experiencias reales.
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">
              El mismo código físico despliega automáticamente la pantalla adecuada según el rol de la persona.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-subtle">
              <button
                onClick={() => setActiveTab("keychain")}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "keychain" ? "bg-amber-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                1. El Llavero Físico
              </button>
              <button
                onClick={() => setActiveTab("client")}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "client" ? "bg-amber-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                2. El Cliente
              </button>
              <button
                onClick={() => setActiveTab("merchant")}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "merchant" ? "bg-amber-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                3. El Negocio en Caja
              </button>
            </div>
          </div>

          {/* Contenido Interactivo */}
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className={`rounded-2xl border p-6 transition ${activeTab === "keychain" ? "border-amber-300 bg-white shadow-card" : "border-slate-200 bg-white/70"}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <QrCode className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">QR Permanente</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Fabricado en acrílico o metal. No requiere reemplazo cuando cambian las promociones o los menús. Todo se actualiza en la nube.
              </p>
              <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-amber-800 font-semibold">
                Llavero inmutable = Costo cero de reimpresión
              </div>
            </div>

            <div className={`rounded-2xl border p-6 transition ${activeTab === "client" ? "border-amber-300 bg-white shadow-card" : "border-slate-200 bg-white/70"}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Acumulación de Oro</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                El cliente visualiza su progreso hacia el próximo Tesoro, sus descuentos activos y su historial sin descargar aplicaciones.
              </p>
              <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-amber-800 font-semibold">
                Multitienda = Una sola cuenta para todos sus Kurios
              </div>
            </div>

            <div className={`rounded-2xl border p-6 transition ${activeTab === "merchant" ? "border-amber-300 bg-white shadow-card" : "border-slate-200 bg-white/70"}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">Confirmación en Caja</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                El comercio confirma deliberadamente cada visita o canje con un toque. Protección contra doble registro con tiempo de cooldown.
              </p>
              <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-amber-800 font-semibold">
                Seguridad = Cero puntos acreditados por error
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Directorio de Comercios Activos */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Comercios Asociados</h2>
              <p className="text-xs text-slate-500 mt-1">Negocios reales operando con el programa KURI</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {stores.map((store) => (
              <div
                key={store.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-subtle transition hover:border-slate-300 hover:shadow-card"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={store.bannerUrl || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200"}
                      alt={store.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-4 bottom-4 flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-2xl border-2 border-white bg-white shadow-md">
                        <img
                          src={store.logoUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200"}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-xs font-semibold text-amber-700">{store.category}</div>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">{store.name}</h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{store.tagLine}</p>

                    <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{store._count.products} productos en vitrina</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                        <span>{store._count.rewards} Tesoros activos</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50/50 p-4 flex items-center justify-between">
                  <Link
                    href={`/store/${store.slug}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 transition hover:text-amber-700"
                  >
                    <span>Ver vitrina digital</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    href={`/kuri/${store.slug === "cafe-andino" ? "KURI-CAFE-001" : "KURI-BARB-001"}`}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-subtle hover:bg-amber-50"
                  >
                    Probar Llavero
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="border-t border-slate-100 bg-white py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">KURI</span>
            <span>—</span>
            <span>Cada visita vale oro</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="hover:text-slate-900">Panel SuperAdmin</Link>
            <Link href="/wallet" className="hover:text-slate-900">Billetera de Cliente</Link>
            <Link href="/store/cafe-andino" className="hover:text-slate-900">Café Andino</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
