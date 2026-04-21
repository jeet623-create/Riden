// Thailand country outline — derived from world.geo.json (public domain, 64 points),
// projected equirectangular into a 400x720 SVG viewBox.
// Lon range 97.38°E–105.59°E, lat range 5.69°N–20.42°N.

export const THAILAND_VIEWBOX = { width: 400, height: 720 }

export const THAILAND_PATH_D =
  'M253.7 402.4 L210.0 380.0 L168.3 380.9 L175.5 342.5 L132.6 342.8 L128.7 396.6 ' +
  'L102.4 468.0 L86.6 511.2 L89.9 546.5 L121.7 548.1 L141.4 592.7 L150.2 635.0 ' +
  'L177.3 663.0 L206.8 668.7 L232.1 694.1 L216.2 714.2 L184.0 720.0 L180.2 694.9 ' +
  'L140.4 673.5 L132.0 682.2 L112.7 663.4 L104.4 639.2 L78.5 611.6 L54.9 588.4 ' +
  'L46.9 617.2 L37.7 590.0 L43.0 559.5 L57.4 512.6 L81.0 462.4 L107.7 416.8 ' +
  'L88.7 372.2 L89.4 349.5 L83.9 322.2 L51.4 283.4 L39.7 258.8 L56.6 249.8 ' +
  'L74.4 207.3 L54.4 175.0 L23.5 139.3 L-0.0 96.4 L20.5 87.6 L42.8 34.7 ' +
  'L77.1 32.5 L105.6 11.3 L133.4 0.0 L154.5 15.1 L157.3 44.5 L190.2 46.7 ' +
  'L178.3 98.2 L179.4 142.0 L230.7 112.9 L245.3 121.5 L273.8 120.1 L283.7 103.1 ' +
  'L320.5 106.4 L357.5 146.1 L360.6 194.4 L400.0 237.0 L397.8 278.4 L382.0 300.4 ' +
  'L336.3 293.4 L273.3 302.7 L242.2 343.4 L253.7 402.4 Z'

export type CityTier = 1 | 2 | 3 | 4 | 5

export interface City {
  name: string
  tier: CityTier
  x: number
  y: number
}

// 28 city lights, 5 intensity tiers
export const CITY_LIGHTS: readonly City[] = [
  { name: 'Bangkok',       tier: 1, x: 152.2, y: 325.7 },
  { name: 'Chiang Mai',    tier: 2, x: 78.4,  y: 79.7  },
  { name: 'Phuket',        tier: 2, x: 49.5,  y: 613.0 },
  { name: 'Pattaya',       tier: 2, x: 170.8, y: 366.4 },
  { name: 'Hua Hin',       tier: 2, x: 125.7, y: 383.8 },
  { name: 'Hat Yai',       tier: 2, x: 150.6, y: 655.6 },
  { name: 'Chiang Rai',    tier: 3, x: 119.6, y: 25.0  },
  { name: 'Krabi',         tier: 3, x: 74.5,  y: 602.9 },
  { name: 'Koh Samui',     tier: 3, x: 128.5, y: 533.2 },
  { name: 'Nakhon Ratch.', tier: 3, x: 230.0, y: 265.9 },
  { name: 'Khon Kaen',     tier: 3, x: 265.9, y: 194.4 },
  { name: 'Udon Thani',    tier: 3, x: 264.1, y: 146.9 },
  { name: 'Ayutthaya',     tier: 3, x: 156.4, y: 295.7 },
  { name: 'Surat Thani',   tier: 4, x: 94.9,  y: 551.4 },
  { name: 'Ubon Rat.',     tier: 4, x: 364.2, y: 252.9 },
  { name: 'Sukhothai',     tier: 4, x: 119.4, y: 166.8 },
  { name: 'Nakh. Si Th.',  tier: 4, x: 126.0, y: 586.1 },
  { name: 'Songkhla',      tier: 4, x: 156.8, y: 646.8 },
  { name: 'Kanchanaburi',  tier: 4, x: 105.0, y: 312.7 },
  { name: 'Mae Sot',       tier: 4, x: 58.2,  y: 181.1 },
  { name: 'Rayong',        tier: 5, x: 190.2, y: 378.2 },
  { name: 'Trat',          tier: 5, x: 250.2, y: 399.7 },
  { name: 'Loei',          tier: 5, x: 211.7, y: 143.3 },
  { name: 'Nan',           tier: 5, x: 165.4, y: 79.7  },
  { name: 'Phitsanulok',   tier: 5, x: 140.7, y: 175.9 },
  { name: 'Nong Khai',     tier: 5, x: 261.4, y: 124.2 },
  { name: 'Ranong',        tier: 5, x: 60.0,  y: 511.7 },
  { name: 'Trang',         tier: 5, x: 108.9, y: 628.4 },
]

// 7 teal "active" city markers (pulsing) per spec
export const ACTIVE_CITIES: readonly City[] = [
  { name: 'Bangkok',    tier: 1, x: 152.2, y: 325.7 },
  { name: 'Chiang Mai', tier: 2, x: 78.4,  y: 79.7  },
  { name: 'Chiang Rai', tier: 3, x: 119.6, y: 25.0  },
  { name: 'Pattaya',    tier: 2, x: 170.8, y: 366.4 },
  { name: 'Hua Hin',    tier: 2, x: 125.7, y: 383.8 },
  { name: 'Phuket',     tier: 2, x: 49.5,  y: 613.0 },
  { name: 'Krabi',      tier: 3, x: 74.5,  y: 602.9 },
]

// 5 dashed connection lines from Bangkok
export const CONNECTIONS: readonly [string, string][] = [
  ['Bangkok', 'Chiang Mai'],
  ['Bangkok', 'Chiang Rai'],
  ['Bangkok', 'Pattaya'],
  ['Bangkok', 'Phuket'],
  ['Bangkok', 'Krabi'],
]
