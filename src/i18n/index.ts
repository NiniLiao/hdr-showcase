import { createI18n } from 'vue-i18n'
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/types'

const STORAGE_KEY = 'hdr.locale'

const en = {
  skip: 'Skip to services',
  lang: { label: 'Language', switchTo: 'Switch to Traditional Chinese' },
  nav: {
    services: 'Services',
    projects: 'Projects',
    about: 'About',
    contact: 'Contact',
    open: 'Open menu',
    close: 'Close menu',
    since: 'est. 1917',
  },
  hero: {
    eyebrow: 'Employee-owned · 200+ locations',
    titleA: 'Architecture, engineering,',
    titleB: 'environmental and',
    titleEm: 'construction services',
    lead: 'We design the infrastructure a place runs on — crossings, water systems, hospitals and transmission — and stay with it from feasibility through the last inspection.',
    explore: 'Explore our services',
    projects: 'View projects',
  },
  directory: {
    eyebrow: 'Service directory',
    title: 'Four disciplines, one delivery team',
    lead: 'Filter by discipline, then open a service for specifications and the projects behind them.',
    retry: 'Try again',
    filterLabel: 'Filter services by discipline',
    open: 'Open {name}',
    cases: '{count} case studies',
    filters: {
      all: 'All',
      transportation: 'Transportation',
      water: 'Water',
      buildings: 'Buildings',
      energy: 'Energy',
    },
  },
  projects: {
    eyebrow: 'Selected projects',
    title: 'One flagship from each discipline',
  },
  detail: {
    close: 'Close',
    loading: 'Loading…',
    capabilities: 'Capabilities',
    cases: 'Case studies',
    talk: 'Talk to this team',
  },
  contact: {
    eyebrow: 'Contact portal',
    title: 'Start a project with us',
    lead: 'Tell us what you are trying to build. We route the enquiry to the office that has done it before and reply within two working days.',
    americas: 'Americas',
    apac: 'Asia Pacific',
    europe: 'Europe',
    name: 'Name',
    email: 'Email',
    organisation: 'Organisation',
    discipline: 'Discipline',
    general: 'General enquiry',
    message: 'What are you building?',
    submit: 'Send enquiry',
    sending: 'Sending…',
    received: 'Received',
    routed: 'Routed to {office}. Someone will reply by {date}.',
    another: 'Send another enquiry',
  },
  footer: {
    copy: 'Employee-owned since 1917. Architecture, engineering, environmental and construction services in more than 200 cities.',
    legal: '© {year} HDR, Inc. · Demonstration build',
  },
}

const zhTW: typeof en = {
  skip: '跳至服務內容',
  lang: { label: '語言', switchTo: '切換為英文' },
  nav: {
    services: '服務項目',
    projects: '代表案例',
    about: '關於我們',
    contact: '聯絡我們',
    open: '開啟選單',
    close: '關閉選單',
    since: '創立於 1917',
  },
  hero: {
    eyebrow: '員工持股 · 全球 200 個以上據點',
    titleA: '建築、工程、',
    titleB: '環境與',
    titleEm: '施工服務',
    lead: '我們設計一座城市賴以運轉的基礎建設——橋梁、水系統、醫院與輸電網——並從可行性評估陪伴到最後一次驗收。',
    explore: '瀏覽服務項目',
    projects: '查看代表案例',
  },
  directory: {
    eyebrow: '服務目錄',
    title: '四大領域，同一支交付團隊',
    lead: '先依領域篩選，再點開服務查看規格與背後的實績。',
    retry: '重新載入',
    filterLabel: '依領域篩選服務',
    open: '開啟{name}',
    cases: '{count} 件實績',
    filters: {
      all: '全部',
      transportation: '交通',
      water: '水資源',
      buildings: '建築',
      energy: '能源',
    },
  },
  projects: {
    eyebrow: '代表案例',
    title: '每個領域各挑一件旗艦專案',
  },
  detail: {
    close: '關閉',
    loading: '載入中…',
    capabilities: '服務能力',
    cases: '實績案例',
    talk: '聯絡這支團隊',
  },
  contact: {
    eyebrow: '聯絡窗口',
    title: '開始你的專案',
    lead: '告訴我們你想蓋什麼。我們會把需求轉給做過同類型案子的辦公室，並在兩個工作天內回覆。',
    americas: '美洲',
    apac: '亞太',
    europe: '歐洲',
    name: '姓名',
    email: '電子郵件',
    organisation: '單位',
    discipline: '領域',
    general: '一般諮詢',
    message: '你想建造什麼？',
    submit: '送出需求',
    sending: '傳送中…',
    received: '已收到',
    routed: '已轉給{office}，我們會在 {date} 前回覆。',
    another: '再送一則需求',
  },
  footer: {
    copy: '自 1917 年起由員工持股。在全球超過 200 個城市提供建築、工程、環境與施工服務。',
    legal: '© {year} HDR, Inc. · 展示用建置',
  },
}

function detectLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (isLocale(stored)) return stored

  return window.navigator.language.toLowerCase().startsWith('zh') ? 'zh-TW' : DEFAULT_LOCALE
}

export const messages = { en, 'zh-TW': zhTW }

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages,
})

export function currentLocale(): Locale {
  return i18n.global.locale.value as Locale
}

export function applyLocale(locale: Locale) {
  i18n.global.locale.value = locale
  if (typeof document !== 'undefined') document.documentElement.lang = locale
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, locale)
}
