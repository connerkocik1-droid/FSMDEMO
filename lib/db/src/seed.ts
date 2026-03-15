import { db, pool } from "./index";
import { eq } from "drizzle-orm";
import {
  companiesTable,
  usersTable,
  customersTable,
  jobsTable,
  invoicesTable,
  leadsTable,
  reviewsTable,
  referralsTable,
} from "./schema";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 10) + 7, Math.floor(Math.random() * 60));
  return d;
}

function hoursAfter(d: Date, hours: number): Date {
  return new Date(d.getTime() + hours * 60 * 60 * 1000);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface DemoCompanyConfig {
  name: string;
  businessType: string;
  tier: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  maxUsers: number;
  serviceTypes: string[];
  users: { clerkId: string; email: string; firstName: string; lastName: string; role: string }[];
  customerCount: number;
  jobCount: number;
  leadCount: number;
  reviewCount: number;
  referralCount: number;
}

const DEMO_COMPANIES: DemoCompanyConfig[] = [
  {
    name: "Sample Lawn Co.",
    businessType: "Lawn Care",
    tier: "free",
    email: "sam@samplelawn.com",
    phone: "(555) 100-0001",
    address: "101 Green Way",
    city: "Austin",
    state: "TX",
    zip: "78701",
    maxUsers: 3,
    serviceTypes: ["Lawn Mowing", "Edging & Trimming", "Leaf Cleanup", "Seasonal Cleanup"],
    users: [
      { clerkId: "user_free_owner", email: "sam@samplelawn.com", firstName: "Sam", lastName: "Rivera", role: "owner" },
      { clerkId: "user_free_tech1", email: "jamie@samplelawn.com", firstName: "Jamie", lastName: "Ortiz", role: "operator" },
    ],
    customerCount: 8,
    jobCount: 12,
    leadCount: 5,
    reviewCount: 4,
    referralCount: 2,
  },
  {
    name: "Brooks Roofing",
    businessType: "Roofing",
    tier: "independent",
    email: "taylor@brooksroofing.com",
    phone: "(555) 200-0002",
    address: "220 Summit Dr",
    city: "Denver",
    state: "CO",
    zip: "80202",
    maxUsers: 6,
    serviceTypes: ["Roof Inspection", "Shingle Repair", "Gutter Install", "Leak Repair", "Full Roof Replacement"],
    users: [
      { clerkId: "user_independent_owner", email: "taylor@brooksroofing.com", firstName: "Taylor", lastName: "Brooks", role: "owner" },
      { clerkId: "user_independent_tech1", email: "devon@brooksroofing.com", firstName: "Devon", lastName: "Clark", role: "operator" },
      { clerkId: "user_independent_admin", email: "pat@brooksroofing.com", firstName: "Pat", lastName: "Nguyen", role: "admin" },
    ],
    customerCount: 12,
    jobCount: 20,
    leadCount: 8,
    reviewCount: 6,
    referralCount: 3,
  },
  {
    name: "Lee HVAC Services",
    businessType: "HVAC",
    tier: "pro",
    email: "jordan@leehvac.com",
    phone: "(555) 300-0003",
    address: "750 Comfort Blvd",
    city: "Dallas",
    state: "TX",
    zip: "75201",
    maxUsers: 25,
    serviceTypes: ["AC Repair", "AC Installation", "Furnace Maintenance", "Duct Cleaning", "Heat Pump Repair", "Thermostat Install", "Emergency HVAC"],
    users: [
      { clerkId: "user_pro_owner", email: "jordan@leehvac.com", firstName: "Jordan", lastName: "Lee", role: "owner" },
      { clerkId: "user_field_tech", email: "marcus@leehvac.com", firstName: "Marcus", lastName: "Williams", role: "operator" },
      { clerkId: "user_pro_admin", email: "sophia@leehvac.com", firstName: "Sophia", lastName: "Ramirez", role: "admin" },
      { clerkId: "user_pro_manager", email: "derek@leehvac.com", firstName: "Derek", lastName: "Johnson", role: "manager" },
      { clerkId: "user_pro_tech2", email: "aisha@leehvac.com", firstName: "Aisha", lastName: "Patel", role: "operator" },
      { clerkId: "user_pro_tech3", email: "ryan@leehvac.com", firstName: "Ryan", lastName: "Chen", role: "operator" },
    ],
    customerCount: 20,
    jobCount: 40,
    leadCount: 15,
    reviewCount: 12,
    referralCount: 6,
  },
  {
    name: "Morgan Lawn Network",
    businessType: "Lawn Care",
    tier: "franchise",
    email: "casey@morganlawn.net",
    phone: "(555) 400-0004",
    address: "1500 Franchise Pkwy",
    city: "Orlando",
    state: "FL",
    zip: "32801",
    maxUsers: 75,
    serviceTypes: ["Full Lawn Service", "Irrigation Install", "Landscape Design", "Tree Trimming", "Sod Installation", "Fertilization", "Pest Treatment"],
    users: [
      { clerkId: "user_franchise_owner", email: "casey@morganlawn.net", firstName: "Casey", lastName: "Morgan", role: "owner" },
      { clerkId: "user_franchise_admin", email: "nina@morganlawn.net", firstName: "Nina", lastName: "Torres", role: "admin" },
      { clerkId: "user_franchise_mgr", email: "ben@morganlawn.net", firstName: "Ben", lastName: "Harper", role: "manager" },
      { clerkId: "user_franchise_tech1", email: "luis@morganlawn.net", firstName: "Luis", lastName: "Gonzalez", role: "operator" },
      { clerkId: "user_franchise_tech2", email: "kira@morganlawn.net", firstName: "Kira", lastName: "Yamamoto", role: "operator" },
    ],
    customerCount: 18,
    jobCount: 35,
    leadCount: 12,
    reviewCount: 10,
    referralCount: 5,
  },
  {
    name: "Chen Field Services Group",
    businessType: "Multi-Trade",
    tier: "enterprise",
    email: "alex@chenservices.com",
    phone: "(555) 500-0005",
    address: "3000 Enterprise Way",
    city: "San Francisco",
    state: "CA",
    zip: "94102",
    maxUsers: 999,
    serviceTypes: ["Electrical Repair", "Plumbing", "HVAC Service", "General Maintenance", "Commercial Cleaning", "Fire Safety Inspection", "Security Systems"],
    users: [
      { clerkId: "user_enterprise_owner", email: "alex@chenservices.com", firstName: "Alex", lastName: "Chen", role: "owner" },
      { clerkId: "user_enterprise_admin", email: "maya@chenservices.com", firstName: "Maya", lastName: "Singh", role: "admin" },
      { clerkId: "user_enterprise_mgr1", email: "carlos@chenservices.com", firstName: "Carlos", lastName: "Reyes", role: "manager" },
      { clerkId: "user_enterprise_mgr2", email: "rachel@chenservices.com", firstName: "Rachel", lastName: "Kim", role: "manager" },
      { clerkId: "user_enterprise_tech1", email: "omar@chenservices.com", firstName: "Omar", lastName: "Hassan", role: "operator" },
      { clerkId: "user_enterprise_tech2", email: "jen@chenservices.com", firstName: "Jen", lastName: "Liu", role: "operator" },
    ],
    customerCount: 20,
    jobCount: 40,
    leadCount: 15,
    reviewCount: 12,
    referralCount: 7,
  },
];

const FIRST_NAMES = ["James", "Maria", "Robert", "Linda", "Michael", "Sarah", "David", "Jennifer", "William", "Elizabeth",
  "Richard", "Patricia", "Thomas", "Barbara", "Daniel", "Susan", "Mark", "Nancy", "Steven", "Karen",
  "Paul", "Lisa", "Andrew", "Betty", "Joshua", "Dorothy", "Kenneth", "Sandra", "Brian", "Ashley"];

const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Lewis", "Robinson", "Walker"];

const STREETS = ["Oak St", "Maple Ave", "Cedar Ln", "Pine Dr", "Elm Ct", "Birch Way", "Willow Rd", "Cherry Blvd",
  "Spruce Pl", "Ash Ter", "Walnut Cir", "Hickory Ln", "Cypress Dr", "Poplar Ave", "Magnolia St"];

const REVIEW_COMMENTS = [
  "Excellent work! Very professional and thorough.",
  "Great service, showed up on time and did a fantastic job.",
  "Would highly recommend to anyone. Very knowledgeable team.",
  "Good work overall. Completed the job as promised.",
  "Solid service. Fair pricing and quality workmanship.",
  "Very happy with the results. Will definitely use again.",
  "Professional crew, cleaned up after themselves. A+",
  "Quick response time and great communication throughout.",
  "Did a decent job but took a bit longer than expected.",
  "Friendly team, fair price, and good results. Satisfied.",
  "Outstanding service from start to finish. Top notch!",
  "Good experience. Minor scheduling hiccup but resolved quickly.",
];

const LEAD_SOURCES = ["website", "google", "referral", "facebook", "yelp", "nextdoor", "homeadvisor", "thumbtack"];
const LEAD_STATUSES = ["new", "contacted", "qualified", "converted", "lost"];
const JOB_STATUSES = ["scheduled", "in_progress", "completed", "completed", "completed", "cancelled"];
const JOB_PRIORITIES = ["low", "normal", "normal", "normal", "high", "urgent"];
const INVOICE_STATUSES = ["draft", "sent", "paid", "paid", "paid", "overdue"];
const REFERRAL_STATUSES = ["pending", "accepted", "completed", "completed", "declined"];

async function seedCompany(config: DemoCompanyConfig) {
  const existing = await db.select().from(companiesTable).where(eq(companiesTable.name, config.name)).limit(1);
  if (existing.length > 0) {
    console.log(`  ⏭  Company "${config.name}" already exists, skipping.`);
    return;
  }

  console.log(`  🏢 Seeding "${config.name}" (${config.tier})...`);

  const [company] = await db.insert(companiesTable).values({
    name: config.name,
    businessType: config.businessType,
    tier: config.tier,
    email: config.email,
    phone: config.phone,
    address: config.address,
    city: config.city,
    state: config.state,
    zip: config.zip,
    maxUsers: config.maxUsers,
    isActive: true,
  }).returning();

  const companyId = company.id;

  const userIds: number[] = [];
  for (const u of config.users) {
    const [user] = await db.insert(usersTable).values({
      clerkId: u.clerkId,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      companyId,
      isActive: true,
      isOnboarded: true,
    }).returning();
    userIds.push(user.id);
  }

  const operatorIds = userIds.slice(1);
  const allAssignableIds = operatorIds.length > 0 ? operatorIds : [userIds[0]];

  const customerIds: number[] = [];
  for (let i = 0; i < config.customerCount; i++) {
    const fn = pick(FIRST_NAMES);
    const ln = pick(LAST_NAMES);
    const [cust] = await db.insert(customersTable).values({
      companyId,
      firstName: fn,
      lastName: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${rand(1, 99)}@email.com`,
      phone: `(555) ${rand(100, 999)}-${rand(1000, 9999)}`,
      address: `${rand(100, 9999)} ${pick(STREETS)}`,
      city: config.city,
      state: config.state,
      zip: config.zip,
      totalJobsCount: 0,
      totalRevenue: "0",
    }).returning();
    customerIds.push(cust.id);
  }

  const jobRecords: { id: number; customerId: number; status: string; revenue: number; serviceType: string; scheduledStart: Date }[] = [];
  for (let i = 0; i < config.jobCount; i++) {
    const status = pick(JOB_STATUSES);
    const serviceType = pick(config.serviceTypes);
    const scheduledStart = daysAgo(rand(1, 90));
    const scheduledEnd = hoursAfter(scheduledStart, rand(1, 4));
    const revenue = rand(150, 3500);
    const custId = pick(customerIds);

    const actualStart = (status === "completed" || status === "in_progress") ? scheduledStart : undefined;
    const actualEnd = status === "completed" ? scheduledEnd : undefined;

    const [job] = await db.insert(jobsTable).values({
      companyId,
      customerId: custId,
      title: `${serviceType} - ${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      description: `${serviceType} service call`,
      status,
      priority: pick(JOB_PRIORITIES),
      serviceType,
      scheduledStart,
      scheduledEnd,
      actualStart,
      actualEnd,
      address: `${rand(100, 9999)} ${pick(STREETS)}`,
      city: config.city,
      state: config.state,
      zip: config.zip,
      assignedToId: pick(allAssignableIds),
      estimatedRevenue: revenue.toString(),
      actualRevenue: status === "completed" ? revenue.toString() : undefined,
    }).returning();

    jobRecords.push({ id: job.id, customerId: custId, status, revenue, serviceType, scheduledStart });
  }

  let invoiceNum = 1000;
  for (const job of jobRecords) {
    if (job.status === "completed" || job.status === "in_progress") {
      const invStatus = job.status === "completed" ? pick(["paid", "paid", "paid", "sent"]) : "draft";
      const subtotal = job.revenue;
      const taxRate = 8.25;
      const taxAmount = Math.round(subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;
      const dueDate = new Date(job.scheduledStart);
      dueDate.setDate(dueDate.getDate() + 30);

      await db.insert(invoicesTable).values({
        companyId,
        customerId: job.customerId,
        jobId: job.id,
        invoiceNumber: `INV-${invoiceNum++}`,
        status: invStatus,
        subtotal: subtotal.toFixed(2),
        taxRate: taxRate.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        total: total.toFixed(2),
        dueDate: dueDate.toISOString().split("T")[0],
        sentAt: invStatus !== "draft" ? job.scheduledStart : undefined,
        paidAt: invStatus === "paid" ? hoursAfter(job.scheduledStart, rand(24, 720)) : undefined,
      });
    }
  }

  for (const job of jobRecords.filter(j => j.status === "scheduled")) {
    const subtotal = job.revenue;
    const taxRate = 8.25;
    const taxAmount = Math.round(subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    const dueDate = new Date(job.scheduledStart);
    dueDate.setDate(dueDate.getDate() + 30);
    const isOverdue = dueDate < new Date();

    await db.insert(invoicesTable).values({
      companyId,
      customerId: job.customerId,
      jobId: job.id,
      invoiceNumber: `INV-${invoiceNum++}`,
      status: isOverdue ? "overdue" : "draft",
      subtotal: subtotal.toFixed(2),
      taxRate: taxRate.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
      dueDate: dueDate.toISOString().split("T")[0],
    });
  }

  for (let i = 0; i < config.leadCount; i++) {
    const fn = pick(FIRST_NAMES);
    const ln = pick(LAST_NAMES);
    await db.insert(leadsTable).values({
      companyId,
      firstName: fn,
      lastName: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${rand(1, 99)}@email.com`,
      phone: `(555) ${rand(100, 999)}-${rand(1000, 9999)}`,
      address: `${rand(100, 9999)} ${pick(STREETS)}`,
      city: config.city,
      state: config.state,
      serviceInterest: pick(config.serviceTypes),
      status: pick(LEAD_STATUSES),
      source: pick(LEAD_SOURCES),
      estimatedValue: rand(200, 5000).toString(),
      assignedToId: pick(allAssignableIds),
      notes: `Interested in ${pick(config.serviceTypes).toLowerCase()} services`,
      createdAt: daysAgo(rand(1, 60)),
    });
  }

  const completedJobs = jobRecords.filter(j => j.status === "completed");
  for (let i = 0; i < config.reviewCount && i < completedJobs.length; i++) {
    const job = completedJobs[i];
    const rating = pick([3, 4, 4, 4, 5, 5, 5, 5]);
    await db.insert(reviewsTable).values({
      companyId,
      customerId: job.customerId,
      jobId: job.id,
      rating,
      comment: pick(REVIEW_COMMENTS),
      testimonial: rating >= 4 ? pick(REVIEW_COMMENTS) : undefined,
      reviewSource: pick(["google", "yelp", "internal", "email"]),
      isPublic: rating >= 4,
      isPublished: true,
      status: "approved",
      createdAt: hoursAfter(job.scheduledStart, rand(24, 168)),
    });
  }

  for (let i = 0; i < config.referralCount; i++) {
    const fn = pick(FIRST_NAMES);
    const ln = pick(LAST_NAMES);
    await db.insert(referralsTable).values({
      companyId,
      customerName: `${fn} ${ln}`,
      customerPhone: `(555) ${rand(100, 999)}-${rand(1000, 9999)}`,
      customerEmail: `${fn.toLowerCase()}.${ln.toLowerCase()}@email.com`,
      serviceNeeded: pick(config.serviceTypes),
      status: pick(REFERRAL_STATUSES),
      rewardAmount: pick(["25.00", "50.00", "75.00", "100.00"]),
      notes: `Referred for ${pick(config.serviceTypes).toLowerCase()}`,
      createdAt: daysAgo(rand(1, 45)),
    });
  }

  const customerJobCounts: Record<number, { count: number; revenue: number }> = {};
  for (const job of jobRecords) {
    if (!customerJobCounts[job.customerId]) {
      customerJobCounts[job.customerId] = { count: 0, revenue: 0 };
    }
    customerJobCounts[job.customerId].count++;
    if (job.status === "completed") {
      customerJobCounts[job.customerId].revenue += job.revenue;
    }
  }

  for (const [custId, stats] of Object.entries(customerJobCounts)) {
    await db.update(customersTable)
      .set({ totalJobsCount: stats.count, totalRevenue: stats.revenue.toFixed(2) })
      .where(eq(customersTable.id, Number(custId)));
  }

  console.log(`  ✅ "${config.name}" seeded: ${config.users.length} users, ${config.customerCount} customers, ${config.jobCount} jobs, ${config.leadCount} leads, ${config.reviewCount} reviews, ${config.referralCount} referrals`);
}

export async function seedDemoData() {
  console.log("🌱 Seeding demo data...");

  for (const config of DEMO_COMPANIES) {
    await seedCompany(config);
  }

  console.log("🌱 Demo data seeding complete!");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDemoData()
    .then(() => {
      pool.end();
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed failed:", err);
      pool.end();
      process.exit(1);
    });
}
