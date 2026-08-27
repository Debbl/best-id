import {
  parse as parseUuid,
  stringify as stringifyUuid,
  v4 as uuidv4,
  v7 as uuidv7,
} from 'uuid'

const BASE62_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const BASE62_BASE = 62n
const UUID_BYTE_LENGTH = 16
const UUID_BIT_LENGTH = 128n
const UUID_MAX_VALUE = 1n << UUID_BIT_LENGTH
const UUID_VARIANT_MASK = 0xc0
const UUID_VARIANT_RFC = 0x80
const UUID_MIN_VERSION = 1
const UUID_MAX_VERSION = 8
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

export interface BestIdParts<TPrefix extends string = string> {
  prefix: TPrefix | ''
  suffix: string
}

export interface ParsedBestId<
  TPrefix extends string = string,
> extends BestIdParts<TPrefix> {
  value: BestId<TPrefix>
}

/**
 * Which UUID payload a Best ID instance generates and accepts.
 *
 * - `v7` (default): time-sortable UUIDv7 only.
 * - `v4`: random UUIDv4 only, not time-sortable.
 * - `any`: accepts any RFC 9562 UUID version (1-8), generates UUIDv7.
 */
export type BestIdVersion = 'v7' | 'v4' | 'any'

export interface BestIdOptions {
  version?: BestIdVersion
}

export interface BestIdFactory {
  readonly version: BestIdVersion

  generate: <TPrefix extends string = ''>(prefix?: TPrefix) => BestId<TPrefix>

  parse: {
    (value: string): ParsedBestId<string>
    <TPrefix extends string>(
      value: string,
      expectedPrefix: TPrefix,
    ): ParsedBestId<TPrefix> & { prefix: TPrefix }
  }

  fromString: {
    (value: string): BestId<string>
    <TPrefix extends string>(
      value: string,
      expectedPrefix: TPrefix,
    ): BestId<TPrefix>
  }

  fromSuffix: <TPrefix extends string = ''>(
    suffix: string,
    prefix?: TPrefix,
  ) => BestId<TPrefix>

  split: {
    <TPrefix extends string>(value: BestId<TPrefix>): BestIdParts<TPrefix>
    (value: string): BestIdParts<string>
    <TPrefix extends string>(
      value: string,
      expectedPrefix: TPrefix,
    ): BestIdParts<TPrefix> & { prefix: TPrefix }
  }

  getPrefix: <TPrefix extends string>(value: BestId<TPrefix>) => TPrefix

  getSuffix: <TPrefix extends string>(value: BestId<TPrefix>) => string

  toUuidBytes: <TPrefix extends string>(value: BestId<TPrefix>) => Uint8Array

  toUuid: <TPrefix extends string>(value: BestId<TPrefix>) => string

  fromUuidBytes: <TPrefix extends string = ''>(
    bytes: Uint8Array,
    prefix?: TPrefix,
  ) => BestId<TPrefix>

  fromUuid: <TPrefix extends string = ''>(
    uuid: string,
    prefix?: TPrefix,
  ) => BestId<TPrefix>
}

// The default exports are thin `v7` wrappers over the shared implementations.
// They stay separate top-level functions so bundlers can drop the ones an
// application never imports, and so `uuidv4` is only reachable through
// `createBestId`.

export function generateBestId<TPrefix extends string = ''>(
  prefix?: TPrefix,
): BestId<TPrefix> {
  return generateWith(prefix, uuidv7())
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
  return parseWith(value, expectedPrefix, 'v7')
}

export function bestIdFromString(value: string): BestId<string>
export function bestIdFromString<TPrefix extends string>(
  value: string,
  expectedPrefix: TPrefix,
): BestId<TPrefix>
export function bestIdFromString<TPrefix extends string = string>(
  value: string,
  expectedPrefix?: TPrefix,
): BestId<TPrefix> {
  return parseWith(value, expectedPrefix, 'v7').value
}

export function bestIdFromSuffix<TPrefix extends string = ''>(
  suffix: string,
  prefix?: TPrefix,
): BestId<TPrefix> {
  return fromSuffixWith(suffix, prefix, 'v7')
}

export function splitBestId<TPrefix extends string>(
  value: BestId<TPrefix>,
): BestIdParts<TPrefix>
export function splitBestId(value: string): BestIdParts<string>
export function splitBestId<TPrefix extends string>(
  value: string,
  expectedPrefix: TPrefix,
): BestIdParts<TPrefix> & { prefix: TPrefix }
export function splitBestId<TPrefix extends string = string>(
  value: string,
  expectedPrefix?: TPrefix,
): BestIdParts<TPrefix> {
  return splitWith(value, expectedPrefix, 'v7')
}

export function getBestIdPrefix<TPrefix extends string>(
  value: BestId<TPrefix>,
): TPrefix {
  return splitWith(value, undefined, 'v7').prefix as TPrefix
}

export function getBestIdSuffix<TPrefix extends string>(
  value: BestId<TPrefix>,
): string {
  return splitWith(value, undefined, 'v7').suffix
}

export function bestIdToUuidBytes<TPrefix extends string>(
  value: BestId<TPrefix>,
): Uint8Array {
  return toUuidBytesWith(value, 'v7')
}

export function bestIdToUuid<TPrefix extends string>(
  value: BestId<TPrefix>,
): string {
  return stringifyUuid(toUuidBytesWith(value, 'v7'))
}

export function bestIdFromUuidBytes<TPrefix extends string = ''>(
  bytes: Uint8Array,
  prefix?: TPrefix,
): BestId<TPrefix> {
  return fromUuidBytesWith(bytes, prefix, 'v7')
}

export function bestIdFromUuid<TPrefix extends string = ''>(
  uuid: string,
  prefix?: TPrefix,
): BestId<TPrefix> {
  return fromUuidBytesWith(parseUuid(uuid), prefix, 'v7')
}

/**
 * Creates a Best ID instance bound to a single UUID version policy. The string
 * format is identical across versions, so only generation and validation
 * differ. Importing this pulls in every operation; import the top-level `v7`
 * functions instead when a bundle should only carry the ones it uses.
 */
export function createBestId(options?: BestIdOptions): BestIdFactory {
  const version = options?.version ?? 'v7'

  function generate<TPrefix extends string = ''>(
    prefix?: TPrefix,
  ): BestId<TPrefix> {
    return generateWith(prefix, version === 'v4' ? uuidv4() : uuidv7())
  }

  function parse(value: string): ParsedBestId<string>
  function parse<TPrefix extends string>(
    value: string,
    expectedPrefix: TPrefix,
  ): ParsedBestId<TPrefix> & { prefix: TPrefix }
  function parse<TPrefix extends string = string>(
    value: string,
    expectedPrefix?: TPrefix,
  ): ParsedBestId<TPrefix> {
    return parseWith(value, expectedPrefix, version)
  }

  function fromString(value: string): BestId<string>
  function fromString<TPrefix extends string>(
    value: string,
    expectedPrefix: TPrefix,
  ): BestId<TPrefix>
  function fromString<TPrefix extends string = string>(
    value: string,
    expectedPrefix?: TPrefix,
  ): BestId<TPrefix> {
    return parseWith(value, expectedPrefix, version).value
  }

  function fromSuffix<TPrefix extends string = ''>(
    suffix: string,
    prefix?: TPrefix,
  ): BestId<TPrefix> {
    return fromSuffixWith(suffix, prefix, version)
  }

  function split<TPrefix extends string>(
    value: BestId<TPrefix>,
  ): BestIdParts<TPrefix>
  function split(value: string): BestIdParts<string>
  function split<TPrefix extends string>(
    value: string,
    expectedPrefix: TPrefix,
  ): BestIdParts<TPrefix> & { prefix: TPrefix }
  function split<TPrefix extends string = string>(
    value: string,
    expectedPrefix?: TPrefix,
  ): BestIdParts<TPrefix> {
    return splitWith(value, expectedPrefix, version)
  }

  function getPrefix<TPrefix extends string>(value: BestId<TPrefix>): TPrefix {
    return splitWith(value, undefined, version).prefix as TPrefix
  }

  function getSuffix<TPrefix extends string>(value: BestId<TPrefix>): string {
    return splitWith(value, undefined, version).suffix
  }

  function toUuidBytes<TPrefix extends string>(
    value: BestId<TPrefix>,
  ): Uint8Array {
    return toUuidBytesWith(value, version)
  }

  function toUuid<TPrefix extends string>(value: BestId<TPrefix>): string {
    return stringifyUuid(toUuidBytesWith(value, version))
  }

  function fromUuidBytes<TPrefix extends string = ''>(
    bytes: Uint8Array,
    prefix?: TPrefix,
  ): BestId<TPrefix> {
    return fromUuidBytesWith(bytes, prefix, version)
  }

  function fromUuid<TPrefix extends string = ''>(
    uuid: string,
    prefix?: TPrefix,
  ): BestId<TPrefix> {
    return fromUuidBytesWith(parseUuid(uuid), prefix, version)
  }

  return {
    version,
    generate,
    parse,
    fromString,
    fromSuffix,
    split,
    getPrefix,
    getSuffix,
    toUuidBytes,
    toUuid,
    fromUuidBytes,
    fromUuid,
  }
}

/**
 * Reads the UUID version encoded in a Best ID suffix, regardless of which
 * version policy created it. Useful for dispatching on mixed inputs.
 */
export function getBestIdVersion(value: string): number {
  const { suffix } = splitBestIdString(value)

  return decodeBase62(suffix)[6] >> 4
}

function generateWith<TPrefix extends string = ''>(
  prefix: TPrefix | undefined,
  uuid: string,
): BestId<TPrefix> {
  const normalizedPrefix = normalizePrefix(prefix ?? '')
  const suffix = encodeBase62(parseUuid(uuid))

  return formatBestId(normalizedPrefix, suffix) as BestId<TPrefix>
}

function parseWith<TPrefix extends string = string>(
  value: string,
  expectedPrefix: TPrefix | undefined,
  version: BestIdVersion,
): ParsedBestId<TPrefix> {
  const { prefix, suffix } = splitBestIdString(value)

  validatePrefix(prefix)

  if (expectedPrefix !== undefined) {
    validatePrefix(expectedPrefix)

    if (prefix !== expectedPrefix) {
      throw new Error(
        `Best ID prefix "${prefix}" does not match "${expectedPrefix}".`,
      )
    }
  }

  validateSuffix(suffix, version)

  return {
    value: value as BestId<TPrefix>,
    prefix: prefix as TPrefix | '',
    suffix,
  }
}

function fromSuffixWith<TPrefix extends string = ''>(
  suffix: string,
  prefix: TPrefix | undefined,
  version: BestIdVersion,
): BestId<TPrefix> {
  const normalizedPrefix = normalizePrefix(prefix ?? '')
  validateSuffix(suffix, version)

  return formatBestId(normalizedPrefix, suffix) as BestId<TPrefix>
}

function splitWith<TPrefix extends string = string>(
  value: string,
  expectedPrefix: TPrefix | undefined,
  version: BestIdVersion,
): BestIdParts<TPrefix> {
  const parsed = parseWith(value, expectedPrefix, version)

  return {
    prefix: parsed.prefix,
    suffix: parsed.suffix,
  }
}

function toUuidBytesWith<TPrefix extends string>(
  value: BestId<TPrefix>,
  version: BestIdVersion,
): Uint8Array {
  return decodeBase62(splitWith(value, undefined, version).suffix)
}

function fromUuidBytesWith<TPrefix extends string = ''>(
  bytes: Uint8Array,
  prefix: TPrefix | undefined,
  version: BestIdVersion,
): BestId<TPrefix> {
  const normalizedPrefix = normalizePrefix(prefix ?? '')
  assertUuidVersion(bytes, version)
  const suffix = encodeBase62(bytes)

  return formatBestId(normalizedPrefix, suffix) as BestId<TPrefix>
}

function splitBestIdString(value: string): BestIdParts<string> {
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

function formatBestId(prefix: string, suffix: string): string {
  return prefix === '' ? suffix : `${prefix}_${suffix}`
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

// Fixed-width Base62 preserves the natural byte ordering of UUID values.
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

function validateSuffix(suffix: string, version: BestIdVersion): void {
  const uuidBytes = decodeBase62(suffix)
  assertUuidVersion(uuidBytes, version)
}

function assertUuidVersion(bytes: Uint8Array, version: BestIdVersion): void {
  if (bytes.length !== UUID_BYTE_LENGTH) {
    throw new Error('Best ID suffix must decode to 16 UUID bytes.')
  }

  const uuidVersion = bytes[6] >> 4
  const isRfcVariant = (bytes[8] & UUID_VARIANT_MASK) === UUID_VARIANT_RFC

  if (version === 'any') {
    if (
      !isRfcVariant ||
      uuidVersion < UUID_MIN_VERSION ||
      uuidVersion > UUID_MAX_VERSION
    ) {
      throw new Error('Best ID suffix does not encode a valid UUID value.')
    }

    return
  }

  const expectedVersion = version === 'v4' ? 4 : 7

  if (!isRfcVariant || uuidVersion !== expectedVersion) {
    throw new Error(
      `Best ID suffix does not encode a valid UUID${version} value.`,
    )
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
