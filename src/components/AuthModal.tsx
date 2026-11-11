"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { UserProfile, SUPERADMIN_EMAIL } from "@/types";

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, authView, setAuthView, switchMockUser } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [apartment, setApartment] = useState("");
  const [referralCode, setReferralCode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (authView === 'register' && password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        setLoading(false);
        return;
      }

      if (authView === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const isSuperadmin = (userCred.user.email || email).trim().toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();

        const newProfile: UserProfile = {
          uid: userCred.user.uid,
          email: userCred.user.email || email,
          displayName: name,
          phone: phone ? "+5411" + phone : undefined,
          address,
          neighborhood,
          apartment,
          role: isSuperadmin ? "admin" : "customer",
          isClubMember: false,
          points: isSuperadmin ? 9999 : 50, // Welcome points!
          referredBy: referralCode || undefined,
          referralCode: name.split(' ')[0].toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
          createdAt: Date.now()
        };

        // Guardar en Firestore y también respaldar en sessionStorage
        try {
          await setDoc(doc(db, "users", userCred.user.uid), newProfile);
        } catch (firestoreErr) {
          console.warn("Firestore offline, guardando perfil en sesión local:", firestoreErr);
        }

        if (switchMockUser) {
          switchMockUser(newProfile);
        }
      }
      setShowAuthModal(false);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Email o contraseña incorrectos. Si aún no creaste la cuenta en esta app, hacé clic en 'Registrarme' arriba.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Este email ya está registrado. Por favor, iniciá sesión.");
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else {
        setError(err.message || "Ocurrió un error. Verificá tus datos.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="relative p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="flex gap-4">
            <button 
              onClick={() => { setAuthView('login'); setError(""); }}
              className={`text-lg font-bold transition-colors ${authView === 'login' ? 'text-[var(--primary)]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => { setAuthView('register'); setError(""); }}
              className={`text-lg font-bold transition-colors ${authView === 'register' ? 'text-[var(--primary)]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Registrarme
            </button>
          </div>
          <button onClick={() => setShowAuthModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Botón de auto-rellenar datos de prueba para testear rápido */}
          {authView === 'register' && (
            <button
              type="button"
              onClick={() => {
                const randomId = Math.floor(100 + Math.random() * 900);
                setName(`Cliente Test ${randomId}`);
                setPhone(`${Math.floor(10000000 + Math.random() * 89999999)}`.slice(0, 8));
                setAddress("Av. Cabildo 2400");
                setNeighborhood("Belgrano");
                setApartment("3A");
                setEmail(`test${randomId}@gmail.com`);
                setPassword("123456");
                setConfirmPassword("123456");
              }}
              className="w-full text-xs font-bold text-[#24598d] bg-blue-50 hover:bg-blue-100 p-2.5 rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>⚡ Auto-rellenar datos de prueba</span>
            </button>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {authView === 'register' && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[var(--primary)] outline-none bg-white text-gray-900"
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
                <div className="flex">
                  <div className="px-4 py-3 rounded-l-xl border border-gray-300 border-r-0 bg-gray-100 text-gray-600 font-bold whitespace-nowrap">
                    +54 11
                  </div>
                  <input 
                    type="tel" required
                    maxLength={8}
                    className="w-full px-4 py-3 rounded-r-xl border border-gray-300 focus:border-[var(--primary)] outline-none bg-white text-gray-900"
                    value={phone} onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setPhone(val);
                    }}
                    placeholder="Ej: 12345678"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Dirección de Entrega</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[var(--primary)] outline-none bg-white text-gray-900 mb-3"
                  value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Ej: Av. Siempreviva 742"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Depto/Timbre</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[var(--primary)] outline-none bg-white text-gray-900"
                      value={apartment} onChange={e => setApartment(e.target.value)}
                      placeholder="Ej: 4B"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Barrio</label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[var(--primary)] outline-none bg-white text-gray-900"
                      value={neighborhood} onChange={e => setNeighborhood(e.target.value)}
                      placeholder="Ej: Palermo"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Código de Invitación (Opcional)</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[var(--primary)] outline-none bg-orange-50 text-gray-900 placeholder:text-gray-400"
                  value={referralCode} onChange={e => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="Ej: MARIA-1234"
                />
                <p className="text-xs text-gray-500 mt-1">Si un amigo te invitó, ingresá su código acá para ganar puntos extra.</p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input 
              type="email" required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[var(--primary)] outline-none bg-white text-gray-900"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" required
              onPaste={e => e.preventDefault()}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[var(--primary)] outline-none bg-white text-gray-900"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {authView === 'register' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Repetir Contraseña</label>
              <input 
                type="password" required
                onPaste={e => e.preventDefault()}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[var(--primary)] outline-none bg-white text-gray-900"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[var(--primary)] text-white py-4 rounded-xl font-bold text-lg hover:bg-[var(--secondary)] transition-colors mt-6 shadow-lg shadow-[var(--primary)]/30 disabled:opacity-50"
          >
            {loading ? 'Cargando...' : (authView === 'login' ? 'Entrar' : 'Crear Cuenta y Sumar 50 Pts')}
          </button>
        </form>
      </div>
    </div>
  );
}
