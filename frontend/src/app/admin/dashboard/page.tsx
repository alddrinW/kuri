"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Sparkles, 
  Store, 
  Users, 
  QrCode, 
  Plus, 
  ArrowRight, 
  Printer, 
  KeyRound,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  ExternalLink,
  Lock,
  Layers,
  Search,
  AlertCircle,
  Download,
  FileSpreadsheet,
  FileDown,
  Copy,
  Check,
  Eye,
  Filter,
  ChevronDown,
  ChevronUp,
  Package,
  FolderOpen,
  Grid,
  List,
  CreditCard,
  Ban,
  DollarSign,
  Receipt,
  Calendar,
  Pencil,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
  GoogleMapsIcon
} from "@/components/SocialIcons";
import ImageUploader from "@/components/ImageUploader";

type ActiveTab = "overview" | "stores" | "subscriptions" | "campaigns" | "batches" | "qrs";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [metrics, setMetrics] = useState<any | null>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [keychains, setKeychains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros y Búsqueda en Catálogo de QR
  const [qrSearch, setQrSearch] = useState("");
  const [qrStatusFilter, setQrStatusFilter] = useState<"ALL" | "ACTIVATED_USER" | "ASSIGNED_STORE">("ALL");
  const [qrStoreFilter, setQrStoreFilter] = useState("ALL");
  const [qrBatchFilter, setQrBatchFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"BY_BATCH" | "FLAT">("BY_BATCH");
  const [expandedBatches, setExpandedBatches] = useState<Record<string, boolean>>({});
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [selectedQrPreview, setSelectedQrPreview] = useState<any | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Modal / Formulario Crear Nuevo Comercio & Credenciales
  const [showCreateStoreModal, setShowCreateStoreModal] = useState(false);
  const [newStore, setNewStore] = useState({
    name: "",
    slug: "",
    category: "Cafetería y Restaurante",
    tagLine: "",
    address: "",
    phone: "",
    whatsapp: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    ownerPhone: "",
  });
  const [createStoreLoading, setCreateStoreLoading] = useState(false);
  const [createStoreMsg, setCreateStoreMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Gestión y Edición Integral de Comercios (HU-009)
  const [isEditStoreModalOpen, setIsEditStoreModalOpen] = useState(false);
  const [editStoreForm, setEditStoreForm] = useState({
    id: "",
    name: "",
    description: "",
    tagLine: "",
    category: "",
    address: "",
    phone: "",
    whatsapp: "",
    email: "",
    facebook: "",
    instagram: "",
    mapUrl: "",
    logoUrl: "",
    bannerUrl: "",
  });
  const [editStoreSaving, setEditStoreSaving] = useState(false);
  const [editStoreError, setEditStoreError] = useState("");

  // Gestión de Suscripciones y Mensualidades de Comercios
  const [editSubModalOpen, setEditSubModalOpen] = useState(false);
  const [editSubForm, setEditSubForm] = useState({
    storeId: "",
    storeName: "",
    monthlyFee: 29,
    billingDueDay: 1,
    subscriptionStatus: "ACTIVE",
    subscriptionNotes: "",
    nextBillingDate: "",
  });
  const [recordPaymentModalOpen, setRecordPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    storeId: "",
    storeName: "",
    defaultFee: 29,
    amount: "29.00",
    paymentMethod: "TRANSFERENCIA",
    reference: "",
    periodCovered: "",
    notes: "",
  });
  const [subActionLoading, setSubActionLoading] = useState(false);
  const [subActionMsg, setSubActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [subSearch, setSubSearch] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED" | "PAST_DUE">("ALL");

  // Editor de Campaña
  const [selectedCampaignStoreId, setSelectedCampaignStoreId] = useState("");
  const [campaignForm, setCampaignForm] = useState({
    type: "VISIT_STAMP",
    goldPerVisit: 1,
    goldRatioAmount: 10,
    cooldownMinutes: 45,
    maxDailyPoints: 2,
    isActive: true,
  });
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignMsg, setCampaignMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Formulario Lotes de Llaveros QR
  const [selectedBatchStoreId, setSelectedBatchStoreId] = useState("");
  const [batchQuantity, setBatchQuantity] = useState("5");
  const [batchPrefix, setBatchPrefix] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [generatedBatch, setGeneratedBatch] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resMetrics, resStores, resBatches, resKeychains] = await Promise.all([
        fetch("/api/admin/metrics"),
        fetch("/api/admin/stores"),
        fetch("/api/admin/batches"),
        fetch("/api/admin/keychains"),
      ]);

      if (resMetrics.status === 403 || resMetrics.status === 401) {
        router.push("/login");
        return;
      }

      const mJson = await resMetrics.json();
      const sJson = await resStores.json();
      const bJson = await resBatches.json();
      const kJson = await resKeychains.json();

      if (mJson.metrics) setMetrics(mJson.metrics);
      if (sJson.stores) {
        setStores(sJson.stores);
        if (sJson.stores.length > 0) {
          if (!selectedBatchStoreId) setSelectedBatchStoreId(sJson.stores[0].id);
          if (!selectedCampaignStoreId) {
            setSelectedCampaignStoreId(sJson.stores[0].id);
            if (sJson.stores[0].campaign) {
              setCampaignForm({
                type: sJson.stores[0].campaign.type,
                goldPerVisit: sJson.stores[0].campaign.goldPerVisit,
                goldRatioAmount: sJson.stores[0].campaign.goldRatioAmount,
                cooldownMinutes: sJson.stores[0].campaign.cooldownMinutes,
                maxDailyPoints: sJson.stores[0].campaign.maxDailyPoints,
                isActive: sJson.stores[0].campaign.isActive,
              });
            }
          }
        }
      }
      if (bJson.batches) setBatches(bJson.batches);
      if (kJson.keychains) setKeychains(kJson.keychains);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, token: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const filteredKeychains = keychains.filter((kc) => {
    const matchesSearch =
      !qrSearch ||
      kc.token.toLowerCase().includes(qrSearch.toLowerCase()) ||
      (kc.store?.name && kc.store.name.toLowerCase().includes(qrSearch.toLowerCase())) ||
      (kc.customer?.name && kc.customer.name.toLowerCase().includes(qrSearch.toLowerCase())) ||
      (kc.batchNumber && kc.batchNumber.toLowerCase().includes(qrSearch.toLowerCase()));

    const matchesStatus =
      qrStatusFilter === "ALL" || kc.status === qrStatusFilter;

    const matchesStore =
      qrStoreFilter === "ALL" || kc.store?.id === qrStoreFilter;

    const matchesBatch =
      qrBatchFilter === "ALL" || (kc.batchNumber || "SIN-LOTE") === qrBatchFilter;

    return matchesSearch && matchesStatus && matchesStore && matchesBatch;
  });

  // Lista única de lotes para el selector de filtro
  const availableBatches = Array.from(new Set(keychains.map((k) => k.batchNumber || "SIN-LOTE")));

  // Agrupación de llaveros filtrados en tarjetas por Lote
  const groupedBatches = (() => {
    const map = new Map<string, {
      batchNumber: string;
      storeName: string;
      createdAt: string;
      total: number;
      activated: number;
      unassigned: number;
      items: any[];
    }>();

    for (const kc of filteredKeychains) {
      const bNum = kc.batchNumber || "SIN-LOTE";
      if (!map.has(bNum)) {
        map.set(bNum, {
          batchNumber: bNum,
          storeName: kc.store?.name || "Sin Comercio Asignado",
          createdAt: kc.createdAt,
          total: 0,
          activated: 0,
          unassigned: 0,
          items: [],
        });
      }
      const g = map.get(bNum)!;
      g.total += 1;
      if (kc.status === "ACTIVATED_USER") g.activated += 1;
      else g.unassigned += 1;
      g.items.push(kc);
    }

    return Array.from(map.values());
  })();

  const toggleBatch = (batchNumber: string) => {
    setExpandedBatches((prev) => ({
      ...prev,
      [batchNumber]: !prev[batchNumber],
    }));
  };

  const expandAllBatches = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    groupedBatches.forEach((b) => {
      next[b.batchNumber] = expand;
    });
    setExpandedBatches(next);
  };

  const handleExportExcel = async (itemsToExport?: any[], batchLabel?: string) => {
    try {
      setIsExportingExcel(true);
      const { utils, writeFile } = await import("xlsx");
      
      const targetItems = itemsToExport || filteredKeychains;

      const rows = targetItems.map((kc, idx) => ({
        "N°": idx + 1,
        "Código Token": kc.token,
        "Estado": kc.status === "ACTIVATED_USER" ? "Activado por Cliente" : "Asignado a Comercio",
        "Comercio": kc.store?.name || "Sin Comercio Asignado",
        "Lote": kc.batchNumber || "SIN-LOTE",
        "Cliente Titular": kc.customer?.name || "No Vinculado",
        "Correo Cliente": kc.customer?.email || "N/A",
        "Teléfono Cliente": kc.customer?.phone || "N/A",
        "Enlace Web de Escaneo": kc.qrTargetUrl || `http://localhost:3000/kuri/${kc.token}`,
        "Fecha Emisión": new Date(kc.createdAt).toLocaleDateString(),
      }));

      const worksheet = utils.json_to_sheet(rows);
      worksheet["!cols"] = [
        { wch: 6 },
        { wch: 28 },
        { wch: 22 },
        { wch: 24 },
        { wch: 20 },
        { wch: 24 },
        { wch: 28 },
        { wch: 18 },
        { wch: 38 },
        { wch: 16 },
      ];

      const workbook = utils.book_new();
      const sheetName = batchLabel ? `Lote ${batchLabel.substring(0, 20)}` : "Llaveros QR";
      utils.book_append_sheet(workbook, worksheet, sheetName);

      const fileName = batchLabel
        ? `kuri-lote-${batchLabel.toLowerCase().replace(/[^a-z0-9]/g, "-")}.xlsx`
        : `kuri-catalogo-llaveros-qr-${new Date().toISOString().split("T")[0]}.xlsx`;

      writeFile(workbook, fileName);
    } catch (err) {
      console.error("Error al exportar a Excel:", err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPdf = async (itemsToExport?: any[], batchLabel?: string) => {
    try {
      setIsExportingPdf(true);
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Grilla de 2 columnas x 3 filas = 6 tarjetas por página A4
      const cols = 2;
      const rows = 3;
      const itemsPerPage = cols * rows;
      const marginX = 14;
      const marginY = 24;
      const cardWidth = (pageWidth - marginX * 2 - 10) / cols;
      const cardHeight = 76;

      const itemsToPrint = itemsToExport || filteredKeychains;

      if (itemsToPrint.length === 0) {
        doc.setFontSize(12);
        doc.text("No hay llaveros que coincidan con los filtros seleccionados.", 20, 30);
        doc.save("kuri-catalogo-vacio.pdf");
        return;
      }

      for (let i = 0; i < itemsToPrint.length; i++) {
        const itemOnPage = i % itemsPerPage;
        const pageIndex = Math.floor(i / itemsPerPage);

        if (i > 0 && itemOnPage === 0) {
          doc.addPage();
        }

        // Encabezado institucional en cada página
        if (itemOnPage === 0) {
          doc.setFillColor(15, 23, 42); // slate-900
          doc.rect(0, 0, pageWidth, 18, "F");
          
          doc.setFontSize(11);
          doc.setTextColor(245, 158, 11); // amber-500
          doc.setFont("helvetica", "bold");
          doc.text("KURI", marginX, 11.5);
          
          doc.setFontSize(9);
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "normal");
          const headerTitle = batchLabel 
            ? `Catálogo Oficial • Lote: ${batchLabel}`
            : "Catálogo Oficial de Llaveros QR Permanentes";
          doc.text(headerTitle, marginX + 16, 11.5);

          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(`Página ${pageIndex + 1} de ${Math.ceil(itemsToPrint.length / itemsPerPage)}`, pageWidth - marginX - 26, 11.5);
        }

        const col = itemOnPage % cols;
        const row = Math.floor(itemOnPage / cols);
        const x = marginX + col * (cardWidth + 10);
        const y = marginY + row * (cardHeight + 10);

        const item = itemsToPrint[i];

        // Tarjeta con borde punteado para guía de corte
        doc.setDrawColor(203, 213, 225);
        doc.setLineDashPattern([2, 2], 0);
        doc.rect(x, y, cardWidth, cardHeight);
        doc.setLineDashPattern([], 0);

        // QR Code vectorial
        if (item.qrDataUrl) {
          try {
            doc.addImage(item.qrDataUrl, "PNG", x + (cardWidth - 42) / 2, y + 4, 42, 42);
          } catch (e) {
            // ignore
          }
        }

        // Token alfanumérico
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(item.token, x + cardWidth / 2, y + 51, { align: "center" });

        // Comercio
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(item.store?.name || "Sin Comercio Asignado", x + cardWidth / 2, y + 57, { align: "center" });

        // Lote y Estado
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        const estadoStr = item.status === "ACTIVATED_USER" ? `Titular: ${item.customer?.name || "Activo"}` : "Disponible en mostrador";
        doc.text(`Lote: ${item.batchNumber || "SIN-LOTE"} | ${estadoStr}`, x + cardWidth / 2, y + 63, { align: "center" });

        // Pie de tarjeta
        doc.setFontSize(6.5);
        doc.setTextColor(180, 83, 9);
        doc.text("Llavero Permanente KURI • Escaneo con Cámara", x + cardWidth / 2, y + 69, { align: "center" });
      }

      const fileName = batchLabel
        ? `kuri-lote-${batchLabel.toLowerCase().replace(/[^a-z0-9]/g, "-")}.pdf`
        : `kuri-catalogo-llaveros-qr-${new Date().toISOString().split("T")[0]}.pdf`;

      doc.save(fileName);
    } catch (err) {
      console.error("Error al exportar a PDF:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  // Al cambiar de tienda en el editor de campañas
  const handleSelectCampaignStore = (storeId: string) => {
    setSelectedCampaignStoreId(storeId);
    setCampaignMsg(null);
    const store = stores.find((s) => s.id === storeId);
    if (store?.campaign) {
      setCampaignForm({
        type: store.campaign.type,
        goldPerVisit: store.campaign.goldPerVisit,
        goldRatioAmount: store.campaign.goldRatioAmount,
        cooldownMinutes: store.campaign.cooldownMinutes,
        maxDailyPoints: store.campaign.maxDailyPoints,
        isActive: store.campaign.isActive,
      });
    }
  };

  // Crear Negocio y Credenciales de Acceso
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateStoreLoading(true);
    setCreateStoreMsg(null);

    try {
      const res = await fetch("/api/admin/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStore),
      });

      const resJson = await res.json();
      if (!res.ok) {
        setCreateStoreMsg({ type: "error", text: resJson.error || "Error al crear comercio" });
      } else {
        setCreateStoreMsg({ type: "success", text: resJson.message });
        await fetchData();
        setTimeout(() => {
          setShowCreateStoreModal(false);
          setCreateStoreMsg(null);
          setNewStore({
            name: "",
            slug: "",
            category: "Cafetería y Restaurante",
            tagLine: "",
            address: "",
            phone: "",
            whatsapp: "",
            ownerName: "",
            ownerEmail: "",
            ownerPassword: "",
            ownerPhone: "",
          });
        }, 1500);
      }
    } catch {
      setCreateStoreMsg({ type: "error", text: "Error de conexión al crear el comercio" });
    } finally {
      setCreateStoreLoading(false);
    }
  };

  // Handlers para Edición Integral de Comercio (SuperAdmin - HU-009)
  const openEditStoreModal = (store: any) => {
    setEditStoreForm({
      id: store.id,
      name: store.name || "",
      description: store.description || "",
      tagLine: store.tagLine || "",
      category: store.category || "Comercio Local",
      address: store.address || "",
      phone: store.phone || "",
      whatsapp: store.whatsapp || "",
      email: store.email || "",
      facebook: store.facebook || "",
      instagram: store.instagram || "",
      mapUrl: store.mapUrl || "",
      logoUrl: store.logoUrl || "",
      bannerUrl: store.bannerUrl || "",
    });
    setEditStoreError("");
    setIsEditStoreModalOpen(true);
  };

  const handleSaveEditStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStoreForm.name.trim()) {
      setEditStoreError("El nombre de la tienda es obligatorio");
      return;
    }
    try {
      setEditStoreSaving(true);
      setEditStoreError("");
      const res = await fetch(`/api/admin/stores/${editStoreForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editStoreForm),
      });
      const json = await res.json();
      if (!res.ok) {
        setEditStoreError(json.error || "Error al actualizar la tienda");
      } else {
        setIsEditStoreModalOpen(false);
        setStores((prev) =>
          prev.map((s) => (s.id === editStoreForm.id ? { ...s, ...json.store } : s))
        );
      }
    } catch {
      setEditStoreError("Error de conexión al guardar los datos de la tienda");
    } finally {
      setEditStoreSaving(false);
    }
  };

  // Funciones de Gestión de Suscripciones y Mensualidades
  const handleQuickToggleStatus = async (store: any) => {
    const nextStatus = store.subscriptionStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const actionLabel = nextStatus === "SUSPENDED" ? "suspender" : "reactivar";
    if (!window.confirm(`¿Confirmas ${actionLabel} el servicio de "${store.name}"? ${nextStatus === "SUSPENDED" ? "Su vitrina pública y su POS quedarán inactivos inmediatamente." : "Su vitrina pública y su POS volverán a estar operativos."}`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/stores/${store.id}/subscription`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionStatus: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Error al actualizar estado");
      } else {
        await fetchData();
      }
    } catch {
      alert("Error de conexión al actualizar estado");
    }
  };

  const openEditSubModal = (store: any) => {
    const dateObj = store.nextBillingDate ? new Date(store.nextBillingDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const dateStr = !isNaN(dateObj.getTime())
      ? dateObj.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    setEditSubForm({
      storeId: store.id,
      storeName: store.name,
      monthlyFee: store.monthlyFee !== undefined ? store.monthlyFee : 29,
      billingDueDay: store.billingDueDay !== undefined ? store.billingDueDay : (dateObj.getDate() || 1),
      subscriptionStatus: store.subscriptionStatus || "ACTIVE",
      subscriptionNotes: store.subscriptionNotes || "",
      nextBillingDate: dateStr,
    });
    setSubActionMsg(null);
    setEditSubModalOpen(true);
  };

  const setDateShortcut = (type: "15days" | "30days" | "nextMonthFirst" | "endOfMonth") => {
    const now = new Date();
    let target = new Date();

    if (type === "15days") {
      target.setDate(now.getDate() + 15);
    } else if (type === "30days") {
      target.setDate(now.getDate() + 30);
    } else if (type === "nextMonthFirst") {
      target = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else if (type === "endOfMonth") {
      target = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, "0");
    const dd = String(target.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    setEditSubForm((prev) => ({
      ...prev,
      nextBillingDate: dateStr,
      billingDueDay: target.getDate(),
    }));
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubActionLoading(true);
    setSubActionMsg(null);
    try {
      const res = await fetch(`/api/admin/stores/${editSubForm.storeId}/subscription`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyFee: Number(editSubForm.monthlyFee),
          billingDueDay: Number(editSubForm.billingDueDay),
          subscriptionStatus: editSubForm.subscriptionStatus,
          subscriptionNotes: editSubForm.subscriptionNotes,
          nextBillingDate: editSubForm.nextBillingDate ? new Date(editSubForm.nextBillingDate).toISOString() : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubActionMsg({ type: "error", text: json.error || "Error al actualizar suscripción" });
      } else {
        setSubActionMsg({ type: "success", text: json.message || "Suscripción guardada" });
        await fetchData();
        setTimeout(() => {
          setEditSubModalOpen(false);
          setSubActionMsg(null);
        }, 1200);
      }
    } catch {
      setSubActionMsg({ type: "error", text: "Error de red al actualizar suscripción" });
    } finally {
      setSubActionLoading(false);
    }
  };

  const openRecordPaymentModal = (store: any) => {
    const fee = store.monthlyFee !== undefined ? store.monthlyFee : 29;
    setPaymentForm({
      storeId: store.id,
      storeName: store.name,
      defaultFee: fee,
      amount: String(fee),
      paymentMethod: "TRANSFERENCIA",
      reference: `TRF-${Date.now().toString(36).toUpperCase()}`,
      periodCovered: new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" }),
      notes: "",
    });
    setSubActionMsg(null);
    setRecordPaymentModalOpen(true);
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubActionLoading(true);
    setSubActionMsg(null);
    try {
      const res = await fetch(`/api/admin/stores/${paymentForm.storeId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          reference: paymentForm.reference,
          periodCovered: paymentForm.periodCovered,
          notes: paymentForm.notes,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubActionMsg({ type: "error", text: json.error || "Error al registrar pago" });
      } else {
        setSubActionMsg({ type: "success", text: json.message || "Pago registrado y comercio reactivado" });
        await fetchData();
        setTimeout(() => {
          setRecordPaymentModalOpen(false);
          setSubActionMsg(null);
        }, 1400);
      }
    } catch {
      setSubActionMsg({ type: "error", text: "Error de red al registrar pago" });
    } finally {
      setSubActionLoading(false);
    }
  };

  // Guardar Campaña de Fidelidad
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignStoreId) return;

    setCampaignLoading(true);
    setCampaignMsg(null);

    try {
      const res = await fetch(`/api/admin/campaigns/${selectedCampaignStoreId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignForm),
      });

      const resJson = await res.json();
      if (!res.ok) {
        setCampaignMsg({ type: "error", text: resJson.error || "Error al actualizar campaña" });
      } else {
        setCampaignMsg({ type: "success", text: resJson.message });
        await fetchData();
      }
    } catch {
      setCampaignMsg({ type: "error", text: "Error de red al actualizar campaña" });
    } finally {
      setCampaignLoading(false);
    }
  };

  // Generar Lote de Llaveros QR
  const handleGenerateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchStoreId) return;

    setGenLoading(true);
    setGeneratedBatch(null);

    try {
      const res = await fetch("/api/admin/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: selectedBatchStoreId,
          quantity: Number(batchQuantity),
          prefix: batchPrefix.trim() || undefined,
        }),
      });

      const resJson = await res.json();
      if (resJson.success) {
        setGeneratedBatch(resJson);
        await fetchData();
      }
    } catch {
      // ignore
    } finally {
      setGenLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Sparkles className="h-6 w-6 animate-spin text-amber-500" />
        <span className="ml-2 text-xs font-medium text-slate-500">Cargando consola central KURI...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Consola Central SuperAdmin</span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Plataforma KURI</h1>
          </div>
        </div>

        {/* Botón Acción Destacada */}
        <button
          onClick={() => setShowCreateStoreModal(true)}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4 text-amber-400" />
          <span>Registrar Nuevo Comercio</span>
        </button>
      </div>

      {/* Navegación por Pestañas */}
      <div className="mt-6 flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition ${
            activeTab === "overview"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Resumen de Red</span>
        </button>

        <button
          onClick={() => setActiveTab("stores")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition ${
            activeTab === "stores"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Store className="h-3.5 w-3.5" />
          <span>Comercios & Credenciales ({stores.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition ${
            activeTab === "subscriptions"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CreditCard className="h-3.5 w-3.5 text-amber-400" />
          <span>Mensualidades & Cobros ({stores.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("campaigns")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition ${
            activeTab === "campaigns"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Configuración de Campañas</span>
        </button>

        <button
          onClick={() => setActiveTab("batches")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition ${
            activeTab === "batches"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Lotes de Llaveros</span>
        </button>

        <button
          onClick={() => setActiveTab("qrs")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition ${
            activeTab === "qrs"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <QrCode className="h-3.5 w-3.5 text-amber-400" />
          <span>Catálogo de QR ({keychains.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: RESUMEN DE RED ================= */}
      {activeTab === "overview" && (
        <div className="mt-6 space-y-8">
          {metrics && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold text-slate-500">Comercios Afiliados</span>
                  <Store className="h-4 w-4" />
                </div>
                <div className="mt-3 text-3xl font-black text-slate-900">{metrics.totalStores}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold text-slate-500">Clientes Registrados</span>
                  <Users className="h-4 w-4" />
                </div>
                <div className="mt-3 text-3xl font-black text-slate-900">{metrics.totalCustomers}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold text-slate-500">Llaveros Físicos Totales</span>
                  <QrCode className="h-4 w-4" />
                </div>
                <div className="mt-3 text-3xl font-black text-slate-900">{metrics.totalKeychains}</div>
                <div className="mt-1 text-[11px] text-emerald-600 font-medium">
                  {metrics.activatedKeychains} activados por clientes
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-subtle">
                <div className="flex items-center justify-between text-amber-800">
                  <span className="text-xs font-semibold">Oro en Circulación</span>
                  <Sparkles className="h-4 w-4 text-amber-600" />
                </div>
                <div className="mt-3 text-3xl font-black text-amber-700">{metrics.totalGoldCirculating} <span className="text-xs font-semibold">Oro</span></div>
                <div className="mt-1 text-[11px] text-amber-800 font-medium">
                  {metrics.totalTransactions} visitas auditadas
                </div>
              </div>
            </div>
          )}

          {/* Accesos Rápidos de Administración */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div
              onClick={() => setShowCreateStoreModal(true)}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle hover:border-amber-400 transition"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <Store className="h-4 w-4" />
              </div>
              <h3 className="mt-3 font-bold text-slate-900 text-sm">Dar de Alta Comercio</h3>
              <p className="mt-1 text-xs text-slate-500">Crea la tienda y genera las credenciales de acceso para su dueño.</p>
            </div>

            <div
              onClick={() => setActiveTab("campaigns")}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle hover:border-amber-400 transition"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <h3 className="mt-3 font-bold text-slate-900 text-sm">Ajustar Campañas</h3>
              <p className="mt-1 text-xs text-slate-500">Configura sellos por visita, montos de compra y cooldown antifraude.</p>
            </div>

            <div
              onClick={() => setActiveTab("batches")}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle hover:border-amber-400 transition"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <QrCode className="h-4 w-4" />
              </div>
              <h3 className="mt-3 font-bold text-slate-900 text-sm">Imprimir Lotes de QR</h3>
              <p className="mt-1 text-xs text-slate-500">Genera paquetes de llaveros permanentes listos para producción física.</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: COMERCIOS & CREDENCIALES ================= */}
      {activeTab === "stores" && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Directorio de Comercios y Credenciales</h2>
              <p className="text-xs text-slate-500">Administra las cuentas de los dueños y el estado de cada negocio afiliado</p>
            </div>
            <button
              onClick={() => setShowCreateStoreModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              <span>Nuevo Negocio</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-subtle">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-3.5 font-semibold">Comercio</th>
                  <th className="p-3.5 font-semibold">Categoría</th>
                  <th className="p-3.5 font-semibold">Dueño / Acceso</th>
                  <th className="p-3.5 font-semibold">Mensualidad & Estado</th>
                  <th className="p-3.5 font-semibold">Campaña Activa</th>
                  <th className="p-3.5 font-semibold">Llaveros</th>
                  <th className="p-3.5 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stores.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/40">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">/{s.slug}</div>
                    </td>
                    <td className="p-3.5">{s.category}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{s.owner?.name || "Sin asignar"}</div>
                      <div className="text-[10px] text-amber-700 font-mono">{s.owner?.email}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                          s.subscriptionStatus === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${s.subscriptionStatus === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {s.subscriptionStatus === "ACTIVE" ? "Activo" : "Suspendido"}
                        </span>
                        <span className="font-bold text-slate-900 text-xs">
                          ${Number(s.monthlyFee || 29).toFixed(2)}
                          <span className="text-[10px] text-slate-400 font-normal">/m</span>
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                        <Calendar className="h-3 w-3 text-amber-600 shrink-0" />
                        <span>
                          {s.nextBillingDate
                            ? `Corte: ${new Date(s.nextBillingDate).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}`
                            : `Corte mensual: Día ${s.billingDueDay || 1}`}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                        {s.campaign?.type === "VISIT_STAMP" ? "Sellos por Visita" : "Puntos por Monto"}
                      </span>
                    </td>
                    <td className="p-3.5">{s._count?.keychains || 0} asignados</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditSubModal(s)}
                          className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition shadow-xs ${
                            s.subscriptionStatus === "ACTIVE"
                              ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                              : "border border-amber-300 bg-amber-500 text-slate-950 hover:bg-amber-400"
                          }`}
                          title="Activar o configurar fecha de cobro en calendario"
                        >
                          <Calendar className={`h-3 w-3 ${s.subscriptionStatus === "ACTIVE" ? "text-amber-600" : "text-slate-950"}`} />
                          <span>{s.subscriptionStatus === "ACTIVE" ? "Gestionar" : "Activar Suscripción"}</span>
                        </button>
                        <button
                          onClick={() => openRecordPaymentModal(s)}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-xs"
                          title="Registrar cobro de mensualidad"
                        >
                          <DollarSign className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => openEditStoreModal(s)}
                          className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs"
                          title="Editar información, redes sociales y ubicación del comercio"
                        >
                          <Pencil className="h-3 w-3 text-slate-500" />
                        </button>
                        <Link
                          href={`/store/${s.slug}`}
                          target="_blank"
                          className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                          title="Ver vitrina web"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => handleQuickToggleStatus(s)}
                          className={`rounded-xl px-2 py-1.5 text-[11px] font-bold transition ${
                            s.subscriptionStatus === "ACTIVE"
                              ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                              : "border border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                          title={s.subscriptionStatus === "ACTIVE" ? "Suspender servicio" : "Reactivar servicio"}
                        >
                          <Ban className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB: MENSUALIDADES & COBROS ================= */}
      {activeTab === "subscriptions" && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Control de Mensualidades y Cobros</h2>
              <p className="text-xs text-slate-500">Supervisa facturación recurrente, adapta mensualidades y suspende comercios por falta de pago</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateStoreModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                <Plus className="h-3.5 w-3.5 text-amber-400" />
                <span>Nuevo Negocio</span>
              </button>
            </div>
          </div>

          {/* KPIs Financieros */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-500">Facturación Mensual Est.</span>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-3 text-3xl font-black text-slate-900">
                ${stores.filter((s) => s.subscriptionStatus === "ACTIVE").reduce((acc, s) => acc + (Number(s.monthlyFee) || 0), 0).toFixed(2)}
              </div>
              <div className="mt-1 text-[11px] text-emerald-700 font-medium">Comercios al día</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-500">Comercios Activos</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-3 text-3xl font-black text-slate-900">
                {stores.filter((s) => s.subscriptionStatus === "ACTIVE").length}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Sitio web y POS operativos</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-500">Servicios Suspendidos</span>
                <Ban className="h-4 w-4 text-rose-600" />
              </div>
              <div className="mt-3 text-3xl font-black text-rose-600">
                {stores.filter((s) => s.subscriptionStatus === "SUSPENDED").length}
              </div>
              <div className="mt-1 text-[11px] text-rose-600 font-medium">Bloqueo por falta de pago</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-500">Total Comercios</span>
                <Store className="h-4 w-4 text-amber-600" />
              </div>
              <div className="mt-3 text-3xl font-black text-slate-900">
                {stores.length}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Bajo gestión KURI</div>
            </div>
          </div>

          {/* Filtros de Mensualidades */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-subtle">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por comercio o correo..."
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {(["ALL", "ACTIVE", "SUSPENDED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSubStatusFilter(st)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    subStatusFilter === st
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {st === "ALL" ? "Todos" : st === "ACTIVE" ? "Al Día (Activos)" : "Suspendidos (Mora)"}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de Comercios con Suscripciones */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-subtle">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-3.5 font-semibold">Comercio</th>
                  <th className="p-3.5 font-semibold">Tarifa Mensual</th>
                  <th className="p-3.5 font-semibold">Día de Corte</th>
                  <th className="p-3.5 font-semibold">Estado de Servicio</th>
                  <th className="p-3.5 font-semibold">Próximo Cobro</th>
                  <th className="p-3.5 font-semibold">Último Pago</th>
                  <th className="p-3.5 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stores
                  .filter((s) => {
                    const matchSearch =
                      s.name.toLowerCase().includes(subSearch.toLowerCase()) ||
                      (s.owner?.email || "").toLowerCase().includes(subSearch.toLowerCase());
                    const matchStatus = subStatusFilter === "ALL" || s.subscriptionStatus === subStatusFilter;
                    return matchSearch && matchStatus;
                  })
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/40">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[10px] text-slate-400">{s.owner?.name} • {s.owner?.email}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-sm font-black text-slate-900">
                          ${Number(s.monthlyFee || 29).toFixed(2)}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">USD/mes</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-700">Día {s.billingDueDay || 1}</span>
                        <div className="text-[10px] text-slate-400">de cada mes</div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                              s.subscriptionStatus === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                s.subscriptionStatus === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                            {s.subscriptionStatus === "ACTIVE" ? "Activo (Web & POS)" : "Suspendido (Bloqueado)"}
                          </span>
                        </div>
                        {s.subscriptionNotes && (
                          <div className="mt-1 text-[10px] text-slate-500 truncate max-w-xs" title={s.subscriptionNotes}>
                            {s.subscriptionNotes}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span>
                            {s.nextBillingDate
                              ? new Date(s.nextBillingDate).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
                              : "No programado"}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        {s.lastPaymentDate ? (
                          <div>
                            <div className="font-medium text-slate-800">
                              {new Date(s.lastPaymentDate).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                            {s.subscriptionPayments && s.subscriptionPayments[0] && (
                              <div className="text-[10px] text-emerald-700 font-semibold font-mono">
                                ${Number(s.subscriptionPayments[0].amount).toFixed(2)} • {s.subscriptionPayments[0].paymentMethod}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Sin registros</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => openRecordPaymentModal(s)}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-xs"
                          title="Registrar cobro de mensualidad"
                        >
                          Cobrar
                        </button>
                        <button
                          onClick={() => openEditSubModal(s)}
                          className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition inline-flex items-center gap-1 shadow-xs"
                          title="Ajustar fecha de calendario y mensualidad"
                        >
                          <Calendar className="h-3 w-3 text-amber-600" />
                          <span>{s.subscriptionStatus === "ACTIVE" ? "Fecha / Plan" : "Activar"}</span>
                        </button>
                        <button
                          onClick={() => handleQuickToggleStatus(s)}
                          className={`rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition shadow-xs ${
                            s.subscriptionStatus === "ACTIVE"
                              ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                              : "border border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                          title={s.subscriptionStatus === "ACTIVE" ? "Bloquear tienda y POS" : "Reactivar tienda y POS"}
                        >
                          {s.subscriptionStatus === "ACTIVE" ? "Suspender" : "Reactivar"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CONFIGURACIÓN DE CAMPAÑAS ================= */}
      {activeTab === "campaigns" && (
        <div className="mt-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Reglas y Motor de Fidelidad</h2>
            <p className="text-xs text-slate-500">Configura los parámetros de acumulación de Oro y controles de fraude por negocio</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            
            {/* Selector de Comercio */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle">
              <div className="text-xs font-semibold text-slate-700 mb-2">Selecciona un Comercio</div>
              <div className="space-y-1.5">
                {stores.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectCampaignStore(s.id)}
                    className={`w-full rounded-xl p-3 text-left text-xs transition ${
                      selectedCampaignStoreId === s.id
                        ? "border border-amber-300 bg-amber-50/60 font-bold text-slate-900"
                        : "border border-slate-100 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div>{s.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">/{s.slug}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Formulario de Ajuste de Campaña */}
            <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-subtle">
              {campaignMsg && (
                <div className={`mb-4 rounded-xl p-3 text-xs ${
                  campaignMsg.type === "success"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border border-rose-200 bg-rose-50 text-rose-800"
                }`}>
                  {campaignMsg.text}
                </div>
              )}

              <form onSubmit={handleSaveCampaign} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Modalidad de Acumulación</label>
                  <div className="mt-1.5 grid grid-cols-2 gap-3 text-xs">
                    <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 ${
                      campaignForm.type === "VISIT_STAMP"
                        ? "border-amber-500 bg-amber-50/50 font-bold text-amber-900"
                        : "border-slate-200 text-slate-600"
                    }`}>
                      <span>Sellos por Visita (1 Visita = X Oro)</span>
                      <input
                        type="radio"
                        name="campType"
                        value="VISIT_STAMP"
                        checked={campaignForm.type === "VISIT_STAMP"}
                        onChange={() => setCampaignForm({ ...campaignForm, type: "VISIT_STAMP" })}
                        className="hidden"
                      />
                    </label>

                    <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 ${
                      campaignForm.type === "PURCHASE_AMOUNT"
                        ? "border-amber-500 bg-amber-50/50 font-bold text-amber-900"
                        : "border-slate-200 text-slate-600"
                    }`}>
                      <span>Puntos por Monto ($ de Consumo)</span>
                      <input
                        type="radio"
                        name="campType"
                        value="PURCHASE_AMOUNT"
                        checked={campaignForm.type === "PURCHASE_AMOUNT"}
                        onChange={() => setCampaignForm({ ...campaignForm, type: "PURCHASE_AMOUNT" })}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      {campaignForm.type === "VISIT_STAMP" ? "Oro por Cada Visita Confirmada" : "Monto en $ para Sumar 1 de Oro"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={campaignForm.type === "VISIT_STAMP" ? campaignForm.goldPerVisit : campaignForm.goldRatioAmount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (campaignForm.type === "VISIT_STAMP") {
                          setCampaignForm({ ...campaignForm, goldPerVisit: val });
                        } else {
                          setCampaignForm({ ...campaignForm, goldRatioAmount: val });
                        }
                      }}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Cooldown Mínimo Antifraude (Minutos)</label>
                    <input
                      type="number"
                      min="0"
                      value={campaignForm.cooldownMinutes}
                      onChange={(e) => setCampaignForm({ ...campaignForm, cooldownMinutes: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Tiempo mínimo requerido entre visitas consecutivas</span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Límite Máximo de Visitas Diarias por Cliente</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={campaignForm.maxDailyPoints}
                      onChange={(e) => setCampaignForm({ ...campaignForm, maxDailyPoints: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="campActive"
                      checked={campaignForm.isActive}
                      onChange={(e) => setCampaignForm({ ...campaignForm, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="campActive" className="text-xs font-semibold text-slate-700">
                      Campaña Activa para Escaneo y Caja
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={campaignLoading}
                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {campaignLoading ? "Guardando..." : "Guardar Reglas de Campaña"}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* ================= TAB 4: LOTES DE LLAVEROS QR ================= */}
      {activeTab === "batches" && (
        <div className="mt-6 space-y-8">
          
          {/* Formulario Generador de Lotes */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-subtle">
            <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <QrCode className="h-4 w-4 text-amber-600" />
              <span>Generar Lote de Llaveros QR (Para Impresión Física)</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">Crea tokens criptográficos permanentes inmutables listos para mandar a imprimir en llaveros acrílicos o metálicos</p>

            <form onSubmit={handleGenerateBatch} className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Comercio Asignado</label>
                <select
                  value={selectedBatchStoreId}
                  onChange={(e) => setSelectedBatchStoreId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Cantidad a Generar</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={batchQuantity}
                  onChange={(e) => setBatchQuantity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Prefijo Opcional</label>
                <input
                  type="text"
                  placeholder="Ej. CAFE, BARB"
                  value={batchPrefix}
                  onChange={(e) => setBatchPrefix(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono uppercase text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={genLoading}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 text-amber-400" />
                  <span>{genLoading ? "Generando..." : "Crear Lote de QR"}</span>
                </button>
              </div>
            </form>

            {/* Vista Previa e Impresión de Lote Recién Creado */}
            {generatedBatch && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/40 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 uppercase">Lote Listo para Producción</span>
                    <h3 className="text-sm font-bold text-slate-900">{generatedBatch.batchNumber} ({generatedBatch.totalGenerated} llaveros para {generatedBatch.storeName})</h3>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Imprimir Pliego de QR</span>
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5">
                  {generatedBatch.keychains.map((k: any) => (
                    <div key={k.id} className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-subtle">
                      <img src={k.qrDataUrl} alt={k.token} className="mx-auto h-24 w-24 object-contain" />
                      <div className="mt-2 font-mono text-[10px] font-bold text-slate-800 truncate">{k.token}</div>
                      <div className="text-[9px] text-slate-400 truncate">{generatedBatch.storeName}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Histórico de Lotes */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-subtle">
            <h3 className="text-base font-bold text-slate-900 mb-4">Lotes en Producción</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="pb-3 font-semibold">Código de Lote</th>
                    <th className="pb-3 font-semibold">Comercio</th>
                    <th className="pb-3 font-semibold">Total Llaveros</th>
                    <th className="pb-3 font-semibold">Activados</th>
                    <th className="pb-3 font-semibold">Por Asignar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batches.map((b) => (
                    <tr key={b.batchNumber} className="hover:bg-slate-50/50">
                      <td className="py-3 font-mono font-bold text-slate-900">{b.batchNumber}</td>
                      <td className="py-3 font-medium text-slate-800">{b.storeName}</td>
                      <td className="py-3">{b.total}</td>
                      <td className="py-3 text-emerald-600 font-semibold">{b.activated}</td>
                      <td className="py-3 text-slate-400">{b.unassigned}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 5: CATÁLOGO DE QR Y EXPORTACIÓN ================= */}
      {activeTab === "qrs" && (
        <div className="mt-6 space-y-6">
          
          {/* Barra Superior de Control y Exportación */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Inventario Central</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                  {filteredKeychains.length} de {keychains.length} Llaveros
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">Catálogo Maestro de Llaveros QR</h2>
              <p className="text-xs text-slate-500">
                Visualización de todos los llaveros físicos emitidos, sus códigos QR inmutables y descarga en múltiples formatos.
              </p>
            </div>

            {/* Botones de Descarga Masiva */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Botón Descargar en Excel */}
              <button
                onClick={() => handleExportExcel()}
                disabled={isExportingExcel || filteredKeychains.length === 0}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
                title="Descargar tabla en formato Excel (.xlsx)"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>{isExportingExcel ? "Generando Excel..." : "Descargar Excel (.xlsx)"}</span>
              </button>

              {/* Botón Descargar en PDF */}
              <button
                onClick={() => handleExportPdf()}
                disabled={isExportingPdf || filteredKeychains.length === 0}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
                title="Descargar catálogo completo de códigos QR en formato PDF (.pdf)"
              >
                <FileDown className="h-4 w-4 text-amber-400" />
                <span>{isExportingPdf ? "Generando PDF..." : "Descargar PDF (.pdf)"}</span>
              </button>

              {/* Botón Imprimir Pliego */}
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                title="Imprimir directamente vista de tarjetas"
              >
                <Printer className="h-3.5 w-3.5 text-slate-600" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          {/* Filtros, Selectores y Modo de Vista */}
          <div className="space-y-3">
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              
              {/* Input de Búsqueda */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por código de token (KURI-...), comercio, lote o titular..."
                  value={qrSearch}
                  onChange={(e) => setQrSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none shadow-sm"
                />
              </div>

              {/* Filtros por Estado */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                <button
                  onClick={() => setQrStatusFilter("ALL")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition shrink-0 ${
                    qrStatusFilter === "ALL"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Todos ({keychains.length})
                </button>
                <button
                  onClick={() => setQrStatusFilter("ACTIVATED_USER")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition shrink-0 ${
                    qrStatusFilter === "ACTIVATED_USER"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Activados ({keychains.filter((k) => k.status === "ACTIVATED_USER").length})
                </button>
                <button
                  onClick={() => setQrStatusFilter("ASSIGNED_STORE")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition shrink-0 ${
                    qrStatusFilter === "ASSIGNED_STORE"
                      ? "bg-amber-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  En Mostrador ({keychains.filter((k) => k.status !== "ACTIVATED_USER").length})
                </button>
              </div>

              {/* Selectores de Lote y Comercio */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                {/* Selector de Lote */}
                <select
                  value={qrBatchFilter}
                  onChange={(e) => setQrBatchFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-amber-500 focus:outline-none shadow-sm"
                >
                  <option value="ALL">Todos los Lotes ({availableBatches.length})</option>
                  {availableBatches.map((b) => (
                    <option key={b} value={b}>
                      Lote: {b}
                    </option>
                  ))}
                </select>

                {/* Selector de Comercio */}
                <select
                  value={qrStoreFilter}
                  onChange={(e) => setQrStoreFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-amber-500 focus:outline-none shadow-sm"
                >
                  <option value="ALL">Todos los Comercios</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fila de Controles de Modo de Vista y Acciones de Despliegue */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Modo de visualización:</span>
                <div className="flex items-center rounded-xl bg-slate-100 p-0.5">
                  <button
                    onClick={() => setViewMode("BY_BATCH")}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      viewMode === "BY_BATCH"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Package className="h-3.5 w-3.5 text-amber-600" />
                    <span>Por Lotes ({groupedBatches.length})</span>
                  </button>
                  <button
                    onClick={() => setViewMode("FLAT")}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      viewMode === "FLAT"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Grid className="h-3.5 w-3.5" />
                    <span>Grilla Continua</span>
                  </button>
                </div>
              </div>

              {viewMode === "BY_BATCH" && groupedBatches.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => expandAllBatches(true)}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Desplegar todos
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={() => expandAllBatches(false)}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Colapsar todos
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Estado Vacío */}
          {filteredKeychains.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <QrCode className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-3 text-sm font-bold text-slate-800">No se encontraron llaveros QR</h3>
              <p className="mt-1 text-xs text-slate-500">
                Prueba con otro término de búsqueda o selecciona otro filtro de lote o comercio.
              </p>
            </div>
          ) : viewMode === "BY_BATCH" ? (
            /* VISTA AGRUPADA: CARDS DE LOTES DESPLEGABLES */
            <div className="space-y-5">
              {groupedBatches.map((batch) => {
                const isExpanded = Boolean(expandedBatches[batch.batchNumber]);

                return (
                  <div
                    key={batch.batchNumber}
                    className={`rounded-2xl border bg-white shadow-subtle overflow-hidden transition-all duration-200 ${
                      isExpanded
                        ? "border-amber-400 ring-1 ring-amber-400/20 shadow-md"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    {/* Cabecera / Card del Lote con Acción Clickeable */}
                    <div
                      onClick={() => toggleBatch(batch.batchNumber)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 cursor-pointer bg-white hover:bg-slate-50/70 transition select-none"
                    >
                      {/* Información de Identificación del Lote */}
                      <div className="flex items-center gap-3.5">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition shadow-xs ${
                          isExpanded
                            ? "bg-amber-100/70 text-amber-800 border-amber-300"
                            : "bg-amber-50 text-amber-700 border-amber-200/60"
                        }`}>
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-bold text-slate-900">
                              Lote: {batch.batchNumber}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                              {batch.storeName}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">{batch.total} {batch.total === 1 ? "Llavero QR" : "Llaveros QR"}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">{batch.activated} activados</span>
                            <span>•</span>
                            <span className="text-amber-700 font-medium">{batch.unassigned} en mostrador</span>
                            <span>•</span>
                            <span className="text-slate-400">Emisión: {new Date(batch.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Acciones del Lote y Botón de Despliegue */}
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {/* Descargar este Lote en Excel */}
                        <button
                          onClick={() => handleExportExcel(batch.items, batch.batchNumber)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                          title="Descargar este lote en Excel (.xlsx)"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Excel</span>
                        </button>

                        {/* Descargar este Lote en PDF */}
                        <button
                          onClick={() => handleExportPdf(batch.items, batch.batchNumber)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                          title="Descargar este lote en PDF (.pdf)"
                        >
                          <FileDown className="h-3.5 w-3.5 text-amber-600" />
                          <span>PDF</span>
                        </button>

                        {/* Botón Desplegar / Ocultar */}
                        <button
                          onClick={() => toggleBatch(batch.batchNumber)}
                          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                            isExpanded
                              ? "bg-slate-900 text-white shadow-xs"
                              : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100/80"
                          }`}
                        >
                          <span>{isExpanded ? "Ocultar Llaveros" : "Desplegar Llaveros"}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 text-amber-400" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-amber-700" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Contenido Desplegable: Grilla de Códigos QR del Lote */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/40 p-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {batch.items.map((kc) => (
                            <div
                              key={kc.id}
                              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle transition hover:border-amber-400 hover:shadow-md"
                            >
                              <div>
                                {/* Código QR renderizado en contenedor */}
                                <div className="relative flex aspect-square w-full items-center justify-center rounded-xl bg-slate-50 p-4 border border-slate-100 group-hover:bg-amber-50/20 transition">
                                  {kc.qrDataUrl ? (
                                    <img
                                      src={kc.qrDataUrl}
                                      alt={kc.token}
                                      className="h-full w-full object-contain"
                                    />
                                  ) : (
                                    <QrCode className="h-16 w-16 text-slate-300" />
                                  )}

                                  {/* Botón Ver Ficha Detallada */}
                                  <button
                                    onClick={() => setSelectedQrPreview(kc)}
                                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/0 opacity-0 transition group-hover:bg-slate-900/60 group-hover:opacity-100 text-white font-bold text-xs gap-1.5"
                                  >
                                    <Eye className="h-4 w-4 text-amber-400" />
                                    <span>Ver Ficha</span>
                                  </button>
                                </div>

                                {/* Ficha técnica del QR */}
                                <div className="mt-3 space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono text-xs font-bold text-slate-900 truncate" title={kc.token}>
                                      {kc.token}
                                    </span>
                                    <button
                                      onClick={() => copyToClipboard(kc.token, kc.token)}
                                      className="text-slate-400 hover:text-slate-700"
                                      title="Copiar token"
                                    >
                                      {copiedToken === kc.token ? (
                                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                  </div>

                                  <div className="text-[11px] font-medium text-slate-600 truncate">
                                    {kc.store?.name || "Sin Comercio Asignado"}
                                  </div>

                                  <div className="flex items-center justify-between pt-1">
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {kc.batchNumber || "SIN-LOTE"}
                                    </span>
                                    {kc.status === "ACTIVATED_USER" ? (
                                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-100">
                                        Activo
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-100">
                                        En Mostrador
                                      </span>
                                    )}
                                  </div>

                                  {kc.customer && (
                                    <div className="text-[10px] text-slate-500 pt-0.5 truncate">
                                      Titular: <span className="font-semibold text-slate-700">{kc.customer.name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Acciones de la tarjeta */}
                              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                <a
                                  href={kc.qrDataUrl}
                                  download={`${kc.token}.png`}
                                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition"
                                  title="Descargar imagen PNG individual"
                                >
                                  <Download className="h-3 w-3 text-slate-400" />
                                  <span>PNG</span>
                                </a>

                                <Link
                                  href={`/kuri/${kc.token}`}
                                  target="_blank"
                                  className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 transition"
                                  title="Probar resolución polimórfica en nueva pestaña"
                                >
                                  <span>Probar</span>
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* VISTA DE GRILLA CONTINUA (FLAT) */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredKeychains.map((kc) => (
                <div
                  key={kc.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle transition hover:border-amber-400 hover:shadow-md"
                >
                  <div>
                    {/* Código QR renderizado en contenedor */}
                    <div className="relative flex aspect-square w-full items-center justify-center rounded-xl bg-slate-50 p-4 border border-slate-100 group-hover:bg-amber-50/20 transition">
                      {kc.qrDataUrl ? (
                        <img
                          src={kc.qrDataUrl}
                          alt={kc.token}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <QrCode className="h-16 w-16 text-slate-300" />
                      )}

                      {/* Botón Ver Ficha Detallada */}
                      <button
                        onClick={() => setSelectedQrPreview(kc)}
                        className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/0 opacity-0 transition group-hover:bg-slate-900/60 group-hover:opacity-100 text-white font-bold text-xs gap-1.5"
                      >
                        <Eye className="h-4 w-4 text-amber-400" />
                        <span>Ver Ficha Completa</span>
                      </button>
                    </div>

                    {/* Ficha técnica del QR */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 truncate" title={kc.token}>
                          {kc.token}
                        </span>
                        <button
                          onClick={() => copyToClipboard(kc.token, kc.token)}
                          className="text-slate-400 hover:text-slate-700"
                          title="Copiar token"
                        >
                          {copiedToken === kc.token ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="text-[11px] font-medium text-slate-600 truncate">
                        {kc.store?.name || "Sin Comercio Asignado"}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {kc.batchNumber || "SIN-LOTE"}
                        </span>
                        {kc.status === "ACTIVATED_USER" ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-100">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-100">
                            En Mostrador
                          </span>
                        )}
                      </div>

                      {kc.customer && (
                        <div className="text-[10px] text-slate-500 pt-0.5 truncate">
                          Titular: <span className="font-semibold text-slate-700">{kc.customer.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones de la tarjeta */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={kc.qrDataUrl}
                      download={`${kc.token}.png`}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition"
                      title="Descargar imagen PNG individual"
                    >
                      <Download className="h-3 w-3 text-slate-400" />
                      <span>PNG</span>
                    </a>

                    <Link
                      href={`/kuri/${kc.token}`}
                      target="_blank"
                      className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 transition"
                      title="Probar resolución polimórfica en nueva pestaña"
                    >
                      <span>Probar Escaneo</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ================= MODAL: FICHA DETALLADA DE LLAVERO QR ================= */}
      {selectedQrPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-md rounded-3xl bg-white p-7 shadow-elevated">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Ficha de Llavero</span>
                <h3 className="text-base font-bold text-slate-900">Código QR Permanente</h3>
              </div>
              <button
                onClick={() => setSelectedQrPreview(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 flex flex-col items-center text-center">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <img
                  src={selectedQrPreview.qrDataUrl}
                  alt={selectedQrPreview.token}
                  className="h-52 w-52 object-contain"
                />
              </div>

              <div className="mt-4 font-mono text-sm font-black text-slate-900">
                {selectedQrPreview.token}
              </div>

              <div className="mt-1 text-xs font-semibold text-slate-700">
                {selectedQrPreview.store?.name || "Sin Comercio Asignado"}
              </div>

              <div className="mt-3 flex items-center gap-2">
                {selectedQrPreview.status === "ACTIVATED_USER" ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-100">
                    Llavero Activado por Cliente
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-100">
                    Disponible en Mostrador
                  </span>
                )}
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 font-mono">
                  {selectedQrPreview.batchNumber}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Cliente Titular:</span>
                <span className="font-semibold text-slate-800">
                  {selectedQrPreview.customer ? selectedQrPreview.customer.name : "Pendiente de Activación"}
                </span>
              </div>
              {selectedQrPreview.customer?.email && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Correo Electrónico:</span>
                  <span className="font-mono text-slate-800">{selectedQrPreview.customer.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">URL Permanente:</span>
                <span className="font-mono text-slate-800 truncate max-w-[200px]">
                  {selectedQrPreview.qrTargetUrl || `/kuri/${selectedQrPreview.token}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fecha Emisión:</span>
                <span className="text-slate-800">
                  {new Date(selectedQrPreview.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <a
                href={selectedQrPreview.qrDataUrl}
                download={`${selectedQrPreview.token}.png`}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-center text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
              >
                Descargar PNG
              </a>
              <Link
                href={`/kuri/${selectedQrPreview.token}`}
                target="_blank"
                className="flex-1 rounded-xl bg-slate-900 py-2.5 text-center text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Probar Escaneo
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: REGISTRAR NUEVO COMERCIO & CREDENCIALES ================= */}
      {showCreateStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-xl rounded-3xl bg-white p-7 shadow-elevated">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Alta de Comercio</span>
                <h3 className="text-lg font-bold text-slate-900">Registrar Negocio y Credenciales</h3>
              </div>
              <button
                onClick={() => setShowCreateStoreModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {createStoreMsg && (
              <div className={`mt-4 rounded-xl p-3 text-xs ${
                createStoreMsg.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-rose-200 bg-rose-50 text-rose-800"
              }`}>
                {createStoreMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateStore} className="mt-5 space-y-5">
              
              {/* Sección 1: Información Comercial */}
              <div>
                <div className="text-xs font-bold uppercase text-slate-400 mb-2.5">1. Datos del Negocio</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Nombre del Comercio *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Boutique del Café"
                      value={newStore.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
                        setNewStore({ ...newStore, name, slug });
                      }}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Identificador URL (Slug) *</label>
                    <input
                      type="text"
                      required
                      placeholder="boutique-del-cafe"
                      value={newStore.slug}
                      onChange={(e) => setNewStore({ ...newStore, slug: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Categoría</label>
                    <input
                      type="text"
                      value={newStore.category}
                      onChange={(e) => setNewStore({ ...newStore, category: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="+593 99 123 4567"
                      value={newStore.phone}
                      onChange={(e) => setNewStore({ ...newStore, phone: e.target.value, whatsapp: e.target.value.replace(/\D/g, "") })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-700">Dirección Física</label>
                  <input
                    type="text"
                    placeholder="Av. Principal y Calle 5, Local 2"
                    value={newStore.address}
                    onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sección 2: Credenciales de Acceso para el Dueño */}
              <div className="border-t border-slate-100 pt-4">
                <div className="text-xs font-bold uppercase text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-amber-600" />
                  <span>2. Credenciales de Acceso del Propietario</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Nombre del Propietario</label>
                    <input
                      type="text"
                      placeholder="Ej. Roberto Gómez"
                      value={newStore.ownerName}
                      onChange={(e) => setNewStore({ ...newStore, ownerName: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Correo Electrónico (Login) *</label>
                    <input
                      type="email"
                      required
                      placeholder="roberto@boutiquecafe.com"
                      value={newStore.ownerEmail}
                      onChange={(e) => setNewStore({ ...newStore, ownerEmail: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-700">Contraseña de Acceso Inicial *</label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={newStore.ownerPassword}
                    onChange={(e) => setNewStore({ ...newStore, ownerPassword: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">El comerciante usará este correo y contraseña para entrar a su panel privado</span>
                </div>
              </div>

              {/* Nota Informativa sobre Campaña y Suscripción */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-800">Campaña y Suscripción Automatizadas</p>
                    <p className="text-[11px] leading-relaxed text-slate-600">
                      La campaña se preconfigura automáticamente. Podrás <strong className="text-slate-900 font-semibold">activar y calendarizar la suscripción mensual</strong> de este negocio directamente desde la lista de comercios eligiendo la fecha en el calendario.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateStoreModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createStoreLoading}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {createStoreLoading ? "Creando Comercio..." : "Registrar Comercio y Acceso"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL: ACTIVAR Y CONFIGURAR SUSCRIPCIÓN CON CALENDARIO ================= */}
      {editSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-lg rounded-3xl bg-white p-7 shadow-elevated">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Facturación & Control</span>
                <h3 className="text-lg font-bold text-slate-900">Activar y Configurar Suscripción</h3>
                <p className="text-xs text-slate-500 font-medium">{editSubForm.storeName}</p>
              </div>
              <button
                onClick={() => setEditSubModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {subActionMsg && (
              <div className={`mt-4 rounded-xl p-3 text-xs ${
                subActionMsg.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-rose-200 bg-rose-50 text-rose-800"
              }`}>
                {subActionMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveSubscription} className="mt-5 space-y-4">
              
              {/* Selector de Estado del Servicio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Estado del Servicio KURI *</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditSubForm({ ...editSubForm, subscriptionStatus: "ACTIVE" })}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${
                      editSubForm.subscriptionStatus === "ACTIVE"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <CheckCircle2 className={`h-4 w-4 ${editSubForm.subscriptionStatus === "ACTIVE" ? "text-emerald-600" : "text-slate-400"}`} />
                    <div>
                      <div className="text-xs font-bold">Activo</div>
                      <div className="text-[10px] text-slate-500">Vitrina y POS operativos</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditSubForm({ ...editSubForm, subscriptionStatus: "SUSPENDED" })}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${
                      editSubForm.subscriptionStatus === "SUSPENDED"
                        ? "border-rose-300 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Ban className={`h-4 w-4 ${editSubForm.subscriptionStatus === "SUSPENDED" ? "text-rose-600" : "text-slate-400"}`} />
                    <div>
                      <div className="text-xs font-bold">Suspendido</div>
                      <div className="text-[10px] text-slate-500">Bloqueo por falta de pago</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Tarifa Mensual con Botones Rápidos */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Mensualidad Acordada ($ USD) *</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editSubForm.monthlyFee}
                    onChange={(e) => setEditSubForm({ ...editSubForm, monthlyFee: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 pl-7 pr-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Planes sugeridos:</span>
                  {[19, 29, 39, 49, 99].map((fee) => (
                    <button
                      key={fee}
                      type="button"
                      onClick={() => setEditSubForm({ ...editSubForm, monthlyFee: fee })}
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition ${
                        editSubForm.monthlyFee === fee
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      ${fee}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector con Calendario para Fecha de Próximo Cobro */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    <span>Fecha de Próximo Cobro (Calendario) *</span>
                  </label>
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                    Día de corte: {editSubForm.billingDueDay}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="date"
                    required
                    value={editSubForm.nextBillingDate}
                    onChange={(e) => {
                      const dStr = e.target.value;
                      const parts = dStr.split("-");
                      const day = parts.length === 3 ? parseInt(parts[2], 10) : 1;
                      setEditSubForm({
                        ...editSubForm,
                        nextBillingDate: dStr,
                        billingDueDay: !isNaN(day) ? day : 1,
                      });
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:outline-none shadow-xs"
                  />
                </div>

                {/* Accesos Rápidos de Calendario */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400">Atajos rápidos:</span>
                  <button
                    type="button"
                    onClick={() => setDateShortcut("15days")}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-100 transition shadow-xs"
                  >
                    +15 Días
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateShortcut("30days")}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-100 transition shadow-xs"
                  >
                    +30 Días
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateShortcut("nextMonthFirst")}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-100 transition shadow-xs"
                  >
                    1° del Próximo Mes
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateShortcut("endOfMonth")}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-100 transition shadow-xs"
                  >
                    Fin de Mes
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                  Si no se registra el cobro antes de la fecha programada en el calendario, el sistema suspenderá automáticamente la vitrina web y las operaciones en caja POS.
                </p>
              </div>

              {/* Notas Administrativas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Notas de Acuerdo / Facturación</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Plan acordado con periodo de prueba hasta la fecha seleccionada..."
                  value={editSubForm.subscriptionNotes}
                  onChange={(e) => setEditSubForm({ ...editSubForm, subscriptionNotes: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditSubModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={subActionLoading}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 shadow-sm"
                >
                  {subActionLoading ? "Guardando..." : "Guardar y Activar Suscripción"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REGISTRAR PAGO DE MENSUALIDAD ================= */}
      {recordPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-md rounded-3xl bg-white p-7 shadow-elevated">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Recaudación KURI</span>
                <h3 className="text-lg font-bold text-slate-900">Registrar Pago de Mensualidad</h3>
                <p className="text-xs text-slate-500">{paymentForm.storeName}</p>
              </div>
              <button
                onClick={() => setRecordPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {subActionMsg && (
              <div className={`mt-4 rounded-xl p-3 text-xs ${
                subActionMsg.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-rose-200 bg-rose-50 text-rose-800"
              }`}>
                {subActionMsg.text}
              </div>
            )}

            <form onSubmit={handleRecordPaymentSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Monto del Pago ($ USD) *</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 pl-7 pr-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Método de Pago *</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                >
                  <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                  <option value="TARJETA">Tarjeta de Crédito / Débito</option>
                  <option value="EFECTIVO">Efectivo / Caja</option>
                  <option value="DEPOSITO">Depósito Bancario</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Código de Referencia / Comprobante</label>
                <input
                  type="text"
                  placeholder="Ej. TRF-1928392"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Periodo Cubierto</label>
                <input
                  type="text"
                  placeholder="Ej. Octubre 2026"
                  value={paymentForm.periodCovered}
                  onChange={(e) => setPaymentForm({ ...paymentForm, periodCovered: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Notas / Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej. Comprobante verificado en banco"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-[11px] text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Al registrar el cobro, el comercio se reactivará automáticamente y su fecha de corte se extenderá 1 mes.</span>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRecordPaymentModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={subActionLoading}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {subActionLoading ? "Registrando..." : "Confirmar y Reactivar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDITAR INFORMACIÓN DE COMERCIO (HU-009) ================= */}
      {isEditStoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-3xl bg-white p-7 shadow-elevated max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Gestión de Comercios</span>
                <h3 className="text-lg font-bold text-slate-900">Editar Información del Comercio</h3>
                <p className="text-xs text-slate-500 font-medium">{editStoreForm.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditStoreModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {editStoreError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{editStoreError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditStore} className="mt-5 space-y-4 text-xs">
              
              {/* Bloque 1: Identidad */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs border-b border-slate-100 pb-1">
                  <Building2 className="h-3.5 w-3.5 text-slate-500" />
                  <span>Datos Principales</span>
                </h4>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Nombre del Comercio *</label>
                    <input
                      type="text"
                      required
                      value={editStoreForm.name}
                      onChange={(e) => setEditStoreForm({ ...editStoreForm, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
                    <input
                      type="text"
                      value={editStoreForm.category}
                      onChange={(e) => setEditStoreForm({ ...editStoreForm, category: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Eslogan / Tagline</label>
                    <input
                      type="text"
                      value={editStoreForm.tagLine}
                      onChange={(e) => setEditStoreForm({ ...editStoreForm, tagLine: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Descripción del Negocio</label>
                    <textarea
                      rows={2}
                      value={editStoreForm.description}
                      onChange={(e) => setEditStoreForm({ ...editStoreForm, description: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 2: Redes Sociales */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs border-b border-slate-100 pb-1">
                  <Globe className="h-3.5 w-3.5 text-slate-500" />
                  <span>Redes Sociales & Contacto</span>
                </h4>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <FacebookIcon className="h-3 w-3 text-blue-600" />
                      <span>Facebook</span>
                    </label>
                    <input
                      type="text"
                      value={editStoreForm.facebook}
                      onChange={(e) => setEditStoreForm({ ...editStoreForm, facebook: e.target.value })}
                      placeholder="https://facebook.com/..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <InstagramIcon className="h-3 w-3 text-pink-600" />
                      <span>Instagram</span>
                    </label>
                    <input
                      type="text"
                      value={editStoreForm.instagram}
                      onChange={(e) => setEditStoreForm({ ...editStoreForm, instagram: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <WhatsAppIcon className="h-3 w-3 text-emerald-600" />
                      <span>WhatsApp</span>
                    </label>
                    <input
                      type="text"
                      value={editStoreForm.whatsapp}
                      onChange={(e) => setEditStoreForm({ ...editStoreForm, whatsapp: e.target.value })}
                      placeholder="593991122334"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-amber-600" />
                      <span>Correo</span>
                    </label>
                    <input
                      type="email"
                      value={editStoreForm.email}
                      onChange={(e) => setEditStoreForm({ ...editStoreForm, email: e.target.value })}
                      placeholder="hola@negocio.com"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-slate-600" />
                      <span>Teléfono</span>
                    </label>
                    <input
                      type="text"
                      value={editStoreForm.phone}
                      onChange={(e) => setEditStoreForm({ ...editStoreForm, phone: e.target.value })}
                      placeholder="+593 2 290 4455"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 3: Ubicación & Maps */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs border-b border-slate-100 pb-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-600" />
                  <span>Ubicación & Google Maps</span>
                </h4>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Dirección Física</label>
                    <input
                      type="text"
                      value={editStoreForm.address}
                      onChange={(e) => setEditStoreForm({ ...editStoreForm, address: e.target.value })}
                      placeholder="Av. Amazonas y República, Quito"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <GoogleMapsIcon className="h-3 w-3 text-rose-500" />
                      <span>Link de Maps</span>
                    </label>
                    <input
                      type="url"
                      value={editStoreForm.mapUrl}
                      onChange={(e) => setEditStoreForm({ ...editStoreForm, mapUrl: e.target.value })}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 4: Logo y Portada */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs border-b border-slate-100 pb-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Imágenes del Comercio</span>
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  <ImageUploader
                    label="Logotipo del Comercio"
                    currentUrl={editStoreForm.logoUrl}
                    onImageUploaded={(url) => setEditStoreForm((prev) => ({ ...prev, logoUrl: url }))}
                    folder="kuri/logos"
                    aspectRatio="square"
                    description="Imagen cuadrada oficial (SVG o PNG transparente)"
                  />

                  <ImageUploader
                    label="Portada / Banner"
                    currentUrl={editStoreForm.bannerUrl}
                    onImageUploaded={(url) => setEditStoreForm((prev) => ({ ...prev, bannerUrl: url }))}
                    folder="kuri/banners"
                    aspectRatio="wide"
                    description="Banner horizontal para la vitrina del comercio"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditStoreModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editStoreSaving}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  {editStoreSaving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
