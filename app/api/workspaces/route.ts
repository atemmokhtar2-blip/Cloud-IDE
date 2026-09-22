import { NextResponse } from "next/server";
import { vercelSandboxProvider } from "@/lib/workspace/vercel-sandbox";
import { runtimeDisabledResponse, runtimeEnabled } from "@/lib/workspace/runtime";

export async function POST(request: Request) {
  if (!runtimeEnabled()) return runtimeDisabledResponse();

  try {
    const body = (await request.json()) as { projectId?: string };
    const projectId = body.projectId?.trim();
    if (!projectId || projectId.length > 100) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const workspace = await vercelSandboxProvider.createWorkspace(projectId);
    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create workspace";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
