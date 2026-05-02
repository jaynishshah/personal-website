import { redirect } from 'next/navigation'

export default function LegacyCaseStudyPage({ params }: { params: { slug: string } }) {
  redirect(`/case-studies/${params.slug}`)
}
