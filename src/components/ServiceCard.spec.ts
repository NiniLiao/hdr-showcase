import { describe, expect, it } from 'vitest'
import ServiceCard from './ServiceCard.vue'
import { mountWith, summaryFixture } from '@/test/helpers'

describe('ServiceCard', () => {
  it('renders the discipline code, name and case count', () => {
    const wrapper = mountWith(ServiceCard, { props: { service: summaryFixture } })

    expect(wrapper.text()).toContain('TRB')
    expect(wrapper.text()).toContain('Transportation and bridge engineering')
    expect(wrapper.text()).toContain('42 case studies')
  })

  it('labels itself for screen readers', () => {
    const wrapper = mountWith(ServiceCard, { props: { service: summaryFixture } })

    expect(wrapper.attributes('aria-label')).toBe('Open Transportation and bridge engineering')
  })

  it('translates its own chrome', () => {
    const wrapper = mountWith(ServiceCard, { props: { service: summaryFixture } }, 'zh-TW')

    expect(wrapper.text()).toContain('42 件實績')
    expect(wrapper.attributes('aria-label')).toContain('開啟')
  })

  it('emits open with the slug when clicked', async () => {
    const wrapper = mountWith(ServiceCard, { props: { service: summaryFixture } })

    await wrapper.trigger('click')

    expect(wrapper.emitted('open')).toEqual([['transportation']])
  })

  it('emits prefetch on hover and on focus, not only on click', async () => {
    const wrapper = mountWith(ServiceCard, { props: { service: summaryFixture } })

    await wrapper.trigger('mouseenter')
    await wrapper.trigger('focus')

    expect(wrapper.emitted('prefetch')).toHaveLength(2)
  })

  it('carries the discipline accent through a custom property', () => {
    const wrapper = mountWith(ServiceCard, { props: { service: summaryFixture } })

    expect(wrapper.attributes('style')).toContain('--accent')
  })
})
