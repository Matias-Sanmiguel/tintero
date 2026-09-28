import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/presupuestos/[id]/pdf": ["./src/server/engine/tectonic"],
  },
  outputFileTracingExcludes: {
    "*": [".env.local", "data/store.json"],
  },
};

export default nextConfig;
