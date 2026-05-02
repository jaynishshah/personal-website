import type { Metadata } from 'next'
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site'

interface PageMetadataInput {
  title: string
  summary?: string
  path: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  tags?: string[]
  canonicalUrl?: string
}

export function buildPageMetadata({
  title,
  summary = SITE_DESCRIPTION,
  path,
  image,
  type = 'website',
  publishedTime,
  tags = [],
  canonicalUrl,
}: PageMetadataInput): Metadata {
  const url = canonicalUrl ? absoluteUrl(canonicalUrl) : absoluteUrl(path)
  const imageUrl = image ? absoluteUrl(image) : absoluteUrl('/images/site/profile.png')
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`

  return {
    title: fullTitle,
    description: summary,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: summary,
      url,
      siteName: SITE_NAME,
      type,
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(tags.length > 0 ? { tags } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: summary,
      images: [imageUrl],
    },
  }
}

