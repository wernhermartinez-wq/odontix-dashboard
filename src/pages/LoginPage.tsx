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
    if (error) setError('Email o contraseña incorrectos');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f4f6f8' }}>
      {/* Grid de fondo sutil */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(19,122,140,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(19,122,140,0.04) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #137a8c 0%, #1a9db5 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(19,122,140,0.25)',
              fontSize: 26,
            }}>
              🦷
            </div>
          </div>
          <h1 style={{
            fontFamily: 'Manrope, system-ui, sans-serif',
            fontWeight: 800, fontSize: 24, color: '#1a1a1f',
            letterSpacing: '-0.03em', margin: '0 0 6px',
          }}>
            Odontix
          </h1>
          <p style={{ color: '#9a9aaa', fontSize: 13, margin: 0 }}>
            Panel de gestión para tu clínica
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
        >
          <h2 style={{
            fontFamily: 'Manrope, system-ui, sans-serif',
            fontWeight: 700, fontSize: 18, color: '#1a1a1f',
            margin: '0 0 24px',
          }}>
            Iniciar sesión
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#42424d' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="clinica@ejemplo.com"
                className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all"
                style={{ background: '#f4f6f8', border: '1.5px solid #d4d9e0', color: '#1a1a1f' }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#137a8c';
                  e.target.style.boxShadow = '0 0 0 3px rgba(19,122,140,0.1)';
                  e.target.style.background = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d4d9e0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = '#f4f6f8';
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#42424d' }}>
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all"
                style={{ background: '#f4f6f8', border: '1.5px solid #d4d9e0', color: '#1a1a1f' }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#137a8c';
                  e.target.style.boxShadow = '0 0 0 3px rgba(19,122,140,0.1)';
                  e.target.style.background = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d4d9e0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = '#f4f6f8';
                }}
              />
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', color: '#c0392b' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold rounded-lg py-2.5 text-sm mt-2 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #137a8c 0%, #0f5e70 100%)', boxShadow: '0 4px 16px rgba(19,122,140,0.25)', marginTop: 8 }}
            >
              {loading ? 'Accediendo...' : 'Entrar →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#b0b0bc' }}>
          Odontix · Gestión de citas por WhatsApp
        </p>
      </div>
    </div>
  );
}
