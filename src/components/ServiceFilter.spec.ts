import { describe, expect, it } from 'vitest'
import ServiceFilter from './ServiceFilter.vue'
import { mountWith } from '@/test/helpers'

const counts = { all: 4, transportation: 1 }

describe('ServiceFilter', () => {
  it('renders one chip per discipline plus the all option', () => {
    const wrapper = mountWith(ServiceFilter, { props: { active: 'all', counts } })

    expect(wrapper.findAll('button')).toHaveLength(5)
    expect(wrapper.text()).toContain('Transportation')
  })

  it('marks only the active chip as pressed', () => {
    const wrapper = mountWith(ServiceFilter, { props: { active: 'water', counts } })
    const pressed = wrapper.findAll('button').filter((chip) => chip.attributes('aria-pressed') === 'true')

    expect(pressed).toHaveLength(1)
    expect(pressed[0]!.text()).toContain('Water')
  })

  it('emits the selected filter id', async () => {
    const wrapper = mountWith(ServiceFilter, { props: { active: 'all', counts } })

    await wrapper.findAll('button')[3]!.trigger('click')

    expect(wrapper.emitted('change')).toEqual([['buildings']])
  })

  it('shows a count badge only where a count exists', () => {
    const wrapper = mountWith(ServiceFilter, { props: { active: 'all', counts } })

    expect(wrapper.findAll('.chip__count')).toHaveLength(2)
  })

  it('translates the chip labels and the group label', () => {
    const wrapper = mountWith(ServiceFilter, { props: { active: 'all', counts } }, 'zh-TW')

    expect(wrapper.text()).toContain('水資源')
    expect(wrapper.find('[role="group"]').attributes('aria-label')).toBe('依領域篩選服務')
  })
})
