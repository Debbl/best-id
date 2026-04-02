import { parse as parseUuid, v4 as uuidv4 } from 'uuid'
import { assert, describe, expectTypeOf, it } from 'vitest'

import {
  bestIdFromUuid,
  bestIdFromUuidBytes,
  bestIdToUuid,
  bestIdToUuidBytes,
  generateBestId,
} from '../src/index.js'
import type { BestId } from '../src/index.js'

describe('best id UUID conversions', () => {
  it('round-trips a best id through a UUID string', () => {
    const value = generateBestId('user')
    const uuid = bestIdToUuid(value)

    assert.equal(bestIdFromUuid(uuid, 'user'), value)
  })

  it('round-trips a best id through UUID bytes', () => {
    const value = generateBestId('user')
    const bytes = bestIdToUuidBytes(value)

    assert.equal(bestIdFromUuidBytes(bytes, 'user'), value)
    assert.deepEqual(
      Array.from(bytes),
      Array.from(parseUuid(bestIdToUuid(value))),
    )
  })

  it('creates prefix-free ids from UUID input', () => {
    const value = generateBestId()
    const uuid = bestIdToUuid(value)

    assert.equal(bestIdFromUuid(uuid), value)
  })

  it('rejects UUID bytes with an invalid length', () => {
    assert.throws(
      () => bestIdFromUuidBytes(new Uint8Array(15), 'user'),
      'Best ID suffix must decode to 16 UUID bytes.',
    )
  })

  it('rejects non-v7 UUID input', () => {
    const uuid = uuidv4()
    const bytes = parseUuid(uuid)

    assert.throws(
      () => bestIdFromUuid(uuid, 'user'),
      'Best ID suffix does not encode a valid UUIDv7 value.',
    )
    assert.throws(
      () => bestIdFromUuidBytes(bytes, 'user'),
      'Best ID suffix does not encode a valid UUIDv7 value.',
    )
  })

  it('narrows the TypeScript type for UUID-derived ids', () => {
    const value = bestIdFromUuid(bestIdToUuid(generateBestId('user')), 'user')

    expectTypeOf(value).toEqualTypeOf<BestId<'user'>>()
  })
})
