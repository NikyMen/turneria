// Aca conecto la ruta de doctores con el shell y los datos del consultorio.

import { DashboardShell } from "@/components/dashboard-shell";
import { DoctorsPage } from "@/components/doctors-page";
import { getClinicViewModel } from "@/lib/clinic-view-model";

export default function DoctorsRoutePage() {
  const data = getClinicViewModel();

  return (
    <DashboardShell>
      <DoctorsPage doctors={data.doctors} />
    </DashboardShell>
  );
}
