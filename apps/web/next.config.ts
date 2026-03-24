import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@pharmapersonal/types", "@pharmapersonal/config"],
};

export default nextConfig;
