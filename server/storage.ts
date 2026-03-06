import { eq, and, desc, or, lte, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users, projects, contracts, invoices, messages, analyticsSnapshots, projectRequests,
  type User, type InsertUser,
  type Project, type InsertProject,
  type Contract, type InsertContract,
  type Invoice, type InsertInvoice,
  type Message, type InsertMessage,
  type AnalyticsSnapshot, type InsertAnalyticsSnapshot,
  type ProjectRequest, type InsertProjectRequest,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  getClientUsers(): Promise<User[]>;
  getAdminUsers(): Promise<User[]>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;

  getProjects(): Promise<Project[]>;
  getProjectsByClient(clientId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, data: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;

  getContracts(): Promise<Contract[]>;
  getContractsByClient(clientId: string): Promise<Contract[]>;
  getContract(id: string): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: string, data: Partial<InsertContract & { signedAt: Date | null; pdfUrl: string; signedByClient: boolean }>): Promise<Contract | undefined>;
  deleteContract(id: string): Promise<void>;

  getInvoices(): Promise<Invoice[]>;
  getInvoicesByClient(clientId: string): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<void>;
  getDueRecurringInvoices(): Promise<Invoice[]>;

  getMessages(userId: string): Promise<Message[]>;
  getConversation(user1Id: string, user2Id: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesRead(receiverId: string, senderId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;

  getAnalytics(projectId: string): Promise<AnalyticsSnapshot[]>;
  getAllAnalytics(): Promise<AnalyticsSnapshot[]>;
  createAnalytics(snapshot: InsertAnalyticsSnapshot): Promise<AnalyticsSnapshot>;

  getProjectRequests(): Promise<ProjectRequest[]>;
  getProjectRequestsByClient(clientId: string): Promise<ProjectRequest[]>;
  createProjectRequest(req: InsertProjectRequest): Promise<ProjectRequest>;
  updateProjectRequest(id: string, data: Partial<ProjectRequest>): Promise<ProjectRequest | undefined>;
  deleteProjectRequest(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getClientUsers(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "client")).orderBy(desc(users.createdAt));
  }

  async getAdminUsers(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "admin")).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(messages).where(
      sql`${messages.senderId} = ${id} OR ${messages.receiverId} = ${id}`
    );
    await db.delete(invoices).where(eq(invoices.clientId, id));
    await db.delete(contracts).where(eq(contracts.clientId, id));
    const userProjects = await db.select({ id: projects.id }).from(projects).where(eq(projects.clientId, id));
    for (const p of userProjects) {
      await db.delete(analyticsSnapshots).where(eq(analyticsSnapshots.projectId, p.id));
    }
    await db.delete(projects).where(eq(projects.clientId, id));
    await db.delete(projectRequests).where(eq(projectRequests.clientId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  async getProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProjectsByClient(clientId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.clientId, clientId)).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async updateProject(id: string, data: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db.update(projects).set(data).where(eq(projects.id, id)).returning();
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getContracts(): Promise<Contract[]> {
    return db.select().from(contracts).orderBy(desc(contracts.createdAt));
  }

  async getContractsByClient(clientId: string): Promise<Contract[]> {
    return db.select().from(contracts).where(eq(contracts.clientId, clientId)).orderBy(desc(contracts.createdAt));
  }

  async getContract(id: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }

  async createContract(contract: InsertContract): Promise<Contract> {
    const [created] = await db.insert(contracts).values(contract).returning();
    return created;
  }

  async updateContract(id: string, data: Partial<InsertContract & { signedAt: Date | null; pdfUrl: string; signedByClient: boolean }>): Promise<Contract | undefined> {
    const [updated] = await db.update(contracts).set(data).where(eq(contracts.id, id)).returning();
    return updated;
  }

  async deleteContract(id: string): Promise<void> {
    await db.delete(contracts).where(eq(contracts.id, id));
  }

  async getInvoices(): Promise<Invoice[]> {
    return db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoicesByClient(clientId: string): Promise<Invoice[]> {
    return db.select().from(invoices).where(eq(invoices.clientId, clientId)).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [created] = await db.insert(invoices).values(invoice).returning();
    return created;
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice | undefined> {
    const [updated] = await db.update(invoices).set(data).where(eq(invoices.id, id)).returning();
    return updated;
  }

  async deleteInvoice(id: string): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  async getDueRecurringInvoices(): Promise<Invoice[]> {
    return db.select().from(invoices)
      .where(
        and(
          eq(invoices.isRecurring, true),
          lte(invoices.nextBillingDate, new Date())
        )
      );
  }

  async getMessages(userId: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));
  }

  async getConversation(user1Id: string, user2Id: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(
        or(
          and(eq(messages.senderId, user1Id), eq(messages.receiverId, user2Id)),
          and(eq(messages.senderId, user2Id), eq(messages.receiverId, user1Id))
        )
      )
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }

  async markMessagesRead(receiverId: string, senderId: string): Promise<void> {
    await db.update(messages)
      .set({ read: true })
      .where(and(eq(messages.receiverId, receiverId), eq(messages.senderId, senderId)));
  }

  async getUnreadCount(userId: string): Promise<number> {
    const unread = await db.select().from(messages)
      .where(and(eq(messages.receiverId, userId), eq(messages.read, false)));
    return unread.length;
  }

  async getAnalytics(projectId: string): Promise<AnalyticsSnapshot[]> {
    return db.select().from(analyticsSnapshots)
      .where(eq(analyticsSnapshots.projectId, projectId))
      .orderBy(analyticsSnapshots.date);
  }

  async getAllAnalytics(): Promise<AnalyticsSnapshot[]> {
    return db.select().from(analyticsSnapshots)
      .orderBy(desc(analyticsSnapshots.date));
  }

  async createAnalytics(snapshot: InsertAnalyticsSnapshot): Promise<AnalyticsSnapshot> {
    const [created] = await db.insert(analyticsSnapshots).values(snapshot).returning();
    return created;
  }

  async getProjectRequests(): Promise<ProjectRequest[]> {
    return db.select().from(projectRequests).orderBy(desc(projectRequests.createdAt));
  }

  async getProjectRequestsByClient(clientId: string): Promise<ProjectRequest[]> {
    return db.select().from(projectRequests)
      .where(eq(projectRequests.clientId, clientId))
      .orderBy(desc(projectRequests.createdAt));
  }

  async createProjectRequest(req: InsertProjectRequest): Promise<ProjectRequest> {
    const [created] = await db.insert(projectRequests).values(req).returning();
    return created;
  }

  async updateProjectRequest(id: string, data: Partial<ProjectRequest>): Promise<ProjectRequest | undefined> {
    const [updated] = await db.update(projectRequests).set(data).where(eq(projectRequests.id, id)).returning();
    return updated;
  }

  async deleteProjectRequest(id: string): Promise<void> {
    await db.delete(projectRequests).where(eq(projectRequests.id, id));
  }
}

export const storage = new DatabaseStorage();
