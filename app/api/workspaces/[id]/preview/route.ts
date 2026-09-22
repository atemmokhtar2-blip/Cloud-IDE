import { NextResponse } from "next/server";
import { vercelSandboxProvider } from "@/lib/workspace/vercel-sandbox";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const port = Number(new URL(request.url).searchParams.get("port") ?? "3000");
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      return NextResponse.json({ error: "Invalid port" }, { status: 400 });
    }
    const url = await vercelSandboxProvider.getPreviewUrl(id, port);
    return NextResponse.json({ url, port });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Preview is unavailable";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
