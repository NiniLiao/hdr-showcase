import { onScopeDispose, ref, type Ref } from 'vue'

export function useMediaQuery(query: string): Ref<boolean> {
  const matches = ref(false)

  if (typeof window !== 'undefined' && 'matchMedia' in window) {
    const list = window.matchMedia(query)
    matches.value = list.matches

    const onChange = (event: MediaQueryListEvent) => (matches.value = event.matches)
    list.addEventListener('change', onChange)
    onScopeDispose(() => list.removeEventListener('change', onChange))
  }

  return matches
}
