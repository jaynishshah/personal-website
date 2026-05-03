import type { CaseStudy } from './content'

type CaseStudyPreviewFields = Pick<
  CaseStudy,
  'previewImage' | 'accentColor' | 'systemLayers' | 'artifacts' | 'outcomes'
>

const previewFields: CaseStudyPreviewFields = {
  previewImage: '/images/case-studies/example.jpg',
  accentColor: '#D62B7F',
  systemLayers: ['Foundations'],
  artifacts: ['Token architecture'],
  outcomes: ['Design-code parity'],
}

void previewFields
