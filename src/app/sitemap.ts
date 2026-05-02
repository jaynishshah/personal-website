import type { MetadataRoute } from 'next'
import { getBlogPosts, getCaseStudies } from '@/lib/content'
import { absoluteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = ['/', '/about', '/blog', '/case-studies', '/now'].map((route) => ({
    url: absoluteUrl(route),
  }))

  const blogRoutes: MetadataRoute.Sitemap = getBlogPosts().map((post) => ({
    url: absoluteUrl(post.url),
    lastModified: post.date,
  }))

  const caseStudyRoutes: MetadataRoute.Sitemap = getCaseStudies().map((caseStudy) => ({
    url: absoluteUrl(caseStudy.url),
    lastModified: caseStudy.date,
  }))

  return [...staticRoutes, ...blogRoutes, ...caseStudyRoutes]
}
