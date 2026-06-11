import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  customers,
  vehicles,
  drivers,
  collectionOrders,
  invoices,
  routes,
  facilities,
  recyclingMetrics,
  wasteTypes,
} from "@/db/schema";
import { eq, sql, and, gte, desc } from "drizzle-orm";

export async function GET() {
  try {
    // Customer counts
    const [totalCustomers] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(customers)
      .where(eq(customers.isActive, true));

    // Vehicle counts by status
    const vehicleCounts = await db
      .select({
        status: vehicles.status,
        count: sql<number>`count(*)::int`,
      })
      .from(vehicles)
      .groupBy(vehicles.status);

    // Driver count
    const [totalDrivers] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(drivers)
      .where(eq(drivers.isActive, true));

    // Order counts by status
    const orderCounts = await db
      .select({
        status: collectionOrders.status,
        count: sql<number>`count(*)::int`,
      })
      .from(collectionOrders)
      .groupBy(collectionOrders.status);

    // Revenue stats
    const [revenueStats] = await db
      .select({
        totalBilled: sql<string>`coalesce(sum(${invoices.totalAmount}), 0)`,
        totalPaid: sql<string>`coalesce(sum(${invoices.paidAmount}), 0)`,
        totalOutstanding: sql<string>`coalesce(sum(${invoices.totalAmount} - ${invoices.paidAmount}), 0)`,
      })
      .from(invoices);

    // Active routes
    const [totalRoutes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(routes)
      .where(eq(routes.isActive, true));

    // Facility count
    const [totalFacilities] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(facilities)
      .where(eq(facilities.isActive, true));

    // Recent orders
    const recentOrders = await db
      .select({
        id: collectionOrders.id,
        orderNumber: collectionOrders.orderNumber,
        status: collectionOrders.status,
        scheduledDate: collectionOrders.scheduledDate,
        customerName: customers.name,
        weightTons: collectionOrders.weightTons,
      })
      .from(collectionOrders)
      .leftJoin(customers, eq(collectionOrders.customerId, customers.id))
      .orderBy(desc(collectionOrders.createdAt))
      .limit(5);

    // Recycling diversion data
    const recyclingData = await db
      .select({
        date: recyclingMetrics.date,
        totalReceivedTons: recyclingMetrics.totalReceivedTons,
        totalRecycledTons: recyclingMetrics.totalRecycledTons,
        totalLandfillTons: recyclingMetrics.totalLandfillTons,
        diversionRate: recyclingMetrics.diversionRate,
        facilityName: facilities.name,
      })
      .from(recyclingMetrics)
      .leftJoin(facilities, eq(recyclingMetrics.facilityId, facilities.id))
      .orderBy(desc(recyclingMetrics.date))
      .limit(9);

    // Waste type breakdown from orders
    const wasteBreakdown = await db
      .select({
        name: wasteTypes.name,
        category: wasteTypes.category,
        totalWeight: sql<string>`coalesce(sum(${collectionOrders.weightTons}), 0)`,
        orderCount: sql<number>`count(*)::int`,
      })
      .from(collectionOrders)
      .leftJoin(wasteTypes, eq(collectionOrders.wasteTypeId, wasteTypes.id))
      .where(eq(collectionOrders.status, "completed"))
      .groupBy(wasteTypes.name, wasteTypes.category);

    // Overdue invoices
    const [overdueInvoices] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(invoices)
      .where(eq(invoices.status, "overdue"));

    // Today's orders
    const today = new Date().toISOString().split("T")[0];
    const [todaysOrders] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(collectionOrders)
      .where(
        and(
          eq(collectionOrders.scheduledDate, today),
          eq(collectionOrders.status, "scheduled")
        )
      );

    return NextResponse.json({
      totalCustomers: totalCustomers.count,
      vehicleCounts,
      totalDrivers: totalDrivers.count,
      orderCounts,
      revenue: {
        totalBilled: parseFloat(revenueStats.totalBilled),
        totalPaid: parseFloat(revenueStats.totalPaid),
        totalOutstanding: parseFloat(revenueStats.totalOutstanding),
      },
      totalRoutes: totalRoutes.count,
      totalFacilities: totalFacilities.count,
      recentOrders,
      recyclingData,
      wasteBreakdown,
      overdueInvoices: overdueInvoices.count,
      todaysOrders: todaysOrders.count,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
