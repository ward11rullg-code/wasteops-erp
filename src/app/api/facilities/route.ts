import { NextResponse } from "next/server";
import { db } from "@/db";
import { facilities } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db.select().from(facilities).orderBy(desc(facilities.createdAt));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
