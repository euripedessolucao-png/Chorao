// app/api/test-config/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    openaiKey: process.env.OPENAI_API_KEY ? "✅ CONFIGURADA" : "❌ FALTANDO",
    keyLength: process.env.OPENAI_API_KEY?.length || 0,
    message: process.env.OPENAI_API_KEY 
      ? "Tudo configurado! Teste o /rewrite-lyrics"
      : "Adicione OPENAI_API_KEY nas variáveis de ambiente"
  })
}
