const MAX_COMMAND_LENGTH = 2000;
const MAX_PATH_LENGTH = 300;

const BLOCKED_COMMANDS = [
  /(^|\\s)(shutdown|reboot|halt)(\\s|$)/i,
  /(^|\\s)(mkfs|fdisk)(\\s|$)/i,
  /(^|\\s)rm\\s+-rf\\s+\\/(\\s|$)/i,
];

export function validateCommand(command: string) {
  const value = command.trim();
  if (!value) throw new Error("Command is required");
  if (value.length > MAX_COMMAND_LENGTH) throw new Error("Command is too long");
  if (BLOCKED_COMMANDS.some((pattern) => pattern.test(value))) {
    throw new Error("Command is not allowed");
  }
  return value;
}

export function validateWorkspacePath(path: string) {
  const value = path.trim();
  if (!value || value.length > MAX_PATH_LENGTH) throw new Error("Invalid file path");
  if (value.startsWith("/") || value.includes("\\0") || value.split("/").includes("..")) {
    throw new Error("Path must stay inside the workspace");
  }
  return value;
}
