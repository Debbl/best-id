import { parse as parseUuid, v4 as uuidv4, v7 as uuidv7 } from 'uuid'
import { assert, describe, expectTypeOf, it } from 'vitest'

import {
  createBestId,
  generateBestId,
  getBestIdVersion,
  parseBestId,
} from '../src/index.js'
import type { BestId } from '../src/index.js'

const v4BestId = createBestId({ version: 'v4' })
const anyBestId = createBestId({ version: 'any' })

describe('createBestId', () => {
  it('defaults to the UUIDv7 policy', () => {
    const instance = createBestId()

    assert.equal(instance.version, 'v7')
    assert.equal(getBestIdVersion(instance.generate('user')), 7)
  })

  it('generates UUIDv4-backed ids in the v4 mode', () => {
    const value = v4BestId.generate('user')

    assert.match(value, /^user_[0-9A-Za-z]{22}$/)
    assert.equal(v4BestId.version, 'v4')
    assert.equal(getBestIdVersion(value), 4)
    assert.equal(parseUuid(v4BestId.toUuid(value))[6] >> 4, 4)
  })

  it('keeps the same string format across modes', () => {
    const v7Value = generateBestId('user')
    const v4Value = v4BestId.generate('user')

    assert.equal(v7Value.length, v4Value.length)
  })

  it('round-trips a v4 id through every accessor', () => {
    const value = v4BestId.generate('user')
    const suffix = value.slice('user_'.length)

    assert.equal(v4BestId.parse(value, 'user').suffix, suffix)
    assert.equal(v4BestId.fromString(value, 'user'), value)
    assert.equal(v4BestId.fromSuffix(suffix, 'user'), value)
    assert.deepEqual(v4BestId.split(value, 'user'), { prefix: 'user', suffix })
    assert.equal(v4BestId.getPrefix(value), 'user')
    assert.equal(v4BestId.getSuffix(value), suffix)
    assert.equal(v4BestId.fromUuid(v4BestId.toUuid(value), 'user'), value)
    assert.equal(
      v4BestId.fromUuidBytes(v4BestId.toUuidBytes(value), 'user'),
      value,
    )
  })

  it('supports prefix-free ids in the v4 mode', () => {
    const value = v4BestId.generate()

    assert.match(value, /^[0-9A-Za-z]{22}$/)
    assert.equal(v4BestId.parse(value).prefix, '')
  })
})

describe('version policy enforcement', () => {
  it('rejects v7 payloads in the v4 mode', () => {
    const v7Value = generateBestId('user')

    assert.throws(
      () => v4BestId.parse(v7Value, 'user'),
      'Best ID suffix does not encode a valid UUIDv4 value.',
    )
    assert.throws(
      () => v4BestId.fromUuid(uuidv7(), 'user'),
      'Best ID suffix does not encode a valid UUIDv4 value.',
    )
  })

  it('rejects v4 payloads in the default v7 mode', () => {
    const v4Value = v4BestId.generate('user')

    assert.throws(
      () => parseBestId(v4Value, 'user'),
      'Best ID suffix does not encode a valid UUIDv7 value.',
    )
  })

  it('accepts both versions in the any mode', () => {
    const v7Value = generateBestId('user')
    const v4Value = v4BestId.generate('user')

    assert.equal(anyBestId.parse(v7Value, 'user').value, v7Value)
    assert.equal(anyBestId.parse(v4Value, 'user').value, v4Value)
    assert.equal(
      anyBestId.fromUuid(uuidv4(), 'user').length,
      'user_'.length + 22,
    )
  })

  it('generates time-sortable v7 payloads in the any mode', () => {
    assert.equal(getBestIdVersion(anyBestId.generate('user')), 7)
  })

  it('still rejects non-RFC payloads in the any mode', () => {
    assert.throws(
      () => anyBestId.parse('0000000000000000000000'),
      'Best ID suffix does not encode a valid UUID value.',
    )
    assert.throws(
      () => anyBestId.fromUuidBytes(new Uint8Array(16)),
      'Best ID suffix does not encode a valid UUID value.',
    )
  })

  it('shares the prefix and Base62 rules across modes', () => {
    assert.throws(
      () => v4BestId.generate('User'),
      'Best ID prefix can only contain lowercase letters and underscores.',
    )
    assert.throws(
      () => v4BestId.parse('short'),
      'Best ID suffix must be exactly 22 Base62 characters.',
    )
    assert.throws(
      () => v4BestId.parse('zzzzzzzzzzzzzzzzzzzzzz'),
      'Best ID suffix exceeds the 128-bit UUID range.',
    )
  })
})

describe('getBestIdVersion', () => {
  it('reads the version without enforcing a policy', () => {
    assert.equal(getBestIdVersion(generateBestId('user')), 7)
    assert.equal(getBestIdVersion(v4BestId.generate('user')), 4)
    assert.equal(getBestIdVersion(v4BestId.generate()), 4)
  })

  it('rejects malformed suffixes', () => {
    assert.throws(
      () => getBestIdVersion('short'),
      'Best ID suffix must be exactly 22 Base62 characters.',
    )
  })
})

describe('factory typings', () => {
  it('narrows the TypeScript types like the default exports', () => {
    const generated = v4BestId.generate('user')
    const parsed = v4BestId.parse(generated, 'user')

    expectTypeOf(generated).toEqualTypeOf<BestId<'user'>>()
    expectTypeOf(parsed.value).toEqualTypeOf<BestId<'user'>>()
    expectTypeOf(parsed.prefix).toEqualTypeOf<'user'>()
    expectTypeOf(v4BestId.getPrefix(generated)).toEqualTypeOf<'user'>()
    expectTypeOf(
      v4BestId.fromSuffix(v4BestId.getSuffix(generated), 'user'),
    ).toEqualTypeOf<BestId<'user'>>()
  })
})
