import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Estado = 'frio' | 'contactado' | 'demo' | 'propuesta' | 'cerrado';
type PlanInteres = 'basic' | 'professional' | 'premium';

interface Prospecto {
  id: string; nombre: string; contacto: string; ciudad: string;
  telefono: string; email: string; estado: Estado;
  plan_interes: PlanInteres; notas: string; proxima_accion: string; created_at: string;
}

const COLUMNAS: { id: Estado; label: string; color: string; bg: string }[] = [
  { id: 'frio',       label: 'Frío',       color: '#718096', bg: '#EDF2F7' },
  { id: 'contactado', label: 'Contactado', color: '#1A9DB5', bg: 'rgba(26,157,181,0.08)' },
  { id: 'demo',       label: 'Demo',       color: '#D69E2E', bg: 'rgba(214,158,46,0.08)' },
  { id: 'propuesta',  label: 'Propuesta',  color: '#DD6B20', bg: 'rgba(221,107,32,0.08)' },
  { id: 'cerrado',    label: 'Cerrado ✓',  color: '#38A169', bg: 'rgba(56,161,105,0.08)' },
];

const PLAN_STYLE: Record<PlanInteres, { bg: string; color: string }> = {
  basic:        { bg: '#EDF2F7',                    color: '#718096' },
  professional: { bg: 'rgba(26,157,181,0.12)',       color: '#1A7A8E' },
  premium:      { bg: 'rgba(128,90,213,0.12)',       color: '#553C9A' },
};

const EMPTY_FORM = {
  nombre: '', contacto: '', ciudad: '', telefono: '', email: '',
  estado: 'frio' as Estado, plan_interes: 'professional' as PlanInteres,
  notas: '', proxima_accion: '',
};

const TEXT_MUTED = '#4A5568';
const TEXT_DIM   = '#718096';
const INPUT_STYLE = {
  width: '100%', background: '#F7FAFC', border: '1px solid #E2E8F0',
  borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '13px', color: '#1A202C', outline: 'none',
};
const SELECT_STYLE = { ...INPUT_STYLE, cursor: 'pointer' };

export default function AdminPipelinePage({ onConvertir }: { onConvertir?: (p: Prospecto) => void }) {
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Prospecto | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    const { data } = await supabase.from('prospectos').select('*').order('created_at', { ascending: false });
    setProspectos(data || []);
    setLoading(false);
  }

  function abrirNuevo() { setEditando(null); setForm(EMPTY_FORM); setShowModal(true); }
  function abrirEditar(p: Prospecto) {
    setEditando(p);
    setForm({ nombre: p.nombre, contacto: p.contacto||'', ciudad: p.ciudad||'', telefono: p.telefono||'', email: p.email||'', estado: p.estado, plan_interes: p.plan_interes||'professional', notas: p.notas||'', proxima_accion: p.proxima_accion||'' });
    setShowModal(true);
  }

  async function guardar() {
    setSaving(true);
    if (editando) {
      await supabase.from('prospectos').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editando.id);
    } else {
      await supabase.from('prospectos').insert(form);
    }
    await cargar();
    setShowModal(false);
    setSaving(false);
  }

  async function cambiarEstado(id: string, estado: Estado) {
    await supabase.from('prospectos').update({ estado, updated_at: new Date().toISOString() }).eq('id', id);
    setProspectos(prev => prev.map(p => p.id === id ? { ...p, estado } : p));
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este prospecto?')) return;
    await supabase.from('prospectos').delete().eq('id', id);
    setProspectos(prev => prev.filter(p => p.id !== id));
  }

  const byEstado = (estado: Estado) => prospectos.filter(p => p.estado === estado);
  const totalMRR = prospectos.filter(p => p.estado === 'cerrado').reduce((s, p) =>
    s + (p.plan_interes === 'premium' ? 229 : p.plan_interes === 'professional' ? 149 : 89), 0);

  return (
    <div className="p-6 h-full flex flex-col" style={{ background: '#F0F4F8', minHeight: '100vh' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A202C', fontFamily: 'Manrope, system-ui, sans-serif' }}>Pipeline comercial</h1>
          <p className="text-sm mt-0.5" style={{ color: TEXT_MUTED }}>
            {prospectos.length} prospectos · {byEstado('propuesta').length} en propuesta ·{' '}
            <span style={{ color: '#38A169', fontWeight: 600 }}>{totalMRR}€/mes cerrado</span>
          </p>
        </div>
        <button onClick={abrirNuevo}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #1A9DB5, #0f7a8e)', boxShadow: '0 2px 8px rgba(26,157,181,0.3)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo prospecto
        </button>
      </div>

      {loading ? (
        <div className="text-sm" style={{ color: TEXT_MUTED }}>Cargando...</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {COLUMNAS.map(col => (
            <div key={col.id} className="flex-shrink-0 w-64 flex flex-col"
              onDragOver={e => e.preventDefault()}
              onDrop={async e => { e.preventDefault(); if (dragging) await cambiarEstado(dragging, col.id); setDragging(null); }}>
              {/* Column header */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-t-xl" style={{ background: col.bg, border: `1px solid #E2E8F0`, borderBottom: 'none' }}>
                <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: col.color }}>{col.label}</span>
                <span className="ml-auto text-xs font-medium" style={{ color: TEXT_DIM }}>{byEstado(col.id).length}</span>
              </div>
              {/* Column body */}
              <div className="flex-1 rounded-b-xl p-2 space-y-2 min-h-32" style={{ background: '#F7FAFC', border: '1px solid #E2E8F0', borderTop: 'none' }}>
                {byEstado(col.id).map(p => {
                  const ps = PLAN_STYLE[p.plan_interes || 'professional'];
                  return (
                    <div key={p.id} draggable onDragStart={() => setDragging(p.id)} onDragEnd={() => setDragging(null)}
                      className="rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all"
                      style={{ background: dragging === p.id ? '#F7FAFC' : '#FFFFFF', border: '1px solid #E2E8F0', opacity: dragging === p.id ? 0.5 : 1, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#CBD5E0')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}>
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <p className="font-semibold text-sm leading-tight" style={{ color: '#1A202C' }}>{p.nombre}</p>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0" style={ps}>
                          {(p.plan_interes || 'professional').charAt(0).toUpperCase() + (p.plan_interes || 'professional').slice(1)}
                        </span>
                      </div>
                      {p.ciudad && <p className="text-xs mb-1" style={{ color: TEXT_MUTED }}>{p.ciudad}</p>}
                      {p.contacto && <p className="text-xs truncate" style={{ color: TEXT_MUTED }}>{p.contacto}</p>}
                      {p.proxima_accion && (
                        <p className="text-xs mt-1.5 font-medium truncate" style={{ color: '#D69E2E' }}>→ {p.proxima_accion}</p>
                      )}
                      <div className="flex items-center gap-1 mt-2 pt-2" style={{ borderTop: '1px solid #EDF2F7' }}>
                        <button onClick={() => abrirEditar(p)} className="flex-1 text-xs text-left transition-colors" style={{ color: '#1A9DB5' }}>Editar</button>
                        {p.estado === 'cerrado' && onConvertir && (
                          <button onClick={() => onConvertir(p)} className="text-xs px-2 py-0.5 rounded font-medium transition-colors"
                            style={{ background: 'rgba(56,161,105,0.1)', color: '#276749' }}>Convertir</button>
                        )}
                        <button onClick={() => eliminar(p.id)} className="text-xs transition-colors" style={{ color: '#E53E3E' }}>✕</button>
                      </div>
                    </div>
                  );
                })}
                {byEstado(col.id).length === 0 && (
                  <div className="text-center py-6 text-xs" style={{ color: TEXT_DIM }}>Sin prospectos</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '32rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h2 className="text-lg font-bold mb-5" style={{ color: '#1A202C', fontFamily: 'Manrope, system-ui, sans-serif' }}>
              {editando ? 'Editar prospecto' : 'Nuevo prospecto'}
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs mb-1" style={{ color: TEXT_MUTED }}>Nombre clínica *</label>
                  <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} style={INPUT_STYLE} placeholder="Clínica Dr. García" onFocus={e => (e.target.style.borderColor = 'rgba(26,157,181,0.6)')} onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.08)')} />
                </div>
                {[
                  { label: 'Contacto', key: 'contacto', placeholder: 'Dr. García' },
                  { label: 'Ciudad', key: 'ciudad', placeholder: 'Madrid' },
                  { label: 'Teléfono', key: 'telefono', placeholder: '+34 600 000 000' },
                  { label: 'Email', key: 'email', placeholder: 'clinica@mail.com' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs mb-1" style={{ color: TEXT_MUTED }}>{f.label}</label>
                    <input value={(form as any)[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} style={INPUT_STYLE} placeholder={f.placeholder} onFocus={e => (e.target.style.borderColor = 'rgba(26,157,181,0.6)')} onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.08)')} />
                  </div>
                ))}
                <div>
                  <label className="block text-xs mb-1" style={{ color: TEXT_MUTED }}>Estado</label>
                  <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value as Estado})} style={SELECT_STYLE}>
                    {COLUMNAS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: TEXT_MUTED }}>Plan de interés</label>
                  <select value={form.plan_interes} onChange={e => setForm({...form, plan_interes: e.target.value as PlanInteres})} style={SELECT_STYLE}>
                    <option value="basic">Basic — 109€/mes</option>
                    <option value="professional">Professional — 189€/mes</option>
                    <option value="premium">Premium — 279€/mes</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs mb-1" style={{ color: TEXT_MUTED }}>Próxima acción</label>
                  <input value={form.proxima_accion} onChange={e => setForm({...form, proxima_accion: e.target.value})} style={INPUT_STYLE} placeholder="Enviar propuesta el viernes" onFocus={e => (e.target.style.borderColor = 'rgba(26,157,181,0.6)')} onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.08)')} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs mb-1" style={{ color: TEXT_MUTED }}>Notas</label>
                  <textarea value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} rows={3} style={{ ...INPUT_STYLE, resize: 'none' }} placeholder="Interesado en automatizar citas..." onFocus={e => (e.target.style.borderColor = 'rgba(26,157,181,0.6)')} onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.08)')} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg text-sm transition-colors" style={{ border: '1px solid #E2E8F0', color: TEXT_MUTED }}>Cancelar</button>
              <button onClick={guardar} disabled={!form.nombre || saving} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-all" style={{ background: 'linear-gradient(135deg, #1A9DB5, #0f7a8e)', boxShadow: '0 2px 8px rgba(26,157,181,0.3)' }}>
                {saving ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear prospecto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
                                                                             