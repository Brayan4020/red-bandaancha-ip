import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, networkDevices, InsertNetworkDevice, deviceConfigs, InsertDeviceConfig, automationTasks, InsertAutomationTask, aiRecommendations, InsertAiRecommendation } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Network Device Helpers ───────────────────────────────────────────────

export async function getAllNetworkDevices() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(networkDevices);
}

export async function getNetworkDeviceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(networkDevices).where(eq(networkDevices.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createNetworkDevice(device: InsertNetworkDevice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(networkDevices).values(device);
}

export async function updateDeviceStatus(deviceId: number, status: "online" | "offline" | "maintenance") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(networkDevices).set({ status, updatedAt: new Date() }).where(eq(networkDevices.id, deviceId));
}

// ─── Device Configuration Helpers ─────────────────────────────────────────

export async function getLatestDeviceConfig(deviceId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(deviceConfigs)
    .where(eq(deviceConfigs.deviceId, deviceId))
    .orderBy(desc(deviceConfigs.configVersion))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function saveDeviceConfig(config: InsertDeviceConfig) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(deviceConfigs).values(config);
}

// ─── Automation Task Helpers ──────────────────────────────────────────────

export async function createAutomationTask(task: InsertAutomationTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(automationTasks).values(task);
}

export async function getAutomationTask(taskId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(automationTasks).where(eq(automationTasks.id, taskId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAutomationTaskStatus(taskId: number, status: "pending" | "running" | "completed" | "failed" | "cancelled", result?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: any = { status };
  if (status === "running") updates.startedAt = new Date();
  if (status === "completed" || status === "failed") updates.completedAt = new Date();
  if (result) updates.result = result;
  return db.update(automationTasks).set(updates).where(eq(automationTasks.id, taskId));
}

// ─── AI Recommendation Helpers ────────────────────────────────────────────

export async function createAiRecommendation(rec: InsertAiRecommendation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(aiRecommendations).values(rec);
}

export async function getNewRecommendations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiRecommendations).where(eq(aiRecommendations.status, "new")).orderBy(desc(aiRecommendations.priority));
}
