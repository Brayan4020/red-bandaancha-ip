import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Network Equipment Tables ───────────────────────────────────────────────

/**
 * Network devices (routers, switches, firewalls)
 */
export const networkDevices = mysqlTable("network_devices", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  deviceType: mysqlEnum("deviceType", ["router", "switch", "firewall", "ap", "server"]).notNull(),
  vendor: mysqlEnum("vendor", ["huawei", "cisco", "juniper", "fortinet", "arista", "other"]).notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  siteId: int("siteId").notNull(), // 1=Sede1, 2=Sede2, 3=Sede3
  ipAddress: varchar("ipAddress", { length: 45 }).notNull(),
  sshPort: int("sshPort").default(22),
  username: varchar("username", { length: 128 }),
  passwordEncrypted: text("passwordEncrypted"), // Encrypted credentials
  status: mysqlEnum("status", ["online", "offline", "maintenance"]).default("offline"),
  lastHeartbeat: timestamp("lastHeartbeat"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NetworkDevice = typeof networkDevices.$inferSelect;
export type InsertNetworkDevice = typeof networkDevices.$inferInsert;

/**
 * Device configurations (snapshots)
 */
export const deviceConfigs = mysqlTable("device_configs", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId").notNull(),
  configVersion: int("configVersion").notNull(),
  configContent: text("configContent").notNull(), // Full device config
  configHash: varchar("configHash", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["active", "pending", "failed", "archived"]).default("pending"),
  appliedBy: int("appliedBy"), // User ID
  appliedAt: timestamp("appliedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DeviceConfig = typeof deviceConfigs.$inferSelect;
export type InsertDeviceConfig = typeof deviceConfigs.$inferInsert;

/**
 * Network monitoring metrics (SNMP, NetFlow)
 */
export const networkMetrics = mysqlTable("network_metrics", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId").notNull(),
  metricType: mysqlEnum("metricType", ["cpu", "memory", "bandwidth", "latency", "packetLoss", "temperature"]).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 32 }).notNull(), // %, Mbps, ms, etc
  threshold: decimal("threshold", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["normal", "warning", "critical"]).default("normal"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export type NetworkMetric = typeof networkMetrics.$inferSelect;
export type InsertNetworkMetric = typeof networkMetrics.$inferInsert;

/**
 * Automation tasks and change management
 */
export const automationTasks = mysqlTable("automation_tasks", {
  id: int("id").autoincrement().primaryKey(),
  taskName: varchar("taskName", { length: 256 }).notNull(),
  taskType: mysqlEnum("taskType", ["config_apply", "failover", "optimization", "backup", "diagnostic"]).notNull(),
  description: text("description"),
  targetDevices: json("targetDevices"), // Array of device IDs
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed", "cancelled"]).default("pending"),
  scheduledFor: timestamp("scheduledFor"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  result: text("result"), // Execution result/logs
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutomationTask = typeof automationTasks.$inferSelect;
export type InsertAutomationTask = typeof automationTasks.$inferInsert;

/**
 * AI recommendations and insights
 */
export const aiRecommendations = mysqlTable("ai_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId"),
  recommendationType: mysqlEnum("recommendationType", ["optimization", "security", "redundancy", "capacity", "failover"]).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  suggestedAction: text("suggestedAction").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).default("0.85"), // 0-1
  status: mysqlEnum("status", ["new", "reviewed", "implemented", "dismissed"]).default("new"),
  implementedAt: timestamp("implementedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAiRecommendation = typeof aiRecommendations.$inferInsert;

/**
 * Network events and alerts
 */
export const networkEvents = mysqlTable("network_events", {
  id: int("id").autoincrement().primaryKey(),
  eventType: mysqlEnum("eventType", ["device_down", "config_change", "threshold_exceeded", "failover", "recovery", "security_alert"]).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "error", "critical"]).default("info"),
  deviceId: int("deviceId"),
  message: text("message").notNull(),
  details: json("details"),
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NetworkEvent = typeof networkEvents.$inferSelect;
export type InsertNetworkEvent = typeof networkEvents.$inferInsert;