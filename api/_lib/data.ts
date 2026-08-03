import type { Service, Stat } from './types'

export const stats: Stat[] = [
  { label: 'Bridges delivered', value: '1,400+', note: 'Since 1917' },
  { label: 'Repeat clients', value: '98%', note: 'Rolling five years' },
  { label: 'Annual revenue', value: '$4.2B', note: 'FY 2025' },
  { label: 'Employee owners', value: '11,000', note: '200+ locations' },
]

export const services: Service[] = [
  {
    slug: 'transportation',
    code: 'TRB',
    name: 'Transportation and bridge engineering',
    tagline: 'Long-span crossings, transit corridors, seismic retrofit',
    description:
      'We take crossings from feasibility through construction engineering — cable-stayed and segmental long spans, light rail and bus rapid transit corridors, and retrofit programmes that keep ageing structures in service through the next design earthquake.',
    capabilities: [
      'Cable-stayed and segmental design',
      'Corridor and interchange planning',
      'Seismic vulnerability assessment',
      'Construction engineering and inspection',
    ],
    specs: [
      { label: 'Max span', value: '1.2 km' },
      { label: 'Seismic', value: 'Zone 4' },
      { label: 'Delivery', value: 'Design-build' },
    ],
    caseCount: 42,
    caseStudies: [
      {
        id: 'kosciuszko',
        name: 'Kosciuszko Bridge',
        location: 'New York, USA',
        method: 'Cable-stayed',
        completed: 2019,
        value: '$873M',
        summary:
          'Replacement of a 1939 truss with a pair of cable-stayed spans, phased to keep the corridor open throughout construction.',
      },
      {
        id: 'sr520',
        name: 'SR 520 corridor',
        location: 'Seattle, USA',
        method: 'Floating bridge',
        completed: 2016,
        value: '$4.5B',
        summary:
          'The longest floating bridge in the world, carrying a six-lane corridor across Lake Washington on 77 concrete pontoons.',
      },
      {
        id: 'wandoo',
        name: 'Wandoo river crossing',
        location: 'Perth, Australia',
        method: 'Segmental',
        completed: 2023,
        value: '$310M',
        summary:
          'Balanced-cantilever crossing built over a protected estuary with no in-water works permitted during migration season.',
      },
    ],
  },
  {
    slug: 'water',
    code: 'WER',
    name: 'Water and environmental resources',
    tagline: 'Treatment plants, watershed recovery, permitting',
    description:
      'Potable and reuse treatment, conveyance, and the environmental work that surrounds them — habitat restoration, floodplain modelling, and the permitting strategy that gets a scheme approved rather than merely designed.',
    capabilities: [
      'Advanced treatment and potable reuse',
      'Watershed and floodplain modelling',
      'Habitat and stream restoration',
      'NEPA and consent strategy',
    ],
    specs: [
      { label: 'Capacity', value: '380 MGD' },
      { label: 'Reuse', value: 'Direct potable' },
      { label: 'Permits', value: 'NEPA lead' },
    ],
    caseCount: 36,
    caseStudies: [
      {
        id: 'pure-water',
        name: 'Pure Water programme',
        location: 'San Diego, USA',
        method: 'Direct potable reuse',
        completed: 2025,
        value: '$1.8B',
        summary:
          'A reuse programme sized to supply nearly half the city’s water demand, with a demonstration facility used to build public confidence ahead of approval.',
      },
      {
        id: 'elwha',
        name: 'Elwha watershed recovery',
        location: 'Washington, USA',
        method: 'Dam removal',
        completed: 2014,
        value: '$325M',
        summary:
          'Sediment management and channel design following the largest dam removal ever attempted, restoring salmon access to 70 miles of habitat.',
      },
    ],
  },
  {
    slug: 'buildings',
    code: 'SBA',
    name: 'Sustainable building and architecture',
    tagline: 'Healthcare, laboratories, civic space, net-zero retrofit',
    description:
      'Buildings that carry demanding programmes — operating theatres, containment laboratories, courthouses — designed to run on a fraction of the energy their predecessors needed, and to keep running when the grid does not.',
    capabilities: [
      'Acute care and surgical planning',
      'BSL-3 and research laboratories',
      'Net-zero and deep energy retrofit',
      'Resilience and continuity planning',
    ],
    specs: [
      { label: 'EUI target', value: '28 kBtu' },
      { label: 'Certification', value: 'LEED Platinum' },
      { label: 'Containment', value: 'BSL-3' },
    ],
    caseCount: 51,
    caseStudies: [
      {
        id: 'mercy',
        name: 'Mercy regional medical centre',
        location: 'Missouri, USA',
        method: 'Acute care',
        completed: 2024,
        value: '$540M',
        summary:
          'A 420-bed replacement hospital with an operating envelope that keeps critical care running for 96 hours off-grid.',
      },
      {
        id: 'coastal-lab',
        name: 'Coastal research laboratory',
        location: 'Nova Scotia, Canada',
        method: 'BSL-3',
        completed: 2022,
        value: '$190M',
        summary:
          'A containment laboratory on an exposed shoreline, raised above the 2100 surge line and heated by seawater exchange.',
      },
    ],
  },
  {
    slug: 'energy',
    code: 'EPS',
    name: 'Energy and power solutions',
    tagline: 'Grid modernisation, wind, storage integration',
    description:
      'Transmission and generation work for utilities under pressure to connect new load faster than their networks were built for — routing, interconnection studies, and the storage that makes intermittent supply dispatchable.',
    capabilities: [
      'Transmission routing and siting',
      'Interconnection and system studies',
      'Onshore and offshore wind',
      'Utility-scale storage integration',
    ],
    specs: [
      { label: 'Voltage', value: '765 kV' },
      { label: 'Storage', value: '1.4 GWh' },
      { label: 'Studies', value: 'Interconnect' },
    ],
    caseCount: 29,
    caseStudies: [
      {
        id: 'plains-hvdc',
        name: 'Plains HVDC link',
        location: 'Kansas, USA',
        method: 'HVDC transmission',
        completed: 2026,
        value: '$2.1B',
        summary:
          'An 800 km direct-current link routed around 340 parcels of tribal and agricultural land, negotiated ahead of design freeze.',
      },
      {
        id: 'north-sea',
        name: 'North Sea array substation',
        location: 'Scotland, UK',
        method: 'Offshore wind',
        completed: 2023,
        value: '$680M',
        summary:
          'Offshore collector platform and export cable design for a 1.1 GW array, installed inside a single weather window.',
      },
    ],
  },
]

export function findService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug)
}
