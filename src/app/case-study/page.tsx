import { getCaseStudies } from '@/lib/content'
import PostCard from '@/components/PostCard'
import styles from './page.module.css'

export default function CaseStudyPage() {
  const caseStudies = getCaseStudies()

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Case Studies</h1>
        <div className={styles.caseStudies}>
          {caseStudies.map((caseStudy) => (
            <PostCard
              key={caseStudy.slug}
              title={caseStudy.title}
              slug={caseStudy.slug}
              date={caseStudy.date}
              featuredImage={caseStudy.featuredImage}
              excerpt={caseStudy.description}
              tags={caseStudy.tags}
              type="case-study"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

