import { useState } from "react";
import { absences } from "@/data/mockData";

export default function AbsencesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "rescheduled">("all");
  const [toasts, setToasts] = useState<string[]>([]);

  function showToast(msg: string) {
    setToasts((prev) => [...prev, msg]);
    setTimeout(() => setToasts((prev) => prev.slice(1)), 3000);
  }

  const filtered = absences.filter((a) => {
    const matchSearch = a.patientName.toLowerCase().includes(search.toLowerCase()) || a.patientPhone.includes(search);
    const matchFilter = filter === "all" || (filter === "rescheduled" ? a.rescheduled : !a.rescheduled);
    return matchSearch && matchFilter;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const total = absences.length;
  const rescheduled = absences.filter((a) => a.rescheduled).length;
  const waSent = absences.filter((a) => a.whatsappSent).length;
  const pending = absences.filter((a) => !a.rescheduled).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Toast */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t, i) => (
          <div key={i} className="bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            {t}
          </div>
        ))}
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Ausencias</h1>
        <p className="text-gray-500 text-sm">Gestión de pacientes que no asistieron a sus citas</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total ausencias", value: total, color: "bg-red-50 text-red-600" },
          { label: "Pendientes reprog.", value: pending, color: "bg-amber-50 text-amber-600" },
          { label: "Reprogramadas", value: rescheduled, color: "bg-green-50 text-green-600" },
          { label: "WhatsApp enviado", value: waSent, color: "bg-blue-50 text-blue-600" },
        ].map((k) => (
          <div key={k.label} className={`${k.color} rounded-xl p-4`}>
            <p className="text-3xl font-bold">{k.value}</p>
            <p className="text-sm font-medium opacity-80">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" placeholder="Buscar paciente..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {(["all","pending","rescheduled"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
              {f === "all" ? "Todas" : f === "pending" ? "Pendientes" : "Reprogramadas"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Paciente</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Fecha / Hora</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Tratamiento</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Profesional</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">WhatsApp</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-400 py-10">Sin resultados</td></tr>
              ) : filtered.map((a) => (
                <tr key={a.appointmentId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{a.patientName}</p>
                    <p className="text-gray-400 text-xs">{a.patientPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    <p className="font-medium">{a.date}</p>
                    <p className="text-gray-400">{a.time}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{a.treatment}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{a.professionalName.split(" ").slice(0, 2).join(" ")}</td>
                  <td className="px-4 py-3">
                    {a.whatsappSent ? (
                      <span className="text-green-600 text-xs flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                        Enviado
                      </span>
                    ) : <span className="text-gray-300 text-xs">No enviado</span>}
                  </td>
                  <td className="px-4 py-3">
                    {a.rescheduled ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        {a.rescheduledDate ? `Reprog. ${a.rescheduledDate}` : "Reprogramado"}
                      </span>
                    ) : (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => showToast(`📅 Reprogramando cita de ${a.patientName}...`)}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg transition-colors font-medium"
                      >
                        Reprogramar
                      </button>
                      <button
                        onClick={() => showToast(`💬 WhatsApp enviado a ${a.patientName}`)}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WA
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          {filtered.length} de {absences.length} ausencias
        </div>
      </div>
    </div>
  );
}
