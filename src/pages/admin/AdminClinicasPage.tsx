import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Clinica { id: string; nombre: string; email: string; activo: boolean; plan?: string; }
interface AdminClinicasPageProps { onVerComo: (clinica: { id: string; nombre: string }) => void; }

const PLANES = ['basic', 'professional', 'premium'];
const CARD = { background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '0.875rem' };
const TEXT_MUTED = '#5c5c6b';
const TEXT_DIM = '#9a9aaa';

const planStyle: Record<string, { bg: string; color: string }> = {
  basic:        { bg: '#f0f2f5', color: '#5c5c6b' },
  professional: { bg: 'rgba(79,158,255,0.14)',  color: '#1a9db5' },
  premium:      { bg: 'rgba(167,139,250,0.14)', color: '#3dc0d8' },
};

const INPUT_STYLE = {
  width: '100%', background: '#f4f6f8', border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '14px', color: '#1a1a1f',
  outline: 'none',
};

export default function AdminClinicasPage({ onVerComo }: AdminClinicasPageProps) {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(true);
  const [planes, setPlanes] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [newClinica, setNewClinica] = useState({ nombre: '', email: '', telefono: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { cargarClinicas(); }, []);

  async function cargarClinicas() {
    const { data } = await supabase.from('clientes').select('*').order('nombre');
    if (data) {
      setClinicas(data);
      const { data: configs } = await supabase.from('odontix_config').select('cliente_id, plan');
      if (configs) {
        const planMap: Record<string, string> = {};
        configs.forEach((c: any) => { planMap[c.cliente_id] = c.plan; });
        setPlanes(planMap);
      }
    }
    setLoading(false);
  }

  async function cambiarPlan(clienteId: string, plan: string) {
    const { data: existing } = await supabase.from('odontix_config').select('cliente_id').eq('cliente_id', clienteId).single();
    if (existing) {
      await supabase.from('odontix_config').update({ plan }).eq('cliente_id', clienteId);
    } else {
      await supabase.from('odontix_config').insert({ cliente_id: clienteId, plan, horario_apertura: '09:00', horario_cierre: '18:00', dias_atencion: [1,2,3,4,5], whatsapp_activo: true });
    }
    setPlanes(prev => ({ ...prev, [clienteId]: plan }));
  }

  async function crearClinica() {
    setSaving(true);
    const { data } = await supabase.from('clientes').insert({ nombre: newClinica.nombre, email: newClinica.email, telefono: newClinica.telefono, activo: true }).select('id').single();
    if (data) {
      await supabase.from('odontix_config').insert({ cliente_id: data.id, plan: 'basic', horario_apertura: '09:00', horario_cierre: '18:00', dias_atencion: [1,2,3,4,5], whatsapp_activo: true });
      await cargarClinicas();
      setShowModal(false);
      setNewClinica({ nombre: '', email: '', telefono: '' });
    }
    setSaving(false);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1a1a1f', fontFamily: 'Manrope, system-ui, sans-serif' }}>Clínicas</h1>
          <p className="text-sm mt-1" style={{ color: TEXT_MUTED }}>{clinicas.length} clínicas registradas</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all text-white"
          style={{ background: 'linear-gradient(135deg, #137a8c, #0f5e70)', boxShadow: '0 0 16px rgba(19,122,140,0.35)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva clínica
        </button>
      </div>

      {loading ? (
        <div className="text-sm" style={{ color: TEXT_MUTED }}>Cargando...</div>
      ) : (
        <div className="space-y-3">
          {clinicas.map((c) => {
            const plan = planes[c.id] || 'basic';
            const ps = planStyle[plan] || planStyle.basic;
            return (
              <div key={c.id} style={{ ...CARD, padding: '1.25rem' }} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(19,122,140,0.08)', boxShadow: '0 0 12px rgba(79,158,255,0.2)' }}>
                  <span className="font-bold text-sm" style={{ color: '#1a9db5' }}>{c.nombre.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{c.nombre}</p>
                  <p className="text-xs truncate" style={{ color: TEXT_MUTED }}>{c.email}</p>
                </div>
                <select value={plan} onChange={(e) => cambiarPlan(c.id, e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none"
                  style={{ background: ps.bg, color: ps.color }}>
                  {PLANES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
                <button onClick={() => onVerComo({ id: c.id, nombre: c.nombre })}
                  className="text-sm font-medium whitespace-nowrap transition-colors"
                  style={{ color: '#1a9db5' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#7AB8FF')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#1a9db5')}>
                  Ver como →
                </button>
              </div>
            );
          })}
          {clinicas.length === 0 && (
            <div className="text-center py-16" style={{ color: TEXT_DIM }}>
              <p className="text-sm">Sin clínicas registradas</p>
              <button onClick={() => setShowModal(true)} className="mt-3 text-sm" style={{ color: '#1a9db5' }}>Crear primera clínica</button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ background: '#ffffff', border: '1px solid rgba(79,158,255,0.2)', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '28rem', boxShadow: '0 0 40px rgba(79,158,255,0.1)' }}>
            <h2 className="text-lg font-bold mb-5" style={{ color: '#1a1a1f', fontFamily: 'Manrope, system-ui, sans-serif' }}>Nueva clínica</h2>
            <div className="space-y-4">
              {[
                { label: 'Nombre *', key: 'nombre', type: 'text', placeholder: 'Clínica Dental García' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'clinica@ejemplo.com' },
                { label: 'Teléfono', key: 'telefono', type: 'text', placeholder: '+34 600 000 000' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs mb-1.5" style={{ color: TEXT_MUTED }}>{f.label}</label>
                  <input type={f.type} value={(newClinica as any)[f.key]}
                    onChange={(e) => setNewClinica({ ...newClinica, [f.key]: e.target.value })}
                    style={INPUT_STYLE} placeholder={f.placeholder}
                    onFocus={e => (e.target.style.borderColor = 'rgba(79,158,255,0.6)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.08)')} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg text-sm transition-colors"
                style={{ border: '1px solid rgba(0,0,0,0.08)', color: TEXT_MUTED }}>Cancelar</button>
              <button onClick={crearClinica} disabled={!newClinica.nombre || saving}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #137a8c, #0f5e70)', boxShadow: '0 0 16px rgba(19,122,140,0.35)' }}>
                {saving ? 'Guardando...' : 'Crear clínica'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
