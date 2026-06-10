import { useState } from "react";
import { appointments, professionals } from "@/data/mockData";
import type { Appointment } from "@/data/mockData";

const statusColors: Record<string, string> = {
  attended: "bg-green-100 text-green-700 border-green-200",
  absent: "bg-red-100 text-red-700 border-red-200",
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};
const statusLabels: Record<string, string> = {
  attended: "Atendido",
  absent: "Ausente",
  scheduled: "Agendado",
  cancelled: "Cancelado",
};
const treatmentColors: Record<string, string> = {
  Limpieza: "#3b82f6", Ortodoncia: "#8b5cf6", Endodoncia: "#ef4444",
  Extracción: "#f97316", Blanqueamiento: "#eab308", Implante: "#06b6d4",
  Control: "#10b981", Radiografía: "#6b7280", Obturación: "#ec4899", Periodoncia: "#14b8a6",
};

function pad(n: number) { return String(n).padStart(2, "0"); }
function dateStr(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

export default function AgendaPage() {
  const [view, setView] = useState<"calendar" | "table">("table");
  const [selectedProfessional, setSelectedProfessional] = useState("all");
  const [selectedDate, setSelectedDate] = useState(dateStr(new Date("2026-06-09")));
  const [calendarOffset, setCalendarOffset] = useState(0);

  const filtered = appointments.filter((a) => {
    const profMatch = selectedProfessional === "all" || a.professionalId === selectedProfessional;
    return profMatch;
  });

  const tableFiltered = filtered.filter((a) => a.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));

  // Calendar month
  const baseDate = new Date("2026-06-01");
  baseDate.setMonth(baseDate.getMonth() + calendarOffset);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = new Date(year, month, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });

  function getDayAppointments(day: number): Appointment[] {
    const ds = `${year}-${pad(month + 1)}-${pad(day)}`;
    return filtered.filter((a) => a.date === ds);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500 text-sm">{appointments.length} citas en el sistema</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(["table", "calendar"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === v ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
              >
                {v === "table" ? "Lista" : "Calendario"}
              </button>
            ))}
          </div>
          {/* Professional filter */}
          <select
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value)}
            className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los profesionales</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {view === "table" ? (
        <div className="space-y-4">
          {/* Date picker */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500 text-sm">{tableFiltered.length} citas</span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Hora</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Paciente</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Profesional</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Tratamiento</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Sala</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Duración</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">WhatsApp</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {tableFiltered.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-gray-400 py-10">Sin citas para esta fecha</td></tr>
                  ) : tableFiltered.map((appt) => (
                    <tr key={appt.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm text-gray-900 font-medium">{appt.time}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{appt.patientName}</div>
                        <div className="text-gray-400 text-xs">{appt.patientPhone}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{appt.professionalName.split(" ").slice(0, 2).join(" ")}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: treatmentColors[appt.treatment] }} />
                          <span className="text-gray-700 text-xs">{appt.treatment}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{appt.room}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{appt.duration} min</td>
                      <td className="px-4 py-3">
                        {appt.confirmedByWhatsApp ? (
                          <span className="text-green-500 text-xs flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                            Confirmado
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">Pendiente</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusColors[appt.status]}`}>
                          {statusLabels[appt.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        // Calendar view
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button onClick={() => setCalendarOffset(calendarOffset - 1)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            </button>
            <h3 className="text-sm font-semibold text-gray-900 capitalize">{monthLabel}</h3>
            <button onClick={() => setCalendarOffset(calendarOffset + 1)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
          {/* Days header */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map((d) => (
              <div key={d} className="text-center text-[11px] font-medium text-gray-400 py-2">{d}</div>
            ))}
          </div>
          {/* Grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} className="border-b border-r border-gray-100 min-h-20 bg-gray-50/50" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayAppts = getDayAppointments(day);
              const ds = `${year}-${pad(month + 1)}-${pad(day)}`;
              const isToday = ds === "2026-06-09";
              return (
                <div
                  key={day}
                  className={`border-b border-r border-gray-100 min-h-20 p-1.5 cursor-pointer hover:bg-blue-50/50 transition-colors ${isToday ? "bg-blue-50/70" : ""}`}
                  onClick={() => { setSelectedDate(ds); setView("table"); }}
                >
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? "bg-blue-600 text-white" : "text-gray-700"}`}>{day}</span>
                  {dayAppts.slice(0, 3).map((a, idx) => (
                    <div key={idx} className="text-[10px] px-1 py-0.5 rounded mb-0.5 truncate text-white" style={{ backgroundColor: treatmentColors[a.treatment] + "cc" }}>
                      {a.time} {a.patientName.split(" ")[0]}
                    </div>
                  ))}
                  {dayAppts.length > 3 && (
                    <div className="text-[10px] text-gray-400 px-1">+{dayAppts.length - 3} más</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
