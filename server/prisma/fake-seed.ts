import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding fake data...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Create admin if not exists
  const admin = await prisma.user.upsert({
    where: { email: 'admin@transitops.com' },
    update: {},
    create: {
      email: 'admin@transitops.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'FLEET_MANAGER',
    },
  });

  // Wipe existing data
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.driver.deleteMany();

  // Create more vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.create({ data: { registration: 'ABC-123', name: 'Van 1', type: 'Van', region: 'North', capacity: 1500, odometer: 10000, purchaseCost: 45000, status: 'AVAILABLE' } }),
    prisma.vehicle.create({ data: { registration: 'XYZ-789', name: 'Truck 1', type: 'Truck', region: 'South', capacity: 5000, odometer: 50000, purchaseCost: 80000, status: 'ON_TRIP' } }),
    prisma.vehicle.create({ data: { registration: 'DEF-456', name: 'Van 2', type: 'Van', region: 'East', capacity: 1500, odometer: 15000, purchaseCost: 42000, status: 'AVAILABLE' } }),
    prisma.vehicle.create({ data: { registration: 'LMN-789', name: 'Truck 2', type: 'Truck', region: 'West', capacity: 6000, odometer: 20000, purchaseCost: 85000, status: 'IN_SHOP' } }),
    prisma.vehicle.create({ data: { registration: 'PQR-123', name: 'Truck 3', type: 'Truck', region: 'North', capacity: 5500, odometer: 30000, purchaseCost: 82000, status: 'ON_TRIP' } })
  ]);

  // Create more drivers
  const drivers = await Promise.all([
    prisma.driver.create({ data: { name: 'John Doe', phone: '555-1234', licenseNumber: 'DL-12345', licenseCategory: 'C', expiryDate: new Date('2025-01-01'), safetyScore: 95.5, status: 'AVAILABLE' } }),
    prisma.driver.create({ data: { name: 'Jane Smith', phone: '555-9876', licenseNumber: 'DL-98765', licenseCategory: 'C', expiryDate: new Date('2026-01-01'), safetyScore: 98.0, status: 'ON_TRIP' } }),
    prisma.driver.create({ data: { name: 'Mike Johnson', phone: '555-4567', licenseNumber: 'DL-45678', licenseCategory: 'C', expiryDate: new Date('2025-06-01'), safetyScore: 92.0, status: 'AVAILABLE' } }),
    prisma.driver.create({ data: { name: 'Sarah Williams', phone: '555-7890', licenseNumber: 'DL-78901', licenseCategory: 'C', expiryDate: new Date('2024-12-01'), safetyScore: 88.5, status: 'ON_TRIP' } })
  ]);

  // Create trips (using known cities)
  await Promise.all([
    prisma.trip.create({
      data: {
        vehicleId: vehicles[1].id,
        driverId: drivers[1].id,
        source: 'New York, NY',
        destination: 'Boston, MA',
        cargoWeight: 1200,
        distance: 215,
        status: 'DISPATCHED',
        dispatchedAt: new Date(),
      }
    }),
    prisma.trip.create({
      data: {
        vehicleId: vehicles[4].id,
        driverId: drivers[3].id,
        source: 'Los Angeles, CA',
        destination: 'San Francisco, CA',
        cargoWeight: 4500,
        distance: 380,
        status: 'DISPATCHED',
        dispatchedAt: new Date(),
      }
    }),
    prisma.trip.create({
      data: {
        vehicleId: vehicles[0].id,
        driverId: drivers[0].id,
        source: 'Chicago, IL',
        destination: 'Detroit, MI',
        cargoWeight: 800,
        distance: 280,
        status: 'COMPLETED',
        dispatchedAt: new Date('2023-01-01T10:00:00Z'),
        completedAt: new Date('2023-01-01T15:00:00Z'),
      }
    })
  ]);

  // Create maintenance records
  await prisma.maintenance.create({
    data: { vehicleId: vehicles[3].id, description: 'Engine Overhaul', cost: 2500.00, status: 'IN_PROGRESS' }
  });

  // Create fuel logs
  await prisma.fuelLog.create({
    data: { vehicleId: vehicles[1].id, liters: 120.5, cost: 180.50, mileage: 50200, loggedAt: new Date() }
  });

  console.log('Fake data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
