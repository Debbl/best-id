import { createBestId, getBestIdVersion } from '~/lib/best-id'
import type { BestId, BestIdFactory, BestIdVersion } from '~/lib/best-id'

export const DEFAULT_PREFIX = 'user'
export const DEFAULT_COUNT = 4
export const MAX_COUNT = 12
export const DEFAULT_VERSION: BestIdVersion = 'v7'

export interface VersionOption {
  value: BestIdVersion
  label: string
  generateHint: string
  acceptHint: string
}

export const VERSION_OPTIONS: readonly VersionOption[] = [
  {
    value: 'v7',
    label: 'v7',
    generateHint: 'Time-sortable UUIDv7',
    acceptHint: 'Only UUIDv7 payloads',
  },
  {
    value: 'v4',
    label: 'v4',
    generateHint: 'Random UUIDv4, not sortable',
    acceptHint: 'Only UUIDv4 payloads',
  },
  {
    value: 'any',
    label: 'any',
    generateHint: 'Generates UUIDv7',
    acceptHint: 'Any RFC 9562 version (1-8)',
  },
]

// One instance per mode, created once so the studio never rebuilds them while
// the user toggles between modes.
const INSTANCES: Record<BestIdVersion, BestIdFactory> = {
  v7: createBestId({ version: 'v7' }),
  v4: createBestId({ version: 'v4' }),
  any: createBestId({ version: 'any' }),
}

export function getBestIdInstance(version: BestIdVersion): BestIdFactory {
  return INSTANCES[version]
}

export function getVersionOption(version: BestIdVersion): VersionOption {
  return (
    VERSION_OPTIONS.find((option) => option.value === version) ??
    VERSION_OPTIONS[0]
  )
}

export interface GeneratedItem {
  id: BestId<string>
  prefix: string
  suffix: string
  uuid: string
  uuidVersion: number
}

export function clampCount(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_COUNT
  }

  return Math.min(MAX_COUNT, Math.max(1, Math.trunc(value)))
}

function createGeneratedItem(
  id: BestId<string>,
  instance: BestIdFactory,
): GeneratedItem {
  const parsed = instance.parse(id)

  return {
    id,
    prefix: parsed.prefix,
    suffix: parsed.suffix,
    uuid: instance.toUuid(parsed.value),
    uuidVersion: getBestIdVersion(id),
  }
}

export function createBatch(
  prefix: string,
  count: number,
  version: BestIdVersion = DEFAULT_VERSION,
): GeneratedItem[] {
  const normalizedPrefix = prefix.trim()
  const instance = getBestIdInstance(version)

  return Array.from({ length: clampCount(count) }, () => {
    const nextId =
      normalizedPrefix === ''
        ? instance.generate()
        : instance.generate(normalizedPrefix)

    return createGeneratedItem(nextId, instance)
  })
}

export function createInitialParseText(
  items: readonly GeneratedItem[],
): string {
  return items.map((item) => item.id).join('\n')
}
