import { NextResponse } from "next/server";
import { vercelSandboxProvider } from "@/lib/workspace/vercel-sandbox";
import { validateWorkspacePath } from "@/lib/workspace/security";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const path = validateWorkspacePath(new URL(request.url).searchParams.get("path") ?? "");
    const content = await vercelSandboxProvider.readFile(id, path);
    return NextResponse.json({ path, content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to read file";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { path?: string; content?: string };
    const path = validateWorkspacePath(body.path ?? "");
    if (typeof body.content !== "string") {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }
    if (body.content.length > 1_000_000) {
      return NextResponse.json({ error: "File is too large" }, { status: 413 });
    }
    await vercelSandboxProvider.writeFile(id, path, body.content);
    return NextResponse.json({ ok: true, path });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to write file";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
