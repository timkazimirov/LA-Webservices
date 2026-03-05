import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireAdmin } from "./auth";
import Stripe from "stripe";
import { insertProjectSchema, insertContractSchema, insertInvoiceSchema, insertMessageSchema, insertProjectRequestSchema, insertAnalyticsSchema } from "@shared/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-04-30.basil" as any });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  app.get("/api/clients", requireAdmin, async (req, res) => {
    try {
      const clients = await storage.getClientUsers();
      const safeClients = clients.map(({ password, ...c }) => c);
      res.json(safeClients);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/clients/:id", requireAdmin, async (req, res) => {
    try {
      const client = await storage.getUser(req.params.id);
      if (!client || client.role !== "client") return res.status(404).json({ message: "Client not found" });
      const { password, ...safe } = client;
      const clientProjects = await storage.getProjectsByClient(client.id);
      const clientInvoices = await storage.getInvoicesByClient(client.id);
      const clientContracts = await storage.getContractsByClient(client.id);
      const clientRequests = await storage.getProjectRequestsByClient(client.id);
      res.json({ ...safe, projects: clientProjects, invoices: clientInvoices, contracts: clientContracts, projectRequests: clientRequests });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/clients/:id", requireAdmin, async (req, res) => {
    try {
      const allowedFields = ["clientStage", "websiteUrl", "notes", "fullName", "email", "company", "phone"];
      const sanitized: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) sanitized[key] = req.body[key];
      }
      const updated = await storage.updateUser(req.params.id, sanitized);
      if (!updated) return res.status(404).json({ message: "Client not found" });
      const { password, ...safe } = updated;
      res.json(safe);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/clients", requireAdmin, async (req, res) => {
    try {
      const { username, password, email, fullName, company, phone, clientStage } = req.body;
      if (!username || !password || !email || !fullName) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already taken" });
      }
      const crypto = await import("crypto");
      const salt = crypto.randomBytes(16).toString("hex");
      const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
      const hashedPassword = `${salt}.${derivedKey}`;
      const user = await storage.createUser({
        username, password: hashedPassword, email, fullName,
        role: "client", company: company || null, phone: phone || null,
        clientStage: clientStage || "potential",
      });
      const { password: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin-users", requireAuth, async (_req, res) => {
    try {
      const admins = await storage.getAdminUsers();
      const safeAdmins = admins.map(({ password, ...a }) => a);
      res.json(safeAdmins);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const projectsList = user.role === "admin"
        ? await storage.getProjects()
        : await storage.getProjectsByClient(user.id);
      res.json(projectsList);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (req.user!.role !== "admin" && project.clientId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(project);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/projects", requireAdmin, async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);
      res.status(201).json(project);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/projects/:id", requireAdmin, async (req, res) => {
    try {
      const allowedFields = ["name", "domain", "status", "description"];
      const sanitized: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) sanitized[key] = req.body[key];
      }
      const project = await storage.updateProject(req.params.id, sanitized);
      if (!project) return res.status(404).json({ message: "Project not found" });
      res.json(project);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/projects/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.json({ message: "Project deleted" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/contracts", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const contractsList = user.role === "admin"
        ? await storage.getContracts()
        : await storage.getContractsByClient(user.id);
      res.json(contractsList);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/contracts", requireAdmin, async (req, res) => {
    try {
      const data = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(data);
      res.status(201).json(contract);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/contracts/:id", requireAdmin, async (req, res) => {
    try {
      const allowedFields = ["title", "description", "amount", "status", "signedAt"];
      const sanitized: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) sanitized[key] = req.body[key];
      }
      if (sanitized.status === "signed" && !sanitized.signedAt) {
        sanitized.signedAt = new Date();
      }
      const contract = await storage.updateContract(req.params.id, sanitized);
      if (!contract) return res.status(404).json({ message: "Contract not found" });
      res.json(contract);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/contracts/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteContract(req.params.id);
      res.json({ message: "Contract deleted" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/invoices", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const invoicesList = user.role === "admin"
        ? await storage.getInvoices()
        : await storage.getInvoicesByClient(user.id);
      res.json(invoicesList);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/invoices", requireAdmin, async (req, res) => {
    try {
      const data = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(data);
      res.status(201).json(invoice);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/invoices/:id", requireAdmin, async (req, res) => {
    try {
      const allowedFields = ["status", "dueDate", "description", "amount"];
      const sanitized: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) sanitized[key] = req.body[key];
      }
      if (sanitized.status === "paid") {
        sanitized.paidAt = new Date();
      }
      const invoice = await storage.updateInvoice(req.params.id, sanitized);
      if (!invoice) return res.status(404).json({ message: "Invoice not found" });
      res.json(invoice);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/invoices/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteInvoice(req.params.id);
      res.json({ message: "Invoice deleted" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/invoices/:id/pay", requireAuth, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) return res.status(404).json({ message: "Invoice not found" });
      if (invoice.status === "paid") return res.status(400).json({ message: "Invoice already paid" });

      const user = req.user!;
      if (user.role !== "admin" && invoice.clientId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const amountInCents = Math.round(parseFloat(invoice.amount) * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        metadata: { invoiceId: invoice.id, clientId: invoice.clientId },
      });

      await storage.updateInvoice(invoice.id, {
        stripePaymentIntentId: paymentIntent.id,
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/invoices/:id/confirm-payment", requireAuth, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) return res.status(404).json({ message: "Invoice not found" });

      const user = req.user!;
      if (user.role !== "admin" && invoice.clientId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!invoice.stripePaymentIntentId) {
        return res.status(400).json({ message: "No payment intent found for this invoice" });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(invoice.stripePaymentIntentId);
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ message: "Payment has not been completed yet" });
      }

      const expectedAmount = Math.round(parseFloat(invoice.amount) * 100);
      if (paymentIntent.amount !== expectedAmount) {
        return res.status(400).json({ message: "Payment amount mismatch" });
      }

      await storage.updateInvoice(invoice.id, {
        status: "paid",
        paidAt: new Date(),
      });

      res.json({ message: "Payment confirmed" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/stripe/config", requireAuth, async (_req, res) => {
    res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
  });

  app.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const messagesList = await storage.getMessages(req.user!.id);
      res.json(messagesList);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/messages/conversation/:userId", requireAuth, async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.user!.id, req.params.userId);
      res.json(conversation);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const data = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user!.id,
      });
      const message = await storage.createMessage(data);
      res.status(201).json(message);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post("/api/messages/read/:senderId", requireAuth, async (req, res) => {
    try {
      await storage.markMessagesRead(req.user!.id, req.params.senderId);
      res.json({ message: "Messages marked as read" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/messages/unread", requireAuth, async (req, res) => {
    try {
      const count = await storage.getUnreadCount(req.user!.id);
      res.json({ count });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/analytics/:projectId", requireAuth, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.projectId);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (req.user!.role !== "admin" && project.clientId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const analytics = await storage.getAnalytics(req.params.projectId);
      res.json(analytics);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/analytics", requireAdmin, async (req, res) => {
    try {
      const data = insertAnalyticsSchema.parse(req.body);
      const snapshot = await storage.createAnalytics(data);
      res.status(201).json(snapshot);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.get("/api/project-requests", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const requests = user.role === "admin"
        ? await storage.getProjectRequests()
        : await storage.getProjectRequestsByClient(user.id);
      res.json(requests);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/project-requests", requireAuth, async (req, res) => {
    try {
      const data = insertProjectRequestSchema.parse({
        ...req.body,
        clientId: req.user!.id,
      });
      const request = await storage.createProjectRequest(data);
      res.status(201).json(request);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/project-requests/:id", requireAdmin, async (req, res) => {
    try {
      const allowedFields = ["status", "adminNotes"];
      const sanitized: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) sanitized[key] = req.body[key];
      }
      const updated = await storage.updateProjectRequest(req.params.id, sanitized);
      if (!updated) return res.status(404).json({ message: "Request not found" });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/dashboard/stats", requireAdmin, async (req, res) => {
    try {
      const clients = await storage.getClientUsers();
      const allProjects = await storage.getProjects();
      const allContracts = await storage.getContracts();
      const allInvoices = await storage.getInvoices();

      const totalRevenue = allInvoices
        .filter(i => i.status === "paid")
        .reduce((sum, i) => sum + parseFloat(i.amount), 0);

      const pendingRevenue = allInvoices
        .filter(i => i.status === "pending")
        .reduce((sum, i) => sum + parseFloat(i.amount), 0);

      const activeProjects = allProjects.filter(p => p.status === "in-progress" || p.status === "active").length;

      res.json({
        totalClients: clients.length,
        totalProjects: allProjects.length,
        activeProjects,
        totalContracts: allContracts.length,
        signedContracts: allContracts.filter(c => c.status === "signed" || c.status === "completed").length,
        totalRevenue,
        pendingRevenue,
        totalInvoices: allInvoices.length,
        paidInvoices: allInvoices.filter(i => i.status === "paid").length,
        pendingInvoices: allInvoices.filter(i => i.status === "pending").length,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(
      `User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /login\nDisallow: /api/\n\nSitemap: https://lawebservices.com/sitemap.xml`
    );
  });

  app.get("/sitemap.xml", (_req, res) => {
    const now = new Date().toISOString().split("T")[0];
    res.type("application/xml").send(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://lawebservices.com/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://lawebservices.com/#services</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://lawebservices.com/#pricing</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://lawebservices.com/#testimonials</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`
    );
  });

  return httpServer;
}
