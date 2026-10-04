export interface ArticleHeading {
  id: string
  level: 2 | 3
  title: string
}

export function getArticleHeadingId(title: string) {
  return title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function extractArticleHeadings(content: string): ArticleHeading[] {
  return [...content.matchAll(/^(#{2,3})\s+(.+?)(?:\s+#+)?\s*$/gm)].map(([, markers, rawTitle]) => {
    const title = rawTitle.replace(/[`*_]/g, '').trim()

    return {
      id: getArticleHeadingId(title),
      level: markers.length as 2 | 3,
      title,
    }
  })
}
