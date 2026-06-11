import { NextResponse } from "next/server";

export async function GET() {
  const hasDb = !!process.env.DATABASE_URL;
  return NextResponse.json({
    ok: true,
    database: hasDb ? "configured" : "missing - add DATABASE_URL in Vercel Settings → Environment Variables",
    timestamp: new Date().toISOString(),
  });
}
