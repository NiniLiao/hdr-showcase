import type { Localized, SourceService, SourceStat } from './types.js'

const l = (en: string, zh: string): Localized => ({ en, 'zh-TW': zh })
const lx = (en: string[], zh: string[]): Localized<string[]> => ({ en, 'zh-TW': zh })

export const stats: SourceStat[] = [
  { label: l('Bridges delivered', '完成橋梁'), value: '1,400+', note: l('Since 1917', '自 1917 年起') },
  { label: l('Repeat clients', '回流客戶'), value: '98%', note: l('Rolling five years', '近五年滾動統計') },
  { label: l('Annual revenue', '年度營收'), value: '$4.2B', note: l('FY 2025', '2025 會計年度') },
  { label: l('Employee owners', '員工股東'), value: '11,000', note: l('200+ locations', '200 個以上據點') },
]

export const services: SourceService[] = [
  {
    slug: 'transportation',
    code: 'TRB',
    name: l('Transportation and bridge engineering', '交通與橋梁工程'),
    tagline: l(
      'Long-span crossings, transit corridors, seismic retrofit',
      '長跨距橋梁、軌道廊道、耐震補強',
    ),
    description: l(
      'We take crossings from feasibility through construction engineering — cable-stayed and segmental long spans, light rail and bus rapid transit corridors, and retrofit programmes that keep ageing structures in service through the next design earthquake.',
      '我們從可行性評估一路做到施工工程：斜張橋與節塊推進的長跨距橋梁、輕軌與 BRT 廊道，以及讓老舊結構撐過下一次設計地震的補強計畫。',
    ),
    capabilities: lx(
      [
        'Cable-stayed and segmental design',
        'Corridor and interchange planning',
        'Seismic vulnerability assessment',
        'Construction engineering and inspection',
      ],
      ['斜張橋與節塊工法設計', '廊道與交流道規劃', '耐震風險評估', '施工工程與監造'],
    ),
    specs: [
      { label: l('Max span', '最大跨距'), value: l('1.2 km', '1.2 公里') },
      { label: l('Seismic', '耐震分區'), value: l('Zone 4', '第 4 區') },
      { label: l('Delivery', '交付模式'), value: l('Design-build', '統包') },
    ],
    caseCount: 42,
    caseStudies: [
      {
        id: 'kosciuszko',
        name: l('Kosciuszko Bridge', 'Kosciuszko 大橋'),
        location: l('New York, USA', '美國紐約'),
        method: l('Cable-stayed', '斜張橋'),
        completed: 2019,
        value: '$873M',
        summary: l(
          'Replacement of a 1939 truss with a pair of cable-stayed spans, phased to keep the corridor open throughout construction.',
          '以雙座斜張橋取代 1939 年的桁架舊橋，分期施工讓廊道全程維持通車。',
        ),
      },
      {
        id: 'sr520',
        name: l('SR 520 corridor', 'SR 520 廊道'),
        location: l('Seattle, USA', '美國西雅圖'),
        method: l('Floating bridge', '浮橋'),
        completed: 2016,
        value: '$4.5B',
        summary: l(
          'The longest floating bridge in the world, carrying a six-lane corridor across Lake Washington on 77 concrete pontoons.',
          '世界最長的浮橋，以 77 座混凝土浮箱承載六車道廊道橫越華盛頓湖。',
        ),
      },
      {
        id: 'wandoo',
        name: l('Wandoo river crossing', 'Wandoo 河橋'),
        location: l('Perth, Australia', '澳洲伯斯'),
        method: l('Segmental', '節塊工法'),
        completed: 2023,
        value: '$310M',
        summary: l(
          'Balanced-cantilever crossing built over a protected estuary with no in-water works permitted during migration season.',
          '跨越受保護河口的平衡懸臂橋，洄游季節期間全面禁止水域施工。',
        ),
      },
    ],
  },
  {
    slug: 'water',
    code: 'WER',
    name: l('Water and environmental resources', '水資源與環境'),
    tagline: l('Treatment plants, watershed recovery, permitting', '淨水廠、流域復育、環評許可'),
    description: l(
      'Potable and reuse treatment, conveyance, and the environmental work that surrounds them — habitat restoration, floodplain modelling, and the permitting strategy that gets a scheme approved rather than merely designed.',
      '飲用水與再生水處理、輸送管網，以及環繞其上的環境工作：棲地復育、洪泛模擬，還有讓計畫真的被核准而不只是被設計出來的許可策略。',
    ),
    capabilities: lx(
      [
        'Advanced treatment and potable reuse',
        'Watershed and floodplain modelling',
        'Habitat and stream restoration',
        'NEPA and consent strategy',
      ],
      ['高級處理與直接再生飲用水', '流域與洪泛平原模擬', '棲地與河川復育', 'NEPA 與環評許可策略'],
    ),
    specs: [
      { label: l('Capacity', '處理量'), value: l('380 MGD', '每日 380 萬加侖') },
      { label: l('Reuse', '再生等級'), value: l('Direct potable', '直接飲用') },
      { label: l('Permits', '許可角色'), value: l('NEPA lead', 'NEPA 主辦') },
    ],
    caseCount: 36,
    caseStudies: [
      {
        id: 'pure-water',
        name: l('Pure Water programme', 'Pure Water 計畫'),
        location: l('San Diego, USA', '美國聖地牙哥'),
        method: l('Direct potable reuse', '直接再生飲用水'),
        completed: 2025,
        value: '$1.8B',
        summary: l(
          'A reuse programme sized to supply nearly half the city’s water demand, with a demonstration facility used to build public confidence ahead of approval.',
          '規模足以供應全市近半用水的再生水計畫，核准前先以示範廠建立民眾信心。',
        ),
      },
      {
        id: 'elwha',
        name: l('Elwha watershed recovery', 'Elwha 流域復育'),
        location: l('Washington, USA', '美國華盛頓州'),
        method: l('Dam removal', '拆壩'),
        completed: 2014,
        value: '$325M',
        summary: l(
          'Sediment management and channel design following the largest dam removal ever attempted, restoring salmon access to 70 miles of habitat.',
          '史上最大規模拆壩後的泥沙管理與河道設計，讓鮭魚重新取得 70 英里棲地。',
        ),
      },
    ],
  },
  {
    slug: 'buildings',
    code: 'SBA',
    name: l('Sustainable building and architecture', '永續建築與設計'),
    tagline: l(
      'Healthcare, laboratories, civic space, net-zero retrofit',
      '醫療、實驗室、公共空間、淨零改造',
    ),
    description: l(
      'Buildings that carry demanding programmes — operating theatres, containment laboratories, courthouses — designed to run on a fraction of the energy their predecessors needed, and to keep running when the grid does not.',
      '承載高難度機能的建築：手術室、負壓實驗室、法院。用遠低於前一代的能耗運轉，並在電網停擺時仍能繼續運作。',
    ),
    capabilities: lx(
      [
        'Acute care and surgical planning',
        'BSL-3 and research laboratories',
        'Net-zero and deep energy retrofit',
        'Resilience and continuity planning',
      ],
      ['急重症與手術空間規劃', 'BSL-3 與研究型實驗室', '淨零與深度節能改造', '韌性與營運持續規劃'],
    ),
    specs: [
      { label: l('EUI target', '能耗目標'), value: l('28 kBtu', '28 kBtu') },
      { label: l('Certification', '認證'), value: l('LEED Platinum', 'LEED 白金級') },
      { label: l('Containment', '生物安全'), value: l('BSL-3', 'BSL-3') },
    ],
    caseCount: 51,
    caseStudies: [
      {
        id: 'mercy',
        name: l('Mercy regional medical centre', 'Mercy 區域醫學中心'),
        location: l('Missouri, USA', '美國密蘇里州'),
        method: l('Acute care', '急重症醫療'),
        completed: 2024,
        value: '$540M',
        summary: l(
          'A 420-bed replacement hospital with an operating envelope that keeps critical care running for 96 hours off-grid.',
          '420 床的重建醫院，外殼系統可在完全斷電下維持重症照護 96 小時。',
        ),
      },
      {
        id: 'coastal-lab',
        name: l('Coastal research laboratory', '海岸研究實驗室'),
        location: l('Nova Scotia, Canada', '加拿大新斯科細亞省'),
        method: l('BSL-3', 'BSL-3'),
        completed: 2022,
        value: '$190M',
        summary: l(
          'A containment laboratory on an exposed shoreline, raised above the 2100 surge line and heated by seawater exchange.',
          '座落於暴露海岸線的負壓實驗室，抬高於 2100 年暴潮線之上，並以海水交換供熱。',
        ),
      },
    ],
  },
  {
    slug: 'energy',
    code: 'EPS',
    name: l('Energy and power solutions', '能源與電力'),
    tagline: l('Grid modernisation, wind, storage integration', '電網現代化、風電、儲能整合'),
    description: l(
      'Transmission and generation work for utilities under pressure to connect new load faster than their networks were built for — routing, interconnection studies, and the storage that makes intermittent supply dispatchable.',
      '為承受併網壓力的電力公司做輸電與發電工程：路線選線、併聯研究，以及讓間歇性電源變得可調度的儲能設施。',
    ),
    capabilities: lx(
      [
        'Transmission routing and siting',
        'Interconnection and system studies',
        'Onshore and offshore wind',
        'Utility-scale storage integration',
      ],
      ['輸電選線與選址', '併聯與系統研究', '陸域與離岸風電', '公用事業級儲能整合'],
    ),
    specs: [
      { label: l('Voltage', '電壓等級'), value: l('765 kV', '765 kV') },
      { label: l('Storage', '儲能容量'), value: l('1.4 GWh', '1.4 GWh') },
      { label: l('Studies', '研究範疇'), value: l('Interconnect', '併聯研究') },
    ],
    caseCount: 29,
    caseStudies: [
      {
        id: 'plains-hvdc',
        name: l('Plains HVDC link', 'Plains 高壓直流輸電'),
        location: l('Kansas, USA', '美國堪薩斯州'),
        method: l('HVDC transmission', '高壓直流輸電'),
        completed: 2026,
        value: '$2.1B',
        summary: l(
          'An 800 km direct-current link routed around 340 parcels of tribal and agricultural land, negotiated ahead of design freeze.',
          '長 800 公里的直流輸電線，繞行 340 筆原住民與農業用地，並在設計凍結前完成協商。',
        ),
      },
      {
        id: 'north-sea',
        name: l('North Sea array substation', '北海風場變電站'),
        location: l('Scotland, UK', '英國蘇格蘭'),
        method: l('Offshore wind', '離岸風電'),
        completed: 2023,
        value: '$680M',
        summary: l(
          'Offshore collector platform and export cable design for a 1.1 GW array, installed inside a single weather window.',
          '1.1 GW 風場的海上集電平台與輸出海纜設計，在單一天氣窗口內完成安裝。',
        ),
      },
    ],
  },
]

export function findService(slug: string): SourceService | undefined {
  return services.find((service) => service.slug === slug)
}
