import { getBlogPosts } from '@/lib/content'
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const items = getBlogPosts()
    .map(
      (post) => `
        <item>
          <title>${escapeXml(post.title)}</title>
          <link>${absoluteUrl(post.url)}</link>
          <guid>${absoluteUrl(post.url)}</guid>
          <pubDate>${new Date(post.date).toUTCString()}</pubDate>
          <description>${escapeXml(post.summary)}</description>
        </item>`
    )
    .join('\n')

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${absoluteUrl('/')}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    ${items}
  </channel>
</rss>`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}

