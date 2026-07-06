import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import odontixAgent from '@/assets/odontixagent2.png';

const features = [
  { svg: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", title: 'Citas por WhatsApp', desc: 'Pacientes reservan y confirman sin llamadas' },
  { svg: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", title: 'IA que gestiona tu agenda', desc: 'Recuerda, reagenda y cancela automáticamente' },
  { svg: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", title: 'Dashboard en tiempo real', desc: 'KPIs, ingresos y ocupación de un vistazo' },
];

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
    <div className="min-h-screen flex" style={{ background: '#0d1018' }}>

      {/* ── LADO IZQUIERDO ── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ flex: '0 0 55%', background: 'linear-gradient(155deg, #071a1f 0%, #0a2530 60%, #0d3040 100%)' }}
      >
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(79,158,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79,158,255,0.05) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }} />
        {/* Glow */}
        <div className="absolute pointer-events-none" style={{
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,158,255,0.08) 0%, transparent 70%)',
          top: '5%', left: '-15%',
        }} />

        {/* Logo — Odontix Agent */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src={odontixAgent}
            alt="Odontix Agent"
            style={{ height: 52, width: 'auto', filter: 'drop-shadow(0 0 16px rgba(79,158,255,0.5))' }}
          />
        </div>

        {/* Texto */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5 text-xs font-medium"
            style={{ background: 'rgba(79,158,255,0.1)', border: '1px solid rgba(79,158,255,0.25)', color: '#4F9EFF' }}>
            🦷 Panel de gestión para clínicas
          </div>
          <h1 style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontWeight: 800, fontSize: 38, lineHeight: 1.15, color: '#ffffff', marginBottom: 16 }}>
            Tu clínica en<br />
            <span style={{ color: '#4F9EFF' }}>piloto automático</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7, marginBottom: 32, maxWidth: 400 }}>
            Automatiza citas, recordatorios y cancelaciones por WhatsApp.
          </p>
          <div className="flex flex-col gap-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center justify-center rounded-xl"
                  style={{ width: 40, height: 40, background: 'rgba(79,158,255,0.1)', border: '1px solid rgba(79,158,255,0.2)' }}>
                  <svg width="18" height="18" fill="none" stroke="#4F9EFF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d={f.svg} />
                  </svg>
                </div>
                <div>
                  <p style={{ color: '#ffffff', fontWeight: 600, fontSize: 14, margin: '0 0 2px' }}>{f.title}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats footer */}
        <div className="relative z-10 flex gap-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {[['+200', 'clínicas activas'], ['98%', 'tasa confirmación'], ['4.9★', 'valoración']].map(([val, label]) => (
            <div key={label}>
              <p style={{ color: '#ffffff', fontWeight: 700, fontSize: 20, margin: 0 }}>{val}</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── LADO DERECHO: Formulario ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="absolute inset-0 pointer-events-none lg:hidden" style={{
          backgroundImage: 'linear-gradient(rgba(79,158,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79,158,255,0.05) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }} />

        <div className="w-full max-w-sm relative z-10">
          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-8">
            <img src={odontixAgent} alt="Odontix" style={{ height: 120, width: 'auto', margin: '0 auto', filter: 'drop-shadow(0 0 24px rgba(79,158,255,0.5))' }} />
          </div>

          {/* Card */}
          <div className="rounded-2xl p-8" style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(79,158,255,0.15)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)',
          }}>
            <h2 style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontWeight: 700, fontSize: 22, color: 'rgba(240,240,245,0.95)', margin: '0 0 4px' }}>
              Bienvenido
            </h2>
            <p style={{ color: 'rgba(240,240,245,0.4)', fontSize: 14, margin: '0 0 28px' }}>
              Accede a tu panel de clínica
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(240,240,245,0.6)' }}>Email</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="clinica@ejemplo.com"
                  className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,240,245,0.9)' }}
                  onFocus={(e) => { e.target.style.borderColor = '#4F9EFF'; e.target.style.boxShadow = '0 0 0 3px rgba(79,158,255,0.15)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(240,240,245,0.6)' }}>Contraseña</label>
                <input
                  type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,240,245,0.9)' }}
                  onFocus={(e) => { e.target.style.borderColor = '#4F9EFF'; e.target.style.boxShadow = '0 0 0 3px rgba(79,158,255,0.15)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {error && (
                <div className="rounded-lg px-4 py-3 text-sm"
                  style={{ background: 'rgba(255,60,90,0.1)', border: '1px solid rgba(255,60,90,0.25)', color: '#FF3C5A' }}>
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full font-semibold rounded-lg py-3 text-sm transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #4F9EFF 0%, #2563eb 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(79,158,255,0.3)', marginTop: 8 }}
              >
                {loading ? 'Accediendo...' : 'Entrar al panel →'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: 'rgba(240,240,245,0.2)' }}>
            Odontix · Gestión de citas por WhatsApp
          </p>
        </div>
      </div>
    </div>
  );
}
