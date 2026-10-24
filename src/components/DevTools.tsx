"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Settings2, RefreshCw, CalendarDays, X, ChevronUp, ChevronDown } from "lucide-react";

declare global {
  interface Window {
    mockDay?: number;
  }
}

export function DevTools() {
  const { user, setUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mockDay, setMockDay] = useState<number | undefined>(undefined);
  
  // Is this production? We could hide it, but since it's a test task, we just show it.
  // In a real app, we'd check process.env.NODE_ENV === 'development'

  useEffect(() => {
    // Patch Date.prototype.getDay globally for testing
    const originalGetDay = Date.prototype.getDay;
    Date.prototype.getDay = function() {
      if (typeof window !== 'undefined' && window.mockDay !== undefined) {
        return window.mockDay;
      }
      return originalGetDay.call(this);
    };

    return () => {
      Date.prototype.getDay = originalGetDay;
    };
  }, []);

  const resetDailyReward = async () => {
    if (!user) {
      alert("Debés iniciar sesión primero.");
      return;
    }
    try {
      await updateDoc(doc(db, "users", user.uid), { lastDailyRewardClaim: 0 });
      if (setUser) setUser({ ...user, lastDailyRewardClaim: 0 });
      alert("Día reiniciado. Recargá la página (F5) para ver el Cofre Sorpresa.");
    } catch (err) {
      console.error(err);
      alert("Error al reiniciar el día.");
    }
  };

  const handleDayChange = (dayNum: number | undefined) => {
    setMockDay(dayNum);
    window.mockDay = dayNum;
    alert(dayNum === undefined ? "Día vuelto a la normalidad." : `Día simulado cambiado al índice ${dayNum}. Probá agregar cosas al carrito.`);
  };

  const days = [
    { num: 1, label: 'Lunes' }, { num: 2, label: 'Martes' }, { num: 3, label: 'Miércoles' },
    { num: 4, label: 'Jueves' }, { num: 5, label: 'Viernes' }, { num: 6, label: 'Sábado' }, { num: 0, label: 'Domingo' }
  ];

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[9999] bg-black text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-transform"
        title="Herramientas de Desarrollador"
      >
        <Settings2 size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-white border-2 border-black p-4 rounded-2xl shadow-2xl w-72 flex flex-col gap-4 font-mono text-sm">
      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
        <h4 className="font-bold flex items-center gap-2"><Settings2 size={16} /> DevTools (Test)</h4>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-black">
          <X size={16} />
        </button>
      </div>

      <button 
        onClick={resetDailyReward}
        className="flex items-center gap-2 bg-blue-100 text-blue-700 p-2 rounded-lg font-bold hover:bg-blue-200 transition-colors w-full justify-center"
      >
        <RefreshCw size={16} /> Reiniciar Día (Cofre)
      </button>

      <div className="space-y-2">
        <label className="flex items-center gap-2 font-bold text-gray-700">
          <CalendarDays size={16} /> Simular Día Actual
        </label>
        <select 
          value={mockDay === undefined ? "real" : mockDay}
          onChange={(e) => handleDayChange(e.target.value === "real" ? undefined : parseInt(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-lg outline-none font-bold text-black"
        >
          <option value="real">Día Real (Hoy)</option>
          {days.map(d => (
            <option key={d.num} value={d.num}>{d.label}</option>
          ))}
        </select>
      </div>
      
      <p className="text-[10px] text-gray-400 leading-tight">
        * Al cambiar el día, el carrito creerá que es ese día de la semana, lo que te permite testear si los cupones que vencen ciertos días funcionan.
      </p>
    </div>
  );
}
