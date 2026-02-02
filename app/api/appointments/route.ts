import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  console.log("🔵 POST /api/appointments iniciado");
  
  try {
    const body = await req.json();
    console.log("📦 Payload recebido:", body);
    
    const { barber_id, service_id, appointment_date, appointment_time, client_name, client_phone } = body;

    // Validação básica
    if (!service_id || !appointment_date || !appointment_time || !client_name || !client_phone) {
      console.warn("⚠️ Validação falhou - campos faltando:", {
        service_id: !!service_id,
        appointment_date: !!appointment_date,
        appointment_time: !!appointment_time,
        client_name: !!client_name,
        client_phone: !!client_phone,
      });
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    console.log("🔌 Conectando ao Supabase...");
    
    // Verifica se tem a service_role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY não está configurada!");
      return NextResponse.json(
        { error: "Configuração do servidor incompleta" },
        { status: 500 }
      );
    }
    
    console.log("🔑 Usando service_role key para bypass de RLS");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const insertData = {
      barber_id: barber_id || null,
      service_id,
      appointment_date,
      appointment_time,
      client_name,
      client_phone,
      status: "active",
    };

    console.log("💾 Tentando inserir no banco:", insertData);

    // Inserir agendamento
    const { data, error } = await supabase
      .from("appointments")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("❌ Erro do Supabase ao criar agendamento:");
      console.error("   Código:", error.code);
      console.error("   Mensagem:", error.message);
      console.error("   Detalhes:", error.details);
      console.error("   Hint:", error.hint);
      console.error("   Objeto completo:", JSON.stringify(error, null, 2));
      
      return NextResponse.json(
        { 
          error: "Erro ao criar agendamento",
          details: error.message,
          code: error.code,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    console.log("✅ Agendamento criado com sucesso:", data);

    return NextResponse.json(
      { success: true, appointment: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ ERRO CRÍTICO no POST /api/appointments:");
    console.error("   Tipo:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("   Mensagem:", error instanceof Error ? error.message : String(error));
    console.error("   Stack:", error instanceof Error ? error.stack : "N/A");
    console.error("   Objeto completo:", error);
    
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
