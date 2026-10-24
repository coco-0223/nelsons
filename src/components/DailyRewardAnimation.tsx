"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Gift, Star, X } from "lucide-react";
import { Settings } from "@/types";

interface Props {
  settings: Partial<Settings>;
}

export function DailyRewardAnimation({ settings }: Props) {
  const { user, setUser } = useAuth();
  const [show, setShow] = useState(false);
  const [opened, setOpened] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(0);

  useEffect(() => {
    if (!user || !settings.marketing_dailyPrizeActive) return;

    const todayStr = new Date().toLocaleDateString();
    const lastClaimDate = user.lastDailyRewardClaim ? new Date(user.lastDailyRewardClaim).toLocaleDateString() : null;

    if (lastClaimDate !== todayStr) {
      // Small delay to not be too aggressive on load
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [user, settings.marketing_dailyPrizeActive]);

  const openChest = async () => {
    if (!user) return;
    
    // Calculate random reward based on settings
    const min = settings.marketing_dailyPrizeMin || 10;
    const max = settings.marketing_dailyPrizeMax || 50;
    const reward = Math.floor(Math.random() * (max - min + 1)) + min;
    
    setRewardPoints(reward);
    setOpened(true);

    try {
      const updatedUser = {
        ...user,
        points: user.points + reward,
        lastDailyRewardClaim: Date.now()
      };

      await setDoc(doc(db, "users", user.uid), updatedUser);
      // Actualizamos estado local si la app lo soporta (si auth context permite forzar refresh)
      if (setUser) setUser(updatedUser);
      else {
        // Fallback: reload the page to refresh auth state from DB
        setTimeout(() => window.location.reload(), 2000);
      }
      
    } catch (err) {
      console.error(err);
    }
  };

  const close = () => {
    setShow(false);
    if (opened && !setUser) {
      window.location.reload();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative text-center">
        {!opened && (
          <button onClick={close} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        )}
        
        <div className="p-8 pb-10 flex flex-col items-center">
          <h2 className="text-3xl font-black text-[var(--primary)] mb-2">¡Premio Diario!</h2>
          <p className="text-gray-500 mb-8 font-medium">Abrí tu regalo sorpresa todos los días y ganá puntos para comprar empanadas.</p>
          
          {!opened ? (
            <button 
              onClick={openChest}
              className="relative group cursor-pointer animate-bounce hover:animate-none transition-transform hover:scale-110"
            >
              <div className="w-32 h-32 bg-orange-100 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:bg-orange-200 transition-colors"></div>
              <Gift size={100} className="text-orange-500 relative z-10 drop-shadow-2xl" />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white px-4 py-1 rounded-full font-bold text-sm whitespace-nowrap shadow-lg">
                TOCÁ PARA ABRIR
              </div>
            </button>
          ) : (
            <div className="animate-in zoom-in duration-500 flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-40 rounded-full animate-pulse"></div>
                <Star size={120} className="text-yellow-400 fill-yellow-400 relative z-10 animate-[spin_10s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 font-black text-4xl text-yellow-900 drop-shadow-md">
                  +{rewardPoints}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mt-6">¡Ganaste {rewardPoints} Puntos!</h3>
              <p className="text-gray-500 mt-2 mb-6">Ya están guardados en tu Billetera Coqueta.</p>
              
              <button 
                onClick={close}
                className="w-full bg-[var(--primary)] text-white py-4 rounded-xl font-bold text-lg hover:bg-[var(--secondary)] transition-colors shadow-lg shadow-[var(--primary)]/30"
              >
                ¡Genial!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
