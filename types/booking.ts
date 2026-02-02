export type Barber = {
  id: string;
  name: string;
};

export type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number | null;
};

export type AppointmentCreate = {
  barber_id?: string | null;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  client_name: string;
  client_phone: string;
};