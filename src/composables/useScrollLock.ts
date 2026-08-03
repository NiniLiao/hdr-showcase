import { watch, type Ref } from 'vue'

/**
 * iOS Safari ignores `overflow: hidden` on body, so the scroll position is
 * pinned with `position: fixed` and restored on release.
 */
export function useScrollLock(locked: Ref<boolean>) {
  let offset = 0

  watch(locked, (isLocked) => {
    const { body } = document

    if (isLocked) {
      offset = window.scrollY
      body.style.position = 'fixed'
      body.style.top = `-${offset}px`
      body.style.left = '0'
      body.style.right = '0'
      body.style.overflow = 'hidden'
      return
    }

    body.style.position = ''
    body.style.top = ''
    body.style.left = ''
    body.style.right = ''
    body.style.overflow = ''
    window.scrollTo({ top: offset, behavior: 'instant' as ScrollBehavior })
  })
}
