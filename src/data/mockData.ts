// ─── Types ────────────────────────────────────────────────────────────────────

export type Gender = "M" | "F";
export type AppointmentStatus = "scheduled" | "attended" | "absent" | "cancelled";
export type TreatmentType =
  | "Limpieza"
  | "Ortodoncia"
  | "Endodoncia"
  | "Extracción"
  | "Blanqueamiento"
  | "Implante"
  | "Control"
  | "Radiografía"
  | "Obturación"
  | "Periodoncia";

export interface Patient {
  id: string;
  name: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  age: number;
  gender: Gender;
  dni: string;
  address: string;
  insurance: string;
  registeredAt: string;
  lastVisit: string | null;
  nextAppointment: string | null;
  totalVisits: number;
  notes: string;
  tags: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  professionalId: string;
  professionalName: string;
  date: string;
  time: string;
  duration: number;
  treatment: TreatmentType;
  status: AppointmentStatus;
  notes: string;
  room: string;
  confirmedByWhatsApp: boolean;
  followUpRequired: boolean;
  nextFollowUpDate?: string;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  color: string;
  avatar: string;
}

export interface AbsenceRecord {
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  treatment: TreatmentType;
  professionalName: string;
  rescheduled: boolean;
  whatsappSent: boolean;
  rescheduledDate?: string;
}

export interface FollowUp {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  type: "control" | "limpieza" | "tratamiento";
  dueDate: string;
  lastVisit: string;
  treatment: string;
  priority: "high" | "medium" | "low";
  whatsappSent: boolean;
}

// ─── Professionals ─────────────────────────────────────────────────────────────

export const professionals: Professional[] = [
  { id: "p1", name: "Dr. Alejandro Ríos", specialty: "Odontología General", color: "#2563eb", avatar: "AR" },
  { id: "p2", name: "Dra. Carolina Medina", specialty: "Ortodoncia", color: "#7c3aed", avatar: "CM" },
  { id: "p3", name: "Dr. Matías Torres", specialty: "Endodoncia", color: "#059669", avatar: "MT" },
  { id: "p4", name: "Dra. Valentina Cruz", specialty: "Periodoncia", color: "#d97706", avatar: "VC" },
];

// ─── Patients ──────────────────────────────────────────────────────────────────

const firstNames = [
  "Lucía","Martín","Valentina","Agustín","Camila","Santiago","Sofía","Matías",
  "Isabella","Tomás","Emma","Nicolás","Florencia","Joaquín","Victoria","Diego",
  "Catalina","Sebastián","Antonella","Lucas","Bianca","Facundo","Rocío","Gonzalo",
  "Julieta","Ramiro","Pilar","Ignacio","Natalia","Bruno","Daniela","Rodrigo",
  "Mariana","Emilio","Paula","Federico","Micaela","Leandro","Celeste","Hernán",
  "Alejandra","Ezequiel","Valeria","Andrés","Jimena","Pablo","Gabriela","Sergio",
  "Claudia","Maximiliano",
];
const lastNames = [
  "García","Rodríguez","López","Martínez","González","Pérez","Sánchez","Ramírez",
  "Torres","Flores","Rivera","Gómez","Díaz","Morales","Jiménez","Herrera",
  "Medina","Castro","Cruz","Ortega","Vega","Rojas","Álvarez","Mendoza",
  "Ríos","Silva","Suárez","Delgado","Vargas","Ramos","Gutiérrez","Molina",
  "Reyes","Serrano","Blanco","Navarro","Moreno","Ibáñez","Cabrera","Fuentes",
  "Luna","Acosta","Aguilar","Bermúdez","Villanueva","Cárdenas","Soto","Pizarro",
  "Carrasco","Figueroa",
];
const insurances = [
  "OSDE 210","Swiss Medical","Galeno","Medifé","IOMA","Sancor Salud","Particular",
  "PAMI","Federada Salud","Particular","Particular","Swiss Medical",
];
const tagSets = [
  ["Ortodoncia","VIP"],["Regular"],["Embarazada"],["Diabético"],["Hipertenso"],
  ["Alérgico a penicilina"],["VIP","Regular"],["Regular"],["Implante pendiente"],
  ["Seguro premium"],["Nuevo paciente"],["Regular"],
];

function rndSeeded(seed: number, max: number): number {
  return ((seed * 1664525 + 1013904223) >>> 0) % max;
}

function pad(n: number): string { return String(n).padStart(2, "0"); }

function dateStr(daysOffset: number): string {
  const d = new Date("2026-06-09");
  d.setDate(d.getDate() + daysOffset);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const patients: Patient[] = firstNames.map((fn, i) => {
  const ln = lastNames[i];
  const age = 18 + rndSeeded(i * 7, 55);
  const gender: Gender = i % 3 === 0 ? "M" : "F";
  const visits = 1 + rndSeeded(i * 13, 20);
  const year = 2026 - age;
  const m = 1 + rndSeeded(i * 3, 12);
  const day = 1 + rndSeeded(i * 5, 27);
  const phoneA = 4000 + rndSeeded(i * 11, 3000);
  const phoneB = 1000 + rndSeeded(i * 17, 9000);
  return {
    id: `pat-${i + 1}`,
    name: fn,
    lastName: ln,
    fullName: `${fn} ${ln}`,
    phone: `+549 11 ${phoneA}-${phoneB}`,
    email: `${fn.toLowerCase().replace(/á/g,"a").replace(/é/g,"e").replace(/í/g,"i").replace(/ó/g,"o").replace(/ú/g,"u")}.${ln.toLowerCase().replace(/á/g,"a").replace(/é/g,"e").replace(/í/g,"i").replace(/ó/g,"o").replace(/ú/g,"u")}@email.com`,
    birthDate: `${year}-${pad(m)}-${pad(day)}`,
    age,
    gender,
    dni: String(20000000 + rndSeeded(i * 23, 22000000)),
    address: `Av. Corrientes ${100 + rndSeeded(i * 9, 9900)}, CABA`,
    insurance: insurances[i % insurances.length],
    registeredAt: dateStr(-(30 + rndSeeded(i * 7, 700))),
    lastVisit: visits > 0 ? dateStr(-(1 + rndSeeded(i * 11, 89))) : null,
    nextAppointment: i % 2 === 0 ? dateStr(1 + rndSeeded(i * 3, 29)) : null,
    totalVisits: visits,
    notes: i % 5 === 0 ? "Paciente con ansiedad dental. Requiere trato especial." : "",
    tags: tagSets[i % tagSets.length],
  };
});

// ─── Appointments ──────────────────────────────────────────────────────────────

const treatments: TreatmentType[] = [
  "Limpieza","Ortodoncia","Endodoncia","Extracción","Blanqueamiento",
  "Implante","Control","Radiografía","Obturación","Periodoncia",
];
const rooms = ["Consultorio 1","Consultorio 2","Consultorio 3","Consultorio 4"];
const timeSlots = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30",
];

function statusForDate(dateOffset: number, seed: number): AppointmentStatus {
  const r = rndSeeded(seed, 100);
  if (dateOffset < 0) {
    if (r < 70) return "attended";
    if (r < 87) return "absent";
    return "cancelled";
  }
  if (dateOffset === 0) {
    if (r < 40) return "attended";
    if (r < 55) return "absent";
    return "scheduled";
  }
  return "scheduled";
}

export const appointments: Appointment[] = [];
let apptCounter = 0;

// Today
for (let i = 0; i < 14; i++) {
  const patient = patients[i % patients.length];
  const prof = professionals[i % professionals.length];
  apptCounter++;
  appointments.push({
    id: `appt-${apptCounter}`,
    patientId: patient.id,
    patientName: patient.fullName,
    patientPhone: patient.phone,
    professionalId: prof.id,
    professionalName: prof.name,
    date: dateStr(0),
    time: timeSlots[i % timeSlots.length],
    duration: [30,45,60,90][i % 4],
    treatment: treatments[i % treatments.length],
    status: statusForDate(0, apptCounter * 7),
    notes: "",
    room: rooms[i % rooms.length],
    confirmedByWhatsApp: rndSeeded(apptCounter * 3, 10) > 3,
    followUpRequired: rndSeeded(apptCounter * 5, 10) > 6,
  });
}

// Past 60 days
for (let day = -60; day < 0; day++) {
  const dow = ((new Date("2026-06-09").getDay() + day) % 7 + 7) % 7;
  if (dow === 0 || dow === 6) continue;
  const count = 8 + rndSeeded(Math.abs(day) * 3, 7);
  for (let i = 0; i < count; i++) {
    const patient = patients[(apptCounter + i) % patients.length];
    const prof = professionals[i % professionals.length];
    apptCounter++;
    appointments.push({
      id: `appt-${apptCounter}`,
      patientId: patient.id,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      professionalId: prof.id,
      professionalName: prof.name,
      date: dateStr(day),
      time: timeSlots[i % timeSlots.length],
      duration: [30,45,60,90][i % 4],
      treatment: treatments[i % treatments.length],
      status: statusForDate(day, apptCounter * 7),
      notes: "",
      room: rooms[i % rooms.length],
      confirmedByWhatsApp: rndSeeded(apptCounter * 3, 10) > 3,
      followUpRequired: rndSeeded(apptCounter * 5, 10) > 6,
      nextFollowUpDate: rndSeeded(apptCounter * 5, 10) > 6 ? dateStr(7 + rndSeeded(apptCounter, 53)) : undefined,
    });
  }
}

// Future 30 days
for (let day = 1; day <= 30; day++) {
  const dow = ((new Date("2026-06-09").getDay() + day) % 7 + 7) % 7;
  if (dow === 0 || dow === 6) continue;
  const count = 8 + rndSeeded(day * 3, 6);
  for (let i = 0; i < count; i++) {
    const patient = patients[(apptCounter + i) % patients.length];
    const prof = professionals[i % professionals.length];
    apptCounter++;
    appointments.push({
      id: `appt-${apptCounter}`,
      patientId: patient.id,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      professionalId: prof.id,
      professionalName: prof.name,
      date: dateStr(day),
      time: timeSlots[i % timeSlots.length],
      duration: [30,45,60,90][i % 4],
      treatment: treatments[i % treatments.length],
      status: "scheduled",
      notes: "",
      room: rooms[i % rooms.length],
      confirmedByWhatsApp: rndSeeded(apptCounter * 3, 10) > 5,
      followUpRequired: false,
    });
  }
}

// ─── Absences ─────────────────────────────────────────────────────────────────

export const absences: AbsenceRecord[] = appointments
  .filter((a) => a.status === "absent")
  .map((a, i) => ({
    appointmentId: a.id,
    patientId: a.patientId,
    patientName: a.patientName,
    patientPhone: a.patientPhone,
    date: a.date,
    time: a.time,
    treatment: a.treatment,
    professionalName: a.professionalName,
    rescheduled: rndSeeded(i * 7, 10) > 5,
    whatsappSent: rndSeeded(i * 3, 10) > 4,
    rescheduledDate: rndSeeded(i * 7, 10) > 5 ? dateStr(1 + rndSeeded(i, 13)) : undefined,
  }));

// ─── Follow-ups ───────────────────────────────────────────────────────────────

export const followUps: FollowUp[] = patients.slice(0, 35).map((p, i) => {
  const types: Array<"control" | "limpieza" | "tratamiento"> = ["control","limpieza","tratamiento"];
  const type = types[i % 3];
  const priorities: Array<"high" | "medium" | "low"> = ["high","medium","low"];
  return {
    id: `fu-${i + 1}`,
    patientId: p.id,
    patientName: p.fullName,
    patientPhone: p.phone,
    type,
    dueDate: dateStr(-5 + rndSeeded(i * 7, 35)),
    lastVisit: dateStr(-(30 + rndSeeded(i * 11, 150))),
    treatment: type === "limpieza" ? "Limpieza semestral" : type === "control" ? "Control post-tratamiento" : "Tratamiento de conducto pendiente",
    priority: priorities[i % 3],
    whatsappSent: rndSeeded(i * 5, 10) > 5,
  };
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getTodayStr(): string { return dateStr(0); }

export function getTodayAppointments(): Appointment[] {
  return appointments.filter((a) => a.date === dateStr(0));
}

export function getWeeklyData() {
  const labels = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
  return labels.map((day, i) => {
    const offset = i - 3;
    const d = dateStr(offset);
    const dayAppts = appointments.filter((a) => a.date === d);
    return {
      day,
      total: dayAppts.length,
      attended: dayAppts.filter((a) => a.status === "attended").length,
      absent: dayAppts.filter((a) => a.status === "absent").length,
      scheduled: dayAppts.filter((a) => a.status === "scheduled").length,
    };
  });
}

export function getMonthlyData() {
  const months = ["Ene","Feb","Mar","Abr","May","Jun"];
  const bases = [145,138,162,171,158,143];
  return months.map((month, idx) => {
    const base = bases[idx];
    const attended = Math.floor(base * 0.72);
    const absent = Math.floor(base * 0.12);
    return {
      month,
      total: base,
      attended,
      absent,
      cancelled: base - attended - absent,
      revenue: attended * (2800 + rndSeeded(idx * 11, 1700)),
    };
  });
}
