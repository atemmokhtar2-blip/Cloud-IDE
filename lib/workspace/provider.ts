import type { CommandResult, Workspace } from "./types";

export interface WorkspaceProvider {
  createWorkspace(projectId: string): Promise<Workspace>;
  startWorkspace(id: string): Promise<void>;
  stopWorkspace(id: string): Promise<void>;
  executeCommand(id: string, command: string): Promise<CommandResult>;
  readFile(id: string, path: string): Promise<string>;
  writeFile(id: string, path: string, content: string): Promise<void>;
  destroyWorkspace(id: string): Promise<void>;
}
