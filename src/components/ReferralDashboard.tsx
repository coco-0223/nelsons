"use client";

import { useAuth } from "@/context/AuthContext";
import { Copy, Share2, Users } from "lucide-react";
import { useState } from "react";
import { Settings } from "@/types";

interface Props {
  settings: Partial<Settings>;
}

export function ReferralDashboard({ settings }: Props) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user || !settings.marketing_referralsActive) return null;

  const referralCode = user.referralCode || "PROMO-" + user.uid.substring(0,4).toUpperCase();
  const rewardForReferrer = settings.marketing_referralReferrerReward || 500;
  const rewardForReferred = settings.marketing_referralReferredReward || 500;

  const shareText = `¡Pedí en Empanadas Coquetas con mi código ${referralCode} y ganá ${rewardForReferred} Puntos de bienvenida para gastar en empanadas!`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center mt-6">
      <div className="bg-indigo-50 p-6 rounded-2xl flex-1 w-full text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-2 text-indigo-600">
          <Users size={24} />
          <h3 className="font-black text-xl text-indigo-900">Invitá y Ganá</h3>
        </div>
        <p className="text-indigo-700/80 mb-4">
          Compartí este código con tus amigos. Ellos ganan {rewardForReferred} pts en su primer pedido, y vos ganás {rewardForReferrer} pts por cada amigo que compre.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="bg-white border-2 border-indigo-200 rounded-xl px-6 py-3 flex-1 flex justify-between items-center">
            <span className="font-mono font-black text-2xl text-indigo-900 tracking-widest">{referralCode}</span>
            <button onClick={copyToClipboard} className="text-indigo-500 hover:text-indigo-700 transition-colors p-2" title="Copiar código">
              <Copy size={20} />
            </button>
          </div>
          <button 
            onClick={shareWhatsApp}
            className="bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-colors shadow-lg shadow-[#25D366]/30"
          >
            <Share2 size={18} /> Compartir
          </button>
        </div>
        {copied && <p className="text-sm font-bold text-green-600 mt-2">¡Código copiado!</p>}
      </div>
    </div>
  );
}
