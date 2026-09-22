import { NextResponse } from "next/server";
import { vercelSandboxProvider } from "@/lib/workspace/vercel-sandbox";
import { runtimeDisabledResponse, runtimeEnabled } from "@/lib/workspace/runtime";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!runtimeEnabled()) return runtimeDisabledResponse();

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { action?: string };
    if (body.action === "start") {
      await vercelSandboxProvider.startWorkspace(id);
    } else if (body.action === "stop") {
      await vercelSandboxProvider.stopWorkspace(id);
    } else if (body.action === "destroy") {
      await vercelSandboxProvider.destroyWorkspace(id);
    } else {
      return NextResponse.json({ error: "action must be start, stop, or destroy" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, action: body.action });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Workspace lifecycle action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
