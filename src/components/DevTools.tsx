"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserProfile, SUPERADMIN_EMAIL } from "@/types";
import { Settings2, RefreshCw, CalendarDays, X, Users, Shield, User, Award, LogOut } from "lucide-react";

declare global {
  interface Window {
    mockDay?: number;
  }
}

// Perfiles de prueba listos para usar con 1 clic
const MOCK_PROFILES: { label: string; desc: string; icon: any; color: string; profile: UserProfile }[] = [
  {
    label: "Super Admin",
    desc: "cocobustos.93@gmail.com (Acceso total a /admin)",
    icon: Shield,
    color: "bg-red-500 text-white",
    profile: {
      uid: "mock-admin-uid",
      email: SUPERADMIN_EMAIL,
      displayName: "Coco Bustos (Admin)",
      role: "admin",
      isClubMember: true,
      points: 9999,
      phone: "+541199999999",
      address: "Local Central Nelson's",
      neighborhood: "Palermo",
      apartment: "Admin",
      referralCode: "COCO-ADMIN",
      createdAt: Date.now() - 10000000,
    },
  },
  {
    label: "Cliente VIP (Club)",
    desc: "Miembro del Club con 1.450 puntos y cupones",
    icon: Award,
    color: "bg-[#FFC71F] text-[#0f2540]",
    profile: {
      uid: "mock-vip-uid",
      email: "cliente.vip@gmail.com",
      displayName: "Martín Palermo (VIP)",
      role: "customer",
      isClubMember: true,
      clubPlanId: "plan-mensual",
      points: 1450,
      phone: "+541155554444",
      address: "Av. Santa Fe 3420",
      neighborhood: "Palermo",
      apartment: "4 B",
      referralCode: "MARTIN-VIP",
      createdAt: Date.now() - 5000000,
      coupons: [
        {
          id: "coupon-mock-1",
          couponTemplateId: "tmpl-1",
          couponName: "20% OFF en Pizzas",
          code: "NELSON20",
          isUsed: false,
        },
        {
          id: "coupon-mock-2",
          couponTemplateId: "tmpl-2",
          couponName: "Focaccia de Regalo",
          code: "REGALO-FOCACCIA",
          isUsed: false,
        },
      ],
    },
  },
  {
    label: "Cliente Nuevo",
    desc: "Primerizo con 50 puntos de bienvenida",
    icon: User,
    color: "bg-blue-600 text-white",
    profile: {
      uid: "mock-new-uid",
      email: "cliente.nuevo@gmail.com",
      displayName: "Lucía Rossi",
      role: "customer",
      isClubMember: false,
      points: 50,
      phone: "+541133332222",
      address: "Gorriti 4800",
      neighborhood: "Palermo Soho",
      apartment: "1 A",
      referralCode: "LUCIA-NEW",
      createdAt: Date.now(),
    },
  },
];

export function DevTools() {
  const { user, setUser, switchMockUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mockDay, setMockDay] = useState<number | undefined>(undefined);

  useEffect(() => {
    const originalGetDay = Date.prototype.getDay;
    Date.prototype.getDay = function () {
      if (typeof window !== "undefined" && window.mockDay !== undefined) {
        return window.mockDay;
      }
      return originalGetDay.call(this);
    };

    return () => {
      Date.prototype.getDay = originalGetDay;
    };
  }, []);

  const handleDayChange = (dayNum: number | undefined) => {
    setMockDay(dayNum);
    window.mockDay = dayNum;
  };

  const days = [
    { num: 1, label: "Lunes" },
    { num: 2, label: "Martes" },
    { num: 3, label: "Miércoles" },
    { num: 4, label: "Jueves" },
    { num: 5, label: "Viernes" },
    { num: 6, label: "Sábado" },
    { num: 0, label: "Domingo" },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[9999] bg-[#0f2540] text-[#FFC71F] border-2 border-[#FFC71F] p-3 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-2 group cursor-pointer"
        title="Simulador de Usuarios y DevTools"
      >
        <Users size={22} />
        <span className="text-xs font-bold font-archivo pr-1 hidden sm:inline-block">
          {user ? (user.role === "admin" ? "Admin" : user.displayName?.split(" ")[0] || "Cliente") : "Switchear Usuario"}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-white border-2 border-[#0f2540] p-4 rounded-3xl shadow-2xl w-80 sm:w-96 flex flex-col gap-3 font-sans text-sm animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0f2540] text-[#FFC71F] flex items-center justify-center">
            <Users size={16} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 leading-none">Simulador de Usuarios</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Switcheá con 1 clic sin contraseñas</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Usuario Activo Actualmente */}
      <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
          Sesión Actual:
        </span>
        {user ? (
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-xs truncate">
                {user.displayName || user.email}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                Rol: <span className="font-bold uppercase text-[#24598d]">{user.role}</span> • {user.points} pts
              </p>
            </div>
            <button
              onClick={() => switchMockUser(null)}
              className="text-xs text-red-600 hover:bg-red-50 p-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              title="Cerrar sesión simulada"
            >
              <LogOut size={13} />
              <span>Salir</span>
            </button>
          </div>
        ) : (
          <div className="text-gray-500 text-xs flex items-center justify-between">
            <span>Visitante sin sesión (Anónimo)</span>
            <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full font-bold">Invitado</span>
          </div>
        )}
      </div>

      {/* Botones de Cambio Rápido */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
          Elegir Perfil de Prueba:
        </span>
        {MOCK_PROFILES.map((p) => {
          const Icon = p.icon;
          const isActive = user?.email?.toLowerCase() === p.profile.email.toLowerCase();

          return (
            <button
              key={p.label}
              onClick={() => {
                switchMockUser(p.profile);
              }}
              className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                isActive
                  ? "border-[#24598d] bg-blue-50/70 shadow-sm ring-2 ring-[#24598d]/20"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${p.color}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-xs">{p.label}</span>
                  {isActive && (
                    <span className="text-[10px] bg-[#24598d] text-white px-2 py-0.5 rounded-full font-bold">
                      Activo
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 truncate">{p.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Simulación del día (cupones por día de la semana) */}
      <div className="pt-2 border-t border-gray-100">
        <label className="flex items-center gap-1.5 font-bold text-gray-700 text-xs mb-1.5">
          <CalendarDays size={14} className="text-[#24598d]" />
          <span>Simular Día de la Semana</span>
        </label>
        <select
          value={mockDay === undefined ? "real" : mockDay}
          onChange={(e) => handleDayChange(e.target.value === "real" ? undefined : parseInt(e.target.value))}
          className="w-full p-2 border border-gray-200 rounded-xl outline-none font-bold text-xs text-gray-800 bg-gray-50"
        >
          <option value="real">Día Real (Hoy)</option>
          {days.map((d) => (
            <option key={d.num} value={d.num}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
