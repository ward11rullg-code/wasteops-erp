import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { eq, like, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = db.select().from(vehicles);

    if (status) {
      query = query.where(eq(vehicles.status, status as "active" | "maintenance" | "out_of_service" | "retired")) as typeof query;
    }
    if (search) {
      query = query.where(like(vehicles.vehicleNumber, `%${search}%`)) as typeof query;
    }

    const data = await query.orderBy(desc(vehicles.createdAt));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inserted = await db.insert(vehicles).values(body).returning();
    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
