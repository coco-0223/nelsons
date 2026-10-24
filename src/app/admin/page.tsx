"use client";

import { useState, useEffect } from "react";
import { Settings } from "@/types";

export default function AdminDashboard() {
  const [settings, setSettings] = useState<Partial<Settings>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("coquetas_settings");
    if (stored) {
      setSettings(JSON.parse(stored));
    }
    setIsLoaded(true);
  }, []);

  const handleToggle = (field: keyof Settings) => {
    const updated = { ...settings, [field]: !settings[field] };
    setSettings(updated);
    localStorage.setItem("coquetas_settings", JSON.stringify(updated));
  };

  if (!isLoaded) return <div className="p-8 text-gray-500">Cargando dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-2">Ventas de Hoy</h3>
          <p className="text-3xl font-bold text-gray-800">$0</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-2">Pedidos Pendientes</h3>
          <p className="text-3xl font-bold text-gray-800">0</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 font-medium mb-2">Pizzas & Focaccias Vendidas</h3>
          <p className="text-3xl font-bold text-[var(--primary)]">{settings.totalEmpanadasSold || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            🚀 Módulo de Fidelización
          </h2>
          <div className="space-y-4">
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <h4 className="font-bold text-gray-800">Catálogo de Premios y Cupones</h4>
                <p className="text-sm text-gray-500 mb-3">Administrá los premios por puntos y los cupones promocionales independientes.</p>
                <div className="flex gap-2">
                  <a 
                    href="/admin/prizes" 
                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition-colors"
                  >
                    Premios (Puntos)
                  </a>
                  <a 
                    href="/admin/coupons" 
                    className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[var(--secondary)] transition-colors shadow-sm"
                  >
                    Cupones Promocionales &rarr;
                  </a>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={!!settings.marketing_allowCouponRedemption} onChange={() => handleToggle('marketing_allowCouponRedemption')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
              </label>
            </div>

            <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div>
                  <h4 className="font-bold text-gray-800">Premio Diario (Gamificación)</h4>
                  <p className="text-sm text-gray-500">Cofre sorpresa para que entren todos los días.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={!!settings.marketing_dailyPrizeActive} onChange={() => handleToggle('marketing_dailyPrizeActive')} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                </label>
              </div>
              {settings.marketing_dailyPrizeActive && (
                <div className="p-4 pt-0 border-t border-gray-100 grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Puntos Mínimos</label>
                    <input 
                      type="number" 
                      value={settings.marketing_dailyPrizeMin || 10}
                      onChange={(e) => {
                        const updated = { ...settings, marketing_dailyPrizeMin: parseInt(e.target.value) || 0 };
                        setSettings(updated);
                        localStorage.setItem("coquetas_settings", JSON.stringify(updated));
                      }}
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--primary)] text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Puntos Máximos</label>
                    <input 
                      type="number" 
                      value={settings.marketing_dailyPrizeMax || 50}
                      onChange={(e) => {
                        const updated = { ...settings, marketing_dailyPrizeMax: parseInt(e.target.value) || 0 };
                        setSettings(updated);
                        localStorage.setItem("coquetas_settings", JSON.stringify(updated));
                      }}
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--primary)] text-gray-900 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div>
                  <h4 className="font-bold text-gray-800">Sistema de Referidos</h4>
                  <p className="text-sm text-gray-500">Tus clientes ganan puntos invitando amigos.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={!!settings.marketing_referralsActive} onChange={() => handleToggle('marketing_referralsActive')} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                </label>
              </div>
              {settings.marketing_referralsActive && (
                <div className="p-4 pt-0 border-t border-gray-100 grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Premio para Invitador (Pts)</label>
                    <input 
                      type="number" 
                      value={settings.marketing_referralReferrerReward || 500}
                      onChange={(e) => {
                        const updated = { ...settings, marketing_referralReferrerReward: parseInt(e.target.value) || 0 };
                        setSettings(updated);
                        localStorage.setItem("coquetas_settings", JSON.stringify(updated));
                      }}
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--primary)] text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Premio para Invitado (Pts)</label>
                    <input 
                      type="number" 
                      value={settings.marketing_referralReferredReward || 500}
                      onChange={(e) => {
                        const updated = { ...settings, marketing_referralReferredReward: parseInt(e.target.value) || 0 };
                        setSettings(updated);
                        localStorage.setItem("coquetas_settings", JSON.stringify(updated));
                      }}
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--primary)] text-gray-900 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div>
                  <h4 className="font-bold text-gray-800">Pagar con Puntos en Carrito</h4>
                  <p className="text-sm text-gray-500">Permite descontar el total de la compra usando puntos como efectivo.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={!!settings.marketing_allowCheckoutDiscount} onChange={() => handleToggle('marketing_allowCheckoutDiscount')} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                </label>
              </div>
              {settings.marketing_allowCheckoutDiscount && (
                <div className="p-4 pt-0 border-t border-gray-100 mt-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Tasa de Ganancia: ¿Cuántos Puntos ganan al comprar?</label>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold">Ganan 1 Punto cada $</span>
                      <input 
                        type="number" 
                        value={settings.marketing_loyaltyEarnRate || 10}
                        onChange={(e) => {
                          const updated = { ...settings, marketing_loyaltyEarnRate: parseInt(e.target.value) || 0 };
                          setSettings(updated);
                          localStorage.setItem("coquetas_settings", JSON.stringify(updated));
                        }}
                        className="w-24 p-2 border border-gray-200 rounded-lg outline-none focus:border-[var(--primary)] text-gray-900 bg-white"
                      />
                      <span className="font-bold">gastados.</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Equivalencia de Canje: ¿Cuántos pesos vale 1 Punto?</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-bold">$</span>
                      <input 
                        type="number" 
                        value={settings.marketing_loyaltyPointsValue || 1}
                        onChange={(e) => {
                          const updated = { ...settings, marketing_loyaltyPointsValue: parseInt(e.target.value) || 0 };
                          setSettings(updated);
                          localStorage.setItem("coquetas_settings", JSON.stringify(updated));
                        }}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--primary)] text-gray-900 bg-white"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Si ponés 1, significa que 100 puntos descuentan $100.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <h4 className="font-bold text-gray-800">Cartel de Bienvenida (Inicio)</h4>
                <p className="text-sm text-gray-500">Muestra el seleccionador "Para Hoy" o "Programado" al entrar.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={!!settings.marketing_welcomeModal} onChange={() => handleToggle('marketing_welcomeModal')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
              </label>
            </div>

          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center">
          <p className="text-gray-400">Gráfico de ventas (Próximamente)</p>
        </div>
      </div>
    </div>
  );
}
