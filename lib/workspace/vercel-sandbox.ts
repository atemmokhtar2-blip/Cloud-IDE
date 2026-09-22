import { Sandbox } from "@vercel/sandbox";
import type { CommandResult, Workspace } from "./types";
import type { WorkspaceProvider } from "./provider";

const WORKSPACE_PREFIX = "cloud-ide";

function shellQuote(value: string) {
  return "'" + value.replace(/'/g, "'\\''") + "'";
}

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

  async listFiles(id: string): Promise<string[]> {
    const result = await this.executeCommand(
      id,
      "find . -maxdepth 5 -type f -not -path './node_modules/*' -not -path './.next/*' -not -path './.git/*' | sed 's#^./##' | sort",
    );
    if (result.exitCode !== 0) throw new Error(result.stderr || "Failed to list files");
    return result.stdout.split("\n").map((line) => line.trim()).filter(Boolean);
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

  async createFile(id: string, path: string): Promise<void> {
    const parent = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : ".";
    const result = await this.executeCommand(id, `mkdir -p -- ${shellQuote(parent)} && : > ${shellQuote(path)}`);
    if (result.exitCode !== 0) throw new Error(result.stderr || "Failed to create file");
  }

  async deletePath(id: string, path: string): Promise<void> {
    const result = await this.executeCommand(id, `rm -rf -- ${shellQuote(path)}`);
    if (result.exitCode !== 0) throw new Error(result.stderr || "Failed to delete path");
  }

  async renamePath(id: string, from: string, to: string): Promise<void> {
    const parent = to.includes("/") ? to.slice(0, to.lastIndexOf("/")) : ".";
    const result = await this.executeCommand(id, `mkdir -p -- ${shellQuote(parent)} && mv -- ${shellQuote(from)} ${shellQuote(to)}`);
    if (result.exitCode !== 0) throw new Error(result.stderr || "Failed to rename path");
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
