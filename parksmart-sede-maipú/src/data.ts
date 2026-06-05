import { SlotType, ParkingSector } from './types'

export function getSlotMeta(i: number): { type: SlotType; sector: ParkingSector; floor: number } {
  let type: SlotType = 'standard'
  let sector: ParkingSector = 'Norte'

  if (i === 4) { type = 'ev'; sector = 'Techado' }
  else if (i === 12) { type = 'preferential'; sector = 'Techado' }
  else if (i === 45) { sector = 'Techado' }
  else if (i % 7 === 0) { type = 'ev' }
  else if (i % 9 === 0) { type = 'preferential'; sector = 'Techado' }
  else if (i > 80) { sector = 'Sur' }
  else if (i > 45) { sector = 'Techado' }

  return { type, sector, floor: i > 60 ? 2 : 1 }
}
