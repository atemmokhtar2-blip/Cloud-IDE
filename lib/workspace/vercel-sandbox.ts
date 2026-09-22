import { Sandbox } from "@vercel/sandbox";
import type { CommandResult, Workspace } from "./types";
import type { WorkspaceProvider } from "./provider";

const WORKSPACE_PREFIX = "cloud-ide";

function sandboxName(projectId: string) {
  const safe = projectId.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 48);
  return `${WORKSPACE_PREFIX}-${safe}`;
}

function toWorkspace(projectId: string, sandbox: Sandbox): Workspace {
  return {
    id: sandbox.name,
    projectId,
    status: sandbox.status === "running" ? "running" : "stopped",
    provider: "vercel-sandbox",
    createdAt: new Date().toISOString(),
  };
}

export class VercelSandboxProvider implements WorkspaceProvider {
  async createWorkspace(projectId: string): Promise<Workspace> {
    const sandbox = await Sandbox.getOrCreate({ name: sandboxName(projectId), ports: [3000] });
    return toWorkspace(projectId, sandbox);
  }

  async startWorkspace(id: string): Promise<void> {
    const sandbox = await Sandbox.get({ name: id });
    await sandbox.runCommand("true", []);
  }

  async stopWorkspace(id: string): Promise<void> {
    const sandbox = await Sandbox.get({ name: id });
    await sandbox.stop();
  }

  async executeCommand(id: string, command: string): Promise<CommandResult> {
    const sandbox = await Sandbox.get({ name: id });
    const result = await sandbox.runCommand({ cmd: "bash", args: ["-lc", command] });
    return {
      exitCode: result.exitCode,
      stdout: await result.stdout(),
      stderr: await result.stderr(),
    };
  }

  async readFile(id: string, path: string): Promise<string> {
    const sandbox = await Sandbox.get({ name: id });
    const buffer = await sandbox.readFileToBuffer({ path });
    if (!buffer) throw new Error(`File not found: ${path}`);
    return buffer.toString("utf8");
  }

  async writeFile(id: string, path: string, content: string): Promise<void> {
    const sandbox = await Sandbox.get({ name: id });
    await sandbox.writeFiles([{ path, content: Buffer.from(content, "utf8") }]);
  }

  async getPreviewUrl(id: string, port = 3000): Promise<string> {
    const sandbox = await Sandbox.get({ name: id });
    return sandbox.domain(port);
  }

  async destroyWorkspace(id: string): Promise<void> {
    const sandbox = await Sandbox.get({ name: id });
    await sandbox.delete();
  }
}

export const vercelSandboxProvider = new VercelSandboxProvider();
