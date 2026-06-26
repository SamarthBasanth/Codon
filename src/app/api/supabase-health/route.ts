import { NextResponse } from "next/server";
import { dataSource } from "@/server/methods";

export async function GET() {
  const source = await dataSource();
  return NextResponse.json({
    source, // "supabase" once the schema is seeded, else "mock"
    configured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY),
  });
}
