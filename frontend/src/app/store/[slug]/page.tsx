"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  QrCode, 
  ArrowRight,
  Award,
  AlertCircle,
  Tag,
  Percent,
  X,
  ChevronDown,
  Mail,
  ExternalLink
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
  GoogleMapsIcon
} from "@/components/SocialIcons";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountGoldPrice: number | null;
  category: string;
  imageUrl: string | null;
}

interface Reward {
  id: string;
  title: string;
  description: string | null;
  costInGold: number;
}

interface ScheduleDay {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

interface PromoCampaign {
  id: string;
  name: string;
  type: string;
  description: string | null;
  discountPercent: number | null;
  multiplier: number | null;
}

interface StoreData {
  id: string;
  slug: string;
  name: string;
  tagLine: string | null;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  facebook?: string | null;
  instagram: string | null;
  mapUrl: string | null;
  category: string;
  scheduleText: string | null;
  isOpenManual: boolean;
  subscriptionStatus?: string;
  campaign?: {
    name: string;
    description: string | null;
    goldPerVisit: number;
    discountPercent: number | null;
    bannerNotice: string | null;
  } | null;
  schedules?: ScheduleDay[];
  promoCampaigns?: PromoCampaign[];
  products: Product[];
  rewards: Reward[];
}

const DAY_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default function StorePublicPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/stores/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.store) setStore(data.store);
        else setError("Comercio no encontrado");
      })
      .catch(() => setError("Error al cargar comercio"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Sparkles className="h-4 w-4 animate-spin text-amber-500" />
          <span>Cargando vitrina de comercio...</span>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-slate-900">Comercio no encontrado</h2>
        <p className="mt-1 text-xs text-slate-500">El comercio solicitado no existe o fue suspendido temporalmente.</p>
        <Link href="/" className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  // Bloqueo total si el negocio tiene mensualidad suspendida
  if (store.subscriptionStatus === "SUSPENDED") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 shadow-sm">
          <AlertCircle className="h-8 w-8" />
        </div>
        <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-700">
          Servicio Suspendido
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Vitrina Web Inactiva
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          El portal web y catálogo digital de <strong className="font-semibold text-slate-900">{store.name}</strong> se encuentran pausados temporalmente debido a una mensualidad pendiente de regularización.
        </p>
        <div className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-left text-xs text-slate-600 space-y-2">
          <p className="font-medium text-slate-800">¿Eres el propietario o administrador de este comercio?</p>
          <p>
            Inicia sesión en tu panel de control de KURI para consultar el estado de tu cuenta o comunícate con la administración central para reactivar tu vitrina pública y sistema de fidelización de forma inmediata.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
          >
            <span>Acceder a Mi Cuenta</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Ir al Inicio
          </Link>
        </div>
      </div>
    );
  }

  const categories = Array.from(new Set(store.products.map((p) => p.category)));
  const filteredProducts =
    selectedCategory === "ALL"
      ? store.products
      : store.products.filter((p) => p.category === selectedCategory);

  return (
    <div className="flex flex-col bg-white pb-20">
      
      {/* Portada y Cabecera del Comercio */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-100">
        <img
          src={store.bannerUrl || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1400"}
          alt={store.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="absolute bottom-6 left-0 right-0">
          <div className="mx-auto flex max-w-7xl items-end justify-between px-4 sm:px-6">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-card">
                <img
                  src={store.logoUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200"}
                  alt={store.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-white">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-semibold">
                  <span className={`h-1.5 w-1.5 rounded-full ${store.isOpenManual ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                  <span>{store.isOpenManual ? "Abierto ahora" : "Cerrado"}</span>
                </div>
                <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">{store.name}</h1>
                <p className="text-xs sm:text-sm text-slate-200 line-clamp-1">{store.tagLine}</p>
              </div>
            </div>

            {/* Botón Flotante para clientes con Kuri */}
            <div className="hidden sm:block">
              <Link
                href={`/kuri/${store.slug === "cafe-andino" ? "KURI-CAFE-001" : "KURI-BARB-001"}`}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-semibold text-slate-900 shadow-md transition hover:bg-amber-400"
              >
                <QrCode className="h-4 w-4" />
                <span>Tengo mi Kuri</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Información Operativa y Contacto */}
      <div className="border-b border-slate-100 bg-slate-50/60 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {store.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="font-medium text-slate-800">{store.address}</span>
                {store.mapUrl && (
                  <a
                    href={store.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-900 hover:bg-amber-100 transition border border-amber-200 shadow-2xs"
                    title="Abrir ubicación en Google Maps"
                  >
                    <GoogleMapsIcon className="h-3 w-3" />
                    <span>Ver en Maps</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
            )}
            {store.scheduleText && (
              <button
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium group transition"
              >
                <Clock className="h-4 w-4 text-slate-400 group-hover:text-amber-600" />
                <span>{store.scheduleText}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>
            )}
          </div>

          {/* Canales de Contacto y Redes Sociales */}
          <div className="flex flex-wrap items-center gap-2">
            {store.whatsapp && (
              <a
                href={`https://wa.me/${store.whatsapp}?text=Hola,%20quisiera%20hacer%20una%20consulta%20en%20${encodeURIComponent(store.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 shadow-2xs"
                title="Escribir por WhatsApp"
              >
                <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            )}
            {store.facebook && (
              <a
                href={store.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-2xs"
                title="Visitar página de Facebook"
              >
                <FacebookIcon className="h-3.5 w-3.5 text-blue-600" />
                <span>Facebook</span>
              </a>
            )}
            {store.instagram && (
              <a
                href={store.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-2xs"
                title="Visitar perfil de Instagram"
              >
                <InstagramIcon className="h-3.5 w-3.5 text-pink-600" />
                <span>Instagram</span>
              </a>
            )}
            {store.email && (
              <a
                href={`mailto:${store.email}`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-2xs"
                title="Enviar correo"
              >
                <Mail className="h-3.5 w-3.5 text-amber-600" />
                <span>Correo</span>
              </a>
            )}
            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-2xs"
                title="Llamar al comercio"
              >
                <Phone className="h-3.5 w-3.5 text-slate-600" />
                <span>Llamar</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Contenido Principal: Campañas, Tesoros & Catálogo */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-8">
        
        {/* Banner de Beneficios Activos del Llavero Kuri */}
        {(store.campaign?.bannerNotice || (store.promoCampaigns && store.promoCampaigns.length > 0)) && (
          <div className="mb-10 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 p-5 shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-900 shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Beneficio Exclusivo</span>
                    <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                      Llavero Kuri
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                    {store.campaign?.bannerNotice || "Presenta tu Kuri y accede a promociones inmediatas"}
                  </h3>
                  {store.promoCampaigns && store.promoCampaigns.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {store.promoCampaigns.map((p) => (
                        <div key={p.id} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-900 shadow-2xs">
                          <Percent className="h-3 w-3 text-amber-600" />
                          <span>{p.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Link
                href={`/kuri/${store.slug === "cafe-andino" ? "KURI-CAFE-001" : "KURI-BARB-001"}`}
                className="shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                <span>Ver Mi Oro</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Descripción e Historia del Comercio */}
        {store.description && (
          <div className="mb-10 rounded-2xl border border-slate-100 bg-slate-50/70 p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sobre Nosotros</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{store.name}</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                  {store.description}
                </p>
              </div>
              {store.mapUrl && (
                <a
                  href={store.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition shadow-2xs"
                >
                  <GoogleMapsIcon className="h-3.5 w-3.5 text-amber-600" />
                  <span>Cómo llegar</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Sección de Tesoros Canjeables en este Comercio */}
        {store.rewards.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  <span>Tesoros de Fidelidad ({store.rewards.length})</span>
                </h2>
                <p className="text-xs text-slate-500">Recompensas exclusivas que puedes canjear acumulando Oro con tu Kuri</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {store.rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/40 via-white to-white p-5 shadow-subtle flex flex-col justify-between"
                >
                  <div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                      <Sparkles className="h-3 w-3 text-amber-600" />
                      <span>{reward.costInGold} de Oro</span>
                    </div>
                    <h3 className="mt-3 font-bold text-slate-900 text-sm">{reward.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{reward.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-[11px] text-amber-800 font-semibold">
                    <span>Canjeable en caja</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sección de Catálogo de Productos y Precios */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Carta y Productos</h2>
              <p className="text-xs text-slate-500">Precios regulares y descuentos especiales para Clientes de Oro</p>
            </div>

            {/* Filtros de Categoría */}
            {categories.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedCategory("ALL")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    selectedCategory === "ALL"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid de Productos */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-subtle transition hover:border-slate-300 hover:shadow-card flex flex-col justify-between"
              >
                <div>
                  {product.imageUrl && (
                    <div className="h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{product.category}</div>
                    <h3 className="mt-1 font-bold text-slate-900 text-sm">{product.name}</h3>
                    {product.description && (
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">{product.description}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50/50 p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Precio Regular</div>
                    <div className="text-sm font-bold text-slate-900">${product.price.toFixed(2)}</div>
                  </div>

                  {product.discountGoldPrice && (
                    <div className="text-right rounded-xl border border-amber-200 bg-amber-50/80 px-2.5 py-1">
                      <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1 justify-end">
                        <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                        <span>Cliente de Oro</span>
                      </div>
                      <div className="text-xs font-bold text-amber-900">${product.discountGoldPrice.toFixed(2)}</div>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL DE HORARIOS SEMANALES DETALLADOS */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Horarios de Atención Semanales</h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {store.schedules && store.schedules.length > 0 ? (
                store.schedules.map((s) => (
                  <div key={s.dayOfWeek} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <span className="font-medium text-slate-700">{DAY_NAMES[s.dayOfWeek - 1]}</span>
                    {s.isOpen ? (
                      <span className="font-bold text-slate-900">{s.openTime} - {s.closeTime}</span>
                    ) : (
                      <span className="font-medium text-slate-400 italic">Cerrado</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-slate-500">
                  {store.scheduleText || "Horario regular de atención"}
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 flex justify-end">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
