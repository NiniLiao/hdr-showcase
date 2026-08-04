/**
 * jsdom ships no <dialog> behaviour, no pointer capture and no scrolling, all of
 * which ServiceDetail relies on. These shims are deliberately minimal: they give
 * the component something real to toggle without pretending to be a browser.
 */

let matchesNarrow = false

/** Switches the viewport every `useMediaQuery('(max-width: …)')` call sees. */
export function setNarrowViewport(narrow: boolean) {
  matchesNarrow = narrow
}

function installDialog() {
  const proto = window.HTMLDialogElement?.prototype
  if (!proto || typeof proto.showModal === 'function') return

  proto.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
    this.dispatchEvent(new Event('open'))
  }

  proto.show = function show(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }

  proto.close = function close(this: HTMLDialogElement, returnValue?: string) {
    if (!this.hasAttribute('open')) return
    this.removeAttribute('open')
    if (returnValue !== undefined) this.returnValue = returnValue
    this.dispatchEvent(new Event('close'))
  }
}

function installScrollIntoView() {
  Element.prototype.scrollIntoView ??= () => undefined
}

function installPointerCapture() {
  Element.prototype.setPointerCapture ??= () => undefined
  Element.prototype.releasePointerCapture ??= () => undefined
  Element.prototype.hasPointerCapture ??= () => false
}

function installMatchMedia() {
  window.matchMedia = (query: string) =>
    ({
      media: query,
      matches: query.includes('max-width') ? matchesNarrow : false,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList
}

installDialog()
installScrollIntoView()
installPointerCapture()
installMatchMedia()

window.scrollTo = () => undefined
