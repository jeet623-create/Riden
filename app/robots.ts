import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dmc", "/api"],
      },
    ],
    sitemap: "https://riden.me/sitemap.xml",
  }
}
