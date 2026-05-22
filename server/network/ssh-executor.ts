/**
 * SSH Executor for applying network configurations
 * Connects to devices and executes commands via SSH
 */

import { Client } from "ssh2";
import { promisify } from "util";

export interface SSHConnectionOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  timeout?: number;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  errors: string;
  executedCommands: number;
  failedCommands: number;
  duration: number;
}

export interface CommandExecutionLog {
  command: string;
  success: boolean;
  output: string;
  error?: string;
  timestamp: number;
}

/**
 * SSH Executor class for managing device connections and command execution
 */
export class SSHExecutor {
  private client: Client | null = null;
  private executionLogs: CommandExecutionLog[] = [];
  private startTime: number = 0;

  /**
   * Connect to a device via SSH
   */
  async connect(options: SSHConnectionOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client();

      const timeout = options.timeout || 10000;
      const timeoutHandle = setTimeout(() => {
        this.client?.end();
        reject(new Error(`SSH connection timeout after ${timeout}ms`));
      }, timeout);

      this.client.on("ready", () => {
        clearTimeout(timeoutHandle);
        console.log(`[SSH] Connected to ${options.host}:${options.port}`);
        resolve();
      });

      this.client.on("error", (err) => {
        clearTimeout(timeoutHandle);
        reject(new Error(`SSH connection error: ${err.message}`));
      });

      this.client.on("close", () => {
        console.log(`[SSH] Connection closed`);
      });

      this.client.connect({
        host: options.host,
        port: options.port,
        username: options.username,
        password: options.password,
        readyTimeout: timeout,
      });
    });
  }

  /**
   * Execute a single command via SSH
   */
  private async executeCommand(command: string): Promise<{ output: string; error: string }> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error("SSH client not connected"));
        return;
      }

      let output = "";
      let error = "";

      this.client.exec(command, (err, stream) => {
        if (err) {
          reject(err);
          return;
        }

        stream.on("close", (code) => {
          resolve({ output, error });
        });

        stream.on("data", (data) => {
          output += data.toString();
        });

        stream.stderr.on("data", (data) => {
          error += data.toString();
        });
      });
    });
  }

  /**
   * Execute multiple commands with vendor-specific handling
   */
  async executeCommands(
    commands: string[],
    vendor: "cisco" | "huawei" | "fortinet"
  ): Promise<ExecutionResult> {
    if (!this.client) {
      throw new Error("SSH client not connected");
    }

    this.startTime = Date.now();
    this.executionLogs = [];

    let executedCommands = 0;
    let failedCommands = 0;
    let allOutput = "";
    let allErrors = "";

    try {
      // Vendor-specific command execution
      if (vendor === "cisco") {
        await this.executeCiscoCommands(commands);
      } else if (vendor === "huawei") {
        await this.executeHuaweiCommands(commands);
      } else if (vendor === "fortinet") {
        await this.executeFortinetCommands(commands);
      }

      // Count results
      for (const log of this.executionLogs) {
        if (log.success) {
          executedCommands++;
          allOutput += `[OK] ${log.command}\n${log.output}\n`;
        } else {
          failedCommands++;
          allErrors += `[FAILED] ${log.command}\n${log.error}\n`;
        }
      }
    } catch (error) {
      allErrors += `Execution error: ${String(error)}\n`;
    }

    const duration = Date.now() - this.startTime;

    return {
      success: failedCommands === 0,
      output: allOutput,
      errors: allErrors,
      executedCommands,
      failedCommands,
      duration,
    };
  }

  /**
   * Execute Cisco IOS commands
   */
  private async executeCiscoCommands(commands: string[]): Promise<void> {
    for (const command of commands) {
      try {
        const { output, error } = await this.executeCommand(command);
        this.executionLogs.push({
          command,
          success: !error || error.length === 0,
          output,
          error: error || undefined,
          timestamp: Date.now(),
        });
      } catch (err) {
        this.executionLogs.push({
          command,
          success: false,
          output: "",
          error: String(err),
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Execute Huawei VRP commands
   */
  private async executeHuaweiCommands(commands: string[]): Promise<void> {
    for (const command of commands) {
      try {
        const { output, error } = await this.executeCommand(command);
        this.executionLogs.push({
          command,
          success: !error || error.length === 0,
          output,
          error: error || undefined,
          timestamp: Date.now(),
        });
      } catch (err) {
        this.executionLogs.push({
          command,
          success: false,
          output: "",
          error: String(err),
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Execute Fortinet FortiGate commands
   */
  private async executeFortinetCommands(commands: string[]): Promise<void> {
    for (const command of commands) {
      try {
        const { output, error } = await this.executeCommand(command);
        this.executionLogs.push({
          command,
          success: !error || error.length === 0,
          output,
          error: error || undefined,
          timestamp: Date.now(),
        });
      } catch (err) {
        this.executionLogs.push({
          command,
          success: false,
          output: "",
          error: String(err),
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Get execution logs
   */
  getExecutionLogs(): CommandExecutionLog[] {
    return this.executionLogs;
  }

  /**
   * Disconnect from device
   */
  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.client) {
        this.client.end();
        this.client = null;
      }
      resolve();
    });
  }
}

/**
 * Apply configuration to a device via SSH
 */
export async function applyConfigurationViaSSH(
  options: SSHConnectionOptions & {
    commands: string[];
    vendor: "cisco" | "huawei" | "fortinet";
  }
): Promise<ExecutionResult> {
  const executor = new SSHExecutor();

  try {
    // Connect to device
    await executor.connect({
      host: options.host,
      port: options.port,
      username: options.username,
      password: options.password,
      timeout: options.timeout,
    });

    // Execute commands
    const result = await executor.executeCommands(options.commands, options.vendor);

    return result;
  } catch (error) {
    throw new Error(`Failed to apply configuration: ${String(error)}`);
  } finally {
    // Disconnect
    await executor.disconnect();
  }
}

/**
 * Validate SSH connection without executing commands
 */
export async function validateSSHConnection(options: SSHConnectionOptions): Promise<boolean> {
  const executor = new SSHExecutor();

  try {
    await executor.connect(options);
    await executor.disconnect();
    return true;
  } catch (error) {
    console.error("SSH connection validation failed:", error);
    return false;
  }
}
