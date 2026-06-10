import { useState } from "react";
import { patients, appointments } from "@/data/mockData";
import type { Patient } from "@/data/mockData";

const insuranceColors: Record<string, string> = {
  "OSDE 210": "bg-blue-100 text-blue-700",
  "Swiss Medical": "bg-indigo-100 text-indigo-700",
  "Galeno": "bg-violet-100 text-violet-700",
  "Medifé": "bg-sky-100 text-sky-700",
  "IOMA": "bg-cyan-100 text-cyan-700",
  "Sancor Salud": "bg-teal-100 text-teal-700",
  "Particular": "bg-gray-100 text-gray-600",
  "PAMI": "bg-amber-100 text-amber-700",
  "Federada Salud": "bg-orange-100 text-orange-700",
};

function PatientModal({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const patientAppts = appointments.filter((a) => a.patientId === patient.id).sort((a, b) => b.date.localeCompare(a.date));
  const attended = patientAppts.filter(a => a.status === "attended").length;
  const absent = patientAppts.filter(a => a.status === "absent").length;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
              {patient.name[0]}{patient.lastName[0]}
            </div>
            <div>
              <h2 className="text-gray-900 font-bold text-lg">{patient.fullName}</h2>
              <p className="text-gray-500 text-sm">{patient.phone} · {patient.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-400 text-xs">DNI</p><p className="font-medium text-gray-900">{patient.dni}</p></div>
          <div><p className="text-gray-400 text-xs">Edad</p><p className="font-medium text-gray-900">{patient.age} años</p></div>
          <div><p className="text-gray-400 text-xs">Fecha de nacimiento</p><p className="font-medium text-gray-900">{patient.birthDate}</p></div>
          <div><p className="text-gray-400 text-xs">Género</p><p className="font-medium text-gray-900">{patient.gender === "M" ? "Masculino" : "Femenino"}</p></div>
          <div><p className="text-gray-400 text-xs">Cobertura</p><p className="font-medium text-gray-900">{patient.insurance}</p></div>
          <div><p className="text-gray-400 text-xs">Dirección</p><p className="font-medium text-gray-900">{patient.address}</p></div>
          <div><p className="text-gray-400 text-xs">Registrado</p><p className="font-medium text-gray-900">{patient.registeredAt}</p></div>
          <div><p className="text-gray-400 text-xs">Última visita</p><p className="font-medium text-gray-900">{patient.lastVisit ?? "—"}</p></div>
        </div>

        {patient.notes && (
          <div className="px-5 pb-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
              <strong>Nota clínica:</strong> {patient.notes}
            </div>
          </div>
        )}

        <div className="px-5 pb-3 flex gap-2 flex-wrap">
          {patient.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>

        {/* Stats */}
        <div className="px-5 pb-3 grid grid-cols-3 gap-3">
          {[
            { label: "Total visitas", value: patient.totalVisits },
            { label: "Atendidas", value: attended },
            { label: "Ausencias", value: absent },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* History */}
        <div className="px-5 pb-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Historial de citas</h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {patientAppts.slice(0, 15).map((a) => (
              <div key={a.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-gray-100 last:border-0">
                <span className="text-gray-400 w-24 flex-shrink-0">{a.date} {a.time}</span>
                <span className="text-gray-700 flex-1">{a.treatment}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                  a.status === "attended" ? "bg-green-100 text-green-700" :
                  a.status === "absent" ? "bg-red-100 text-red-700" :
                  "bg-blue-100 text-blue-700"
                }`}>
                  {a.status === "attended" ? "Atendido" : a.status === "absent" ? "Ausente" : "Agendado"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [sortKey, setSortKey] = useState<"name" | "lastVisit" | "totalVisits">("name");
  const [insuranceFilter, setInsuranceFilter] = useState("all");

  const insurances = ["all", ...Array.from(new Set(patients.map((p) => p.insurance)))];

  const filtered = patients
    .filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = p.fullName.toLowerCase().includes(q) || p.phone.includes(q) || p.dni.includes(q) || p.email.toLowerCase().includes(q);
      const matchInsurance = insuranceFilter === "all" || p.insurance === insuranceFilter;
      return matchSearch && matchInsurance;
    })
    .sort((a, b) => {
      if (sortKey === "name") return a.fullName.localeCompare(b.fullName);
      if (sortKey === "lastVisit") return (b.lastVisit ?? "").localeCompare(a.lastVisit ?? "");
      return b.totalVisits - a.totalVisits;
    });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {selectedPatient && <PatientModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500 text-sm">{patients.length} pacientes registrados</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Nuevo paciente
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono, DNI o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <select value={insuranceFilter} onChange={(e) => setInsuranceFilter(e.target.value)} className="border border-gray-200 rounded-lg text-sm px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">Todas las coberturas</option>
          {insurances.slice(1).map((ins) => <option key={ins} value={ins}>{ins}</option>)}
        </select>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)} className="border border-gray-200 rounded-lg text-sm px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="name">Ordenar: Nombre</option>
          <option value="lastVisit">Ordenar: Última visita</option>
          <option value="totalVisits">Ordenar: Más visitas</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Paciente</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Contacto</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Cobertura</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Edad</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Visitas</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Última visita</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Tags</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                        {p.name[0]}{p.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{p.fullName}</p>
                        <p className="text-gray-400 text-xs">DNI {p.dni}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700 text-xs">{p.phone}</p>
                    <p className="text-gray-400 text-xs truncate max-w-40">{p.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${insuranceColors[p.insurance] ?? "bg-gray-100 text-gray-600"}`}>
                      {p.insurance}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{p.age} años</td>
                  <td className="px-4 py-3 text-gray-600 text-xs font-medium">{p.totalVisits}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.lastVisit ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {p.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedPatient(p)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          {filtered.length} de {patients.length} pacientes
        </div>
      </div>
    </div>
  );
}
