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
    titleA: 'Architecture, engineering,',
    titleB: 'environmental and',
    titleEm: 'construction services.',
    explore: 'Explore our services',
    carousel: 'Featured projects',
    slides: 'Choose a project',
    play: 'Resume rotation',
    pause: 'Pause rotation',
    viewService: 'View this service',
    captionHide: 'Close image details',
    source: 'Source',
  },
  markets: {
    health: 'Health',
    civic: 'Civic',
    science: 'Science',
    industrial: 'Industrial',
    urban: 'Urban',
  },
  directory: {
    eyebrow: 'Service directory',
    title: 'Four disciplines, one delivery team',
    lead: 'Filter by discipline, then open a service for its specifications and the projects behind it.',
    retry: 'Try again',
    serviceAxis: 'Filter by discipline',
    empty: 'No service covers that combination yet.',
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
    motto: 'Let’s work together to make great things possible.',
    copy: 'Employee-owned since 1917. Architecture, engineering, environmental and construction services in more than 200 cities.',
    touch: 'Get in touch',
    careers: 'Careers',
    company: 'Company',
    contactUs: 'Contact us',
    allLocations: 'All locations',
    openings: 'Current openings',
    workingHere: 'Working at HDR',
    ourCulture: 'Our culture',
    sustainability: 'Sustainability',
    legal: '© {year} HDR, Inc.',
    note: 'Demonstration build',
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
    titleA: '建築、工程、',
    titleB: '環境與',
    titleEm: '施工服務。',
    explore: '瀏覽服務項目',
    carousel: '代表專案輪播',
    slides: '選擇專案',
    play: '繼續輪播',
    pause: '暫停輪播',
    viewService: '查看這項服務',
    captionHide: '收起照片說明',
    source: '資料來源',
  },
  markets: {
    health: '醫療',
    civic: '公共',
    science: '科研',
    industrial: '產業',
    urban: '城市',
  },
  directory: {
    eyebrow: '服務目錄',
    title: '四大領域，同一支交付團隊',
    lead: '依專業領域篩選，點開任一服務可查看規格與背後的實績。',
    retry: '重新載入',
    serviceAxis: '依專業領域篩選',
    empty: '目前沒有服務同時符合這個組合。',
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
    motto: '一起合作，讓了不起的事情發生。',
    copy: '自 1917 年起由員工持股。在全球超過 200 個城市提供建築、工程、環境與施工服務。',
    touch: '聯絡我們',
    careers: '人才招募',
    company: '關於公司',
    contactUs: '聯絡表單',
    allLocations: '全球據點',
    openings: '職缺列表',
    workingHere: '在 HDR 工作',
    ourCulture: '企業文化',
    sustainability: '永續發展',
    legal: '© {year} HDR, Inc.',
    note: '展示用建置',
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
