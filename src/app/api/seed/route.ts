import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  customers,
  vehicles,
  drivers,
  wasteTypes,
  facilities,
  routes,
  routeStops,
  collectionOrders,
  invoices,
  invoiceLineItems,
  recyclingMetrics,
} from "@/db/schema";

export async function POST() {
  try {
    // Clear existing data
    await db.delete(invoiceLineItems);
    await db.delete(invoices);
    await db.delete(collectionOrders);
    await db.delete(routeStops);
    await db.delete(routes);
    await db.delete(recyclingMetrics);
    await db.delete(drivers);
    await db.delete(vehicles);
    await db.delete(facilities);
    await db.delete(wasteTypes);
    await db.delete(customers);

    // Seed Waste Types
    const insertedWasteTypes = await db
      .insert(wasteTypes)
      .values([
        { name: "Municipal Solid Waste", category: "municipal_solid", description: "General household and commercial waste", disposalMethod: "Landfill", pricePerTon: "45.00", isHazardous: false },
        { name: "Organic Waste", category: "organic", description: "Food scraps, yard waste, biodegradable materials", disposalMethod: "Composting", pricePerTon: "35.00", isHazardous: false },
        { name: "Mixed Recyclables", category: "recyclable", description: "Paper, cardboard, plastics, glass, metals", disposalMethod: "Recycling Center", pricePerTon: "25.00", isHazardous: false },
        { name: "Hazardous Chemicals", category: "hazardous", description: "Industrial chemicals, solvents, paints", disposalMethod: "Specialized Treatment", pricePerTon: "250.00", isHazardous: true, requiresSpecialPermit: true },
        { name: "Construction Debris", category: "construction", description: "Concrete, wood, drywall, roofing materials", disposalMethod: "Construction Landfill", pricePerTon: "55.00", isHazardous: false },
        { name: "E-Waste", category: "electronic", description: "Computers, monitors, phones, circuit boards", disposalMethod: "E-Waste Recycler", pricePerTon: "150.00", isHazardous: true },
        { name: "Medical Waste", category: "medical", description: "Sharps, biohazard materials, pharmaceutical waste", disposalMethod: "Incineration", pricePerTon: "350.00", isHazardous: true, requiresSpecialPermit: true },
        { name: "Industrial Sludge", category: "industrial", description: "Wastewater treatment byproducts, manufacturing waste", disposalMethod: "Treatment & Disposal", pricePerTon: "180.00", isHazardous: true },
      ])
      .returning();

    // Seed Facilities
    const insertedFacilities = await db
      .insert(facilities)
      .values([
        { name: "Green Valley Landfill", type: "landfill", address: "5000 Disposal Rd", city: "Springfield", state: "IL", zipCode: "62701", capacity: "500000", currentUtilization: "62.5", operatingHours: "6:00 AM - 6:00 PM", contactPerson: "Tom Anderson", contactPhone: "555-0201" },
        { name: "EcoSort Recycling Center", type: "recycling_center", address: "1200 Green Way", city: "Springfield", state: "IL", zipCode: "62702", capacity: "150000", currentUtilization: "45.0", operatingHours: "7:00 AM - 5:00 PM", contactPerson: "Maria Santos", contactPhone: "555-0202" },
        { name: "Central Transfer Station", type: "transfer_station", address: "800 Industrial Blvd", city: "Springfield", state: "IL", zipCode: "62703", capacity: "100000", currentUtilization: "38.0", operatingHours: "5:00 AM - 7:00 PM", contactPerson: "Jake Morrison", contactPhone: "555-0203" },
        { name: "BioSafe Hazardous Facility", type: "hazardous_waste_facility", address: "3000 Safety Dr", city: "Decatur", state: "IL", zipCode: "62521", capacity: "50000", currentUtilization: "22.0", operatingHours: "8:00 AM - 4:00 PM", contactPerson: "Dr. Lisa Park", contactPhone: "555-0204" },
        { name: "GreenEarth Composting", type: "composting_facility", address: "700 Farm Lane", city: "Springfield", state: "IL", zipCode: "62704", capacity: "80000", currentUtilization: "55.0", operatingHours: "6:00 AM - 4:00 PM", contactPerson: "Sam Green", contactPhone: "555-0205" },
      ])
      .returning();

    // Seed Vehicles
    const insertedVehicles = await db
      .insert(vehicles)
      .values([
        { vehicleNumber: "TRK-001", type: "Rear Loader", make: "Mack", model: "LR613", year: 2022, licensePlate: "WM-1001", capacityTons: "12", fuelType: "CNG", status: "active", mileage: 45000, lastMaintenanceDate: "2025-11-15", nextMaintenanceDate: "2026-02-15" },
        { vehicleNumber: "TRK-002", type: "Front Loader", make: "Peterbilt", model: "520", year: 2023, licensePlate: "WM-1002", capacityTons: "16", fuelType: "diesel", status: "active", mileage: 32000, lastMaintenanceDate: "2025-12-01", nextMaintenanceDate: "2026-03-01" },
        { vehicleNumber: "TRK-003", type: "Side Loader", make: "Autocar", model: "Xpert", year: 2021, licensePlate: "WM-1003", capacityTons: "10", fuelType: "CNG", status: "active", mileage: 68000, lastMaintenanceDate: "2025-10-20", nextMaintenanceDate: "2026-01-20" },
        { vehicleNumber: "TRK-004", type: "Roll-Off", make: "Mack", model: "TerraPro", year: 2020, licensePlate: "WM-1004", capacityTons: "20", fuelType: "diesel", status: "maintenance", mileage: 95000, lastMaintenanceDate: "2026-01-10", nextMaintenanceDate: "2026-04-10" },
        { vehicleNumber: "TRK-005", type: "Rear Loader", make: "Heil", model: "DuraPack", year: 2024, licensePlate: "WM-1005", capacityTons: "14", fuelType: "electric", status: "active", mileage: 12000, lastMaintenanceDate: "2026-01-05", nextMaintenanceDate: "2026-04-05" },
        { vehicleNumber: "TRK-006", type: "Flatbed", make: "Freightliner", model: "M2 106", year: 2019, licensePlate: "WM-1006", capacityTons: "18", fuelType: "diesel", status: "active", mileage: 120000, lastMaintenanceDate: "2025-12-20", nextMaintenanceDate: "2026-03-20" },
        { vehicleNumber: "TRK-007", type: "Rear Loader", make: "Mack", model: "LR613", year: 2023, licensePlate: "WM-1007", capacityTons: "12", fuelType: "CNG", status: "out_of_service", mileage: 28000, lastMaintenanceDate: "2025-09-15", nextMaintenanceDate: "2025-12-15" },
      ])
      .returning();

    // Seed Drivers
    const insertedDrivers = await db
      .insert(drivers)
      .values([
        { employeeId: "EMP-001", firstName: "James", lastName: "Wilson", email: "j.wilson@wasteco.com", phone: "555-0101", licenseNumber: "CDL-12345", licenseExpiry: "2027-06-15", cdlClass: "B", hireDate: "2020-03-15", currentVehicleId: insertedVehicles[0].id },
        { employeeId: "EMP-002", firstName: "Sarah", lastName: "Martinez", email: "s.martinez@wasteco.com", phone: "555-0102", licenseNumber: "CDL-12346", licenseExpiry: "2027-08-20", cdlClass: "A", hireDate: "2019-07-01", currentVehicleId: insertedVehicles[1].id },
        { employeeId: "EMP-003", firstName: "Robert", lastName: "Johnson", email: "r.johnson@wasteco.com", phone: "555-0103", licenseNumber: "CDL-12347", licenseExpiry: "2026-12-01", cdlClass: "B", hireDate: "2021-01-10", currentVehicleId: insertedVehicles[2].id },
        { employeeId: "EMP-004", firstName: "Emily", lastName: "Chen", email: "e.chen@wasteco.com", phone: "555-0104", licenseNumber: "CDL-12348", licenseExpiry: "2028-03-10", cdlClass: "A", hireDate: "2022-05-20", currentVehicleId: insertedVehicles[4].id },
        { employeeId: "EMP-005", firstName: "Michael", lastName: "Davis", email: "m.davis@wasteco.com", phone: "555-0105", licenseNumber: "CDL-12349", licenseExpiry: "2027-01-25", cdlClass: "B", hireDate: "2018-11-01", currentVehicleId: insertedVehicles[5].id },
      ])
      .returning();

    // Seed Customers
    const insertedCustomers = await db
      .insert(customers)
      .values([
        { name: "Springfield Community Hospital", email: "facilities@sch.org", phone: "555-0301", address: "100 Hospital Dr", city: "Springfield", state: "IL", zipCode: "62701", customerType: "commercial", contractStart: "2024-01-01", contractEnd: "2026-12-31", notes: "Medical waste contract - requires certified handler" },
        { name: "Oak Ridge Apartments", email: "mgmt@oakridge.com", phone: "555-0302", address: "2500 Oak Ridge Blvd", city: "Springfield", state: "IL", zipCode: "62702", customerType: "residential", contractStart: "2024-06-01", contractEnd: "2025-12-31", notes: "200-unit complex, 8 dumpsters" },
        { name: "Smith Family Residence", email: "john.smith@email.com", phone: "555-0303", address: "421 Maple Street", city: "Springfield", state: "IL", zipCode: "62703", customerType: "residential", contractStart: "2025-01-01", contractEnd: "2025-12-31" },
        { name: "TechCorp Industries", email: "waste@techcorp.com", phone: "555-0304", address: "500 Technology Park", city: "Springfield", state: "IL", zipCode: "62704", customerType: "industrial", contractStart: "2024-03-01", contractEnd: "2027-02-28", notes: "E-waste and industrial waste - hazardous handling" },
        { name: "Green Leaf Restaurant", email: "owner@greenleaf.com", phone: "555-0305", address: "890 Main Street", city: "Springfield", state: "IL", zipCode: "62701", customerType: "commercial", contractStart: "2025-04-01", contractEnd: "2026-03-31", notes: "Organic waste collection - grease trap service" },
        { name: "Metro Construction LLC", email: "safety@metrocons.com", phone: "555-0306", address: "3200 Builder Way", city: "Springfield", state: "IL", zipCode: "62705", customerType: "commercial", contractStart: "2024-08-01", contractEnd: "2026-07-31", notes: "Roll-off containers for construction debris" },
        { name: "Westfield Elementary School", email: "admin@westfield.edu", phone: "555-0307", address: "1500 Education Ave", city: "Springfield", state: "IL", zipCode: "62702", customerType: "commercial", contractStart: "2025-09-01", contractEnd: "2026-06-30" },
        { name: "Downtown Office Complex", email: "property@downtown.com", phone: "555-0308", address: "100 Commerce Plaza", city: "Springfield", state: "IL", zipCode: "62701", customerType: "commercial", contractStart: "2024-01-01", contractEnd: "2026-12-31", notes: "Mixed recycling program - 30 office suites" },
        { name: "Maria Garcia", email: "maria.g@email.com", phone: "555-0309", address: "789 Sunset Lane", city: "Springfield", state: "IL", zipCode: "62704", customerType: "residential", contractStart: "2025-06-01", contractEnd: "2026-05-31" },
        { name: "Hartfield Manufacturing", email: "ehs@hartfield.com", phone: "555-0310", address: "4500 Industrial Pkwy", city: "Decatur", state: "IL", zipCode: "62521", customerType: "industrial", contractStart: "2024-01-01", contractEnd: "2026-12-31", notes: "Heavy industrial waste - bi-weekly collection" },
      ])
      .returning();

    // Seed Routes
    const insertedRoutes = await db
      .insert(routes)
      .values([
        { name: "Residential North", description: "North Springfield residential pickup", frequency: "weekly", assignedVehicleId: insertedVehicles[0].id, assignedDriverId: insertedDrivers[0].id, estimatedDurationMinutes: 240, estimatedDistanceMiles: "35.5", dayOfWeek: "monday", startTime: "06:00" },
        { name: "Residential South", description: "South Springfield residential pickup", frequency: "weekly", assignedVehicleId: insertedVehicles[2].id, assignedDriverId: insertedDrivers[2].id, estimatedDurationMinutes: 210, estimatedDistanceMiles: "28.0", dayOfWeek: "tuesday", startTime: "06:00" },
        { name: "Commercial Downtown", description: "Downtown commercial businesses", frequency: "biweekly", assignedVehicleId: insertedVehicles[1].id, assignedDriverId: insertedDrivers[1].id, estimatedDurationMinutes: 300, estimatedDistanceMiles: "22.0", dayOfWeek: "wednesday", startTime: "05:30" },
        { name: "Industrial Zone", description: "Industrial park collection", frequency: "biweekly", assignedVehicleId: insertedVehicles[4].id, assignedDriverId: insertedDrivers[3].id, estimatedDurationMinutes: 360, estimatedDistanceMiles: "45.0", dayOfWeek: "thursday", startTime: "07:00" },
        { name: "Medical Route", description: "Medical facilities - certified hazmat", frequency: "weekly", assignedVehicleId: insertedVehicles[5].id, assignedDriverId: insertedDrivers[4].id, estimatedDurationMinutes: 180, estimatedDistanceMiles: "15.0", dayOfWeek: "friday", startTime: "08:00" },
      ])
      .returning();

    // Seed Route Stops
    await db.insert(routeStops).values([
      { routeId: insertedRoutes[0].id, customerId: insertedCustomers[1].id, stopOrder: 1, address: "2500 Oak Ridge Blvd", instructions: "8 dumpsters at loading dock" },
      { routeId: insertedRoutes[0].id, customerId: insertedCustomers[2].id, stopOrder: 2, address: "421 Maple Street" },
      { routeId: insertedRoutes[0].id, customerId: insertedCustomers[8].id, stopOrder: 3, address: "789 Sunset Lane" },
      { routeId: insertedRoutes[2].id, customerId: insertedCustomers[7].id, stopOrder: 1, address: "100 Commerce Plaza", instructions: "Loading dock B, recycling bins in basement" },
      { routeId: insertedRoutes[2].id, customerId: insertedCustomers[4].id, stopOrder: 2, address: "890 Main Street", instructions: "Grease trap behind kitchen" },
      { routeId: insertedRoutes[3].id, customerId: insertedCustomers[3].id, stopOrder: 1, address: "500 Technology Park", instructions: "E-waste only - Building C" },
      { routeId: insertedRoutes[3].id, customerId: insertedCustomers[9].id, stopOrder: 2, address: "4500 Industrial Pkwy", instructions: "Security check-in required" },
      { routeId: insertedRoutes[4].id, customerId: insertedCustomers[0].id, stopOrder: 1, address: "100 Hospital Dr", instructions: "Biohazard waste - dock 3" },
    ]);

    // Seed Collection Orders
    const insertedOrders = await db
      .insert(collectionOrders)
      .values([
        { orderNumber: "ORD-2026-001", customerId: insertedCustomers[0].id, routeId: insertedRoutes[4].id, driverId: insertedDrivers[4].id, vehicleId: insertedVehicles[5].id, wasteTypeId: insertedWasteTypes[6].id, facilityId: insertedFacilities[3].id, status: "completed", scheduledDate: "2026-01-10", scheduledTime: "08:00", completedAt: new Date("2026-01-10T09:30:00"), weightTons: "1.5", containerSize: "Biohazard Bin", numberOfContainers: 4, pickupAddress: "100 Hospital Dr" },
        { orderNumber: "ORD-2026-002", customerId: insertedCustomers[1].id, routeId: insertedRoutes[0].id, driverId: insertedDrivers[0].id, vehicleId: insertedVehicles[0].id, wasteTypeId: insertedWasteTypes[0].id, facilityId: insertedFacilities[0].id, status: "completed", scheduledDate: "2026-01-13", scheduledTime: "06:30", completedAt: new Date("2026-01-13T08:15:00"), weightTons: "4.2", containerSize: "8 yd³", numberOfContainers: 8, pickupAddress: "2500 Oak Ridge Blvd" },
        { orderNumber: "ORD-2026-003", customerId: insertedCustomers[3].id, routeId: insertedRoutes[3].id, driverId: insertedDrivers[3].id, vehicleId: insertedVehicles[4].id, wasteTypeId: insertedWasteTypes[5].id, facilityId: insertedFacilities[1].id, status: "completed", scheduledDate: "2026-01-09", scheduledTime: "07:30", completedAt: new Date("2026-01-09T10:00:00"), weightTons: "2.8", containerSize: "E-Waste Container", numberOfContainers: 2, pickupAddress: "500 Technology Park" },
        { orderNumber: "ORD-2026-004", customerId: insertedCustomers[5].id, routeId: null, driverId: insertedDrivers[1].id, vehicleId: insertedVehicles[3].id, wasteTypeId: insertedWasteTypes[4].id, facilityId: insertedFacilities[0].id, status: "in_progress", scheduledDate: "2026-01-22", scheduledTime: "07:00", weightTons: null, containerSize: "30 yd³ Roll-Off", numberOfContainers: 2, pickupAddress: "3200 Builder Way" },
        { orderNumber: "ORD-2026-005", customerId: insertedCustomers[4].id, routeId: insertedRoutes[2].id, driverId: insertedDrivers[1].id, vehicleId: insertedVehicles[1].id, wasteTypeId: insertedWasteTypes[1].id, facilityId: insertedFacilities[4].id, status: "scheduled", scheduledDate: "2026-01-29", scheduledTime: "06:00", containerSize: "6 yd³", numberOfContainers: 2, pickupAddress: "890 Main Street" },
        { orderNumber: "ORD-2026-006", customerId: insertedCustomers[7].id, routeId: insertedRoutes[2].id, driverId: insertedDrivers[1].id, vehicleId: insertedVehicles[1].id, wasteTypeId: insertedWasteTypes[2].id, facilityId: insertedFacilities[1].id, status: "scheduled", scheduledDate: "2026-01-29", scheduledTime: "05:30", containerSize: "8 yd³", numberOfContainers: 6, pickupAddress: "100 Commerce Plaza" },
        { orderNumber: "ORD-2026-007", customerId: insertedCustomers[9].id, routeId: insertedRoutes[3].id, driverId: insertedDrivers[3].id, vehicleId: insertedVehicles[4].id, wasteTypeId: insertedWasteTypes[7].id, facilityId: insertedFacilities[3].id, status: "scheduled", scheduledDate: "2026-01-23", scheduledTime: "07:00", containerSize: "20 yd³", numberOfContainers: 3, pickupAddress: "4500 Industrial Pkwy" },
        { orderNumber: "ORD-2026-008", customerId: insertedCustomers[2].id, routeId: insertedRoutes[0].id, driverId: insertedDrivers[0].id, vehicleId: insertedVehicles[0].id, wasteTypeId: insertedWasteTypes[0].id, facilityId: insertedFacilities[0].id, status: "completed", scheduledDate: "2026-01-06", scheduledTime: "07:00", completedAt: new Date("2026-01-06T07:45:00"), weightTons: "0.5", containerSize: "96 gal", numberOfContainers: 1, pickupAddress: "421 Maple Street" },
      ])
      .returning();

    // Seed Invoices
    const insertedInvoices = await db
      .insert(invoices)
      .values([
        { invoiceNumber: "INV-2026-001", customerId: insertedCustomers[0].id, status: "paid", issueDate: "2026-01-01", dueDate: "2026-01-31", subtotal: "1575.00", taxRate: "8.25", taxAmount: "129.94", totalAmount: "1704.94", paidAmount: "1704.94", paidAt: new Date("2026-01-15") },
        { invoiceNumber: "INV-2026-002", customerId: insertedCustomers[1].id, status: "sent", issueDate: "2026-01-01", dueDate: "2026-01-31", subtotal: "2400.00", taxRate: "8.25", taxAmount: "198.00", totalAmount: "2598.00" },
        { invoiceNumber: "INV-2026-003", customerId: insertedCustomers[3].id, status: "paid", issueDate: "2026-01-01", dueDate: "2026-01-31", subtotal: "5800.00", taxRate: "8.25", taxAmount: "478.50", totalAmount: "6278.50", paidAmount: "6278.50", paidAt: new Date("2026-01-20") },
        { invoiceNumber: "INV-2026-004", customerId: insertedCustomers[5].id, status: "overdue", issueDate: "2025-12-01", dueDate: "2025-12-31", subtotal: "3200.00", taxRate: "8.25", taxAmount: "264.00", totalAmount: "3464.00" },
        { invoiceNumber: "INV-2026-005", customerId: insertedCustomers[7].id, status: "draft", issueDate: "2026-01-15", dueDate: "2026-02-15", subtotal: "1800.00", taxRate: "8.25", taxAmount: "148.50", totalAmount: "1948.50" },
      ])
      .returning();

    // Seed Invoice Line Items
    await db.insert(invoiceLineItems).values([
      { invoiceId: insertedInvoices[0].id, orderId: insertedOrders[0].id, description: "Medical Waste Collection - Hospital", quantity: "1.5", unitPrice: "350.00", amount: "525.00" },
      { invoiceId: insertedInvoices[0].id, description: "Hazmat Disposal Surcharge", quantity: "1", unitPrice: "500.00", amount: "500.00" },
      { invoiceId: insertedInvoices[0].id, description: "Container Rental (4 bio bins)", quantity: "1", unitPrice: "550.00", amount: "550.00" },
      { invoiceId: insertedInvoices[1].id, orderId: insertedOrders[1].id, description: "Municipal Waste Collection - 8 containers", quantity: "4.2", unitPrice: "45.00", amount: "189.00" },
      { invoiceId: insertedInvoices[1].id, description: "Monthly Service Fee - Residential Complex", quantity: "1", unitPrice: "1200.00", amount: "1200.00" },
      { invoiceId: insertedInvoices[1].id, description: "Container Rental (8 x 8yd³)", quantity: "8", unitPrice: "126.38", amount: "1011.00" },
      { invoiceId: insertedInvoices[2].id, orderId: insertedOrders[2].id, description: "E-Waste Collection & Processing", quantity: "2.8", unitPrice: "150.00", amount: "420.00" },
      { invoiceId: insertedInvoices[2].id, description: "Data Destruction Certificate", quantity: "1", unitPrice: "800.00", amount: "800.00" },
      { invoiceId: insertedInvoices[2].id, description: "Quarterly Service Fee - Industrial", quantity: "1", unitPrice: "4580.00", amount: "4580.00" },
      { invoiceId: insertedInvoices[3].id, description: "Roll-Off Container Rental (2 x 30yd³)", quantity: "2", unitPrice: "800.00", amount: "1600.00" },
      { invoiceId: insertedInvoices[3].id, description: "Construction Debris Disposal", quantity: "10", unitPrice: "55.00", amount: "550.00" },
      { invoiceId: insertedInvoices[3].id, description: "Delivery & Pickup Fee", quantity: "2", unitPrice: "525.00", amount: "1050.00" },
      { invoiceId: insertedInvoices[4].id, description: "Mixed Recycling Collection - Monthly", quantity: "1", unitPrice: "900.00", amount: "900.00" },
      { invoiceId: insertedInvoices[4].id, description: "Container Rental (6 x 8yd³)", quantity: "6", unitPrice: "150.00", amount: "900.00" },
    ]);

    // Seed Recycling Metrics
    await db.insert(recyclingMetrics).values([
      { facilityId: insertedFacilities[1].id, date: "2025-10-01", wasteTypeId: insertedWasteTypes[2].id, totalReceivedTons: "1200", totalRecycledTons: "960", totalLandfillTons: "240", diversionRate: "80.0" },
      { facilityId: insertedFacilities[1].id, date: "2025-11-01", wasteTypeId: insertedWasteTypes[2].id, totalReceivedTons: "1350", totalRecycledTons: "1080", totalLandfillTons: "270", diversionRate: "80.0" },
      { facilityId: insertedFacilities[1].id, date: "2025-12-01", wasteTypeId: insertedWasteTypes[2].id, totalReceivedTons: "1500", totalRecycledTons: "1275", totalLandfillTons: "225", diversionRate: "85.0" },
      { facilityId: insertedFacilities[4].id, date: "2025-10-01", wasteTypeId: insertedWasteTypes[1].id, totalReceivedTons: "800", totalRecycledTons: "720", totalLandfillTons: "80", diversionRate: "90.0" },
      { facilityId: insertedFacilities[4].id, date: "2025-11-01", wasteTypeId: insertedWasteTypes[1].id, totalReceivedTons: "900", totalRecycledTons: "810", totalLandfillTons: "90", diversionRate: "90.0" },
      { facilityId: insertedFacilities[4].id, date: "2025-12-01", wasteTypeId: insertedWasteTypes[1].id, totalReceivedTons: "950", totalRecycledTons: "874", totalLandfillTons: "76", diversionRate: "92.0" },
      { facilityId: insertedFacilities[0].id, date: "2025-10-01", wasteTypeId: insertedWasteTypes[0].id, totalReceivedTons: "3500", totalRecycledTons: "350", totalLandfillTons: "3150", diversionRate: "10.0" },
      { facilityId: insertedFacilities[0].id, date: "2025-11-01", wasteTypeId: insertedWasteTypes[0].id, totalReceivedTons: "3800", totalRecycledTons: "380", totalLandfillTons: "3420", diversionRate: "10.0" },
      { facilityId: insertedFacilities[0].id, date: "2025-12-01", wasteTypeId: insertedWasteTypes[0].id, totalReceivedTons: "4200", totalRecycledTons: "504", totalLandfillTons: "3696", diversionRate: "12.0" },
    ]);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      counts: {
        wasteTypes: insertedWasteTypes.length,
        facilities: insertedFacilities.length,
        vehicles: insertedVehicles.length,
        drivers: insertedDrivers.length,
        customers: insertedCustomers.length,
        routes: insertedRoutes.length,
        orders: insertedOrders.length,
        invoices: insertedInvoices.length,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
