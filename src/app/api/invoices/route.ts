import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, customers } from "@/db/schema";
import { eq, desc, and, like } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        status: invoices.status,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        subtotal: invoices.subtotal,
        taxRate: invoices.taxRate,
        taxAmount: invoices.taxAmount,
        totalAmount: invoices.totalAmount,
        paidAmount: invoices.paidAmount,
        paidAt: invoices.paidAt,
        customerName: customers.name,
        customerId: invoices.customerId,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id));

    const conditions = [];
    if (status) {
      conditions.push(eq(invoices.status, status as "draft" | "sent" | "paid" | "overdue" | "cancelled"));
    }
    if (search) {
      conditions.push(like(invoices.invoiceNumber, `%${search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const data = await query.orderBy(desc(invoices.createdAt));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inserted = await db.insert(invoices).values(body).returning();
    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
