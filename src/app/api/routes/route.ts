import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { routes, vehicles, drivers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db
      .select({
        id: routes.id,
        name: routes.name,
        description: routes.description,
        frequency: routes.frequency,
        dayOfWeek: routes.dayOfWeek,
        startTime: routes.startTime,
        estimatedDurationMinutes: routes.estimatedDurationMinutes,
        estimatedDistanceMiles: routes.estimatedDistanceMiles,
        isActive: routes.isActive,
        vehicleNumber: vehicles.vehicleNumber,
        driverFirstName: drivers.firstName,
        driverLastName: drivers.lastName,
        createdAt: routes.createdAt,
      })
      .from(routes)
      .leftJoin(vehicles, eq(routes.assignedVehicleId, vehicles.id))
      .leftJoin(drivers, eq(routes.assignedDriverId, drivers.id))
      .orderBy(desc(routes.createdAt));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inserted = await db.insert(routes).values(body).returning();
    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
