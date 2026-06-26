import { NextResponse } from "next/server";
import { searchMethods } from "@/server/methods";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const results = await searchMethods(q);
  return NextResponse.json({ query: q, count: results.length, results });
}
