import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getAllNetworkDevices, getNetworkDeviceById, createNetworkDevice, updateDeviceStatus, getLatestDeviceConfig, saveDeviceConfig, createAutomationTask, getAutomationTask, updateAutomationTaskStatus, createAiRecommendation, getNewRecommendations } from "../db";
import { testDeviceConnectivity, NetworkDeviceConnector } from "../network/device-connector";
import { generateConfiguration } from "../network/config-generator";
import { quickAudit } from "../network/config-auditor";

export const networkRouter = router({
  // ─── Device Management ─────────────────────────────────────────────────

  /**
   * Get all network devices
   */
  listDevices: publicProcedure.query(async () => {
    try {
      const devices = await getAllNetworkDevices();
      return { success: true, devices };
    } catch (error) {
      return { success: false, devices: [], error: String(error) };
    }
  }),

  /**
   * Get device by ID
   */
  getDevice: publicProcedure
    .input(z.object({ deviceId: z.number() }))
    .query(async ({ input }) => {
      try {
        const device = await getNetworkDeviceById(input.deviceId);
        return { success: true, device };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Add new network device
   */
  addDevice: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        deviceType: z.enum(["router", "switch", "firewall", "ap", "server"]),
        vendor: z.enum(["huawei", "cisco", "juniper", "fortinet", "arista", "other"]),
        model: z.string(),
        siteId: z.number(),
        ipAddress: z.string(),
        sshPort: z.number().default(22),
        username: z.string(),
        passwordEncrypted: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await createNetworkDevice(input);
        return { success: true, message: "Device added successfully" };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Test device connectivity
   */
  testConnectivity: protectedProcedure
    .input(
      z.object({
        host: z.string(),
        port: z.number(),
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const isOnline = await testDeviceConnectivity(input);
        return { success: true, isOnline };
      } catch (error) {
        return { success: false, isOnline: false, error: String(error) };
      }
    }),

  // ─── Configuration Management ──────────────────────────────────────────

  /**
   * Get device configuration
   */
  getDeviceConfig: protectedProcedure
    .input(z.object({ deviceId: z.number() }))
    .query(async ({ input }) => {
      try {
        const config = await getLatestDeviceConfig(input.deviceId);
        return { success: true, config };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Fetch and save device configuration
   */
  syncDeviceConfig: protectedProcedure
    .input(
      z.object({
        deviceId: z.number(),
        ipAddress: z.string(),
        vendor: z.enum(["huawei", "cisco", "juniper", "fortinet"]),
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const connector = new NetworkDeviceConnector({
          host: input.ipAddress,
          port: 22,
          username: input.username,
          password: input.password,
        });

        const connected = await connector.connect();
        if (!connected) {
          return { success: false, error: "Failed to connect to device" };
        }

        const configResult = await connector.getConfig(input.vendor);
        await connector.disconnect();

        if (!configResult.success) {
          return { success: false, error: configResult.error };
        }

        // Get latest version
        const latestConfig = await getLatestDeviceConfig(input.deviceId);
        const nextVersion = (latestConfig?.configVersion ?? 0) + 1;

        // Save configuration
        await saveDeviceConfig({
          deviceId: input.deviceId,
          configVersion: nextVersion,
          configContent: configResult.output,
          configHash: Buffer.from(configResult.output).toString("hex").slice(0, 64),
          status: "active",
          appliedBy: ctx.user?.id,
          appliedAt: new Date(),
        });

        return { success: true, message: "Configuration synced successfully" };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  // ─── Automation Tasks ──────────────────────────────────────────────────

  /**
   * Create automation task
   */
  createTask: protectedProcedure
    .input(
      z.object({
        taskName: z.string(),
        taskType: z.enum(["config_apply", "failover", "optimization", "backup", "diagnostic"]),
        description: z.string().optional(),
        targetDevices: z.array(z.number()),
        priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
        scheduledFor: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await createAutomationTask({
          taskName: input.taskName,
          taskType: input.taskType,
          description: input.description,
          targetDevices: input.targetDevices as any,
          priority: input.priority,
          status: "pending",
          scheduledFor: input.scheduledFor,
          createdBy: ctx.user?.id ?? 1,
        });

        return { success: true, message: "Task created successfully" };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get task status
   */
  getTask: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .query(async ({ input }) => {
      try {
        const task = await getAutomationTask(input.taskId);
        return { success: true, task };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Update task status
   */
  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        status: z.enum(["pending", "running", "completed", "failed", "cancelled"]),
        result: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await updateAutomationTaskStatus(input.taskId, input.status, input.result);
        return { success: true, message: "Task status updated" };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  // ─── AI Recommendations ───────────────────────────────────────────────

  /**
   * Get new AI recommendations
   */
  getRecommendations: publicProcedure.query(async () => {
    try {
      const recommendations = await getNewRecommendations();
      return { success: true, recommendations };
    } catch (error) {
      return { success: false, recommendations: [], error: String(error) };
    }
  }),

  /**
   * Create AI recommendation
   */
  createRecommendation: protectedProcedure
    .input(
      z.object({
        deviceId: z.number().optional(),
        recommendationType: z.enum(["optimization", "security", "redundancy", "capacity", "failover"]),
        title: z.string(),
        description: z.string(),
        suggestedAction: z.string(),
        priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
        confidence: z.number().default(0.85).transform(v => v.toString()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await createAiRecommendation({
          deviceId: input.deviceId,
          recommendationType: input.recommendationType,
          title: input.title,
          description: input.description,
          suggestedAction: input.suggestedAction,
          priority: input.priority,
          confidence: input.confidence as any,
          status: "new",
        });

        return { success: true, message: "Recommendation created" };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  // --- Configuration Generation & Audit ---

  /**
   * Generate configuration commands for a device
   */
  generateConfig: protectedProcedure
    .input(
      z.object({
        siteId: z.enum(["sede1", "sede2", "sede3"]),
        vendor: z.enum(["huawei", "cisco", "fortinet"]),
        deviceType: z.enum(["switch", "router", "firewall"]),
      })
    )
    .query(async ({ input }) => {
      try {
        const config = generateConfiguration(input);
        return { success: true, config };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Audit configuration against best practices and VLSM
   */
  auditConfig: protectedProcedure
    .input(
      z.object({
        vendor: z.string(),
        commands: z.array(z.string()),
        sections: z.array(
          z.object({
            name: z.string(),
            description: z.string(),
            commands: z.array(z.string()),
          })
        ),
        site: z.enum(["sede1", "sede2", "sede3"]),
      })
    )
    .query(async ({ input }) => {
      try {
        const auditResult = quickAudit(input);
        return { success: true, audit: auditResult };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),
});
