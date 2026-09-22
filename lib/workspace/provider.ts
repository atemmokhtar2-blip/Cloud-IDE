import type { CommandResult, Workspace } from "./types";

export interface WorkspaceProvider {
  createWorkspace(projectId: string): Promise<Workspace>;
  startWorkspace(id: string): Promise<void>;
  stopWorkspace(id: string): Promise<void>;
  executeCommand(id: string, command: string): Promise<CommandResult>;
  listFiles(id: string): Promise<string[]>;
  readFile(id: string, path: string): Promise<string>;
  writeFile(id: string, path: string, content: string): Promise<void>;
  createFile(id: string, path: string): Promise<void>;
  deletePath(id: string, path: string): Promise<void>;
  renamePath(id: string, from: string, to: string): Promise<void>;
  destroyWorkspace(id: string): Promise<void>;
}
