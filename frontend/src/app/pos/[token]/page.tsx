"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ScanLine, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Award
} from "lucide-react";

export default function PosTerminalPage() {
  const params = useParams();
  const router = useRouter();
  const currentToken = params?.token as string;

  const [inputToken, setInputToken] = useState(currentToken || "");
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchTokenData = async (tok: string) => {
    if (!tok.trim()) return;
    setLoading(true);
    setError("");
    setActionMessage(null);
    try {
      const res = await fetch(`/api/kuri/resolve/${tok.trim()}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "No se pudo leer el Kuri");
        setData(null);
      } else {
        setData(json);
      }
    } catch {
      setError("Error de red");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentToken) {
      fetchTokenData(currentToken);
    }
  }, [currentToken]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputToken.trim()) {
      router.push(`/pos/${inputToken.trim()}`);
      fetchTokenData(inputToken.trim());
    }
  };

  const handleAddVisit = async () => {
    if (!data?.keychain?.token) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/pos/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: data.keychain.token,
          actionType: "ADD_VISIT",
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setActionMessage({ type: "error", text: result.error || "Error al acreditar" });
      } else {
        setActionMessage({ type: "success", text: result.message });
        await fetchTokenData(data.keychain.token);
      }
    } catch {
      setActionMessage({ type: "error", text: "Error de red" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRedeem = async (rewardId: string) => {
    if (!data?.keychain?.token) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/pos/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: data.keychain.token,
          actionType: "REDEEM_REWARD",
          rewardId,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setActionMessage({ type: "error", text: result.error || "Error al canjear" });
      } else {
        setActionMessage({ type: "success", text: result.message });
        await fetchTokenData(data.keychain.token);
      }
    } catch {
      setActionMessage({ type: "error", text: "Error de red" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
        
        {/* Cabecera Terminal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <ScanLine className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Terminal de Caja</span>
              <h1 className="text-base font-bold text-slate-900">Escaneo de Kurios Físicos</h1>
            </div>
          </div>
          <Link href="/store/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-900">
            Panel Tienda
          </Link>
        </div>

        {/* Buscador / Escáner de Token */}
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="Código del Kuri (ej. KURI-CAFE-001)"
              className="w-full rounded-xl border border-slate-200 pl-3.5 pr-8 py-2.5 text-xs font-mono text-slate-900 uppercase focus:border-amber-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Consultar</span>
          </button>
        </form>

        {/* Notificaciones */}
        {actionMessage && (
          <div className={`mt-4 rounded-xl p-3 text-xs font-medium ${
            actionMessage.type === "success" 
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800" 
              : "border border-rose-200 bg-rose-50 text-rose-800"
          }`}>
            {actionMessage.text}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="my-8 text-center text-xs text-slate-400">
            <Sparkles className="mx-auto h-5 w-5 animate-spin text-amber-500" />
            <div className="mt-2">Consultando Kuri en la red...</div>
          </div>
        )}

        {/* Datos del Kuri consultado */}
        {data && (
          <div className="mt-6 space-y-6">
            
            {/* Tarjeta del Llavero */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase">
                    {data.store?.name || "Comercio KURI"}
                  </span>
                  <div className="text-base font-bold text-slate-900">
                    {data.keychain?.customerName || "Llavero Físico Sin Reclamar"}
                  </div>
                  <div className="font-mono text-xs text-slate-400 mt-0.5">{data.keychain?.token}</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-semibold text-slate-400">Oro Actual</div>
                  <div className="text-3xl font-black text-amber-600">
                    {data.customerLoyalty ? data.customerLoyalty.currentGold : data.unclaimedBonus || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Bloqueo si el comercio está suspendido */}
            {data.isSuspended || data.store?.subscriptionStatus === "SUSPENDED" ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-5 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">Servicio de Fidelidad Suspendido</h3>
                <p className="mt-1 text-xs text-rose-800 leading-relaxed">
                  El comercio <strong className="font-semibold text-slate-900">{data.store?.name}</strong> mantiene su suscripción en estado suspendido por mensualidad pendiente. Las opciones de acreditar Oro y canjear Tesoros están deshabilitadas hasta que se regularice el pago.
                </p>
              </div>
            ) : (
              <>
                {/* Botón de Acreditación con Cooldown */}
                <div>
                  {!data.canAddGold ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-700 shrink-0" />
                      <span>Cooldown activo: Espera {data.cooldownRemainingMinutes} minuto(s) antes de sumar otra visita.</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleAddVisit}
                      disabled={actionLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-xs font-bold text-slate-900 shadow-sm transition hover:bg-amber-400 disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Confirmar y Sumar 1 de Oro</span>
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Canje de Tesoros en Mostrador */}
            {data.rewards && data.rewards.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-amber-600" />
                  <span>Tesoros Canjeables</span>
                </div>

                <div className="space-y-2">
                  {data.rewards.map((r: any) => {
                    const currentGold = data.customerLoyalty?.currentGold || 0;
                    const canRedeem = currentGold >= r.costInGold;

                    return (
                      <div
                        key={r.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{r.title}</div>
                          <div className="text-[11px] text-slate-500">{r.costInGold} de Oro</div>
                        </div>

                        <button
                          disabled={!canRedeem || actionLoading}
                          onClick={() => handleRedeem(r.id)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                            canRedeem
                              ? "bg-slate-900 text-white hover:bg-slate-800"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          {canRedeem ? "Canjear" : `Faltan ${r.costInGold - currentGold}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
