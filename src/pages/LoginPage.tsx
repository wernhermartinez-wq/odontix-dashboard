import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Email o contrasena incorrectos');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0d1018' }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(59,110,232,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,110,232,0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3B6EE8 0%, #2A55C8 100%)', boxShadow: '0 0 24px rgba(59,110,232,0.45)' }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-2xl text-white tracking-tight" style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontWeight: 800 }}>
              Odontix
            </span>
          </div>
          <p style={{ color: 'rgba(240,240,245,0.45)', fontSize: '14px' }}>Panel de gestion para tu clinica</p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: '#111520', border: '1px solid rgba(59,110,232,0.15)', boxShadow: '0 0 40px rgba(59,110,232,0.08)' }}
        >
          <h2 className="text-white text-xl mb-6" style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontWeight: 700 }}>
            Iniciar sesion
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'rgba(240,240,245,0.5)' }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="clinica@ejemplo.com"
                className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(59,110,232,0.2)', color: '#f0f0f5' }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(59,110,232,0.6)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(59,110,232,0.2)')}
              />
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'rgba(240,240,245,0.5)' }}>Contrasena</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(59,110,232,0.2)', color: '#f0f0f5' }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(59,110,232,0.6)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(59,110,232,0.2)')}
              />
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-medium rounded-lg py-2.5 text-sm mt-2 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #3B6EE8 0%, #2A55C8 100%)', boxShadow: '0 0 20px rgba(59,110,232,0.35)' }}
            >
              {loading ? 'Accediendo...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(240,240,245,0.2)' }}>
          Odontix SaaS · Gestion de citas por WhatsApp
        </p>
      </div>
    </div>
  );
}
