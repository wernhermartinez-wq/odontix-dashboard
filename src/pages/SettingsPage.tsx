import { useState } from "react";
import { professionals } from "@/data/mockData";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Toggle({ label, description, defaultOn = false }: { label: string; description?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${on ? "bg-blue-600" : "bg-gray-200"}`}
        style={{ height: "22px", width: "40px" }}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-4.5" : "translate-x-0"}`} style={{ transform: on ? "translateX(18px)" : "translateX(0)" }} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [toasts, setToasts] = useState<string[]>([]);
  function showToast(msg: string) {
    setToasts((p) => [...p, msg]);
    setTimeout(() => setToasts((p) => p.slice(1)), 2500);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t, i) => (
          <div key={i} className="bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            {t}
          </div>
        ))}
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 text-sm">Ajustes del sistema y automatizaciones</p>
      </div>

      {/* Clinic info */}
      <Section title="Información de la clínica">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Nombre de la clínica", value: "Centro Dental Odontix" },
            { label: "Teléfono principal", value: "+549 11 4000-0000" },
            { label: "Email de contacto", value: "info@odontix.com" },
            { label: "Dirección", value: "Av. Corrientes 1234, CABA" },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs font-medium text-gray-500 block mb-1">{f.label}</label>
              <input defaultValue={f.value} className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          ))}
        </div>
        <button onClick={() => showToast("✅ Datos de clínica guardados")} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Guardar cambios
        </button>
      </Section>

      {/* WhatsApp */}
      <Section title="Integración WhatsApp">
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Bot activo</p>
            <p className="text-xs text-green-600">+549 11 4000-0000 · Conectado hace 2h</p>
          </div>
          <button className="text-xs text-red-600 hover:text-red-800 font-medium">Desconectar</button>
        </div>
        <div className="space-y-0">
          <Toggle label="Confirmación automática de citas" description="Envía WA 24h antes de cada cita" defaultOn />
          <Toggle label="Recordatorio 2 horas antes" description="Mensaje de recordatorio el día de la cita" defaultOn />
          <Toggle label="Notificación de ausencia" description="Mensaje automático al registrar una ausencia" defaultOn />
          <Toggle label="Invitación de seguimiento" description="WA automático para controles y limpiezas" defaultOn />
          <Toggle label="Encuesta de satisfacción post-consulta" description="Enviada 1h después de la cita" />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="text-xs font-medium text-gray-500 block mb-1">Mensaje de bienvenida</label>
          <textarea
            defaultValue="¡Hola {nombre}! 👋 Te recordamos que tu cita en *Odontix* es el *{fecha}* a las *{hora}* con {profesional}. ¿Confirmas tu asistencia? Responde SÍ o NO."
            rows={3}
            className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <button onClick={() => showToast("✅ Configuración de WhatsApp guardada")} className="mt-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Guardar
        </button>
      </Section>

      {/* Professionals */}
      <Section title="Profesionales">
        <div className="space-y-2.5">
          {professionals.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: p.color }}>
                {p.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-400">{p.specialty}</p>
              </div>
              <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">Editar</button>
            </div>
          ))}
        </div>
        <button onClick={() => showToast("📋 Abriendo formulario de nuevo profesional...")} className="mt-4 w-full border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Agregar profesional
        </button>
      </Section>

      {/* Schedule */}
      <Section title="Horarios de atención">
        <div className="space-y-2">
          {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"].map((day, i) => (
            <div key={day} className="flex items-center gap-3 py-1.5">
              <Toggle label={day} defaultOn={i < 5} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Apertura</label>
            <input type="time" defaultValue="08:00" className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Cierre</label>
            <input type="time" defaultValue="18:00" className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
        </div>
        <button onClick={() => showToast("✅ Horarios guardados")} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Guardar horarios
        </button>
      </Section>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <h3 className="font-semibold text-sm text-red-900 mb-3">Zona de peligro</h3>
        <div className="space-y-2">
          <button className="text-sm text-red-700 hover:text-red-900 font-medium">Exportar todos los datos (CSV)</button>
          <br />
          <button className="text-sm text-red-700 hover:text-red-900 font-medium">Eliminar historial de ausencias</button>
        </div>
      </div>
    </div>
  );
}
