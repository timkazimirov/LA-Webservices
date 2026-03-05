import { storage } from "./storage";
import { hashPassword } from "./auth";

export async function seedDatabase() {
  const existingAdmin = await storage.getUserByUsername("admin");
  if (existingAdmin) return;

  const adminPassword = await hashPassword("tmkpotato123");
  await storage.createUser({
    username: "admin",
    password: adminPassword,
    email: "admin@lawebservices.com",
    fullName: "Admin",
    role: "admin",
    company: "LA Webservices",
    phone: "",
  });

  console.log("Admin account created successfully");
}
