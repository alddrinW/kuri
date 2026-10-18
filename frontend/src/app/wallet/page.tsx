"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Wallet, 
  Sparkles, 
  Store, 
  QrCode, 
  RefreshCw, 
  Award, 
  Clock, 
  ArrowRight,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

interface CardItem {
  id: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  storeCategory: string;
  storeLogo: string | null;
  storeBanner: string | null;
  currentGold: number;
  lifetimeGold: number;
  tier: string;
  keychainToken: string | null;
  nextReward: {
    id: string;
    title: string;
    costInGold: number;
    goldNeeded: number;
    progressPercent: number;
  } | null;
  canRedeemCount: number;
  rewards: Array<{
    id: string;
    title: string;
    costInGold: number;
  }>;
}

interface WalletData {
  user: {
    id: string;
    name: string;
    email: string;
  };
  stats: {
    totalCurrentGold: number;
    totalLifetimeGold: number;
    activeStoresCount: number;
  };
  cards: CardItem[];
  keychains: Array<{
    id: string;
    token: string;
    store: { id: string; name: string };
  }>;
  transactions: Array<{
    id: string;
    goldAmount: number;
    type: string;
    note: string | null;
    createdAt: string;
    store: { name: string };
  }>;
}

export default function WalletPage() {
  const router = useRouter();
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado del modal de reemplazo por extravío
  const [transferModal, setTransferModal] = useState<CardItem | null>(null);
  const [newKeychainInput, setNewKeychainInput] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferMessage, setTransferMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wallet");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Error al cargar la billetera");
      } else {
        setData(json);
      }
    } catch {
      setError("Error de red al cargar la billetera");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTransferKeychain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModal || !newKeychainInput.trim()) return;

    setTransferLoading(true);
    setTransferMessage(null);

    const oldKeychain = data?.keychains.find((k) => k.store.name === transferModal.storeName);
    if (!oldKeychain) {
      setTransferMessage({ type: "error", text: "No se encontró el llavero actual para transferir" });
      setTransferLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/wallet/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldKeychainId: oldKeychain.id,
          newKeychainToken: newKeychainInput.trim(),
        }),
      });

      const resJson = await res.json();
      if (!res.ok) {
        setTransferMessage({ type: "error", text: resJson.error || "Error al transferir" });
      } else {
        setTransferMessage({ type: "success", text: resJson.message });
        setNewKeychainInput("");
        await fetchWallet();
        setTimeout(() => setTransferModal(null), 1800);
      }
    } catch {
      setTransferMessage({ type: "error", text: "Error de red al realizar la transferencia" });
    } finally {
      setTransferLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Sparkles className="h-6 w-6 animate-spin text-amber-500" />
        <span className="ml-2 text-xs font-medium text-slate-500">Cargando tus Kurios...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <h2 className="text-lg font-bold text-slate-900">Billetera no disponible</h2>
        <p className="mt-1 text-xs text-slate-500">{error}</p>
        <Link href="/login" className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      
      {/* Encabezado del Perfil del Cliente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-8">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Billetera de Clientes</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{data.user.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{data.user.email}</p>
        </div>

        {/* Resumen de Oro Global */}
        <div className="flex items-center gap-6 rounded-2xl border border-amber-200/90 bg-amber-50/50 p-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Oro Disponible</div>
            <div className="text-2xl font-black text-amber-700">{data.stats.totalCurrentGold} <span className="text-xs font-medium">Oro</span></div>
          </div>
          <div className="border-l border-amber-200 pl-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Comercios Activos</div>
            <div className="text-2xl font-black text-slate-900">{data.stats.activeStoresCount}</div>
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas Multitienda */}
      <div className="mt-8">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Wallet className="h-4 w-4 text-amber-600" />
          <span>Tus Tarjetas KURI ({data.cards.length})</span>
        </h2>

        {data.cards.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
            Aún no has activado ningún llavero Kuri. Escanea uno en cualquiera de nuestros comercios asociados.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {data.cards.map((card) => (
              <div
                key={card.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-subtle flex flex-col justify-between transition hover:border-amber-300 hover:shadow-card"
              >
                <div>
                  {/* Cabecera de la Tarjeta */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-amber-700 uppercase">{card.storeCategory}</span>
                      <h3 className="text-lg font-bold text-slate-900">{card.storeName}</h3>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                      Nivel {card.tier}
                    </span>
                  </div>

                  {/* Saldo de Oro en esta Tienda */}
                  <div className="my-6 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">{card.currentGold}</span>
                    <span className="text-sm font-semibold text-slate-500">de Oro acumulados</span>
                  </div>

                  {/* Progreso hacia el siguiente Tesoro */}
                  {card.nextReward ? (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{card.nextReward.title}</span>
                        <span className="text-[11px] text-amber-800 font-bold">{card.currentGold}/{card.nextReward.costInGold} Oro</span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full bg-amber-500 transition-all duration-300"
                          style={{ width: `${card.nextReward.progressPercent}%` }}
                        />
                      </div>
                      <div className="mt-1.5 text-[10px] text-slate-500">
                        Te faltan {card.nextReward.goldNeeded} de Oro para desbloquear este Tesoro
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3.5 text-xs text-emerald-800 font-semibold">
                      ¡Tienes Oro suficiente para canjear todos los Tesoros de este comercio!
                    </div>
                  )}
                </div>

                {/* Acciones y Llavero Físico */}
                <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-slate-400">
                    <QrCode className="h-3.5 w-3.5" />
                    <span>{card.keychainToken || "Virtual"}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setTransferModal(card);
                        setTransferMessage(null);
                      }}
                      className="text-slate-500 hover:text-slate-900 hover:underline"
                    >
                      ¿Perdiste tu llavero?
                    </button>

                    {card.keychainToken && (
                      <Link
                        href={`/kuri/${card.keychainToken}`}
                        className="flex items-center gap-1 font-bold text-amber-700 hover:text-amber-800"
                      >
                        <span>Ver tarjeta</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial Reciente de Visitas y Canjes */}
      {data.transactions.length > 0 && (
        <div className="mt-12">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-slate-500" />
            <span>Historial Reciente de Visitas</span>
          </h2>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-subtle">
            <div className="divide-y divide-slate-100">
              {data.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{tx.store.name}</div>
                    <div className="text-[11px] text-slate-500">{tx.note || tx.type}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${tx.goldAmount >= 0 ? "text-amber-700" : "text-rose-600"}`}>
                      {tx.goldAmount >= 0 ? `+${tx.goldAmount}` : tx.goldAmount} Oro
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reemplazo por Llavero Extraviado (HU-005) */}
      {transferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-elevated">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
              <AlertTriangle className="h-5 w-5" />
              <span>Reemplazar Kuri Físico Extraviado</span>
            </div>

            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Solicita un nuevo llavero Kuri en <strong>{transferModal.storeName}</strong>. Al ingresar su código permanente, transferiremos tus <strong>{transferModal.currentGold} de Oro</strong> y tu nivel de forma instantánea. El llavero anterior quedará revocado permanentemente.
            </p>

            {transferMessage && (
              <div className={`mt-3 rounded-xl p-3 text-xs ${
                transferMessage.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-rose-200 bg-rose-50 text-rose-800"
              }`}>
                {transferMessage.text}
              </div>
            )}

            <form onSubmit={handleTransferKeychain} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Código del Nuevo Llavero Físico</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. KURI-CAFE-004"
                  value={newKeychainInput}
                  onChange={(e) => setNewKeychainInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={transferLoading}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {transferLoading ? "Transfiriendo..." : "Confirmar Reemplazo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
