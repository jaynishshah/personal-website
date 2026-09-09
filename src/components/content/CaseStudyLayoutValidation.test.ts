import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  validateCaseStudyMediaProps,
  validateCaseStudyPictogramRowProps,
  validateCaseStudySectionLeadProps,
} from './CaseStudyLayoutValidation.ts'

test('case-study layout validators accept complete runtime-authored props', () => {
  assert.doesNotThrow(() =>
    validateCaseStudyPictogramRowProps({
      src: '/images/pictogram.svg',
      title: 'One system',
      children: 'Supporting copy',
    }),
  )
  assert.doesNotThrow(() =>
    validateCaseStudySectionLeadProps({
      src: '/images/section.svg',
      title: 'Foundations',
      children: 0,
    }),
  )
  assert.doesNotThrow(() =>
    validateCaseStudyMediaProps({
      src: '/images/swatch.png',
      alt: 'A view of the Swatch interface',
    }),
  )
})

test('CaseStudyPictogramRow rejects every malformed required authoring prop', () => {
  const malformedProps: Array<[Record<string, unknown>, string]> = [
    [{ title: 'One system', children: 'Supporting copy' }, '[CaseStudyPictogramRow] "src" must be a non-empty string'],
    [{ src: '', title: 'One system', children: 'Supporting copy' }, '[CaseStudyPictogramRow] "src" must be a non-empty string'],
    [{ src: '   ', title: 'One system', children: 'Supporting copy' }, '[CaseStudyPictogramRow] "src" must be a non-empty string'],
    [{ src: '/images/pictogram.svg', children: 'Supporting copy' }, '[CaseStudyPictogramRow] "title" must be a non-empty string'],
    [{ src: '/images/pictogram.svg', title: '', children: 'Supporting copy' }, '[CaseStudyPictogramRow] "title" must be a non-empty string'],
    [{ src: '/images/pictogram.svg', title: '   ', children: 'Supporting copy' }, '[CaseStudyPictogramRow] "title" must be a non-empty string'],
    [{ src: '/images/pictogram.svg', title: 'One system' }, '[CaseStudyPictogramRow] "children" must be present'],
    [{ src: '/images/pictogram.svg', title: 'One system', children: null }, '[CaseStudyPictogramRow] "children" must be present'],
    [{ src: '/images/pictogram.svg', title: 'One system', children: false }, '[CaseStudyPictogramRow] "children" must be present'],
  ]

  for (const [props, message] of malformedProps) {
    assert.throws(() => validateCaseStudyPictogramRowProps(props), { message })
  }
})

test('CaseStudySectionLead rejects every malformed required authoring prop', () => {
  const malformedProps: Array<[Record<string, unknown>, string]> = [
    [{ title: 'Foundations', children: 'Supporting copy' }, '[CaseStudySectionLead] "src" must be a non-empty string'],
    [{ src: '', title: 'Foundations', children: 'Supporting copy' }, '[CaseStudySectionLead] "src" must be a non-empty string'],
    [{ src: '   ', title: 'Foundations', children: 'Supporting copy' }, '[CaseStudySectionLead] "src" must be a non-empty string'],
    [{ src: '/images/section.svg', children: 'Supporting copy' }, '[CaseStudySectionLead] "title" must be a non-empty string'],
    [{ src: '/images/section.svg', title: '', children: 'Supporting copy' }, '[CaseStudySectionLead] "title" must be a non-empty string'],
    [{ src: '/images/section.svg', title: '   ', children: 'Supporting copy' }, '[CaseStudySectionLead] "title" must be a non-empty string'],
    [{ src: '/images/section.svg', title: 'Foundations' }, '[CaseStudySectionLead] "children" must be present'],
    [{ src: '/images/section.svg', title: 'Foundations', children: null }, '[CaseStudySectionLead] "children" must be present'],
    [{ src: '/images/section.svg', title: 'Foundations', children: false }, '[CaseStudySectionLead] "children" must be present'],
  ]

  for (const [props, message] of malformedProps) {
    assert.throws(() => validateCaseStudySectionLeadProps(props), { message })
  }
})

test('CaseStudyMedia rejects every malformed required authoring prop', () => {
  const malformedProps: Array<[Record<string, unknown>, string]> = [
    [{ alt: 'A view of the Swatch interface' }, '[CaseStudyMedia] "src" must be a non-empty string'],
    [{ src: '', alt: 'A view of the Swatch interface' }, '[CaseStudyMedia] "src" must be a non-empty string'],
    [{ src: '   ', alt: 'A view of the Swatch interface' }, '[CaseStudyMedia] "src" must be a non-empty string'],
    [{ src: '/images/swatch.png' }, '[CaseStudyMedia] "alt" must be a non-empty string'],
    [{ src: '/images/swatch.png', alt: '' }, '[CaseStudyMedia] "alt" must be a non-empty string'],
    [{ src: '/images/swatch.png', alt: '   ' }, '[CaseStudyMedia] "alt" must be a non-empty string'],
  ]

  for (const [props, message] of malformedProps) {
    assert.throws(() => validateCaseStudyMediaProps(props), { message })
  }
})
