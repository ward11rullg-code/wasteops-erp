import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  decimal,
  timestamp,
  boolean,
  pgEnum,
  date,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ──────────────────────────────────────────────────────
export const wasteTypeEnum = pgEnum("waste_type", [
  "municipal_solid",
  "organic",
  "recyclable",
  "hazardous",
  "construction",
  "electronic",
  "medical",
  "industrial",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "pending",
]);

export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "active",
  "maintenance",
  "out_of_service",
  "retired",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
]);

export const routeFrequencyEnum = pgEnum("route_frequency", [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "on_demand",
]);

export const facilityTypeEnum = pgEnum("facility_type", [
  "landfill",
  "recycling_center",
  "transfer_station",
  "composting_facility",
  "hazardous_waste_facility",
  "incineration_plant",
]);

// ─── Customers ──────────────────────────────────────────────────
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  customerType: varchar("customer_type", { length: 50 }).default("residential"), // residential, commercial, industrial
  contractStart: date("contract_start"),
  contractEnd: date("contract_end"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Waste Types ────────────────────────────────────────────────
export const wasteTypes = pgTable("waste_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: wasteTypeEnum("category").notNull(),
  description: text("description"),
  disposalMethod: text("disposal_method"),
  pricePerTon: decimal("price_per_ton", { precision: 10, scale: 2 }),
  isHazardous: boolean("is_hazardous").default(false),
  requiresSpecialPermit: boolean("requires_special_permit").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Facilities ─────────────────────────────────────────────────
export const facilities = pgTable("facilities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: facilityTypeEnum("type").notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  capacity: decimal("capacity", { precision: 12, scale: 2 }), // in tons
  currentUtilization: decimal("current_utilization", { precision: 5, scale: 2 }), // percentage
  operatingHours: varchar("operating_hours", { length: 100 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Vehicles ───────────────────────────────────────────────────
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  vehicleNumber: varchar("vehicle_number", { length: 50 }).notNull().unique(),
  type: varchar("type", { length: 100 }).notNull(), // rear-loader, front-loader, side-loader, roll-off, etc.
  make: varchar("make", { length: 100 }),
  model: varchar("model", { length: 100 }),
  year: integer("year"),
  licensePlate: varchar("license_plate", { length: 20 }),
  capacityTons: decimal("capacity_tons", { precision: 8, scale: 2 }),
  fuelType: varchar("fuel_type", { length: 50 }), // diesel, cng, electric, hybrid
  status: vehicleStatusEnum("status").default("active"),
  lastMaintenanceDate: date("last_maintenance_date"),
  nextMaintenanceDate: date("next_maintenance_date"),
  mileage: integer("mileage"),
  insuranceExpiry: date("insurance_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Drivers / Employees ────────────────────────────────────────
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  employeeId: varchar("employee_id", { length: 50 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  licenseNumber: varchar("license_number", { length: 50 }),
  licenseExpiry: date("license_expiry"),
  cdlClass: varchar("cdl_class", { length: 10 }), // A, B, C
  hireDate: date("hire_date"),
  isActive: boolean("is_active").default(true),
  currentVehicleId: integer("current_vehicle_id").references(() => vehicles.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Routes ─────────────────────────────────────────────────────
export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  frequency: routeFrequencyEnum("frequency").default("weekly"),
  assignedVehicleId: integer("assigned_vehicle_id").references(() => vehicles.id),
  assignedDriverId: integer("assigned_driver_id").references(() => drivers.id),
  estimatedDurationMinutes: integer("estimated_duration_minutes"),
  estimatedDistanceMiles: decimal("estimated_distance_miles", { precision: 8, scale: 2 }),
  dayOfWeek: varchar("day_of_week", { length: 20 }), // monday, tuesday, etc.
  startTime: varchar("start_time", { length: 10 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Route Stops (linking customers to routes) ──────────────────
export const routeStops = pgTable("route_stops", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").references(() => routes.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  stopOrder: integer("stop_order").notNull(),
  address: text("address"),
  instructions: text("instructions"),
  estimatedArrivalTime: varchar("estimated_arrival_time", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Collection Orders ──────────────────────────────────────────
export const collectionOrders = pgTable("collection_orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  routeId: integer("route_id").references(() => routes.id),
  driverId: integer("driver_id").references(() => drivers.id),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  wasteTypeId: integer("waste_type_id").references(() => wasteTypes.id),
  facilityId: integer("facility_id").references(() => facilities.id),
  status: orderStatusEnum("status").default("scheduled"),
  scheduledDate: date("scheduled_date").notNull(),
  scheduledTime: varchar("scheduled_time", { length: 10 }),
  completedAt: timestamp("completed_at"),
  weightTons: decimal("weight_tons", { precision: 10, scale: 2 }),
  containerSize: varchar("container_size", { length: 50 }),
  numberOfContainers: integer("number_of_containers").default(1),
  pickupAddress: text("pickup_address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Invoices ───────────────────────────────────────────────────
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  status: invoiceStatusEnum("status").default("draft"),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default("0"),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Invoice Line Items ─────────────────────────────────────────
export const invoiceLineItems = pgTable("invoice_line_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  orderId: integer("order_id").references(() => collectionOrders.id),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Compliance / Permits ───────────────────────────────────────
export const permits = pgTable("permits", {
  id: serial("id").primaryKey(),
  permitNumber: varchar("permit_number", { length: 100 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  issuingAuthority: varchar("issuing_authority", { length: 255 }),
  issuedDate: date("issued_date"),
  expiryDate: date("expiry_date"),
  facilityId: integer("facility_id").references(() => facilities.id),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  status: varchar("status", { length: 50 }).default("active"),
  documents: jsonb("documents"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Recycling Metrics ──────────────────────────────────────────
export const recyclingMetrics = pgTable("recycling_metrics", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id").references(() => facilities.id),
  date: date("date").notNull(),
  wasteTypeId: integer("waste_type_id").references(() => wasteTypes.id),
  totalReceivedTons: decimal("total_received_tons", { precision: 10, scale: 2 }),
  totalRecycledTons: decimal("total_recycled_tons", { precision: 10, scale: 2 }),
  totalLandfillTons: decimal("total_landfill_tons", { precision: 10, scale: 2 }),
  diversionRate: decimal("diversion_rate", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Relations ──────────────────────────────────────────────────
export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(collectionOrders),
  invoices: many(invoices),
  routeStops: many(routeStops),
}));

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  routes: many(routes),
  orders: many(collectionOrders),
  drivers: many(drivers),
  permits: many(permits),
}));

export const driversRelations = relations(drivers, ({ one, many }) => ({
  currentVehicle: one(vehicles, {
    fields: [drivers.currentVehicleId],
    references: [vehicles.id],
  }),
  routes: many(routes),
  orders: many(collectionOrders),
}));

export const routesRelations = relations(routes, ({ one, many }) => ({
  assignedVehicle: one(vehicles, {
    fields: [routes.assignedVehicleId],
    references: [vehicles.id],
  }),
  assignedDriver: one(drivers, {
    fields: [routes.assignedDriverId],
    references: [drivers.id],
  }),
  stops: many(routeStops),
  orders: many(collectionOrders),
}));

export const routeStopsRelations = relations(routeStops, ({ one }) => ({
  route: one(routes, { fields: [routeStops.routeId], references: [routes.id] }),
  customer: one(customers, { fields: [routeStops.customerId], references: [customers.id] }),
}));

export const collectionOrdersRelations = relations(collectionOrders, ({ one }) => ({
  customer: one(customers, { fields: [collectionOrders.customerId], references: [customers.id] }),
  route: one(routes, { fields: [collectionOrders.routeId], references: [routes.id] }),
  driver: one(drivers, { fields: [collectionOrders.driverId], references: [drivers.id] }),
  vehicle: one(vehicles, { fields: [collectionOrders.vehicleId], references: [vehicles.id] }),
  wasteType: one(wasteTypes, { fields: [collectionOrders.wasteTypeId], references: [wasteTypes.id] }),
  facility: one(facilities, { fields: [collectionOrders.facilityId], references: [facilities.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, { fields: [invoices.customerId], references: [customers.id] }),
  lineItems: many(invoiceLineItems),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceLineItems.invoiceId], references: [invoices.id] }),
  order: one(collectionOrders, { fields: [invoiceLineItems.orderId], references: [collectionOrders.id] }),
}));

export const facilitiesRelations = relations(facilities, ({ many }) => ({
  permits: many(permits),
  recyclingMetrics: many(recyclingMetrics),
  orders: many(collectionOrders),
}));

export const permitsRelations = relations(permits, ({ one }) => ({
  facility: one(facilities, { fields: [permits.facilityId], references: [facilities.id] }),
  vehicle: one(vehicles, { fields: [permits.vehicleId], references: [vehicles.id] }),
}));

export const wasteTypesRelations = relations(wasteTypes, ({ many }) => ({
  orders: many(collectionOrders),
  recyclingMetrics: many(recyclingMetrics),
}));

export const recyclingMetricsRelations = relations(recyclingMetrics, ({ one }) => ({
  facility: one(facilities, { fields: [recyclingMetrics.facilityId], references: [facilities.id] }),
  wasteType: one(wasteTypes, { fields: [recyclingMetrics.wasteTypeId], references: [wasteTypes.id] }),
}));
