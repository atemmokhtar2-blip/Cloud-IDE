export function runtimeEnabled() {
  return process.env.CLOUD_IDE_RUNTIME_ENABLED === "true";
}

export function runtimeDisabledResponse() {
  return Response.json(
    {
      error:
        "Cloud runtime is disabled until authentication and workspace ownership are configured.",
    },
    { status: 503 },
  );
}
