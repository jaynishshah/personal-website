import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDirectory = path.join(process.cwd(), 'src/content')

export interface BlogPost {
  slug: string
  title: string
  date: string
  description: string
  featuredImage?: string
  tags: string[]
  content: string
}

export interface CaseStudy {
  slug: string
  title: string
  date: string
  description: string
  featuredImage?: string
  tags: string[]
  content: string
}

export function getBlogPosts(): BlogPost[] {
  const blogDir = path.join(contentDirectory, 'blog')
  const files = fs.readdirSync(blogDir)
  
  const posts = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const slug = file.replace('.md', '')
      const filePath = path.join(blogDir, file)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)
      
      return {
        slug,
        title: data.title,
        date: data.date,
        description: data.description || '',
        featuredImage: data.featuredImage,
        tags: data.tags || [],
        content,
      }
    })
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  
  return posts
}

export function getBlogPost(slug: string): BlogPost | null {
  try {
    const filePath = path.join(contentDirectory, 'blog', `${slug}.md`)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)
    
    return {
      slug,
      title: data.title,
      date: data.date,
      description: data.description || '',
      featuredImage: data.featuredImage,
      tags: data.tags || [],
      content,
    }
  } catch {
    return null
  }
}

export function getCaseStudies(): CaseStudy[] {
  const caseStudiesDir = path.join(contentDirectory, 'case-studies')
  const files = fs.readdirSync(caseStudiesDir)
  
  const caseStudies = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const slug = file.replace('.md', '')
      const filePath = path.join(caseStudiesDir, file)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)
      
      return {
        slug,
        title: data.title,
        date: data.date,
        description: data.description || '',
        featuredImage: data.featuredImage,
        tags: data.tags || [],
        content,
      }
    })
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  
  return caseStudies
}

export function getCaseStudy(slug: string): CaseStudy | null {
  try {
    const filePath = path.join(contentDirectory, 'case-studies', `${slug}.md`)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)
    
    return {
      slug,
      title: data.title,
      date: data.date,
      description: data.description || '',
      featuredImage: data.featuredImage,
      tags: data.tags || [],
      content,
    }
  } catch {
    return null
  }
}

