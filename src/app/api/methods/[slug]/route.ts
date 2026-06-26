import { NextResponse } from "next/server";
import { getMethodDetail } from "@/server/methods";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const method = await getMethodDetail(slug);
  if (!method) {
    return NextResponse.json({ error: "Method not found" }, { status: 404 });
  }
  return NextResponse.json(method);
}
