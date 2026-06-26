import { NextResponse } from "next/server";
import { listMethods, type MethodFilters } from "@/server/methods";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters: MethodFilters = {
    q: searchParams.get("q") ?? undefined,
    field: searchParams.get("field") ?? undefined,
    language: searchParams.get("language") ?? undefined,
    organism: searchParams.get("organism") ?? undefined,
    dataType: searchParams.get("dataType") ?? undefined,
    license: searchParams.get("license") ?? undefined,
    verifiedOnly: searchParams.get("verified") === "true",
    sort: (searchParams.get("sort") as MethodFilters["sort"]) ?? undefined,
  };
  const methods = await listMethods(filters);
  return NextResponse.json({ count: methods.length, methods });
}
