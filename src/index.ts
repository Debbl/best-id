import { parse as parseUuid, v7 as uuidv7 } from 'uuid'

const BASE62_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const BASE62_BASE = 62n
const UUID_BYTE_LENGTH = 16
const UUID_BIT_LENGTH = 128n
const UUID_MAX_VALUE = 1n << UUID_BIT_LENGTH
const SUFFIX_LENGTH = 22
const PREFIX_MAX_LENGTH = 63
const PREFIX_PATTERN = /^[a-z_]+$/

const BASE62_DIGITS = new Map<string, bigint>(
  Array.from(BASE62_ALPHABET, (character, index) => [character, BigInt(index)]),
)

declare const bestIdBrand: unique symbol

export type BestId<TPrefix extends string = ''> = string & {
  readonly [bestIdBrand]: TPrefix
}

export interface ParsedBestId<TPrefix extends string = string> {
  value: BestId<TPrefix>
  prefix: TPrefix | ''
  suffix: string
}

export function generateBestId<TPrefix extends string = ''>(
  prefix?: TPrefix,
): BestId<TPrefix> {
  const normalizedPrefix = normalizePrefix(prefix ?? '')
  const suffix = encodeBase62(parseUuid(uuidv7()))
  const value =
    normalizedPrefix === '' ? suffix : `${normalizedPrefix}_${suffix}`

  return value as BestId<TPrefix>
}

export function parseBestId(value: string): ParsedBestId<string>
export function parseBestId<TPrefix extends string>(
  value: string,
  expectedPrefix: TPrefix,
): ParsedBestId<TPrefix> & { prefix: TPrefix }
export function parseBestId<TPrefix extends string = string>(
  value: string,
  expectedPrefix?: TPrefix,
): ParsedBestId<TPrefix> {
  const { prefix, suffix } = splitBestId(value)

  validatePrefix(prefix)

  if (expectedPrefix !== undefined) {
    validatePrefix(expectedPrefix)

    if (prefix !== expectedPrefix) {
      throw new Error(
        `Best ID prefix "${prefix}" does not match "${expectedPrefix}".`,
      )
    }
  }

  const uuidBytes = decodeBase62(suffix)
  assertUuidV7(uuidBytes)

  return {
    value: value as BestId<TPrefix>,
    prefix: prefix as TPrefix | '',
    suffix,
  }
}

function splitBestId(value: string): { prefix: string; suffix: string } {
  if (value.length === 0) {
    throw new Error('Best ID value must not be empty.')
  }

  const separatorIndex = value.lastIndexOf('_')

  if (separatorIndex === -1) {
    return { prefix: '', suffix: value }
  }

  if (separatorIndex === 0) {
    throw new Error('Best ID value must not start with an underscore.')
  }

  return {
    prefix: value.slice(0, separatorIndex),
    suffix: value.slice(separatorIndex + 1),
  }
}

function normalizePrefix(prefix: string): string {
  validatePrefix(prefix)
  return prefix
}

function validatePrefix(prefix: string): void {
  if (prefix === '') {
    return
  }

  if (prefix.length > PREFIX_MAX_LENGTH) {
    throw new Error(
      `Best ID prefix must be ${PREFIX_MAX_LENGTH} characters or less.`,
    )
  }

  if (!PREFIX_PATTERN.test(prefix)) {
    throw new Error(
      'Best ID prefix can only contain lowercase letters and underscores.',
    )
  }

  if (prefix.startsWith('_') || prefix.endsWith('_')) {
    throw new Error('Best ID prefix must not start or end with an underscore.')
  }
}

// Fixed-width Base62 preserves the natural byte ordering of UUIDv7 values.
function encodeBase62(bytes: Uint8Array): string {
  let value = bytesToBigInt(bytes)

  if (value === 0n) {
    return '0'.repeat(SUFFIX_LENGTH)
  }

  let encoded = ''

  while (value > 0n) {
    const digitIndex = Number(value % BASE62_BASE)
    encoded = `${BASE62_ALPHABET[digitIndex]}${encoded}`
    value /= BASE62_BASE
  }

  return encoded.padStart(SUFFIX_LENGTH, '0')
}

function decodeBase62(suffix: string): Uint8Array {
  if (suffix.length !== SUFFIX_LENGTH) {
    throw new Error(
      `Best ID suffix must be exactly ${SUFFIX_LENGTH} Base62 characters.`,
    )
  }

  let value = 0n

  for (const character of suffix) {
    const digit = BASE62_DIGITS.get(character)

    if (digit === undefined) {
      throw new Error(
        `Best ID suffix contains an invalid Base62 character: "${character}".`,
      )
    }

    value = value * BASE62_BASE + digit

    if (value >= UUID_MAX_VALUE) {
      throw new Error('Best ID suffix exceeds the 128-bit UUID range.')
    }
  }

  return bigIntToBytes(value)
}

function assertUuidV7(bytes: Uint8Array): void {
  if (bytes.length !== UUID_BYTE_LENGTH) {
    throw new Error('Best ID suffix must decode to 16 UUID bytes.')
  }

  const version = bytes[6] & 0xf0
  const variant = bytes[8] & 0xc0

  if (version !== 0x70 || variant !== 0x80) {
    throw new Error('Best ID suffix does not encode a valid UUIDv7 value.')
  }
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  let value = 0n

  for (const byte of bytes) {
    value = (value << 8n) | BigInt(byte)
  }

  return value
}

function bigIntToBytes(value: bigint): Uint8Array {
  const bytes = new Uint8Array(UUID_BYTE_LENGTH)
  let remaining = value

  for (let index = UUID_BYTE_LENGTH - 1; index >= 0; index -= 1) {
    bytes[index] = Number(remaining & 0xffn)
    remaining >>= 8n
  }

  return bytes
}
