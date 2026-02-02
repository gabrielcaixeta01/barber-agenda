import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

type BarberRow = { id: string; name: string };
type ServiceRow = { id: string; name: string; duration_minutes: number };

function todayISO() {
	const d = new Date();
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const dd = String(d.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}

function mustStr(v: FormDataEntryValue | null, field: string) {
	const s = String(v ?? "").trim();
	if (!s) throw new Error(`Campo obrigatório: ${field}`);
	return s;
}

function optionalStr(v: FormDataEntryValue | null) {
	const s = String(v ?? "").trim();
	return s ? s : null;
}

function mustTime(v: FormDataEntryValue | null, field: string) {
	const s = mustStr(v, field);
	if (!/^\d{2}:\d{2}$/.test(s)) throw new Error(`Formato de hora inválido: ${field}`);
	return s;
}

function mustDate(v: FormDataEntryValue | null, field: string) {
	const s = mustStr(v, field);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error(`Formato de data inválido: ${field}`);
	return s;
}

async function createWalkInAppointment(formData: FormData) {
	"use server";

	const appointment_date = mustDate(formData.get("appointment_date"), "appointment_date");
	const appointment_time = mustTime(formData.get("appointment_time"), "appointment_time");
	const service_id = mustStr(formData.get("service_id"), "service_id");
	const client_name = mustStr(formData.get("client_name"), "client_name");
	const client_phone = mustStr(formData.get("client_phone"), "client_phone");
	const barber_id = optionalStr(formData.get("barber_id"));

	const supabase = await createSupabaseServer();
	const { error } = await supabase
		.from("appointments")
		.insert([
			{
				appointment_date,
				appointment_time,
				service_id,
				barber_id,
				client_name,
				client_phone,
				status: "active",
			},
		]);

	if (error) throw new Error(error.message);

	redirect(`/admin/agendamentos?date=${appointment_date}`);
}

export default async function AdminNewAppointmentPage() {
	const supabase = await createSupabaseServer();

	const [{ data: barbersData, error: barbersError }, { data: servicesData, error: servicesError }] =
		await Promise.all([
			supabase.from("barbers").select("id, name").order("name"),
			supabase.from("services").select("id, name, duration_minutes").order("name"),
		]);

	if (barbersError || servicesError) {
		return (
			<div className="min-h-screen p-6">
				<div className="mx-auto max-w-2xl">
					<div className="rounded-2xl border border-black/10 bg-white p-6">
						<h1 className="text-xl font-semibold">Novo agendamento</h1>
						<p className="mt-2 text-sm text-red-600">
							Erro ao carregar dados: {barbersError?.message || servicesError?.message}
						</p>
					</div>
				</div>
			</div>
		);
	}

	const barbers = (barbersData ?? []) as BarberRow[];
	const services = (servicesData ?? []) as ServiceRow[];

	return (
		<div className="min-h-screen p-6">
			<div className="mx-auto max-w-2xl space-y-6">
				<header>
					<h1 className="text-2xl font-semibold">Novo agendamento presencial</h1>
					<p className="mt-1 text-sm opacity-70">
						Registre um corte feito no balcão para manter o histórico completo.
					</p>
				</header>

				<section className="rounded-2xl border border-black/10 bg-white p-6">
					<form action={createWalkInAppointment} className="grid gap-4">
						<div className="grid gap-3 sm:grid-cols-2">
							<div>
								<label className="text-xs opacity-60">Data</label>
								<input
									name="appointment_date"
									type="date"
									defaultValue={todayISO()}
									required
									className="mt-1 h-11 w-full rounded-xl border border-black/10 px-4"
								/>
							</div>

							<div>
								<label className="text-xs opacity-60">Horário</label>
								<input
									name="appointment_time"
									type="time"
									required
									className="mt-1 h-11 w-full rounded-xl border border-black/10 px-4"
								/>
							</div>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<div>
								<label className="text-xs opacity-60">Cliente</label>
								<input
									name="client_name"
									placeholder="Nome do cliente"
									required
									className="mt-1 h-11 w-full rounded-xl border border-black/10 px-4"
								/>
							</div>

							<div>
								<label className="text-xs opacity-60">Telefone</label>
								<input
									name="client_phone"
									placeholder="Telefone do cliente"
									required
									className="mt-1 h-11 w-full rounded-xl border border-black/10 px-4"
								/>
							</div>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<div>
								<label className="text-xs opacity-60">Serviço</label>
								<select
									name="service_id"
									required
									className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3"
								>
									<option value="">Selecione um serviço</option>
									{services.map((s) => (
										<option key={s.id} value={s.id}>
											{s.name} • {s.duration_minutes} min
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="text-xs opacity-60">Barbeiro</label>
								<select
									name="barber_id"
									className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3"
								>
									<option value="">A definir</option>
									{barbers.map((b) => (
										<option key={b.id} value={b.id}>
											{b.name}
										</option>
									))}
								</select>
							</div>
						</div>

						<button className="h-11 rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:opacity-90">
							Salvar agendamento
						</button>
					</form>
				</section>
			</div>
		</div>
	);
}
