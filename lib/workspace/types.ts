export type WorkspaceStatus = "creating" | "running" | "stopped" | "failed" | "destroyed";

export interface Workspace {
  id: string;
  projectId: string;
  status: WorkspaceStatus;
  provider: string;
  createdAt: string;
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}
