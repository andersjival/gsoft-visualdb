import React, { useState } from "react";
import { KeyRound, ShieldCheck, Eye, EyeOff, Lock, AlertCircle, Sparkles } from "lucide-react";
import { loginWithAccessCode } from "../services/auth";

interface LoginModalProps {
  onSuccess: (token: string, user: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccess }) => {
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Por favor ingresa el código de acceso");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await loginWithAccessCode(code.trim());
    if (result.success && result.token) {
      onSuccess(result.token, result.user || "Anders Jival");
    } else {
      setError(result.error || "Código incorrecto");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#171717] border border-[#2e2e2e] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#222] border border-[#333] flex items-center justify-center text-[#3ecf8e] mb-4 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            GeoSoft <span className="text-[#3ecf8e] font-mono text-lg bg-[#222] px-2 py-0.5 rounded border border-[#333]">VisualDB</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Gestión y visualización segura de bases de datos D1
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Código de Acceso Tokenizado
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ingresa tu código..."
                disabled={loading}
                className="w-full pl-9 pr-10 py-3 bg-[#1f1f1f] border border-[#333] rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#3ecf8e] font-mono text-sm transition"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4 stroke-[2.5]" />
                <span>Desbloquear Panel</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#262626] text-center">
          <p className="text-[11px] text-neutral-500 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-[#3ecf8e]" />
            Sesión criptográfica protegida por HMAC-SHA256
          </p>
        </div>
      </div>
    </div>
  );
};
