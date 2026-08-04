import { describe, expect, it } from 'vitest'
import ServiceFilter from './ServiceFilter.vue'
import { mountWith } from '@/test/helpers'

describe('ServiceFilter', () => {
  it('renders one chip per discipline plus the all option', () => {
    const wrapper = mountWith(ServiceFilter, { props: { activeService: 'all' } })

    expect(wrapper.findAll('button')).toHaveLength(5)
    expect(wrapper.text()).toContain('Transportation')
  })

  it('offers a single axis, labelled for assistive tech only', () => {
    const wrapper = mountWith(ServiceFilter, { props: { activeService: 'all' } })
    const groups = wrapper.findAll('[role="group"]')

    expect(groups).toHaveLength(1)
    expect(groups[0]!.attributes('aria-label')).toBe('Filter by discipline')
    expect(wrapper.find('.row__axis').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('SERVICE')
  })

  it('marks only the active chip as pressed', () => {
    const wrapper = mountWith(ServiceFilter, { props: { activeService: 'water' } })
    const pressed = wrapper
      .findAll('button')
      .filter((chip) => chip.attributes('aria-pressed') === 'true')

    expect(pressed).toHaveLength(1)
    expect(pressed[0]!.text()).toBe('Water')
  })

  it('emits the selected discipline', async () => {
    const wrapper = mountWith(ServiceFilter, { props: { activeService: 'all' } })

    await wrapper.findAll('button')[3]!.trigger('click')

    expect(wrapper.emitted('service')).toEqual([['buildings']])
  })

  it('no longer offers a market axis', async () => {
    const wrapper = mountWith(ServiceFilter, { props: { activeService: 'all' } })

    await wrapper.findAll('button')[1]!.trigger('click')

    expect(wrapper.emitted('market')).toBeUndefined()
    expect(wrapper.text()).not.toContain('Health')
    expect(wrapper.findAll('button[disabled]')).toHaveLength(0)
  })

  it('translates the chips and the group label', () => {
    const wrapper = mountWith(ServiceFilter, { props: { activeService: 'all' } }, 'zh-TW')

    expect(wrapper.text()).toContain('水資源')
    expect(wrapper.find('[role="group"]').attributes('aria-label')).toBe('依專業領域篩選')
  })
})
