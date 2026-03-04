import { storage } from "./storage";
import { hashPassword } from "./auth";

export async function seedDatabase() {
  const existingAdmin = await storage.getUserByUsername("admin");
  if (existingAdmin) return;

  const adminPassword = await hashPassword("admin123");
  const admin = await storage.createUser({
    username: "admin",
    password: adminPassword,
    email: "admin@webforge.io",
    fullName: "Alex Morgan",
    role: "admin",
    company: "WebForge Studio",
    phone: "+1 (555) 100-0001",
  });

  const client1Password = await hashPassword("client123");
  const client1 = await storage.createUser({
    username: "sarah.chen",
    password: client1Password,
    email: "sarah@bloomfloral.com",
    fullName: "Sarah Chen",
    role: "client",
    company: "Bloom Floral Co.",
    phone: "+1 (555) 200-0001",
  });

  const client2Password = await hashPassword("client123");
  const client2 = await storage.createUser({
    username: "james.rivera",
    password: client2Password,
    email: "james@northpeakoutdoors.com",
    fullName: "James Rivera",
    role: "client",
    company: "NorthPeak Outdoors",
    phone: "+1 (555) 200-0002",
  });

  const client3Password = await hashPassword("client123");
  const client3 = await storage.createUser({
    username: "emma.wilson",
    password: client3Password,
    email: "emma@artisanbakehouse.com",
    fullName: "Emma Wilson",
    role: "client",
    company: "Artisan Bake House",
    phone: "+1 (555) 200-0003",
  });

  const project1 = await storage.createProject({
    clientId: client1.id,
    name: "Bloom Floral Website Redesign",
    domain: "bloomfloral.com",
    status: "in-progress",
    description: "Complete redesign of the e-commerce floral shop with modern aesthetics and improved checkout flow.",
  });

  const project2 = await storage.createProject({
    clientId: client2.id,
    name: "NorthPeak Adventure Platform",
    domain: "northpeakoutdoors.com",
    status: "active",
    description: "Adventure booking platform with interactive maps, gear shop integration, and trip planning tools.",
  });

  const project3 = await storage.createProject({
    clientId: client3.id,
    name: "Artisan Bake House Storefront",
    domain: "artisanbakehouse.com",
    status: "completed",
    description: "Custom online storefront with order scheduling, delivery tracking, and a recipe blog.",
  });

  const project4 = await storage.createProject({
    clientId: client1.id,
    name: "Bloom Mobile App Landing",
    domain: "app.bloomfloral.com",
    status: "in-progress",
    description: "Landing page and marketing site for the upcoming Bloom mobile application.",
  });

  await storage.createContract({
    projectId: project1.id,
    clientId: client1.id,
    title: "Website Redesign Agreement",
    description: "Full-scope redesign including UX research, wireframing, visual design, and development for bloomfloral.com.",
    amount: "12500.00",
    status: "signed",
  });

  await storage.createContract({
    projectId: project2.id,
    clientId: client2.id,
    title: "Adventure Platform Development",
    description: "End-to-end development of the NorthPeak adventure booking platform with custom map integration.",
    amount: "28000.00",
    status: "signed",
  });

  await storage.createContract({
    projectId: project3.id,
    clientId: client3.id,
    title: "E-Commerce Storefront Build",
    description: "Design and development of the Artisan Bake House online ordering system.",
    amount: "9500.00",
    status: "completed",
  });

  await storage.createContract({
    projectId: project4.id,
    clientId: client1.id,
    title: "Mobile App Landing Page",
    description: "Design and development of a marketing landing page for the Bloom mobile app.",
    amount: "3500.00",
    status: "sent",
  });

  await storage.createInvoice({
    projectId: project1.id,
    clientId: client1.id,
    amount: "6250.00",
    status: "paid",
    dueDate: new Date("2026-02-15"),
    description: "Bloom Floral Redesign - Phase 1 (50% deposit)",
  });

  await storage.createInvoice({
    projectId: project1.id,
    clientId: client1.id,
    amount: "6250.00",
    status: "pending",
    dueDate: new Date("2026-04-01"),
    description: "Bloom Floral Redesign - Phase 2 (Final payment)",
  });

  await storage.createInvoice({
    projectId: project2.id,
    clientId: client2.id,
    amount: "14000.00",
    status: "paid",
    dueDate: new Date("2026-01-20"),
    description: "NorthPeak Platform - 50% upfront deposit",
  });

  await storage.createInvoice({
    projectId: project2.id,
    clientId: client2.id,
    amount: "14000.00",
    status: "pending",
    dueDate: new Date("2026-05-01"),
    description: "NorthPeak Platform - Final delivery payment",
  });

  await storage.createInvoice({
    projectId: project3.id,
    clientId: client3.id,
    amount: "9500.00",
    status: "paid",
    dueDate: new Date("2026-01-10"),
    description: "Artisan Bake House - Full project payment",
  });

  await storage.createMessage({
    projectId: project1.id,
    senderId: client1.id,
    receiverId: admin.id,
    content: "Hi Alex, just wanted to check in on the progress for the homepage redesign. The new color palette looks fantastic!",
  });

  await storage.createMessage({
    projectId: project1.id,
    senderId: admin.id,
    receiverId: client1.id,
    content: "Thanks Sarah! We're wrapping up the homepage this week. I'll send over the staging link by Friday for your review.",
  });

  await storage.createMessage({
    projectId: project2.id,
    senderId: client2.id,
    receiverId: admin.id,
    content: "The map integration is looking great. Could we add filtering by difficulty level for the hiking trails?",
  });

  await storage.createMessage({
    projectId: project3.id,
    senderId: client3.id,
    receiverId: admin.id,
    content: "The online ordering system is working perfectly. Our customers love the new scheduling feature. Thank you!",
  });

  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    await storage.createAnalytics({
      projectId: project1.id,
      visitors: Math.floor(Math.random() * 200) + 80,
      pageViews: Math.floor(Math.random() * 600) + 200,
      bounceRate: (Math.random() * 30 + 25).toFixed(2),
      avgSessionDuration: Math.floor(Math.random() * 180) + 60,
      date: dateStr,
    });

    await storage.createAnalytics({
      projectId: project2.id,
      visitors: Math.floor(Math.random() * 350) + 150,
      pageViews: Math.floor(Math.random() * 900) + 400,
      bounceRate: (Math.random() * 25 + 20).toFixed(2),
      avgSessionDuration: Math.floor(Math.random() * 240) + 90,
      date: dateStr,
    });

    await storage.createAnalytics({
      projectId: project3.id,
      visitors: Math.floor(Math.random() * 150) + 50,
      pageViews: Math.floor(Math.random() * 400) + 100,
      bounceRate: (Math.random() * 35 + 30).toFixed(2),
      avgSessionDuration: Math.floor(Math.random() * 120) + 40,
      date: dateStr,
    });
  }

  console.log("Database seeded successfully");
}
