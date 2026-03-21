// Aca agrego y ordeno la informacion del consultorio para entregarla lista a la UI.

import { CLINIC_DASHBOARD } from "@/lib/clinic-data";
import { getGoogleCalendarStatus } from "@/lib/google-calendar";
import { getN8nStatus } from "@/lib/n8n";

// Aca saco filtros derivados para no recalcularlos en cada pantalla.
export function buildClinicFilters(patients) {
  return {
    insurances: [...new Set(patients.map((patient) => patient.insurance))].sort((left, right) =>
      left.localeCompare(right)
    ),
    doctors: [...new Set(patients.map((patient) => patient.doctor))].sort((left, right) =>
      left.localeCompare(right)
    )
  };
}

// Aca resumo metricas operativas que despues consumo en el overview.
export function buildClinicSummary(data) {
  const todayAppointments = data.calendar[0]?.slots.length || 0;
  const tomorrowAppointments = data.calendar[1]?.slots.length || 0;
  const insurances = new Set();

  data.doctors.forEach((doctor) => {
    doctor.insurances.forEach((insurance) => {
      insurances.add(insurance);
    });
  });

  return {
    activePatients: data.patients.length,
    todayAppointments,
    tomorrowAppointments,
    doctors: data.doctors.length,
    insurances: insurances.size
  };
}

// Aca junto datos base, resumenes y estados de integracion en una sola respuesta.
export function getClinicViewModel(options = {}) {
  const calendar = Array.isArray(options.calendarOverride) ? options.calendarOverride : CLINIC_DASHBOARD.calendar;
  const dashboardData = {
    ...CLINIC_DASHBOARD,
    calendar
  };

  return {
    ...dashboardData,
    filters: buildClinicFilters(dashboardData.patients),
    summary: buildClinicSummary(dashboardData),
    integrations: {
      n8n: getN8nStatus(),
      googleCalendar: getGoogleCalendarStatus()
    }
  };
}
