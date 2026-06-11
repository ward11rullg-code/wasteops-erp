import { NextResponse } from "next/server";
import { db } from "@/db";
import { recyclingMetrics, facilities, wasteTypes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db
      .select({
        id: recyclingMetrics.id,
        date: recyclingMetrics.date,
        totalReceivedTons: recyclingMetrics.totalReceivedTons,
        totalRecycledTons: recyclingMetrics.totalRecycledTons,
        totalLandfillTons: recyclingMetrics.totalLandfillTons,
        diversionRate: recyclingMetrics.diversionRate,
        facilityName: facilities.name,
        wasteTypeName: wasteTypes.name,
      })
      .from(recyclingMetrics)
      .leftJoin(facilities, eq(recyclingMetrics.facilityId, facilities.id))
      .leftJoin(wasteTypes, eq(recyclingMetrics.wasteTypeId, wasteTypes.id))
      .orderBy(desc(recyclingMetrics.date));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
