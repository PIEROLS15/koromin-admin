import "server-only";

export function requiredServerEnv(name: string) {
  const value = process.env[name];
  if (!value && process.env.NEXT_PHASE === "phase-production-build") return "build-time-placeholder";
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
