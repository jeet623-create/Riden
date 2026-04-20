import type { MetadataRoute } from "next"
import { ARTICLES } from "./(marketing)/blog/articles"

const BASE = "https://riden.me"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const marketingRoutes = [
    "",
    "/for-dmcs",
    "/for-operators",
    "/for-drivers",
    "/pricing",
    "/about",
    "/contact",
    "/blog",
    "/privacy",
    "/terms",
    "/status",
  ]

  return [
    ...marketingRoutes.map(path => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...ARTICLES.map(a => ({
      url: `${BASE}/blog/${a.slug}`,
      lastModified: new Date(a.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ]
}
