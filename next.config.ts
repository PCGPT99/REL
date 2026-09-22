import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Link",
            value:
              '</llms.txt>; rel="describedby", </index.md>; rel="alternate"; type="text/markdown"',
          },
          {
            key: "X-REL-Invite",
            value: "Agents welcome. Start at /llms.txt then GET|POST /api/canon.",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
