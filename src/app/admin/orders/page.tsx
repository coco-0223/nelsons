"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  delivering: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "En Preparación",
  delivering: "En Camino",
  completed: "Completado",
  cancelled: "Cancelado",
};

const DAYS_OF_WEEK = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const loaded: Order[] = [];
      snap.forEach(d => {
        loaded.push({ id: d.id, ...d.data() } as Order);
      });
      setOrders(loaded);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus
      });
    } catch (err) {
      console.error(err);
      alert("Error al actualizar estado");
    }
  };

  const filteredOrders = orders.filter(o => statusFilter === "all" || o.status === statusFilter);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Pedidos</h1>
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          className="p-2 border border-gray-200 rounded-lg outline-none focus:border-[var(--primary)] bg-white"
        >
          <option value="all">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Cargando pedidos...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-dashed border-gray-300 text-center text-gray-500">
          No hay pedidos que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
              <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-900">{order.customerName}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[order.status] || "bg-gray-100"}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Tel:</strong> {order.customerPhone}</p>
                  <p><strong>Dir:</strong> {order.customerAddress}</p>
                  <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  <p><strong>Pago:</strong> {order.paymentMethod}</p>
                  {order.deliveryDate && (
                    <p><strong>Entrega:</strong> {DAYS_OF_WEEK[parseInt(order.deliveryDate)]} {order.deliveryTime}</p>
                  )}
                </div>
              </div>
              
              <div className="p-6 md:w-2/3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Ítems</h4>
                  <ul className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.product.name} {item.isForFutureDate ? '(Programado)' : '(Para Hoy)'}</span>
                        <span className="text-gray-500">${(item.isForFutureDate ? (item.product.priceOffer || item.product.priceScheduled) : (item.product.priceOffer || item.product.priceToday)) * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-gray-100 pt-2 flex justify-between items-center font-bold text-gray-900">
                    <span>Total Pagado:</span>
                    <span className="text-[var(--primary)] text-xl">${order.total}</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <select 
                    value={order.status}
                    onChange={(e) => updateStatus(order.id!, e.target.value)}
                    className="p-2 border border-gray-200 rounded-lg outline-none focus:border-[var(--primary)] text-sm font-bold bg-white"
                  >
                    <option disabled>Cambiar estado...</option>
                    {Object.entries(STATUS_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
