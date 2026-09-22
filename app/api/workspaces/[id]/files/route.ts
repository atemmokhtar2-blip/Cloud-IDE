import { NextResponse } from "next/server";
import { vercelSandboxProvider } from "@/lib/workspace/vercel-sandbox";
import { validateWorkspacePath } from "@/lib/workspace/security";
import { runtimeDisabledResponse, runtimeEnabled } from "@/lib/workspace/runtime";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!runtimeEnabled()) return runtimeDisabledResponse();

  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const path = url.searchParams.get("path");
    if (path) {
      const safePath = validateWorkspacePath(path);
      const content = await vercelSandboxProvider.readFile(id, safePath);
      return NextResponse.json({ path: safePath, content });
    }
    const files = await vercelSandboxProvider.listFiles(id);
    return NextResponse.json({ files });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to inspect workspace files";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!runtimeEnabled()) return runtimeDisabledResponse();

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { path?: string; content?: string; action?: string; to?: string };
    const path = validateWorkspacePath(body.path ?? "");
    if (body.action === "rename") {
      const to = validateWorkspacePath(body.to ?? "");
      await vercelSandboxProvider.renamePath(id, path, to);
      return NextResponse.json({ ok: true, action: "rename", path, to });
    }
    if (typeof body.content !== "string") {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }
    if (body.content.length > 1_000_000) {
      return NextResponse.json({ error: "File is too large" }, { status: 413 });
    }
    await vercelSandboxProvider.writeFile(id, path, body.content);
    return NextResponse.json({ ok: true, path });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to write workspace file";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!runtimeEnabled()) return runtimeDisabledResponse();

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { path?: string };
    const path = validateWorkspacePath(body.path ?? "");
    await vercelSandboxProvider.createFile(id, path);
    return NextResponse.json({ ok: true, path }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create file";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!runtimeEnabled()) return runtimeDisabledResponse();

  try {
    const { id } = await context.params;
    const path = validateWorkspacePath(new URL(request.url).searchParams.get("path") ?? "");
    await vercelSandboxProvider.deletePath(id, path);
    return NextResponse.json({ ok: true, path });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete path";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
