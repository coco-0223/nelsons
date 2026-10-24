"use client";

import { useState, useEffect } from "react";
import { Settings, PaymentMethod, DeliveryDay } from "@/types";

const DAYS_OF_WEEK = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function AdminSettings() {
  const [settings, setSettings] = useState<Partial<Settings>>({
    paymentMethods: [],
    deliveryDays: []
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("coquetas_settings");
    if (stored) {
      setSettings(JSON.parse(stored));
    }
    setIsLoaded(true);
  }, []);

  const saveSettings = (newSettings: Partial<Settings>) => {
    setSettings(newSettings);
    localStorage.setItem("coquetas_settings", JSON.stringify(newSettings));
  };

  const addPaymentMethod = () => {
    const methods = settings.paymentMethods || [];
    saveSettings({
      ...settings,
      paymentMethods: [...methods, { id: Date.now().toString(), name: "Nuevo Método", active: true }]
    });
  };

  const updatePaymentMethod = (index: number, updates: Partial<PaymentMethod>) => {
    const methods = [...(settings.paymentMethods || [])];
    methods[index] = { ...methods[index], ...updates };
    saveSettings({ ...settings, paymentMethods: methods });
  };

  const removePaymentMethod = (index: number) => {
    const methods = [...(settings.paymentMethods || [])];
    methods.splice(index, 1);
    saveSettings({ ...settings, paymentMethods: methods });
  };

  const addDeliveryDay = (dayIndex: number) => {
    const days = settings.deliveryDays || [];
    if (!days.find(d => d.dayOfWeek === dayIndex)) {
      saveSettings({
        ...settings,
        deliveryDays: [...days, { dayOfWeek: dayIndex, active: true, timeSlots: [{ start: "10:00", end: "14:00" }] }]
      });
    }
  };

  const updateDeliveryDay = (index: number, updates: Partial<DeliveryDay>) => {
    const days = [...(settings.deliveryDays || [])];
    days[index] = { ...days[index], ...updates };
    saveSettings({ ...settings, deliveryDays: days });
  };

  const addTimeSlot = (dayIndex: number) => {
    const days = [...(settings.deliveryDays || [])];
    days[dayIndex].timeSlots.push({ start: "19:00", end: "23:00" });
    saveSettings({ ...settings, deliveryDays: days });
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const days = [...(settings.deliveryDays || [])];
    days[dayIndex].timeSlots.splice(slotIndex, 1);
    saveSettings({ ...settings, deliveryDays: days });
  };

  if (!isLoaded) return <div className="p-8 text-gray-500">Cargando...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Configuración del Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">💳 Métodos de Pago</h2>
            <button 
              onClick={addPaymentMethod}
              className="bg-[var(--primary)] text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-[var(--secondary)]"
            >
              + Añadir
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Los clientes seleccionarán cómo pagarán al hacer el checkout. Los pagos no se procesan en la web, son a modo informativo.
          </p>

          <div className="space-y-4">
            {(settings.paymentMethods || []).map((pm, idx) => (
              <div key={pm.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <input
                  type="text"
                  value={pm.name}
                  onChange={(e) => updatePaymentMethod(idx, { name: e.target.value })}
                  className="flex-1 p-2 border border-gray-200 rounded-lg outline-none focus:border-[var(--primary)] text-gray-900 bg-white"
                  placeholder="Ej: Transferencia / Efectivo"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-gray-600">Activo</span>
                  <input 
                    type="checkbox" 
                    checked={pm.active} 
                    onChange={(e) => updatePaymentMethod(idx, { active: e.target.checked })}
                    className="accent-[var(--primary)] w-5 h-5"
                  />
                </label>
                <button onClick={() => removePaymentMethod(idx)} className="text-red-500 font-bold hover:bg-red-50 p-2 rounded-lg">
                  X
                </button>
              </div>
            ))}
            {!(settings.paymentMethods?.length) && (
              <div className="text-sm text-gray-400 text-center py-4 border border-dashed rounded-xl">No hay métodos de pago</div>
            )}
          </div>
        </div>

        {/* Delivery Schedules */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">🚚 Días y Horarios de Envío</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Configura qué días realizas envíos y en qué franjas horarias.
          </p>
          
          <div className="flex gap-2 mb-6 flex-wrap">
            {DAYS_OF_WEEK.map((day, idx) => {
              const isActive = (settings.deliveryDays || []).some(d => d.dayOfWeek === idx && d.active);
              return (
                <button
                  key={idx}
                  onClick={() => {
                    const existing = (settings.deliveryDays || []).find(d => d.dayOfWeek === idx);
                    if (existing) {
                      const dayIdx = (settings.deliveryDays || []).findIndex(d => d.dayOfWeek === idx);
                      updateDeliveryDay(dayIdx, { active: !existing.active });
                    } else {
                      addDeliveryDay(idx);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-bold border transition-colors ${isActive ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'}`}
                >
                  {day.slice(0, 3)}
                </button>
              )
            })}
          </div>

          <div className="space-y-4">
            {(settings.deliveryDays || []).filter(d => d.active).sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((dayConfig) => {
              // Find actual index in settings.deliveryDays
              const actualIdx = (settings.deliveryDays || []).findIndex(d => d.dayOfWeek === dayConfig.dayOfWeek);
              return (
                <div key={dayConfig.dayOfWeek} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-800">{DAYS_OF_WEEK[dayConfig.dayOfWeek]}</h3>
                    <button onClick={() => addTimeSlot(actualIdx)} className="text-[var(--primary)] text-sm font-bold hover:underline">+ Franja</button>
                  </div>
                  
                  <div className="space-y-2">
                    {dayConfig.timeSlots.map((slot, slotIdx) => (
                      <div key={slotIdx} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => {
                            const newSlots = [...dayConfig.timeSlots];
                            newSlots[slotIdx] = { ...newSlots[slotIdx], start: e.target.value };
                            updateDeliveryDay(actualIdx, { timeSlots: newSlots });
                          }}
                          className="flex-1 p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--primary)] text-gray-900 bg-white"
                        />
                        <span className="text-gray-500 font-bold">-</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => {
                            const newSlots = [...dayConfig.timeSlots];
                            newSlots[slotIdx] = { ...newSlots[slotIdx], end: e.target.value };
                            updateDeliveryDay(actualIdx, { timeSlots: newSlots });
                          }}
                          className="flex-1 p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--primary)] text-gray-900 bg-white"
                        />
                        <button onClick={() => removeTimeSlot(actualIdx, slotIdx)} className="text-red-500 font-bold hover:bg-red-50 px-3 py-1 rounded-lg">
                          X
                        </button>
                      </div>
                    ))}
                    {dayConfig.timeSlots.length === 0 && (
                       <div className="text-xs text-gray-400">Sin franjas horarias</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
