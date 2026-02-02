export type AdminStats = {
  appointmentsToday: number;
  appointmentsWeek: number;
  activeBarbers: number;
};

export type AdminAppointmentStatus = "active" | "cancelled" | "completed";

export type AdminAppointmentRow = {
  id: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM:SS ou HH:MM
  status: AdminAppointmentStatus;
  client_name: string;
  client_phone: string;
  barber: { id: string; name: string } | null;
  service: { id: string; name: string } | null;
};

export type AdminWeekAppointment = {
  id: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM:SS ou HH:MM
  status: AdminAppointmentStatus;
  client_name: string;
  client_phone: string;
  barber: { id: string; name: string } | null;
  service: { id: string; name: string; price_cents: number | null; duration_minutes: number | null } | null;
};