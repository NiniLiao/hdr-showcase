import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import TheHeader from './TheHeader.vue'
import { mountWith } from '@/test/helpers'

const SECTIONS = ['services', 'projects', 'about', 'contact', 'top']

function buildPage() {
  for (const id of SECTIONS) {
    const section = document.createElement('section')
    section.id = id
    document.body.append(section)
  }
}

function clearPage() {
  for (const id of SECTIONS) document.getElementById(id)?.remove()
}

describe('TheHeader', () => {
  beforeEach(buildPage)
  afterEach(() => {
    clearPage()
    document.body.removeAttribute('style')
  })

  it('keeps the mobile menu closed until the burger is pressed', async () => {
    const wrapper = mountWith(TheHeader)

    expect(wrapper.find('#mobile-menu').exists()).toBe(false)
    expect(wrapper.find('.burger').attributes('aria-expanded')).toBe('false')

    await wrapper.find('.burger').trigger('click')

    expect(wrapper.find('#mobile-menu').exists()).toBe(true)
    expect(wrapper.find('.burger').attributes('aria-expanded')).toBe('true')
  })

  it('lists every section plus contact in the mobile menu', async () => {
    const wrapper = mountWith(TheHeader)
    await wrapper.find('.burger').trigger('click')

    expect(wrapper.findAll('.menu__link').map((link) => link.attributes('href'))).toEqual([
      '#services',
      '#projects',
      '#about',
      '#contact',
    ])
  })

  it.each([
    [0, 'services'],
    [1, 'projects'],
    [2, 'about'],
    [3, 'contact'],
  ])('scrolls to the section behind menu item %i', async (index, id) => {
    const target = document.getElementById(id)!
    const scroll = vi.spyOn(target, 'scrollIntoView')
    const wrapper = mountWith(TheHeader)

    await wrapper.find('.burger').trigger('click')
    await wrapper.findAll('.menu__link')[index]!.trigger('click')
    await nextTick()

    expect(scroll).toHaveBeenCalledTimes(1)
    expect(wrapper.find('#mobile-menu').exists()).toBe(false)
  })

  /**
   * The scroll lock restores the position the page had when the menu opened,
   * so navigating in the same tick used to land the reader back where they
   * started rather than at the section they chose.
   */
  it('waits for the scroll lock to release before navigating', async () => {
    const target = document.getElementById('contact')!
    const order: string[] = []

    vi.spyOn(target, 'scrollIntoView').mockImplementation(() => order.push('navigate'))
    vi.spyOn(window, 'scrollTo').mockImplementation(() => order.push('unlock'))

    const wrapper = mountWith(TheHeader)
    await wrapper.find('.burger').trigger('click')
    await wrapper.findAll('.menu__link')[3]!.trigger('click')
    await nextTick()

    expect(order).toEqual(['unlock', 'navigate'])
  })

  it('scrolls from the desktop nav too', async () => {
    const target = document.getElementById('projects')!
    const scroll = vi.spyOn(target, 'scrollIntoView')
    const wrapper = mountWith(TheHeader)

    await wrapper.findAll('.nav a')[1]!.trigger('click')
    await nextTick()

    expect(scroll).toHaveBeenCalledTimes(1)
  })

  it('switches language from the menu and from the bar', async () => {
    const wrapper = mountWith(TheHeader)

    expect(wrapper.find('.lang').text()).toBe('中文')

    await wrapper.find('.burger').trigger('click')
    expect(wrapper.find('.menu__lang').text()).toContain('中文')
  })
})
