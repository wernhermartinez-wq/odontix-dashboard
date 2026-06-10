import { useState } from "react";
import { appointments, getMonthlyData, absences, patients } from "@/data/mockData";
import type { Plan } from "@/hooks/usePlan";

function BarChart({ data, valueKey, labelKey, color = "#3b82f6", height = 160 }: {
  data: Array<Record<string, string | number>>;
  valueKey: string;
  labelKey: string;
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey])), 1);
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => {
        const val = Number(d[valueKey]);
        const h = Math.max((val / max) * (height - 24), 2);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-400 font-medium">{val}</span>
            <div
              className="w-full rounded-t-sm transition-all"
              style={{ height: `${h}px`, backgroundColor: color }}
            />
            <span className="text-[10px] text-gray-400">{String(d[labelKey])}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ value, total, color, label }: { value: number; total: number; color: string; label: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
        />
        <text x="48" y="53" textAnchor="middle" className="text-sm" fontSize="16" fontWeight="700" fill="#111827">
          {Math.round(pct)}%
        </text>
      </svg>
      <p className="text-xs text-gray-600 text-center font-medium">{label}</p>
      <p className="text-[11px] text-gray-400">{value} / {total}</p>
    </div>
  );
}

interface StatsPageProps {
  plan?: Plan | null;
}

export default function StatsPage({ plan }: StatsPageProps = {}) {
  const isPremium = plan === "premium";
  const [showReport, setShowReport] = useState(false);
  const currentMonth = new Date().toLocaleString("es-ES", { month: "long", year: "numeric" });
  const monthly = getMonthlyData();
  const total = appointments.length;
  const attended = appointments.filter((a) => a.status === "attended").length;
  const absent = appointments.filter((a) => a.status === "absent").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;
  const scheduled = appointments.filter((a) => a.status === "scheduled").length;
  const confirmed = appointments.filter((a) => a.confirmedByWhatsApp).length;

  const totalRevenue = monthly.reduce((acc, m) => acc + m.revenue, 0);
  const avgPerMonth = Math.round(totalRevenue / monthly.length);

  const treatmentDistrib: Record<string, number> = {};
  appointments.forEach((a) => {
    treatmentDistrib[a.treatment] = (treatmentDistrib[a.treatment] ?? 0) + 1;
  });
  const treatmentData = Object.entries(treatmentDistrib)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([treatment, count]) => ({ treatment: treatment.slice(0, 8), count }));

  const treatmentColors: Record<string, string> = {
    Limpieza: "#3b82f6", Ortodoncia: "#8b5cf6", Endodoncia: "#ef4444",
    Extracción: "#f97316", Blanqueamiento: "#eab308", Implante: "#06b6d4",
    Control: "#10b981", Radiografía: "#6b7280", Obturación: "#ec4899", Periodoncia: "#14b8a6",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Premium monthly report modal */}
      {isPremium && showReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-0.5">Reporte Premium IA</p>
                <h2 className="text-lg font-bold text-gray-900 capitalize">Reporte {currentMonth}</h2>
              </div>
              <button onClick={() => setShowReport(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="space-y-3 mb-5">
              {[
                { label: "Total citas", value: String(appointments.length), sub: "+12% vs mes anterior", ok: true },
                { label: "Tasa de asistencia", value: Math.round((appointments.filter(a=>a.status==="attended").length/appointments.length)*100) + "%", sub: "Objetivo: 80%", ok: appointments.filter(a=>a.status==="attended").length/appointments.length > 0.8 },
                { label: "Confirmaciones WA", value: appointments.filter(a=>a.confirmedByWhatsApp).length + " enviadas", sub: "Reduccion de ausencias del 23%", ok: true },
                { label: "Pacientes recuperados", value: "8", sub: "Via campanas automaticas", ok: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{item.value}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${item.ok ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.ok ? "Bien" : "Mejorar"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-purple-50 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-purple-700 mb-1">Recomendacion IA del mes</p>
              <p className="text-xs text-gray-600">Los jueves tienen un 34% mas de ausencias. Considera enviar recordatorios adicionales el miercoles por la tarde para reducir el ausentismo.</p>
            </div>
            <button
              onClick={() => { setShowReport(false); alert("PDF generado: reporte-" + currentMonth.replace(" ", "-") + ".pdf"); }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Descargar PDF
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Estadísticas y Reportes</h1>
          <p className="text-gray-500 text-sm">Análisis histórico de citas, asistencia y conversión</p>
        </div>
        {isPremium && (
          <button
            onClick={() => setShowReport(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Reporte mensual
          </button>
        )}
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total citas históricas", value: total.toLocaleString(), color: "text-gray-900" },
          { label: "Tasa de asistencia", value: `${total > 0 ? Math.round((attended / total) * 100) : 0}%`, color: "text-green-600" },
          { label: "Tasa de ausencia", value: `${total > 0 ? Math.round((absent / total) * 100) : 0}%`, color: "text-red-500" },
          { label: "Ingresos est. 6M", value: `$${(totalRevenue / 1000).toFixed(0)}K`, color: "text-blue-600" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-gray-400 text-xs mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm text-gray-900 mb-4">Citas por mes</h3>
          <BarChart data={monthly} valueKey="total" labelKey="month" color="#3b82f6" height={160} />
        </div>

        {/* Revenue bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm text-gray-900 mb-1">Ingresos estimados por mes</h3>
          <p className="text-xs text-gray-400 mb-3">Promedio mensual: ${avgPerMonth.toLocaleString()}</p>
          <BarChart
            data={monthly.map((m) => ({ month: m.month, revenue: Math.round(m.revenue / 1000) }))}
            valueKey="revenue"
            labelKey="month"
            color="#10b981"
            height={160}
          />
          <p className="text-[10px] text-gray-300 mt-1 text-right">en miles de $</p>
        </div>
      </div>

      {/* Donuts row */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-sm text-gray-900 mb-6">Indicadores de desempeño</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <DonutChart value={attended} total={total} color="#10b981" label="Asistencia" />
          <DonutChart value={absent} total={total} color="#ef4444" label="Ausentismo" />
          <DonutChart value={confirmed} total={total} color="#3b82f6" label="Confirmación WA" />
          <DonutChart value={attended} total={attended + cancelled} color="#8b5cf6" label="Conversión" />
        </div>
      </div>

      {/* Treatment distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm text-gray-900 mb-4">Distribución por tratamiento</h3>
          <BarChart data={treatmentData} valueKey="count" labelKey="treatment" color="#8b5cf6" height={160} />
        </div>

        {/* Occupancy */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm text-gray-900 mb-4">Ocupación de agenda</h3>
          <div className="space-y-3">
            {[
              { label: "Atendidos", value: attended, total, color: "bg-green-500" },
              { label: "Ausentes", value: absent, total, color: "bg-red-400" },
              { label: "Cancelados", value: cancelled, total, color: "bg-gray-300" },
              { label: "Agendados", value: scheduled, total, color: "bg-blue-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-gray-900">{item.value.toLocaleString()} ({item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              <p className="text-xs text-gray-500">Pacientes activos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{absences.filter(a => a.rescheduled).length}</p>
              <p className="text-xs text-gray-500">Ausencias recuperadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-sm text-gray-900">Resumen mensual detallado</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Mes","Total","Atendidas","Ausentes","Canceladas","Ingresos Est.","Tasa Asist."].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthly.map((m, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{m.month}</td>
                  <td className="px-4 py-3 text-gray-600">{m.total}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{m.attended}</td>
                  <td className="px-4 py-3 text-red-500">{m.absent}</td>
                  <td className="px-4 py-3 text-gray-400">{m.cancelled}</td>
                  <td className="px-4 py-3 text-gray-700">${m.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${(m.attended / m.total) * 100}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{Math.round((m.attended / m.total) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
