type IllustratedContentRuntimeProps = {
  src?: unknown
  title?: unknown
  children?: unknown
}

type MediaRuntimeProps = {
  src?: unknown
  alt?: unknown
}

function requireNonEmptyString(component: string, prop: string, value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`[${component}] "${prop}" must be a non-empty string`)
  }
}

function requireChildren(component: string, children: unknown) {
  if (children === null || children === undefined || children === false) {
    throw new Error(`[${component}] "children" must be present`)
  }
}

export function validateCaseStudyPictogramRowProps({
  src,
  title,
  children,
}: IllustratedContentRuntimeProps) {
  requireNonEmptyString('CaseStudyPictogramRow', 'src', src)
  requireNonEmptyString('CaseStudyPictogramRow', 'title', title)
  requireChildren('CaseStudyPictogramRow', children)
}

export function validateCaseStudySectionLeadProps({
  src,
  title,
  children,
}: IllustratedContentRuntimeProps) {
  requireNonEmptyString('CaseStudySectionLead', 'src', src)
  requireNonEmptyString('CaseStudySectionLead', 'title', title)
  requireChildren('CaseStudySectionLead', children)
}

export function validateCaseStudyMediaProps({ src, alt }: MediaRuntimeProps) {
  requireNonEmptyString('CaseStudyMedia', 'src', src)
  requireNonEmptyString('CaseStudyMedia', 'alt', alt)
}
