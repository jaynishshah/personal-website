export const SITE_NAME = 'Jaynish Shah'
export const SITE_URL = 'https://jaynishshah.com'
export const SITE_DESCRIPTION = 'Portfolio, case studies, and writing on design systems and product design.'

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString()
}

