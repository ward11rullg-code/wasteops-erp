import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { drivers } from "@/db/schema";
import { eq, like, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const active = searchParams.get("active");

    let query = db.select().from(drivers);

    if (active === "true") {
      query = query.where(eq(drivers.isActive, true)) as typeof query;
    }
    if (search) {
      query = query.where(like(drivers.firstName, `%${search}%`)) as typeof query;
    }

    const data = await query.orderBy(desc(drivers.createdAt));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inserted = await db.insert(drivers).values(body).returning();
    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
