"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Sparkles, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Award, 
  Wallet, 
  Clock, 
  Store,
  RefreshCw,
  Gift
} from "lucide-react";

interface ResolveData {
  success: boolean;
  isSuspended?: boolean;
  context: "STORE_PUBLIC" | "KEYCHAIN_UNACTIVATED" | "CUSTOMER_CARD" | "STAFF_TERMINAL" | "OTHER_STORE_STAFF";
  userRole: string;
  keychain: {
    id: string;
    token: string;
    status: string;
    isActivated: boolean;
    customerName: string | null;
  };
  store: {
    id: string;
    slug: string;
    name: string;
    tagLine: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    address: string | null;
    phone: string | null;
    whatsapp: string | null;
    subscriptionStatus?: string;
    campaign: {
      type: string;
      goldPerVisit: number;
      cooldownMinutes: number;
    } | null;
  };
  customerLoyalty: {
    currentGold: number;
    lifetimeGold: number;
    tier: string;
  } | null;
  unclaimedBonus: number;
  canAddGold: boolean;
  cooldownRemainingMinutes: number;
  rewards: Array<{
    id: string;
    title: string;
    description: string | null;
    costInGold: number;
  }>;
  recentTransactions: Array<{
    id: string;
    goldAmount: number;
    type: string;
    note: string | null;
    createdAt: string;
  }>;
}

export default function KuriDynamicPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [data, setData] = useState<ResolveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<"ADD_VISIT" | "REDEEM" | null>(null);
  const [selectedReward, setSelectedReward] = useState<any | null>(null);

  const fetchResolution = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/kuri/resolve/${token}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "No se pudo resolver el código del llavero");
      } else {
        setData(json);
      }
    } catch {
      setError("Error de conexión al leer el Kuri");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResolution();
  }, [token]);

  // Acción de Caja POS: Sumar Oro por visita
  const handleAddVisit = async () => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/pos/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          actionType: "ADD_VISIT",
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setActionMessage({ type: "error", text: result.error || "Error al acreditar" });
      } else {
        setActionMessage({ type: "success", text: result.message });
        setConfirmModal(null);
        await fetchResolution();
      }
    } catch {
      setActionMessage({ type: "error", text: "Error de red al procesar la acción de caja" });
    } finally {
      setActionLoading(false);
    }
  };

  // Acción de Caja POS: Canjear Tesoro
  const handleRedeemReward = async (reward: any) => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/pos/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          actionType: "REDEEM_REWARD",
          rewardId: reward.id,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setActionMessage({ type: "error", text: result.error || "Error al canjear" });
      } else {
        setActionMessage({ type: "success", text: result.message });
        setConfirmModal(null);
        setSelectedReward(null);
        await fetchResolution();
      }
    } catch {
      setActionMessage({ type: "error", text: "Error de red al canjear Tesoro" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Sparkles className="h-6 w-6 animate-spin text-amber-500" />
        <span className="mt-2 text-xs font-medium text-slate-500">Resolviendo contexto del Kuri...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="h-8 w-8 text-rose-500" />
        <h2 className="mt-2 text-lg font-bold text-slate-900">Llavero no encontrado</h2>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">{error || "El código no existe en el registro central."}</p>
        <Link href="/" className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
          Ir al Inicio
        </Link>
      </div>
    );
  }

  // Bloqueo total si el comercio está suspendido por falta de pago
  if (data.isSuspended || data.store?.subscriptionStatus === "SUSPENDED") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 shadow-sm">
          <AlertCircle className="h-8 w-8" />
        </div>
        <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-700">
          Servicio Suspendido
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
          Programa de Fidelidad Inactivo
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          El comercio <strong className="font-semibold text-slate-900">{data.store?.name}</strong> mantiene su suscripción en estado suspendido por mensualidad pendiente. Las acumulaciones de Oro y canje de Tesoros con el llavero KURI están deshabilitadas temporalmente.
        </p>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-600">
          Llavero Token: {data.keychain?.token || token}
        </div>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
        >
          Volver a KURI
        </Link>
      </div>
    );
  }

  const { context, keychain, store, customerLoyalty, unclaimedBonus, rewards, canAddGold, cooldownRemainingMinutes } = data;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      
      {/* 1. CONTEXTO: TERMINAL DE CAJA (Dueño / Staff del negocio) */}
      {context === "STAFF_TERMINAL" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
          
          {/* Cabecera Terminal de Caja */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Terminal de Caja POS</span>
                <h1 className="text-base font-bold text-slate-900">{store.name}</h1>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono font-semibold text-slate-500">{keychain.token}</span>
            </div>
          </div>

          {/* Notificaciones de acción */}
          {actionMessage && (
            <div className={`mt-4 rounded-xl p-3 text-xs font-medium ${
              actionMessage.type === "success" 
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800" 
                : "border border-rose-200 bg-rose-50 text-rose-800"
            }`}>
              {actionMessage.text}
            </div>
          )}

          {/* Tarjeta de Datos del Cliente Escaneado */}
          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Cliente Titular</div>
                <div className="text-lg font-bold text-slate-900">
                  {keychain.customerName || "Llavero sin registrar (En mano)"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Oro Actual</div>
                <div className="text-2xl font-black text-amber-600">
                  {customerLoyalty ? customerLoyalty.currentGold : unclaimedBonus}
                  <span className="text-xs font-medium text-slate-400 ml-1">Oro</span>
                </div>
              </div>
            </div>

            {customerLoyalty && (
              <div className="mt-3 flex items-center gap-2 border-t border-slate-200/60 pt-3 text-xs text-slate-600">
                <span className="font-semibold text-amber-800">Nivel {customerLoyalty.tier}</span>
                <span>•</span>
                <span>{customerLoyalty.lifetimeGold} de Oro acumulados en total</span>
              </div>
            )}
          </div>

          {/* Botón Principal: Sumar Oro por Visita */}
          <div className="mt-6">
            {!canAddGold ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-700 shrink-0" />
                <div>
                  <div className="font-bold">Control de Cooldown Activo</div>
                  <div>Ya se acreditó Oro hace poco. Espera {cooldownRemainingMinutes} minuto(s) antes de sumar otra visita.</div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmModal("ADD_VISIT")}
                disabled={actionLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 text-sm font-bold text-slate-900 shadow-md transition hover:bg-amber-400 disabled:opacity-50"
              >
                <Sparkles className="h-5 w-5" />
                <span>Sumar 1 de Oro (Visita en Caja)</span>
              </button>
            )}
          </div>

          {/* Catálogo de Tesoros para Canjear en Caja */}
          {customerLoyalty && rewards.length > 0 && (
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Canjear Tesoros en Mostrador
              </h2>
              <div className="space-y-2">
                {rewards.map((r) => {
                  const canRedeem = customerLoyalty.currentGold >= r.costInGold;
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-slate-300"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{r.title}</div>
                        <div className="text-[11px] text-slate-500">{r.costInGold} de Oro requeridos</div>
                      </div>

                      <button
                        disabled={!canRedeem || actionLoading}
                        onClick={() => {
                          setSelectedReward(r);
                          setConfirmModal("REDEEM");
                        }}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                          canRedeem
                            ? "bg-slate-900 text-white hover:bg-slate-800"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {canRedeem ? "Canjear" : `Faltan ${r.costInGold - customerLoyalty.currentGold}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal de Confirmación Explícita */}
          {confirmModal === "ADD_VISIT" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-elevated">
                <h3 className="text-base font-bold text-slate-900">Confirmar Acreditación</h3>
                <p className="mt-1 text-xs text-slate-500">
                  ¿Deseas acreditar 1 de Oro a <strong>{keychain.customerName || keychain.token}</strong> por su consumo de hoy?
                </p>
                <div className="mt-6 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setConfirmModal(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddVisit}
                    disabled={actionLoading}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-amber-400 disabled:opacity-50"
                  >
                    {actionLoading ? "Acreditando..." : "Sí, Sumar 1 Oro"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {confirmModal === "REDEEM" && selectedReward && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-elevated">
                <h3 className="text-base font-bold text-slate-900">Confirmar Canje de Tesoro</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Se descontarán <strong>{selectedReward.costInGold} de Oro</strong> para entregar: <strong>{selectedReward.title}</strong>.
                </p>
                <div className="mt-6 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setConfirmModal(null);
                      setSelectedReward(null);
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleRedeemReward(selectedReward)}
                    disabled={actionLoading}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {actionLoading ? "Procesando..." : "Confirmar Entrega"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 2. CONTEXTO: TARJETA DE FIDELIDAD DEL CLIENTE TITULAR */}
      {context === "CUSTOMER_CARD" && customerLoyalty && (
        <div className="flex flex-col gap-6">
          
          {/* Tarjeta de Lujo del Cliente KURI */}
          <div className="overflow-hidden rounded-3xl border border-amber-200/90 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-7 text-white shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200">Tarjeta Oficial de Fidelidad</span>
                <h1 className="text-xl font-black drop-shadow-sm">{store.name}</h1>
              </div>
              <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
                Nivel {customerLoyalty.tier}
              </div>
            </div>

            <div className="my-8 flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tight">{customerLoyalty.currentGold}</span>
              <span className="text-lg font-semibold text-amber-200">de Oro acumulados</span>
            </div>

            {/* Próximo Tesoro y Progreso */}
            {rewards.length > 0 && (
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>Próximo Tesoro: {rewards[0].title}</span>
                  <span>{customerLoyalty.currentGold} / {rewards[0].costInGold} Oro</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (customerLoyalty.currentGold / rewards[0].costInGold) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4 text-xs">
              <span className="font-mono opacity-80">{keychain.token}</span>
              <Link href="/wallet" className="flex items-center gap-1 font-semibold hover:underline">
                <Wallet className="h-3.5 w-3.5" />
                <span>Ver todas mis tarjetas</span>
              </Link>
            </div>
          </div>

          {/* Catálogo de Tesoros Disponibles */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-subtle">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-600" />
              <span>Tesoros que puedes reclamar en caja</span>
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {rewards.map((r) => {
                const canRedeem = customerLoyalty.currentGold >= r.costInGold;
                return (
                  <div
                    key={r.id}
                    className={`rounded-2xl border p-4 transition ${
                      canRedeem ? "border-amber-300 bg-amber-50/30" : "border-slate-100 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{r.title}</span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        {r.costInGold} Oro
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">{r.description}</p>
                    <div className="mt-3 text-[11px] font-semibold text-amber-800">
                      {canRedeem ? "¡Listo para canjear en tu próxima visita!" : `Te faltan ${r.costInGold - customerLoyalty.currentGold} de Oro`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enlace al Menú del Negocio */}
          <div className="text-center">
            <Link
              href={`/store/${store.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Ver menú y precios con descuento de {store.name}</span>
            </Link>
          </div>

        </div>
      )}

      {/* 3. CONTEXTO: LLAVERO SIN ACTIVAR (Flujo de Onboarding Inmediato) */}
      {context === "KEYCHAIN_UNACTIVATED" && (
        <div className="rounded-3xl border border-amber-200/90 bg-gradient-to-br from-amber-50/50 via-white to-white p-8 shadow-card text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md">
            <QrCode className="h-7 w-7" />
          </div>

          <span className="mt-4 inline-block text-[11px] font-bold uppercase tracking-widest text-amber-800">
            Llavero Kuri sin reclamar
          </span>

          <h1 className="mt-1 text-2xl font-black text-slate-900">
            ¡Reclama tu Kuri en {store.name}!
          </h1>

          <p className="mt-2 text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Este llavero físico es tu llave permanente para acumular Oro y canjear Tesoros cada vez que visites el negocio.
          </p>

          {unclaimedBonus > 0 && (
            <div className="my-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 font-medium text-xs">
              <span className="font-bold text-sm">¡Tienes {unclaimedBonus} de Oro esperándote!</span>
              <p className="mt-0.5 text-[11px] text-emerald-700">El comercio ya te acreditó una visita previa. Activa tu cuenta para adjudicarlos de inmediato.</p>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/register?token=${token}`}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
            >
              <span>Activar este Kuri en 20 segundos</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href={`/store/${store.slug}`}
              className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Store className="h-4 w-4 text-slate-400" />
              <span>Ver vitrina del negocio</span>
            </Link>
          </div>

        </div>
      )}

      {/* 4. CONTEXTO: VISTA PÚBLICA / OTRO COMERCIO */}
      {(context === "STORE_PUBLIC" || context === "OTHER_STORE_STAFF") && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <Store className="h-6 w-6" />
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-900">{store.name}</h1>
          <p className="mt-1 text-xs text-slate-500">{store.tagLine}</p>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600">
            Este Kuri físico pertenece a un cliente de <strong>{store.name}</strong>. Puedes ver la vitrina de productos y promociones del negocio a continuación.
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <Link
              href={`/store/${store.slug}`}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
            >
              Ver Carta y Productos
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
