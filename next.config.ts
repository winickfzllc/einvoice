import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['nodemailer', 'nodemailer/lib/mail-composer', 'imapflow', 'mailparser', 'pdf-parse', 'pdf-parse/lib/pdf-parse.js'],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
