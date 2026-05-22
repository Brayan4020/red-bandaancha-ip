/**
 * Database helpers for configuration history
 */

import { getDb } from "./db";
import { configHistory, InsertConfigHistory, ConfigHistory } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

/**
 * Save a generated configuration to history
 */
export async function saveConfigToHistory(
  userId: number,
  data: Omit<InsertConfigHistory, "id" | "createdAt" | "updatedAt">
): Promise<ConfigHistory> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(configHistory).values(data);
  const id = result[0].insertId;

  const saved = await db.query.configHistory.findFirst({
    where: eq(configHistory.id, Number(id)),
  });

  if (!saved) throw new Error("Failed to save configuration to history");
  return saved;
}

/**
 * Get all configurations for a user
 */
export async function getUserConfigHistory(
  userId: number,
  filters?: {
    vendor?: string;
    siteId?: string;
    isTemplate?: boolean;
  }
): Promise<ConfigHistory[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.query.configHistory.findMany({
    where: eq(configHistory.userId, userId),
    orderBy: desc(configHistory.createdAt),
  });

  if (filters?.vendor) {
    query = db.query.configHistory.findMany({
      where: and(
        eq(configHistory.userId, userId),
        eq(configHistory.vendor, filters.vendor as any)
      ),
      orderBy: desc(configHistory.createdAt),
    });
  }

  if (filters?.siteId) {
    query = db.query.configHistory.findMany({
      where: and(
        eq(configHistory.userId, userId),
        eq(configHistory.siteId, filters.siteId as any)
      ),
      orderBy: desc(configHistory.createdAt),
    });
  }

  return query;
}

/**
 * Get a specific configuration by ID
 */
export async function getConfigById(
  configId: number,
  userId: number
): Promise<ConfigHistory | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return (await db.query.configHistory.findFirst({
    where: and(
      eq(configHistory.id, configId),
      eq(configHistory.userId, userId)
    ),
  })) || null;
}

/**
 * Update configuration metadata
 */
export async function updateConfigMetadata(
  configId: number,
  userId: number,
  updates: {
    configName?: string;
    auditScore?: number;
    auditNotes?: string;
    tags?: string[];
    notes?: string;
    isTemplate?: boolean;
  }
): Promise<ConfigHistory> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(configHistory)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(configHistory.id, configId),
        eq(configHistory.userId, userId)
      )
    );

  const updated = await getConfigById(configId, userId);
  if (!updated) throw new Error("Failed to update configuration");
  return updated;
}

/**
 * Delete a configuration from history
 */
export async function deleteConfig(
  configId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(configHistory)
    .where(
      and(
        eq(configHistory.id, configId),
        eq(configHistory.userId, userId)
      )
    );

  return true;
}

/**
 * Get templates (saved configurations marked as templates)
 */
export async function getTemplates(
  userId: number,
  vendor?: string
): Promise<ConfigHistory[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (vendor) {
    return (await db.query.configHistory.findMany({
      where: and(
        eq(configHistory.userId, userId),
        eq(configHistory.isTemplate, true),
        eq(configHistory.vendor, vendor as any)
      ),
      orderBy: desc(configHistory.createdAt),
    })) || [];
  }

  return (await db.query.configHistory.findMany({
    where: and(
      eq(configHistory.userId, userId),
      eq(configHistory.isTemplate, true)
    ),
    orderBy: desc(configHistory.createdAt),
  })) || [];
}

/**
 * Search configurations by name or tags
 */
export async function searchConfigs(
  userId: number,
  searchTerm: string
): Promise<ConfigHistory[]> {
  // Note: This is a simple implementation. For production, use full-text search
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allConfigs = await getUserConfigHistory(userId);
  return allConfigs.filter(
    (config) =>
      config.configName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (config.tags && JSON.stringify(config.tags).toLowerCase().includes(searchTerm.toLowerCase()))
  );
}

/**
 * Get statistics about user's configurations
 */
export async function getConfigStats(userId: number): Promise<{
  totalConfigs: number;
  byVendor: Record<string, number>;
  bySite: Record<string, number>;
  templates: number;
  averageAuditScore: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const configs = await getUserConfigHistory(userId);

  const stats = {
    totalConfigs: configs.length,
    byVendor: {} as Record<string, number>,
    bySite: {} as Record<string, number>,
    templates: configs.filter((c) => c.isTemplate).length,
    averageAuditScore: 0,
  };

  let totalScore = 0;
  let scoreCount = 0;

  configs.forEach((config) => {
    // Count by vendor
    stats.byVendor[config.vendor] = (stats.byVendor[config.vendor] || 0) + 1;

    // Count by site
    stats.bySite[config.siteId] = (stats.bySite[config.siteId] || 0) + 1;

    // Calculate average audit score
    if (config.auditScore) {
      totalScore += config.auditScore;
      scoreCount++;
    }
  });

  stats.averageAuditScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

  return stats;
}

