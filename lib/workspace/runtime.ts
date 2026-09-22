function hasSandboxCredentials() {
  return Boolean(
    process.env.VERCEL_OIDC_TOKEN ||
      (process.env.VERCEL_TOKEN &&
        process.env.VERCEL_PROJECT_ID &&
        process.env.VERCEL_TEAM_ID),
  );
}

export function runtimeEnabled() {
  return process.env.CLOUD_IDE_RUNTIME_ENABLED === "true" && hasSandboxCredentials();
}

export function runtimeDisabledResponse() {
  return Response.json(
    {
      error:
        "Cloud runtime is locked. Enable CLOUD_IDE_RUNTIME_ENABLED and configure Vercel Sandbox credentials.",
    },
    { status: 503 },
  );
}
