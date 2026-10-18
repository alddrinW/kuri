"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ScanLine,
  Users,
  Award,
  Clock,
  ExternalLink,
  CheckCircle2,
  Package,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  Tag,
  Truck,
  Check,
  X,
  Power,
  Flame,
  Percent,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Navigation
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
  GoogleMapsIcon
} from "@/components/SocialIcons";
import ImageUploader from "@/components/ImageUploader";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountGoldPrice: number | null;
  category: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

interface ScheduleDay {
  id?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

interface KeychainOrder {
  id: string;
  quantity: number;
  deliveryAddress: string;
  contactPhone: string;
  recipientName: string;
  notes: string | null;
  status: string;
  trackingNumber: string | null;
  createdAt: string;
}

interface PromoCampaign {
  id: string;
  name: string;
  type: string;
  description: string | null;
  discountPercent: number | null;
  multiplier: number | null;
  isActive: boolean;
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

// Galería de imágenes sugeridas de alta resolución para facilitar el registro rápido
const SUGGESTED_IMAGES = [
  { label: "Espresso Doble", url: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&auto=format&fit=crop&q=80" },
  { label: "Café Latte Art", url: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=500&auto=format&fit=crop&q=80" },
  { label: "Filtrado V60", url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=80" },
  { label: "Cold Brew Artesanal", url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80" },
  { label: "Pastelería Francesa", url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80" },
  { label: "Tarta de Frutos", url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format&fit=crop&q=80" },
  { label: "Corte Clásico", url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=80" },
  { label: "Ritual de Barba", url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&auto=format&fit=crop&q=80" },
];

export default function StoreDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "schedules" | "keychains" | "campaigns" | "profile">("overview");

  const isStaff = data?.userRole === "STORE_STAFF" || data?.isStaff || data?.currentUser?.isStaff || false;

  // Restricción automática de navegación para Terminal POS / Staff de caja
  useEffect(() => {
    if (isStaff && !["overview", "products", "keychains"].includes(activeTab)) {
      setActiveTab("overview");
    }
  }, [isStaff, activeTab]);

  // Estado para edición integral de perfil de tienda, redes sociales y ubicación
  const [profileForm, setProfileForm] = useState({
    name: "",
    description: "",
    tagLine: "",
    category: "Cafetería y Restaurante",
    phone: "",
    whatsapp: "",
    email: "",
    facebook: "",
    instagram: "",
    address: "",
    mapUrl: "",
    logoUrl: "",
    bannerUrl: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Estado para gestión de productos
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    discountGoldPrice: "",
    category: "General",
    imageUrl: "",
    isAvailable: true,
  });
  const [productSaving, setProductSaving] = useState(false);

  // Estado para gestión de horarios
  const [schedules, setSchedules] = useState<ScheduleDay[]>([]);
  const [scheduleText, setScheduleText] = useState("");
  const [isOpenManual, setIsOpenManual] = useState(true);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Estado para pedidos de llaveros
  const [orders, setOrders] = useState<KeychainOrder[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    quantity: 50,
    deliveryAddress: "",
    contactPhone: "",
    recipientName: "",
    notes: "",
  });
  const [orderSaving, setOrderSaving] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Estado para campañas
  const [mainCampaign, setMainCampaign] = useState<any | null>(null);
  const [promoCampaigns, setPromoCampaigns] = useState<PromoCampaign[]>([]);
  const [campaignSaving, setCampaignSaving] = useState(false);
  const [campaignSuccess, setCampaignSuccess] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoForm, setPromoForm] = useState({
    name: "",
    type: "KEYCHAIN_DISCOUNT",
    description: "",
    discountPercent: 10,
    multiplier: 2,
    isActive: true,
  });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/store/dashboard");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Error al cargar panel de comercio");
      } else {
        setData(json);
        setProducts(json.store.products || []);
        setIsOpenManual(json.store.isOpenManual ?? true);
        setScheduleText(json.store.scheduleText || "");
        if (json.store.schedules) setSchedules(json.store.schedules);
        if (json.store.campaign) setMainCampaign(json.store.campaign);
        if (json.store.promoCampaigns) setPromoCampaigns(json.store.promoCampaigns);
        if (json.store.keychainOrders) setOrders(json.store.keychainOrders);

        // Prellenar formulario de perfil de tienda con datos existentes
        setProfileForm({
          name: json.store.name || "",
          description: json.store.description || "",
          tagLine: json.store.tagLine || "",
          category: json.store.category || "Cafetería y Restaurante",
          phone: json.store.phone || "",
          whatsapp: json.store.whatsapp || "",
          email: json.store.email || "",
          facebook: json.store.facebook || "",
          instagram: json.store.instagram || "",
          address: json.store.address || "",
          mapUrl: json.store.mapUrl || "",
          logoUrl: json.store.logoUrl || "",
          bannerUrl: json.store.bannerUrl || "",
        });

        // Prellenar datos de contacto para pedido de llaveros si existen
        setOrderForm((prev) => ({
          ...prev,
          deliveryAddress: json.store.address || "",
          contactPhone: json.store.phone || json.store.whatsapp || "",
          recipientName: json.store.staffMembers?.[0]?.name || "",
        }));
      }
    } catch {
      setError("Error de red al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Guardar perfil del negocio
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profileForm.name.trim()) {
      setProfileError("El nombre del negocio es obligatorio");
      return;
    }
    try {
      setProfileSaving(true);
      setProfileError("");
      const res = await fetch("/api/store/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const json = await res.json();
      if (!res.ok) {
        setProfileError(json.error || "Error al actualizar perfil del negocio");
      } else {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 4000);
        setData((prev: any) => ({
          ...prev,
          store: {
            ...prev.store,
            ...json.store,
          },
        }));
      }
    } catch {
      setProfileError("Error de red al conectar con el servidor");
    } finally {
      setProfileSaving(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Recargar productos
  const loadProducts = async () => {
    try {
      const res = await fetch("/api/store/products");
      const json = await res.json();
      if (json.success) setProducts(json.products);
    } catch (e) {
      console.error(e);
    }
  };

  // Recargar horarios
  const loadSchedules = async () => {
    try {
      const res = await fetch("/api/store/schedules");
      const json = await res.json();
      if (json.success) {
        setSchedules(json.schedules);
        setScheduleText(json.scheduleText || "");
        setIsOpenManual(json.isOpenManual);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Recargar pedidos de llaveros
  const loadOrders = async () => {
    try {
      const res = await fetch("/api/store/keychain-orders");
      const json = await res.json();
      if (json.success) setOrders(json.orders);
    } catch (e) {
      console.error(e);
    }
  };

  // Recargar campañas
  const loadCampaigns = async () => {
    try {
      const res = await fetch("/api/store/campaigns");
      const json = await res.json();
      if (json.success) {
        setMainCampaign(json.mainCampaign);
        setPromoCampaigns(json.promoCampaigns);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Manejo de productos: Guardar o Actualizar
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;

    try {
      setProductSaving(true);
      const url = editingProduct
        ? `/api/store/products/${editingProduct.id}`
        : "/api/store/products";
      const method = editingProduct ? "PUT" : "POST";

      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        discountGoldPrice: productForm.discountGoldPrice ? parseFloat(productForm.discountGoldPrice) : null,
        category: productForm.category || "General",
        imageUrl: productForm.imageUrl || null,
        isAvailable: productForm.isAvailable,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsProductModalOpen(false);
        setEditingProduct(null);
        setProductForm({
          name: "",
          description: "",
          price: "",
          discountGoldPrice: "",
          category: "General",
          imageUrl: "",
          isAvailable: true,
        });
        await loadProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProductSaving(false);
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Deseas eliminar este producto de la carta?")) return;
    try {
      const res = await fetch(`/api/store/products/${id}`, { method: "DELETE" });
      if (res.ok) await loadProducts();
    } catch (err) {
      console.error(err);
    }
  };

  // Alternar disponibilidad inmediata de producto
  const handleToggleProductAvailability = async (product: Product) => {
    try {
      const res = await fetch(`/api/store/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !product.isAvailable }),
      });
      if (res.ok) await loadProducts();
    } catch (err) {
      console.error(err);
    }
  };

  // Conmutador en vivo de estado de apertura
  const handleToggleStoreStatus = async () => {
    try {
      const res = await fetch("/api/store/toggle-status", { method: "PUT" });
      const json = await res.json();
      if (json.success) {
        setIsOpenManual(json.isOpenManual);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Guardar horarios
  const handleSaveSchedules = async () => {
    try {
      setScheduleSaving(true);
      setScheduleSuccess(false);
      const res = await fetch("/api/store/schedules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedules,
          scheduleText,
          isOpenManual,
        }),
      });
      if (res.ok) {
        setScheduleSuccess(true);
        setTimeout(() => setScheduleSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setScheduleSaving(false);
    }
  };

  // Generar texto resumen de horarios automáticamente
  const handleAutoGenerateScheduleText = () => {
    const openDays = schedules.filter((s) => s.isOpen);
    if (openDays.length === 0) {
      setScheduleText("Cerrado temporalmente");
      return;
    }
    const daysWeek = schedules.slice(0, 5);
    const saturday = schedules.find((s) => s.dayOfWeek === 6);
    const sunday = schedules.find((s) => s.dayOfWeek === 7);

    const weekAllOpen = daysWeek.every((d) => d.isOpen && d.openTime === daysWeek[0].openTime && d.closeTime === daysWeek[0].closeTime);

    let summary = "";
    if (weekAllOpen) {
      summary = `Lunes a Viernes: ${daysWeek[0].openTime} - ${daysWeek[0].closeTime}`;
    } else {
      summary = "Lunes a Viernes: Horario rotativo";
    }

    if (saturday && saturday.isOpen) {
      summary += ` | Sábados: ${saturday.openTime} - ${saturday.closeTime}`;
    }
    if (sunday && sunday.isOpen) {
      summary += ` | Domingos: ${sunday.openTime} - ${sunday.closeTime}`;
    }

    setScheduleText(summary);
  };

  // Enviar pedido de llaveros
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.quantity || !orderForm.deliveryAddress || !orderForm.contactPhone || !orderForm.recipientName) {
      return;
    }

    try {
      setOrderSaving(true);
      const res = await fetch("/api/store/keychain-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderForm),
      });

      if (res.ok) {
        setIsOrderModalOpen(false);
        setOrderSuccess(true);
        setTimeout(() => setOrderSuccess(false), 4000);
        await loadOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOrderSaving(false);
    }
  };

  // Guardar campaña principal
  const handleSaveMainCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCampaignSaving(true);
      setCampaignSuccess(false);
      const res = await fetch("/api/store/campaign/main", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mainCampaign),
      });

      if (res.ok) {
        setCampaignSuccess(true);
        setTimeout(() => setCampaignSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCampaignSaving(false);
    }
  };

  // Crear campaña promocional de descuento
  const handleCreatePromoCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.name) return;

    try {
      const res = await fetch("/api/store/campaigns/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promoForm),
      });

      if (res.ok) {
        setIsPromoModalOpen(false);
        setPromoForm({
          name: "",
          type: "KEYCHAIN_DISCOUNT",
          description: "",
          discountPercent: 10,
          multiplier: 2,
          isActive: true,
        });
        await loadCampaigns();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Eliminar campaña secundaria
  const handleDeletePromo = async (id: string) => {
    if (!confirm("¿Deseas eliminar esta promoción?")) return;
    try {
      const res = await fetch(`/api/store/campaigns/promo/${id}`, { method: "DELETE" });
      if (res.ok) await loadCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Sparkles className="h-6 w-6 animate-spin text-amber-500" />
        <span className="ml-2 text-xs font-medium text-slate-500">Cargando panel de comercio...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <h2 className="text-lg font-bold text-slate-900">Panel de Comercio no disponible</h2>
        <p className="mt-1 text-xs text-slate-500">{error || "Inicia sesión con una cuenta de dueño o staff de tienda."}</p>
        <Link href="/login" className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  const { store, topCustomers } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      
      {/* Cabecera Principal y Accesos Rápidos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Centro de Operaciones</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${isOpenManual ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isOpenManual ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              <span>{isOpenManual ? "Abierto en Vivo" : "Cerrado"}</span>
            </span>
            {isStaff && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                <ScanLine className="h-3 w-3 text-amber-600" />
                <span>Terminal POS / Modo Caja</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">{store.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{store.category} • {store.address}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Conmutador rápido de Abierto/Cerrado (Solo visible para Dueño de Comercio o Admin) */}
          {!isStaff && (
            <button
              onClick={handleToggleStoreStatus}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition shadow-sm ${
                isOpenManual
                  ? "border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/70"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
              title="Alterna el cartel de abierto o cerrado en tu vitrina pública"
            >
              <Power className="h-3.5 w-3.5" />
              <span>{isOpenManual ? "Pausar Atención" : "Marcar Abierto"}</span>
            </button>
          )}

          {/* Botón para editar perfil, redes sociales y ubicación (Solo visible para Dueño de Comercio o Admin) */}
          {!isStaff && (
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition shadow-sm ${
                activeTab === "profile"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              title="Editar nombre, descripción, redes sociales y ubicación de tu tienda"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Editar Tienda</span>
            </button>
          )}

          <Link
            href={`/store/${store.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <span>Vitrina Web</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <Link
            href={`/pos/${store.slug === "cafe-andino" ? "KURI-CAFE-001" : "KURI-BARB-001"}`}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-900 shadow-sm hover:bg-amber-400"
          >
            <ScanLine className="h-4 w-4" />
            <span>Terminal POS</span>
          </Link>
        </div>
      </div>

      {/* Alerta de Éxito Global */}
      {orderSuccess && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>Solicitud de llaveros enviada con éxito. Se ha registrado en la cola de producción y despacho.</span>
        </div>
      )}

      {/* Navegación por Módulos / Pestañas */}
      <div className="mt-6 flex overflow-x-auto border-b border-slate-200 gap-1 sm:gap-2 pb-px text-xs font-medium text-slate-500">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition ${
            activeTab === "overview"
              ? "border-slate-900 font-bold text-slate-900"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Resumen General</span>
        </button>

        <button
          onClick={() => { setActiveTab("products"); loadProducts(); }}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition ${
            activeTab === "products"
              ? "border-slate-900 font-bold text-slate-900"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Carta y Productos ({products.length})</span>
        </button>

        {!isStaff && (
          <button
            onClick={() => { setActiveTab("schedules"); loadSchedules(); }}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition ${
              activeTab === "schedules"
                ? "border-slate-900 font-bold text-slate-900"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Horarios de Atención</span>
          </button>
        )}

        <button
          onClick={() => { setActiveTab("keychains"); loadOrders(); }}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition ${
            activeTab === "keychains"
              ? "border-slate-900 font-bold text-slate-900"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Llaveros Físicos ({store._count?.keychains || 0})</span>
        </button>

        {!isStaff && (
          <>
            <button
              onClick={() => { setActiveTab("campaigns"); loadCampaigns(); }}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition ${
                activeTab === "campaigns"
                  ? "border-slate-900 font-bold text-slate-900"
                  : "border-transparent hover:text-slate-900"
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>Campañas & Descuentos</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition ${
                activeTab === "profile"
                  ? "border-slate-900 font-bold text-slate-900"
                  : "border-transparent hover:text-slate-900"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Perfil & Redes</span>
            </button>
          </>
        )}
      </div>

      {/* PESTAÑA 1: RESUMEN GENERAL */}
      {activeTab === "overview" && (
        <div className="mt-8">
          {/* Métricas Clave */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-500">Clientes Afiliados</span>
                <Users className="h-4 w-4" />
              </div>
              <div className="mt-3 text-3xl font-black text-slate-900">{store._count.loyalties}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-500">Visitas Registradas</span>
                <Clock className="h-4 w-4" />
              </div>
              <div className="mt-3 text-3xl font-black text-slate-900">{store._count.transactions}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-500">Llaveros Asignados</span>
                <Package className="h-4 w-4" />
              </div>
              <div className="mt-3 text-3xl font-black text-slate-900">{store._count.keychains}</div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-subtle">
              <div className="flex items-center justify-between text-amber-800">
                <span className="text-xs font-semibold">Tesoros Activos</span>
                <Award className="h-4 w-4 text-amber-600" />
              </div>
              <div className="mt-3 text-3xl font-black text-amber-700">{store.rewards?.length || 0}</div>
            </div>
          </div>

          {/* Grilla: Clientes frecuentes y Tesoros */}
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-subtle">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>Clientes de Oro Más Frecuentes</span>
              </h2>
              <p className="text-xs text-slate-500 mb-4">Tus clientes con mayor constancia y visitas acumuladas</p>

              <div className="divide-y divide-slate-100">
                {topCustomers.map((c: any, idx: number) => (
                  <div key={c.id} className="flex items-center justify-between py-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600 text-[10px]">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{c.customer.name}</div>
                        <div className="text-[10px] text-slate-400">{c.customer.phone || c.customer.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                        Nivel {c.tier}
                      </span>
                      <div className="text-right">
                        <div className="font-black text-amber-700">{c.currentGold} Oro</div>
                        <div className="text-[10px] text-slate-400">{c.lifetimeGold} histórico</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-subtle flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <Award className="h-4 w-4 text-amber-600" />
                  <span>Tesoros de Fidelidad</span>
                </h2>
                <p className="text-xs text-slate-500 mb-4">Recompensas configuradas para tus clientes</p>

                <div className="space-y-3">
                  {store.rewards.map((r: any) => (
                    <div key={r.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-slate-900">{r.title}</div>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                          {r.costInGold} Oro
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <Link
                  href={`/pos/${store.slug === "cafe-andino" ? "KURI-CAFE-001" : "KURI-BARB-001"}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <ScanLine className="h-4 w-4 text-amber-400" />
                  <span>Abrir Escáner de Caja</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: CARTA Y PRODUCTOS */}
      {activeTab === "products" && (
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Catálogo de Productos y Precios</h2>
              <p className="text-xs text-slate-500">
                {isStaff 
                  ? "Consulta los precios de carta regular y los beneficios exclusivos para Clientes de Oro en caja" 
                  : "Administra los artículos visibles en tu vitrina pública con precios regulares y de cliente fiel"}
              </p>
            </div>
            {!isStaff && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: "",
                    description: "",
                    price: "",
                    discountGoldPrice: "",
                    category: "General",
                    imageUrl: "",
                    isAvailable: true,
                  });
                  setIsProductModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo Producto</span>
              </button>
            )}
          </div>

          {/* Banner Informativo para Staff de Mostrador */}
          {isStaff && (
            <div className="mb-6 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-600">
              <ScanLine className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <strong>Modo Consulta de Mostrador:</strong> Catálogo y precios de referencia para atención al público y validación de beneficios de Cliente de Oro.
              </span>
            </div>
          )}

          {products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center">
              <Tag className="mx-auto h-8 w-8 text-slate-300" />
              <h3 className="mt-2 text-sm font-bold text-slate-900">No hay productos registrados</h3>
              <p className="mt-1 text-xs text-slate-500">Agrega tu primer producto o bebida a la carta para exhibirlo en tu vitrina pública.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-subtle transition flex flex-col justify-between ${
                    p.isAvailable ? "border-slate-200 hover:border-slate-300" : "border-slate-200 bg-slate-50/60 opacity-75"
                  }`}
                >
                  <div>
                    {p.imageUrl && (
                      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                        <span className="absolute top-3 left-3 rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                          {p.category}
                        </span>
                        {!p.isAvailable && (
                          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center">
                            <span className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                              Agotado / Inactivo
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                      </div>
                      {p.description && (
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">{p.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">Regular</span>
                        <div className="text-sm font-bold text-slate-900">${p.price.toFixed(2)}</div>
                      </div>

                      {p.discountGoldPrice ? (
                        <div className="text-right rounded-lg bg-amber-50 border border-amber-200 px-2 py-0.5">
                          <span className="text-[9px] font-bold uppercase text-amber-800">Cliente de Oro</span>
                          <div className="text-xs font-bold text-amber-900">${p.discountGoldPrice.toFixed(2)}</div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Sin precio especial</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100/80">
                      {!isStaff ? (
                        <>
                          <button
                            onClick={() => handleToggleProductAvailability(p)}
                            className={`text-[11px] font-semibold transition ${
                              p.isAvailable ? "text-emerald-700 hover:text-emerald-800" : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            {p.isAvailable ? "Disponible en vitrina" : "Marcar disponible"}
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductForm({
                                  name: p.name,
                                  description: p.description || "",
                                  price: String(p.price),
                                  discountGoldPrice: p.discountGoldPrice ? String(p.discountGoldPrice) : "",
                                  category: p.category,
                                  imageUrl: p.imageUrl || "",
                                  isAvailable: p.isAvailable,
                                });
                                setIsProductModalOpen(true);
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
                              title="Editar producto"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              title="Eliminar producto"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                            p.isAvailable ? "text-emerald-700" : "text-slate-400"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${p.isAvailable ? "bg-emerald-500" : "bg-slate-400"}`} />
                            <span>{p.isAvailable ? "Disponible en mostrador" : "Agotado temporalmente"}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {p.id.slice(-6)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: HORARIOS DE ATENCIÓN (Solo Dueño o Admin) */}
      {!isStaff && activeTab === "schedules" && (
        <div className="mt-8 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Horarios de Atención Semanales</h2>
              <p className="text-xs text-slate-500">Configura la apertura y cierre de cada día para que tus clientes lo consulten en tu vitrina</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoGenerateScheduleText}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                Generar Resumen
              </button>
              <button
                onClick={handleSaveSchedules}
                disabled={scheduleSaving}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 shadow-sm"
              >
                {scheduleSaving ? <Sparkles className="h-3.5 w-3.5 animate-spin text-amber-400" /> : <Check className="h-3.5 w-3.5" />}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>

          {scheduleSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Horarios guardados y actualizados en tiempo real en la vitrina pública.</span>
            </div>
          )}

          {/* Grilla día por día */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-subtle space-y-3">
            {schedules.map((day, idx) => (
              <div
                key={day.dayOfWeek}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5"
              >
                <div className="flex items-center gap-3 w-40">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-200/70 font-bold text-slate-700 text-xs">
                    {day.dayOfWeek}
                  </span>
                  <span className="font-bold text-xs text-slate-900">{DAY_NAMES[day.dayOfWeek - 1]}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={day.isOpen}
                      onChange={(e) => {
                        const next = [...schedules];
                        next[idx].isOpen = e.target.checked;
                        setSchedules(next);
                      }}
                      className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className={`text-xs font-semibold ${day.isOpen ? "text-emerald-700" : "text-slate-400"}`}>
                      {day.isOpen ? "Abierto" : "Cerrado"}
                    </span>
                  </label>

                  {day.isOpen && (
                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="time"
                        value={day.openTime}
                        onChange={(e) => {
                          const next = [...schedules];
                          next[idx].openTime = e.target.value;
                          setSchedules(next);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-900 font-medium"
                      />
                      <span className="text-slate-400">a</span>
                      <input
                        type="time"
                        value={day.closeTime}
                        onChange={(e) => {
                          const next = [...schedules];
                          next[idx].closeTime = e.target.value;
                          setSchedules(next);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-900 font-medium"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Texto resumen para la cabecera */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Texto Resumen para Cabecera de Vitrina Pública
              </label>
              <input
                type="text"
                value={scheduleText}
                onChange={(e) => setScheduleText(e.target.value)}
                placeholder="Ej: Lunes a Sábado: 08:00 - 20:00"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-slate-400 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Este texto se muestra junto al icono de reloj en la barra principal de tu vitrina web.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: LLAVEROS KURI */}
      {activeTab === "keychains" && (
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Inventario y Pedidos de Llaveros Físicos</h2>
              <p className="text-xs text-slate-500">
                {isStaff
                  ? "Consulta el stock de llaveros en circulación y el estado de entrega de los lotes asignados"
                  : "Solicita nuevos lotes de llaveros permanentes para tus clientes y rastrea los pedidos"}
              </p>
            </div>
            {!isStaff && (
              <button
                onClick={() => setIsOrderModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-900 hover:bg-amber-400 shadow-sm"
              >
                <Truck className="h-4 w-4" />
                <span>Solicitar Más Llaveros</span>
              </button>
            )}
          </div>

          {/* Tarjeta Informativa de Llaveros */}
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle">
              <span className="text-xs font-semibold text-slate-500">Llaveros en Circulación</span>
              <div className="mt-2 text-2xl font-black text-slate-900">{store._count?.keychains || 0}</div>
              <p className="mt-1 text-[11px] text-slate-400">Asignados a tu local para fidelización</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle">
              <span className="text-xs font-semibold text-slate-500">Pedidos Registrados</span>
              <div className="mt-2 text-2xl font-black text-slate-900">{orders.length}</div>
              <p className="mt-1 text-[11px] text-slate-400">Historial de solicitudes de nuevos lotes</p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-subtle">
              <span className="text-xs font-semibold text-amber-800">Tecnología de Llavero</span>
              <div className="mt-2 text-sm font-bold text-slate-900">QR Permanente + NFC</div>
              <p className="mt-1 text-[11px] text-amber-700">Inmutables y grabados con código único</p>
            </div>
          </div>

          {/* Historial de pedidos */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-subtle">
            <h3 className="font-bold text-sm text-slate-900 mb-4">Historial de Solicitudes de Lotes</h3>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No tienes solicitudes de llaveros pendientes. Haz clic en "Solicitar Más Llaveros" para abastecerte.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <div key={o.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{o.quantity} Llaveros KURI</span>
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          o.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.status === "IN_PRODUCTION"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {o.status === "DELIVERED" ? "Entregado" : o.status === "IN_PRODUCTION" ? "En Producción" : "Pendiente"}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1">Receptor: <strong>{o.recipientName}</strong> • {o.contactPhone}</p>
                      <p className="text-slate-400 text-[11px]">Dirección: {o.deliveryAddress}</p>
                      {o.notes && <p className="text-slate-400 text-[11px] italic mt-0.5">Nota: "{o.notes}"</p>}
                    </div>

                    <div className="text-right">
                      {o.trackingNumber && (
                        <div className="font-semibold text-slate-700">Guía: {o.trackingNumber}</div>
                      )}
                      <div className="text-[10px] text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 5: CAMPAÑAS Y DESCUENTOS (Solo Dueño o Admin) */}
      {!isStaff && activeTab === "campaigns" && (
        <div className="mt-8 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Campañas de Fidelización y Descuentos</h2>
              <p className="text-xs text-slate-500">Configura la regla de sellos/oro de tu llavero y habilita descuentos directos para tus clientes</p>
            </div>
            <button
              onClick={() => setIsPromoModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Promoción con Llavero</span>
            </button>
          </div>

          {campaignSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Reglas de campaña guardadas exitosamente.</span>
            </div>
          )}

          {/* Formulario de Campaña Principal */}
          {mainCampaign && (
            <form onSubmit={handleSaveMainCampaign} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-subtle mb-8 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-600" />
                  <h3 className="font-bold text-sm text-slate-900">Reglas Principales de Oro & Visitas</h3>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  ACTIVA
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Programa</label>
                  <input
                    type="text"
                    value={mainCampaign.name || ""}
                    onChange={(e) => setMainCampaign({ ...mainCampaign, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Oro por Visita Confirmada</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={mainCampaign.goldPerVisit || 1}
                    onChange={(e) => setMainCampaign({ ...mainCampaign, goldPerVisit: parseInt(e.target.value, 10) })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tiempo de Espera Antifraude (Minutos)</label>
                  <input
                    type="number"
                    min="5"
                    max="240"
                    value={mainCampaign.cooldownMinutes || 45}
                    onChange={(e) => setMainCampaign({ ...mainCampaign, cooldownMinutes: parseInt(e.target.value, 10) })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">Tiempo mínimo requerido entre visitas de un mismo cliente en caja</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Máximo de Sellos Diarios por Cliente</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={mainCampaign.maxDailyPoints || 2}
                    onChange={(e) => setMainCampaign({ ...mainCampaign, maxDailyPoints: parseInt(e.target.value, 10) })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Aviso Destacado en Vitrina Pública</label>
                  <input
                    type="text"
                    value={mainCampaign.bannerNotice || ""}
                    onChange={(e) => setMainCampaign({ ...mainCampaign, bannerNotice: e.target.value })}
                    placeholder="Ej: ¡Presenta tu llavero Kuri y recibe 10% de descuento en la barra de cafés!"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">Mensaje que verán los clientes en la portada digital de tu negocio</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={campaignSaving}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {campaignSaving ? "Guardando..." : "Guardar Reglas Principales"}
                </button>
              </div>
            </form>
          )}

          {/* Promociones y Descuentos Secundarios de Llavero */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-subtle">
            <h3 className="font-bold text-sm text-slate-900 mb-4">Promociones y Descuentos con el Llavero Físico</h3>

            {promoCampaigns.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No tienes promociones secundarias activas. Crea una para recompensar a los portadores de tu KURI.
              </div>
            ) : (
              <div className="space-y-3">
                {promoCampaigns.map((promo) => (
                  <div key={promo.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{promo.name}</span>
                        {promo.discountPercent && (
                          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                            {promo.discountPercent}% OFF
                          </span>
                        )}
                        {promo.multiplier && promo.type === "VISIT_MULTIPLIER" && (
                          <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-900">
                            x{promo.multiplier} Oro
                          </span>
                        )}
                      </div>
                      {promo.description && (
                        <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{promo.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeletePromo(promo.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      title="Eliminar promoción"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 6: PERFIL DEL NEGOCIO, REDES SOCIALES Y UBICACIÓN (Solo Dueño o Admin) */}
      {!isStaff && activeTab === "profile" && (
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Perfil del Comercio, Redes Sociales & Ubicación</h2>
              <p className="text-xs text-slate-500">Configura la identidad de tu negocio, canales de contacto y geolocalización para tus clientes</p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/store/${store.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
              >
                <span>Ver Vitrina Pública</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {profileSuccess && (
            <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 shadow-2xs">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>La información de tu tienda, redes sociales y ubicación se han actualizado exitosamente.</span>
            </div>
          )}

          {profileError && (
            <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 shadow-2xs">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Formulario de Configuración (Columna Izquierda) */}
            <form onSubmit={handleSaveProfile} className="lg:col-span-7 space-y-6">
              
              {/* Sección 1: Identidad del Comercio */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-subtle space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Identidad del Negocio</h3>
                    <p className="text-[11px] text-slate-400">Datos visibles en el encabezado de tu vitrina web</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre del Negocio <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Ej: Café Andino de Especialidad"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría Comercial</label>
                    <input
                      type="text"
                      value={profileForm.category}
                      onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                      placeholder="Ej: Cafetería & Panadería de Autor"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Eslogan o Subtítulo</label>
                    <input
                      type="text"
                      value={profileForm.tagLine}
                      onChange={(e) => setProfileForm({ ...profileForm, tagLine: e.target.value })}
                      placeholder="Ej: Tostaduría artesanal y café de origen andino"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción del Negocio</label>
                    <textarea
                      rows={3}
                      value={profileForm.description}
                      onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                      placeholder="Cuéntale a tus clientes tu historia, propuesta de valor y experiencia gastronómica o de servicio..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Redes Sociales y Canales de Contacto */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-subtle space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Redes Sociales & Contacto Directo</h3>
                    <p className="text-[11px] text-slate-400">Canales para que tus clientes te sigan y se comuniquen contigo</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <FacebookIcon className="h-3.5 w-3.5 text-blue-600" />
                      <span>Facebook</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.facebook}
                      onChange={(e) => setProfileForm({ ...profileForm, facebook: e.target.value })}
                      placeholder="https://facebook.com/tu_pagina"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <InstagramIcon className="h-3.5 w-3.5 text-pink-600" />
                      <span>Instagram</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.instagram}
                      onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                      placeholder="https://instagram.com/tu_cuenta"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.whatsapp}
                      onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                      placeholder="Ej: 593991122334"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">Número con código de país para chat directo</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-amber-600" />
                      <span>Correo Electrónico</span>
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="hola@tunegocio.com"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-600" />
                      <span>Teléfono del Local</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+593 2 290 4455"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Ubicación Física y Enlace de Maps */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-subtle space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <MapPin className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Ubicación & Google Maps</h3>
                    <p className="text-[11px] text-slate-400">Dirección física y enlace de navegación para tus clientes</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección Física del Local</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="Ej: Av. Amazonas y República, Quito"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <GoogleMapsIcon className="h-3.5 w-3.5 text-rose-500" />
                        <span>Enlace de Google Maps (Link de Maps)</span>
                      </label>
                      {profileForm.mapUrl && (
                        <a
                          href={profileForm.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 transition"
                        >
                          <span>Probar enlace</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                    <input
                      type="url"
                      value={profileForm.mapUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, mapUrl: e.target.value })}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">
                      Pega aquí el enlace de "Compartir" obtenido desde Google Maps para que tus clientes abran la ruta en su celular.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sección 4: Identidad Visual (Logo y Portada) */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-subtle space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Imágenes y Marca</h3>
                    <p className="text-[11px] text-slate-400">Logotipo y portada panorámica de alta resolución</p>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <ImageUploader
                    label="Logotipo del Negocio"
                    currentUrl={profileForm.logoUrl}
                    onImageUploaded={(url) => setProfileForm((prev) => ({ ...prev, logoUrl: url }))}
                    folder="kuri/logos"
                    aspectRatio="square"
                    description="Imagen cuadrada recomendada (SVG o PNG transparente)"
                  />

                  <ImageUploader
                    label="Portada / Banner Panorámico"
                    currentUrl={profileForm.bannerUrl}
                    onImageUploaded={(url) => setProfileForm((prev) => ({ ...prev, bannerUrl: url }))}
                    folder="kuri/banners"
                    aspectRatio="wide"
                    description="Imagen horizontal panorámica recomendada (1200x500)"
                  />
                </div>

                {/* Galería rápida de imágenes sugeridas */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-600 mb-2">O elige una fotografía de catálogo sugerida:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_IMAGES.map((img) => (
                      <button
                        key={img.label}
                        type="button"
                        onClick={() => setProfileForm((prev) => ({ ...prev, bannerUrl: img.url }))}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition"
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botón Guardar */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  {profileSaving && <Sparkles className="h-3.5 w-3.5 animate-spin text-amber-400" />}
                  <span>{profileSaving ? "Guardando Cambios..." : "Guardar Información del Comercio"}</span>
                </button>
              </div>
            </form>

            {/* Vista Previa en Vivo (Columna Derecha) */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-subtle">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-900">Vista Previa para Clientes</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">/store/{store.slug}</span>
                </div>

                {/* Miniatura de la Portada */}
                <div className="relative h-32 w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
                  <img
                    src={profileForm.bannerUrl || store.bannerUrl || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200"}
                    alt="Portada del comercio"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Logo superpuesto */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2.5">
                    <div className="h-12 w-12 overflow-hidden rounded-xl border-2 border-white bg-white shadow-xs">
                      <img
                        src={profileForm.logoUrl || store.logoUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200"}
                        alt="Logo del comercio"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="text-white">
                      <h4 className="text-sm font-extrabold line-clamp-1 drop-shadow-xs">{profileForm.name || store.name}</h4>
                      <p className="text-[10px] text-slate-200 line-clamp-1">{profileForm.category || store.category}</p>
                    </div>
                  </div>
                </div>

                {/* Eslogan y Descripción */}
                <div className="mt-4 space-y-2">
                  {profileForm.tagLine && (
                    <p className="text-xs font-semibold text-slate-800 italic">
                      "{profileForm.tagLine}"
                    </p>
                  )}
                  {profileForm.description && (
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {profileForm.description}
                    </p>
                  )}
                </div>

                {/* Dirección y Google Maps */}
                {profileForm.address && (
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3 space-y-2">
                    <div className="flex items-start gap-2 text-xs text-slate-700">
                      <MapPin className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="font-medium">{profileForm.address}</span>
                    </div>

                    {profileForm.mapUrl && (
                      <a
                        href={profileForm.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-50 transition shadow-2xs"
                      >
                        <GoogleMapsIcon className="h-3 w-3" />
                        <span>Abrir en Google Maps</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                )}

                {/* Barra de Redes Sociales y Contacto */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Canales de Contacto Activos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profileForm.facebook && (
                      <a
                        href={profileForm.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <FacebookIcon className="h-3 w-3 text-blue-600" />
                        <span>Facebook</span>
                      </a>
                    )}

                    {profileForm.instagram && (
                      <a
                        href={profileForm.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <InstagramIcon className="h-3 w-3 text-pink-600" />
                        <span>Instagram</span>
                      </a>
                    )}

                    {profileForm.whatsapp && (
                      <a
                        href={`https://wa.me/${profileForm.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-100 transition"
                      >
                        <WhatsAppIcon className="h-3 w-3 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {profileForm.email && (
                      <a
                        href={`mailto:${profileForm.email}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Mail className="h-3 w-3 text-amber-600" />
                        <span>Correo</span>
                      </a>
                    )}

                    {profileForm.phone && (
                      <a
                        href={`tel:${profileForm.phone}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Phone className="h-3 w-3 text-slate-600" />
                        <span>Llamar</span>
                      </a>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR / EDITAR PRODUCTO */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900">
                {editingProduct ? "Editar Producto" : "Nuevo Producto en la Carta"}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Producto / Servicio *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ej: Espresso Doble Origen Loja"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Notas achocolatadas, cuerpo sedoso y acidez brillante..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio Regular ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="2.50"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio Cliente de Oro ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.discountGoldPrice}
                    onChange={(e) => setProductForm({ ...productForm, discountGoldPrice: e.target.value })}
                    placeholder="2.00"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
                <input
                  type="text"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  placeholder="Ej: Cafés de Especialidad, Pastelería, etc."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <ImageUploader
                  label="Fotografía del Producto"
                  currentUrl={productForm.imageUrl}
                  onImageUploaded={(url) => setProductForm((prev) => ({ ...prev, imageUrl: url }))}
                  folder="kuri/products"
                  aspectRatio="wide"
                  description="Sube una fotografía de tu platillo o producto a Cloudinary"
                />
                
                {/* Selector rápido de fotos sugeridas */}
                <div className="mt-2.5">
                  <span className="text-[10px] text-slate-400 font-medium">O elige una foto sugerida de alta calidad:</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {SUGGESTED_IMAGES.map((img) => (
                      <button
                        key={img.label}
                        type="button"
                        onClick={() => setProductForm((prev) => ({ ...prev, imageUrl: img.url }))}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isAvailable}
                    onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })}
                    className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-slate-700">Disponible de inmediato</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={productSaving}
                    className="rounded-xl bg-slate-900 px-5 py-2 text-white font-bold hover:bg-slate-800 disabled:opacity-50"
                  >
                    {productSaving ? "Guardando..." : "Guardar Producto"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SOLICITAR MÁS LLAVEROS */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Solicitud de Llaveros Físicos KURI</h3>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cantidad de Llaveros Solicitados *</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[25, 50, 100, 200].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setOrderForm({ ...orderForm, quantity: qty })}
                      className={`rounded-xl border py-2 text-xs font-bold transition ${
                        orderForm.quantity === qty
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {qty} unidades
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="10"
                  required
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value, 10) || 0 })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dirección de Despacho *</label>
                <input
                  type="text"
                  required
                  value={orderForm.deliveryAddress}
                  onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })}
                  placeholder="Calle principal, número y referencia..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre de Quien Recibe *</label>
                  <input
                    type="text"
                    required
                    value={orderForm.recipientName}
                    onChange={(e) => setOrderForm({ ...orderForm, recipientName: e.target.value })}
                    placeholder="Carlos Mendoza"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono de Contacto *</label>
                  <input
                    type="tel"
                    required
                    value={orderForm.contactPhone}
                    onChange={(e) => setOrderForm({ ...orderForm, contactPhone: e.target.value })}
                    placeholder="+593 99..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notas u Observaciones del Lote</label>
                <textarea
                  rows={2}
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  placeholder="Ej: Llaveros grabados con logo para inauguración..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={orderSaving}
                  className="rounded-xl bg-amber-500 px-5 py-2 text-slate-900 font-bold hover:bg-amber-400 disabled:opacity-50"
                >
                  {orderSaving ? "Enviando..." : "Confirmar Pedido"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA PROMOCIÓN / DESCUENTO POR LLAVERO */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Nueva Promoción con Llavero</h3>
              </div>
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePromoCampaign} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título de la Promoción *</label>
                <input
                  type="text"
                  required
                  value={promoForm.name}
                  onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                  placeholder="Ej: 15% OFF en Carta de Filtrados"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Beneficio</label>
                  <select
                    value={promoForm.type}
                    onChange={(e) => setPromoForm({ ...promoForm, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none"
                  >
                    <option value="KEYCHAIN_DISCOUNT">Descuento Directo (%)</option>
                    <option value="VISIT_MULTIPLIER">Multiplicador de Oro (x2)</option>
                  </select>
                </div>

                {promoForm.type === "KEYCHAIN_DISCOUNT" ? (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Porcentaje de Descuento (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={promoForm.discountPercent}
                      onChange={(e) => setPromoForm({ ...promoForm, discountPercent: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Multiplicador de Oro</label>
                    <input
                      type="number"
                      min="2"
                      max="5"
                      value={promoForm.multiplier}
                      onChange={(e) => setPromoForm({ ...promoForm, multiplier: parseInt(e.target.value, 10) || 2 })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción para el Cliente</label>
                <textarea
                  rows={2}
                  value={promoForm.description}
                  onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                  placeholder="Válido en barra al presentar el llavero físico KURI..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-5 py-2 text-white font-bold hover:bg-slate-800"
                >
                  Activar Promoción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
