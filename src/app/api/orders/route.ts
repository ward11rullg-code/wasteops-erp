import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { collectionOrders, customers, drivers, vehicles, wasteTypes } from "@/db/schema";
import { eq, desc, and, like } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = db
      .select({
        id: collectionOrders.id,
        orderNumber: collectionOrders.orderNumber,
        status: collectionOrders.status,
        scheduledDate: collectionOrders.scheduledDate,
        scheduledTime: collectionOrders.scheduledTime,
        completedAt: collectionOrders.completedAt,
        weightTons: collectionOrders.weightTons,
        containerSize: collectionOrders.containerSize,
        numberOfContainers: collectionOrders.numberOfContainers,
        pickupAddress: collectionOrders.pickupAddress,
        notes: collectionOrders.notes,
        customerName: customers.name,
        driverName: drivers.firstName,
        driverLastName: drivers.lastName,
        vehicleNumber: vehicles.vehicleNumber,
        wasteTypeName: wasteTypes.name,
        createdAt: collectionOrders.createdAt,
      })
      .from(collectionOrders)
      .leftJoin(customers, eq(collectionOrders.customerId, customers.id))
      .leftJoin(drivers, eq(collectionOrders.driverId, drivers.id))
      .leftJoin(vehicles, eq(collectionOrders.vehicleId, vehicles.id))
      .leftJoin(wasteTypes, eq(collectionOrders.wasteTypeId, wasteTypes.id));

    const conditions = [];
    if (status) {
      conditions.push(eq(collectionOrders.status, status as "scheduled" | "in_progress" | "completed" | "cancelled" | "pending"));
    }
    if (search) {
      conditions.push(like(collectionOrders.orderNumber, `%${search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const data = await query.orderBy(desc(collectionOrders.scheduledDate));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inserted = await db.insert(collectionOrders).values(body).returning();
    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
