import { NextResponse } from "next/server";
import { vercelSandboxProvider } from "@/lib/workspace/vercel-sandbox";
import { validateCommand } from "@/lib/workspace/security";
import { runtimeDisabledResponse, runtimeEnabled } from "@/lib/workspace/runtime";

const COMMAND_TIMEOUT_MS = 30_000;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!runtimeEnabled()) return runtimeDisabledResponse();

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { command?: string };
    const command = validateCommand(body.command ?? "");

    const result = await Promise.race([
      vercelSandboxProvider.executeCommand(id, command),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Command timed out")), COMMAND_TIMEOUT_MS),
      ),
    ]);

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Command execution failed";
    const status = message.includes("timed out") || message.includes("not allowed") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
