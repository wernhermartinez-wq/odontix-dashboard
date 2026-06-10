import { useState } from "react";
import { followUps } from "@/data/mockData";
import type { Plan } from "@/hooks/usePlan";

const typeColors = { control: "bg-blue-100 text-blue-700", limpieza: "bg-teal-100 text-teal-700", tratamiento: "bg-violet-100 text-violet-700" };
const typeLabels = { control: "Control", limpieza: "Limpieza", tratamiento: "Tratamiento" };
const priorityColors = { high: "bg-red-100 text-red-700", medium: "bg-amber-100 text-amber-700", low: "bg-gray-100 text-gray-500" };
const priorityLabels = { high: "Alta", medium: "Media", low: "Baja" };

const AI_CAMPAIGNS = [
  {
    id: "riesgo",
    label: "En riesgo",
    description: "Sin visita en 3-6 meses",
    count: 12,
    color: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    patients: ["Maria Lopez", "Carlos Ruiz", "Ana Torres", "+9 mas"],
    message: "Hola! Te recordamos que hace tiempo no nos visitas. Tu salud bucal es importante, agenda tu control ahora y recibe un 10% de descuento este mes.",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  },
  {
    id: "perdidos",
    label: "Pacientes perdidos",
    description: "Sin visita en 6-12 meses",
    count: 8,
    color: "from-red-500 to-rose-500",
    bgLight: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    patients: ["Jose Fernandez", "Laura Diaz", "Pedro Sanchez", "+5 mas"],
    message: "Hola! Te echamos de menos en la clinica. Han pasado varios meses desde tu ultima visita. Este mes tenemos horarios disponibles para ti. Podemos ayudarte?",
    icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
  },
  {
    id: "inactivos",
    label: "Inactivos",
    description: "Sin visita en mas de 12 meses",
    count: 5,
    color: "from-gray-500 to-gray-600",
    bgLight: "bg-gray-50",
    textColor: "text-gray-600",
    borderColor: "border-gray-200",
    patients: ["Carmen Vega", "Miguel Ortiz", "+3 mas"],
    message: "Hola! Sabemos que ha pasado mucho tiempo. Si quieres retomar tu cuidado dental, estamos aqui para ayudarte. Sin compromiso, podemos agendar una consulta gratuita.",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

interface FollowUpsPageProps {
  plan?: Plan | null;
}

export default function FollowUpsPage({ plan }: FollowUpsPageProps = {}) {
  const isPremium = plan === "premium";
  const [typeFilter, setTypeFilter] = useState<"all" | "control" | "limpieza" | "tratamiento">("all");
  const [search, setSearch] = useState("");
  const [toasts, setToasts] = useState<string[]>([]);
  const [launchedCampaigns, setLaunchedCampaigns] = useState<string[]>([]);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

  function showToast(msg: string) {
    setToasts((p) => [...p, msg]);
    setTimeout(() => setToasts((p) => p.slice(1)), 3000);
  }

  function launchCampaign(id: string, count: number) {
    setLaunchedCampaigns((p) => [...p, id]);
    showToast("Campana lanzada: " + count + " mensajes enviados via WhatsApp");
  }

  const today = "2026-06-09";
  const filtered = followUps.filter((f) => {
    const matchType = typeFilter === "all" || f.type === typeFilter;
    const matchSearch = f.patientName.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const overdue = followUps.filter((f) => f.dueDate < today);
  const upcoming = followUps.filter((f) => f.dueDate >= today);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t, i) => (
          <div key={i} className="bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            {t}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Seguimientos</h1>
          <p className="text-gray-500 text-sm">Controles, limpiezas y tratamientos pendientes</p>
        </div>
        {isPremium && (
          <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            Premium con IA
          </span>
        )}
      </div>

      {/* PREMIUM: AI Campaigns section */}
      {isPremium && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Campanas automaticas con IA</p>
              <p className="text-xs text-gray-500">El sistema detecto 25 pacientes que necesitan reactivacion</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {AI_CAMPAIGNS.map((c) => {
              const launched = launchedCampaigns.includes(c.id);
              const expanded = expandedCampaign === c.id;
              return (
                <div key={c.id} className={`bg-white rounded-xl border ${c.borderColor} p-4`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={c.icon} />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{c.label}</p>
                        <p className="text-xs text-gray-400">{c.description}</p>
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${c.textColor}`}>{c.count}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {c.patients.map((p, i) => (
                      <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${c.bgLight} ${c.textColor} font-medium`}>{p}</span>
                    ))}
                  </div>

                  <button
                    onClick={() => setExpandedCampaign(expanded ? null : c.id)}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium mb-3 flex items-center gap-1"
                  >
                    <svg className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    {expanded ? "Ocultar mensaje" : "Ver mensaje IA"}
                  </button>

                  {expanded && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3 text-xs text-gray-600 leading-relaxed border border-gray-100">
                      {c.message}
                    </div>
                  )}

                  <button
                    onClick={() => !launched && launchCampaign(c.id, c.count)}
                    className={`w-full text-xs font-semibold py-2 rounded-lg transition-colors ${
                      launched
                        ? "bg-green-50 text-green-600 border border-green-200 cursor-default"
                        : `bg-gradient-to-r ${c.color} text-white hover:opacity-90`
                    }`}
                  >
                    {launched ? "Campana enviada" : `Lanzar campana (${c.count} msgs)`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Vencidos", value: overdue.length, color: "text-red-600", bg: "bg-red-50" },
          { label: "Proximos", value: upcoming.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Controles", value: followUps.filter(f => f.type === "control").length, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Limpiezas", value: followUps.filter(f => f.type === "limpieza").length, color: "text-teal-600", bg: "bg-teal-50" },
        ].map((k) => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4`}>
            <p className={`text-3xl font-bold ${k.color}`}>{k.value}</p>
            <p className={`text-sm font-medium ${k.color} opacity-80`}>{k.label}</p>
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
          {(["all","control","limpieza","tratamiento"] as const).map((f) => (
            <button key={f} onClick={() => setTypeFilter(f)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${typeFilter === f ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
              {f === "all" ? "Todos" : typeLabels[f]}
            </button>
          ))}
        </div>
        <button
          onClick={() => { filtered.filter(f => !f.whatsappSent).forEach(f => showToast("WA enviado a " + f.patientName)); }}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Enviar WA masivo
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((f) => {
          const isOverdue = f.dueDate < today;
          return (
            <div key={f.id} className={`bg-white rounded-xl border p-4 ${isOverdue ? "border-red-200" : "border-gray-200"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-xs font-bold">
                    {f.patientName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{f.patientName}</p>
                    <p className="text-gray-400 text-xs">{f.patientPhone}</p>
                  </div>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${priorityColors[f.priority]}`}>
                  {priorityLabels[f.priority]}
                </span>
              </div>
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeColors[f.type]}`}>{typeLabels[f.type]}</span>
                  {isOverdue && <span className="text-[11px] text-red-600 font-medium">Vencido</span>}
                </div>
                <p className="text-xs text-gray-600">{f.treatment}</p>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>Ultima visita: {f.lastVisit}</span>
                  <span className={isOverdue ? "text-red-500 font-medium" : "text-gray-400"}>Vence: {f.dueDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => showToast("Agendando cita para " + f.patientName)}
                  className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg transition-colors font-medium"
                >
                  Agendar
                </button>
                <button
                  onClick={() => showToast("WhatsApp enviado a " + f.patientName)}
                  className={`flex-1 text-xs py-1.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-1 ${f.whatsappSent ? "bg-green-50 text-green-600 border border-green-200" : "bg-green-600 hover:bg-green-700 text-white"}`}
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  {f.whatsappSent ? "Enviado" : "Enviar WA"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <p>No se encontraron seguimientos</p>
        </div>
      )}
    </div>
  );
}
