import { bestIdToUuid, generateBestId, parseBestId } from '~/lib/best-id'
import type { BestId } from '~/lib/best-id'

export const DEFAULT_PREFIX = 'user'
export const DEFAULT_COUNT = 4
export const MAX_COUNT = 12

export interface GeneratedItem {
  id: BestId<string>
  prefix: string
  suffix: string
  uuid: string
}

export function clampCount(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_COUNT
  }

  return Math.min(MAX_COUNT, Math.max(1, Math.trunc(value)))
}

function createGeneratedItem(id: BestId<string>): GeneratedItem {
  const parsed = parseBestId(id)

  return {
    id,
    prefix: parsed.prefix,
    suffix: parsed.suffix,
    uuid: bestIdToUuid(parsed.value),
  }
}

export function createBatch(prefix: string, count: number): GeneratedItem[] {
  const normalizedPrefix = prefix.trim()

  return Array.from({ length: clampCount(count) }, () => {
    const nextId =
      normalizedPrefix === ''
        ? generateBestId()
        : generateBestId(normalizedPrefix)

    return createGeneratedItem(nextId)
  })
}

export function createInitialParseText(
  items: readonly GeneratedItem[],
): string {
  return items.map((item) => item.id).join('\n')
}
