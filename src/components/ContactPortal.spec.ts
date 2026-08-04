import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import ContactPortal from './ContactPortal.vue'
import { mountWith, receiptFixture, stubFetch } from '@/test/helpers'
import { setNarrowViewport } from '@/test/setup'

const enquiry = {
  name: 'Nini Chen',
  email: 'nini@example.com',
  organisation: 'Kaohsiung Water Bureau',
  message: 'We are scoping a reuse plant and need a permitting strategy.',
}

async function fillIn(wrapper: ReturnType<typeof mountWith>) {
  await wrapper.find('#name').setValue(enquiry.name)
  await wrapper.find('#email').setValue(enquiry.email)
  await wrapper.find('#organisation').setValue(enquiry.organisation)
  await wrapper.find('#discipline').setValue('water')
  await wrapper.find('#message').setValue(enquiry.message)
}

describe('ContactPortal', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    setNarrowViewport(false)
  })

  it('offers a general option plus every discipline', () => {
    const wrapper = mountWith(ContactPortal)
    const options = wrapper.findAll('#discipline option')

    expect(options).toHaveLength(5)
    expect(options[0]!.text()).toBe('General enquiry')
    expect(options.map((option) => option.attributes('value'))).toEqual([
      'general',
      'transportation',
      'water',
      'buildings',
      'energy',
    ])
  })

  it('posts the typed values together with the active locale', async () => {
    const { calls, bodies } = stubFetch()
    const wrapper = mountWith(ContactPortal)

    await fillIn(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(calls).toEqual(['/api/contact'])
    expect(bodies[0]).toEqual({ ...enquiry, discipline: 'water', locale: 'en' })
  })

  it('sends the Chinese locale so the server can reply in kind', async () => {
    const { bodies } = stubFetch()
    const wrapper = mountWith(ContactPortal, {}, 'zh-TW')

    await fillIn(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect((bodies[0] as { locale: string }).locale).toBe('zh-TW')
  })

  it('replaces the form with a receipt once the enquiry lands', async () => {
    stubFetch()
    const wrapper = mountWith(ContactPortal)

    await fillIn(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).toContain(receiptFixture.reference)
    expect(wrapper.text()).toContain(receiptFixture.office)
    expect(wrapper.text()).toContain(receiptFixture.respondBy)
  })

  it('shows a busy label and blocks a second submit while in flight', async () => {
    const { release, calls } = stubFetch({ contactDelay: true })
    const wrapper = mountWith(ContactPortal)

    await fillIn(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const submit = wrapper.find('.submit')
    expect(submit.text()).toBe('Sending…')
    expect(submit.attributes('disabled')).toBeDefined()

    release()
    await flushPromises()

    expect(calls).toHaveLength(1)
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('surfaces the server message and keeps what the user typed', async () => {
    stubFetch({ contactError: 'Enter a valid email address.' })
    const wrapper = mountWith(ContactPortal)

    await fillIn(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toBe('Enter a valid email address.')
    expect((wrapper.find('#email').element as HTMLInputElement).value).toBe(enquiry.email)
  })

  it('lets the user submit again after a failure', async () => {
    stubFetch({ contactError: 'Enter your name.' })
    const wrapper = mountWith(ContactPortal)

    await fillIn(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)

    stubFetch()
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).toContain(receiptFixture.reference)
  })

  it('clears the form when the user starts another enquiry', async () => {
    stubFetch()
    const wrapper = mountWith(ContactPortal)

    await fillIn(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    await wrapper.find('.ghost').trigger('click')

    expect(wrapper.find('form').exists()).toBe(true)
    expect((wrapper.find('#name').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#discipline').element as HTMLSelectElement).value).toBe('general')
  })

  it('stacks to a single column before the first breakpoint', () => {
    const wrapper = mountWith(ContactPortal)

    expect(wrapper.find('.form').exists()).toBe(true)
    expect(wrapper.findAll('.field')).toHaveLength(5)
    expect(wrapper.findAll('.field--wide')).toHaveLength(1)
  })

  describe('on a phone-sized viewport', () => {
    beforeEach(() => setNarrowViewport(true))

    it('replaces the form with the same receipt', async () => {
      stubFetch()
      const wrapper = mountWith(ContactPortal)

      await fillIn(wrapper)
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      expect(wrapper.find('form').exists()).toBe(false)
      expect(wrapper.find('.receipt').exists()).toBe(true)
      expect(wrapper.find('.receipt__reference').text()).toBe(receiptFixture.reference)
      expect(wrapper.find('.receipt__badge').text()).toBe('Received')
    })

    it('still lets the user start a second enquiry', async () => {
      stubFetch()
      const wrapper = mountWith(ContactPortal)

      await fillIn(wrapper)
      await wrapper.find('form').trigger('submit')
      await flushPromises()
      await wrapper.find('.ghost').trigger('click')

      expect(wrapper.find('form').exists()).toBe(true)
      expect((wrapper.find('#name').element as HTMLInputElement).value).toBe('')
    })

    it('keeps what was typed when the server rejects it', async () => {
      stubFetch({ contactError: 'Enter a valid email address.' })
      const wrapper = mountWith(ContactPortal)

      await fillIn(wrapper)
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      expect(wrapper.find('[role="alert"]').text()).toBe('Enter a valid email address.')
      expect((wrapper.find('#message').element as HTMLTextAreaElement).value).toBe(enquiry.message)
    })
  })

  it('translates its labels and actions', () => {
    const wrapper = mountWith(ContactPortal, {}, 'zh-TW')

    expect(wrapper.find('label[for="name"]').text()).toBe('姓名')
    expect(wrapper.find('.submit').text()).toBe('送出需求')
  })
})
