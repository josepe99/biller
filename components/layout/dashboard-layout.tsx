"use client";

import { openCheckout, closeCheckout } from "@/lib/actions/cashRegisterActions";
import { useCashRegister } from "@/components/checkout/CashRegisterContext";
import { getSettingsByNameAction } from "@/lib/actions/settingActions";
import { SessionValidator } from "@/components/auth/session-validator";
import { getLowStockCountAction } from "@/lib/actions/productActions";
import { LayoutDashboard, ShoppingCart, Package } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import CloseCashRegisterModal from "./CloseCashRegisterModal";
import OpenCashRegisterModal from "./OpenCashRegisterModal";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Clock } from "@/components/ui/clock";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { LOGO } from "@/settings";
import Image from "next/image";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { permissions } = useAuth();

  const [lowStockCount, setLowStockCount] = useState(0);
  const { user } = useAuth();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const { cashRegister, setCashRegister } = useCashRegister();
  const [isCloseModal, setIsCloseModal] = useState(false);
  const [businessSetting, setBusinessSetting] = useState<any>(null);
  const [businessSettingLoaded, setBusinessSettingLoaded] = useState(false);

  /*
   * OPTIMIZACIÓN DE CONFIGURACIÓN DEL NEGOCIO
   * - Usa localStorage para cachear la configuración y evitar cargas repetidas
   * - Carga la configuración solo una vez por sesión
   * - Muestra inmediatamente datos cacheados para mejorar UX
   * - Reduce llamadas innecesarias a la API
   */

  // Cargar configuración desde localStorage al inicializar
  const cachedBusinessSetting = useMemo(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("business_setting");
      return cached ? JSON.parse(cached) : null;
    }
    return null;
  }, []);

  // Función para cargar configuración solo una vez
  const loadBusinessSetting = useCallback(async () => {
    if (!businessSettingLoaded) {
      try {
        const setting = await getSettingsByNameAction("business_setting");
        if (setting) {
          setBusinessSetting(setting);
          localStorage.setItem("business_setting", JSON.stringify(setting));
        }
      } catch (error) {
        console.error("Error loading business setting:", error);
      } finally {
        setBusinessSettingLoaded(true);
      }
    }
  }, [businessSettingLoaded]);

  // Usar configuración cacheada inmediatamente si existe
  useEffect(() => {
    if (cachedBusinessSetting && !businessSetting) {
      setBusinessSetting(cachedBusinessSetting);
    }
  }, [cachedBusinessSetting, businessSetting]);

  useEffect(() => {
    const fetchData = async () => {
      // Cargar conteo de stock bajo siempre
      const lowStockCount = await getLowStockCountAction();
      setLowStockCount(lowStockCount);

      // Cargar configuración solo si no está cargada
      if (!businessSetting && !businessSettingLoaded) {
        await loadBusinessSetting();
      }
    };

    fetchData();
  }, [businessSetting, businessSettingLoaded, loadBusinessSetting]);

  // Usar useMemo para optimizar los valores que se muestran
  const { businessLogo, businessName } = useMemo(
    () => ({
      businessLogo: businessSetting?.values?.logo || LOGO,
      businessName: businessSetting?.values?.name
        ? `${businessSetting.values.name} - Biller`
        : "Biller",
    }),
    [businessSetting]
  );

  const getActiveModule = () => {
    if (pathname.includes("/admin")) return "admin";
    if (pathname.includes("/stock")) return "inventory";
    if (pathname.includes("/cash-registers")) return "cash-registers";
    if (pathname.includes("/customers")) return "customers";
    return "billing";
  };

  const activeModule = getActiveModule();

  // Handler para apertura de caja
  const handleSubmit = async ({
    initialCash,
    openingNotes,
    checkoutId,
  }: {
    initialCash: number;
    openingNotes?: string;
    checkoutId: string;
  }) => {
    setLoadingOpen(true);
    try {
      if (!user) throw new Error("Usuario no autenticado");
      const params = {
        checkoutId,
        openedById: user.id,
        initialCash,
        openingNotes,
        openedAt: new Date(),
      };
      const result = await openCheckout(params);
      setCashRegister(result);
      setIsOpenModal(false);
    } catch (e) {
      alert("Error al abrir caja");
    } finally {
      setLoadingOpen(false);
    }
  };

  // Handler para cerrar caja
  // Handler para cerrar caja usando el modal
  const handleCloseCashRegister = async ({
    finalAmounts,
    closingNotes,
  }: {
    finalAmounts: Record<string, number>;
    closingNotes?: string;
  }) => {
    if (!user || !cashRegister) return;
    setLoadingOpen(true);
    try {
      await closeCheckout({
        id: cashRegister.id,
        closedById: user.id,
        finalAmounts,
        closingNotes: closingNotes || undefined,
        closedAt: new Date(),
      });
      setCashRegister(null);
      setIsCloseModal(false);
    } catch (e) {
      alert("Error al cerrar caja");
    } finally {
      setLoadingOpen(false);
    }
  };

  return (
    <>
      <SessionValidator />
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-20 bg-white border-r shadow-md flex flex-col items-center py-6 space-y-6">
          <div className="mb-6">
            <Image src={LOGO} alt="Biller Logo" width={40} height={40} />
          </div>
          <nav className="flex flex-col items-center space-y-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className={`relative h-14 w-14 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:bg-gray-100 ${
                  activeModule === "billing"
                    ? "bg-orange-100 text-orange-700"
                    : ""
                }`}
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="text-xs mt-1">Facturar</span>
              </Button>
            </Link>
            {/* Customers link */}
            <Link href="/customers">
              <Button
                variant="ghost"
                size="icon"
                className={`relative h-14 w-14 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:bg-gray-100 ${
                  activeModule === "customers"
                    ? "bg-orange-100 text-orange-700"
                    : ""
                }`}
              >
                <span className="h-6 w-6 flex items-center justify-center">
                  {/* You can replace this SVG with a user icon if you have one */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9A3.75 3.75 0 1 1 8.25 9a3.75 3.75 0 0 1 7.5 0ZM4.5 19.5a7.5 7.5 0 0 1 15 0v.75a.75.75 0 0 1-.75.75h-13.5a.75.75 0 0 1-.75-.75V19.5Z"
                    />
                  </svg>
                </span>
                <span className="text-xs mt-1">Clientes</span>
              </Button>
            </Link>
            {permissions.includes("inventory:manage") && (
              <Link href="/stock">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`relative h-14 w-14 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:bg-gray-100 ${
                    activeModule === "inventory"
                      ? "bg-orange-100 text-orange-700"
                      : ""
                  }`}
                >
                  <Package className="h-6 w-6" />
                  <span className="text-xs mt-1">Stock</span>
                  {lowStockCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full text-xs"
                    >
                      {lowStockCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            {permissions.includes("cashRegister:manage") && (
              <Link href="/cash-registers">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`relative h-14 w-14 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:bg-gray-100 ${
                    activeModule === "cash-registers"
                      ? "bg-orange-100 text-orange-700"
                      : ""
                  }`}
                >
                  <span className="h-6 w-6 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <rect
                        x="4"
                        y="7"
                        width="16"
                        height="10"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V5a4 4 0 018 0v2"
                      />
                    </svg>
                  </span>
                  <span className="text-xs mt-1">Cierres</span>
                </Button>
              </Link>
            )}
            <Link href="/admin">
              <Button
                variant="ghost"
                size="icon"
                className={`relative h-14 w-14 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:bg-gray-100 ${
                  activeModule === "admin"
                    ? "bg-orange-100 text-orange-700"
                    : ""
                }`}
              >
                <LayoutDashboard className="h-6 w-6" />
                <span className="text-xs mt-1">Admin</span>
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-6">
            <div className="flex items-center space-x-3">
              <Image
                src={businessLogo}
                alt="POS Icon"
                width={25}
                height={25}
                priority
              />
              <h1 className="text-xl font-semibold text-orange-500">
                {businessName}
              </h1>
            </div>
            <div className="flex items-center space-x-4 text-gray-600">
              {!cashRegister ? (
                <>
                  <span>
                    <Badge variant="destructive">Caja cerrada</Badge>
                  </span>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    size="sm"
                    onClick={() => setIsOpenModal(true)}
                  >
                    Abrir caja
                  </Button>
                </>
              ) : (
                <>
                  <span>
                    <Badge variant="default">Caja abierta</Badge>
                  </span>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white ml-2"
                    size="sm"
                    onClick={() => setIsCloseModal(true)}
                  >
                    Cerrar caja
                  </Button>
                  <CloseCashRegisterModal
                    open={isCloseModal}
                    onOpenChange={setIsCloseModal}
                    loading={loadingOpen}
                    onSubmit={handleCloseCashRegister}
                  />
                </>
              )}
              <OpenCashRegisterModal
                open={isOpenModal}
                onOpenChange={setIsOpenModal}
                loading={loadingOpen}
                onSubmit={handleSubmit}
              />
              <Clock showDate={true} />
              <LogoutButton
                variant="outline"
                size="sm"
                className="border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                Cerrar Sesión
              </LogoutButton>
            </div>
          </header>

          {/* Module Content */}
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </>
  );
}
