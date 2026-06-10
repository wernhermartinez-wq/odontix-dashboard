import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Clinica {
  id: string;
  nombre: string;
  email: string;
  activo: boolean;
  plan?: string;
}

interface AdminClinicasPageProps {
  onVerComo: (clinica: { id: string; nombre: string }) => void;
}

const PLANES = ['basic', 'professional', 'premium'];

const planColors: Record<string, string> = {
  basic: 'bg-gray-100 text-gray-600',
  professional: 'bg-blue-100 text-blue-700',
  premium: 'bg-purple-100 text-purple-700',
};

export default function AdminClinicasPage({ onVerComo }: AdminClinicasPageProps) {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(true);
  const [planes, setPlanes] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [newClinica, setNewClinica] = useState({ nombre: '', email: '', telefono: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarClinicas();
  }, []);

  async function cargarClinicas() {
    const { data } = await supabase.from('clientes').select('*').order('nombre');
    if (data) {
      setClinicas(data);
      // Cargar planes
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
    // Check if record exists first
    const { data: existing } = await supabase
      .from('odontix_config')
      .select('cliente_id')
      .eq('cliente_id', clienteId)
      .single();

    if (existing) {
      await supabase
        .from('odontix_config')
        .update({ plan })
        .eq('cliente_id', clienteId);
    } else {
      await supabase
        .from('odontix_config')
        .insert({
          cliente_id: clienteId,
          plan,
          horario_apertura: '09:00',
          horario_cierre: '18:00',
          dias_atencion: [1, 2, 3, 4, 5],
          whatsapp_activo: true,
        });
    }
    setPlanes(prev => ({ ...prev, [clienteId]: plan }));
  }

  async function crearClinica() {
    setSaving(true);
    const { data } = await supabase
      .from('clientes')
      .insert({ nombre: newClinica.nombre, email: newClinica.email, telefono: newClinica.telefono, activo: true })
      .select('id')
      .single();

    if (data) {
      await supabase.from('odontix_config').insert({
        cliente_id: data.id,
        plan: 'basic',
        horario_apertura: '09:00',
        horario_cierre: '18:00',
        dias_atencion: [1, 2, 3, 4, 5],
        whatsapp_activo: true,
      });
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
          <h1 className="text-2xl font-bold text-gray-900">Clínicas</h1>
          <p className="text-gray-500 text-sm mt-1">{clinicas.length} clínicas registradas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva clínica
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Cargando...</div>
      ) : (
        <div className="space-y-3">
          {clinicas.map((c) => {
            const plan = planes[c.id] || 'basic';
            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold text-sm">{c.nombre.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{c.nombre}</p>
                  <p className="text-gray-400 text-xs truncate">{c.email}</p>
                </div>
                <select
                  value={plan}
                  onChange={(e) => cambiarPlan(c.id, e.target.value)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${planColors[plan] || planColors.basic}`}
                >
                  {PLANES.map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
                <button
                  onClick={() => onVerComo({ id: c.id, nombre: c.nombre })}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap transition-colors"
                >
                  Ver como →
                </button>
              </div>
            );
          })}
          {clinicas.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">Sin clínicas registradas</p>
              <button onClick={() => setShowModal(true)} className="mt-3 text-blue-500 text-sm hover:underline">
                Crear primera clínica
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal nueva clínica */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Nueva clínica</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={newClinica.nombre}
                  onChange={(e) => setNewClinica({ ...newClinica, nombre: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Clínica Dental García"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={newClinica.email}
                  onChange={(e) => setNewClinica({ ...newClinica, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="clinica@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={newClinica.telefono}
                  onChange={(e) => setNewClinica({ ...newClinica, telefono: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={crearClinica}
                disabled={!newClinica.nombre || saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium transition-colors"
              >
                {saving ? 'Guardando...' : 'Crear clínica'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
