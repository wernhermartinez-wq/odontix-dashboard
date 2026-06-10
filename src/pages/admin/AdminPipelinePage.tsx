import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Estado = 'frio' | 'contactado' | 'demo' | 'propuesta' | 'cerrado';
type PlanInteres = 'basic' | 'professional' | 'premium';

interface Prospecto {
  id: string;
  nombre: string;
  contacto: string;
  ciudad: string;
  telefono: string;
  email: string;
  estado: Estado;
  plan_interes: PlanInteres;
  notas: string;
  proxima_accion: string;
  created_at: string;
}

const COLUMNAS: { id: Estado; label: string; color: string; bg: string; dot: string }[] = [
  { id: 'frio',       label: 'Frío',       color: 'text-gray-500',  bg: 'bg-gray-50',    dot: 'bg-gray-400' },
  { id: 'contactado', label: 'Contactado', color: 'text-blue-600',  bg: 'bg-blue-50',    dot: 'bg-blue-500' },
  { id: 'demo',       label: 'Demo',       color: 'text-yellow-600',bg: 'bg-yellow-50',  dot: 'bg-yellow-500' },
  { id: 'propuesta',  label: 'Propuesta',  color: 'text-orange-600',bg: 'bg-orange-50',  dot: 'bg-orange-500' },
  { id: 'cerrado',    label: 'Cerrado ✓',  color: 'text-green-600', bg: 'bg-green-50',   dot: 'bg-green-500' },
];

const PLAN_COLORS: Record<PlanInteres, string> = {
  basic:        'bg-gray-100 text-gray-600',
  professional: 'bg-blue-100 text-blue-700',
  premium:      'bg-purple-100 text-purple-700',
};

const EMPTY_FORM = {
  nombre: '', contacto: '', ciudad: '', telefono: '',
  email: '', estado: 'frio' as Estado, plan_interes: 'professional' as PlanInteres,
  notas: '', proxima_accion: '',
};

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

  function abrirNuevo() {
    setEditando(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function abrirEditar(p: Prospecto) {
    setEditando(p);
    setForm({
      nombre: p.nombre, contacto: p.contacto || '', ciudad: p.ciudad || '',
      telefono: p.telefono || '', email: p.email || '', estado: p.estado,
      plan_interes: p.plan_interes || 'professional',
      notas: p.notas || '', proxima_accion: p.proxima_accion || '',
    });
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
  const totalMRREstimado = prospectos.filter(p => p.estado === 'cerrado').reduce((s, p) => {
    return s + (p.plan_interes === 'premium' ? 229 : p.plan_interes === 'professional' ? 149 : 89);
  }, 0);
  const enPropuesta = prospectos.filter(p => p.estado === 'propuesta').length;

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline comercial</h1>
          <p className="text-gray-500 text-sm mt-0.5">{prospectos.length} prospectos · {enPropuesta} en propuesta · <span className="text-green-600 font-medium">{totalMRREstimado}€/mes potencial cerrado</span></p>
        </div>
        <button
          onClick={abrirNuevo}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo prospecto
        </button>
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="text-gray-400 text-sm">Cargando...</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {COLUMNAS.map(col => (
            <div
              key={col.id}
              className="flex-shrink-0 w-64 flex flex-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                if (dragging) await cambiarEstado(dragging, col.id);
                setDragging(null);
              }}
            >
              {/* Column header */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-t-lg ${col.bg} border border-b-0 border-gray-200`}>
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className={`text-xs font-semibold uppercase tracking-wide ${col.color}`}>{col.label}</span>
                <span className="ml-auto text-xs text-gray-400 font-medium">{byEstado(col.id).length}</span>
              </div>

              {/* Cards */}
              <div className={`flex-1 border border-gray-200 rounded-b-lg p-2 space-y-2 min-h-32 ${col.bg}`}>
                {byEstado(col.id).map(p => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={() => setDragging(p.id)}
                    onDragEnd={() => setDragging(null)}
                    className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${dragging === p.id ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{p.nombre}</p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${PLAN_COLORS[p.plan_interes || 'professional']}`}>
                        {(p.plan_interes || 'professional').charAt(0).toUpperCase() + (p.plan_interes || 'professional').slice(1)}
                      </span>
                    </div>

                    {p.ciudad && <p className="text-xs text-gray-400 mb-1">📍 {p.ciudad}</p>}
                    {p.contacto && <p className="text-xs text-gray-500 truncate">{p.contacto}</p>}
                    {p.proxima_accion && (
                      <p className="text-xs text-orange-600 mt-1.5 font-medium truncate">→ {p.proxima_accion}</p>
                    )}

                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                      <button onClick={() => abrirEditar(p)} className="flex-1 text-xs text-blue-500 hover:text-blue-700 text-left">Editar</button>
                      {p.estado === 'cerrado' && onConvertir && (
                        <button
                          onClick={() => onConvertir(p)}
                          className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-0.5 rounded font-medium transition-colors"
                        >
                          Convertir
                        </button>
                      )}
                      <button onClick={() => eliminar(p.id)} className="text-xs text-red-400 hover:text-red-600">✕</button>
                    </div>
                  </div>
                ))}

                {byEstado(col.id).length === 0 && (
                  <div className="text-center py-6 text-gray-300 text-xs">Sin prospectos</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editando ? 'Editar prospecto' : 'Nuevo prospecto'}
            </h2>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Nombre clínica / dentista *</label>
                  <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Clínica Dr. García" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Persona de contacto</label>
                  <input value={form.contacto} onChange={e => setForm({...form, contacto: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Dr. García" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ciudad</label>
                  <input value={form.ciudad} onChange={e => setForm({...form, ciudad: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Madrid" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Teléfono</label>
                  <input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="+34 600 000 000" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="clinica@mail.com" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Estado</label>
                  <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value as Estado})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white">
                    {COLUMNAS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Plan de interés</label>
                  <select value={form.plan_interes} onChange={e => setForm({...form, plan_interes: e.target.value as PlanInteres})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white">
                    <option value="basic">Basic — 89€/mes</option>
                    <option value="professional">Professional — 149€/mes</option>
                    <option value="premium">Premium — 229€/mes</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Próxima acción</label>
                  <input value={form.proxima_accion} onChange={e => setForm({...form, proxima_accion: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Enviar propuesta el viernes" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Notas</label>
                  <textarea value={form.notas} onChange={e => setForm({...form, notas: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Interesado en automatizar citas de ortodoncia..." />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={guardar} disabled={!form.nombre || saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition-colors">
                {saving ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear prospecto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
