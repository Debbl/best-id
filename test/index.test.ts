import { assert, describe, expectTypeOf, it } from 'vitest'

import { generateBestId, parseBestId } from '../src/index.js'
import type { BestId } from '../src/index.js'

describe('generateBestId', () => {
  it('creates a suffix-only best id when no prefix is provided', () => {
    const value = generateBestId()
    const parsed = parseBestId(value)

    assert.match(value, /^[0-9A-Za-z]{22}$/)
    assert.equal(parsed.value, value)
    assert.equal(parsed.prefix, '')
    assert.equal(parsed.suffix, value)
  })

  it('creates a prefixed best id that round-trips through parsing', () => {
    const value = generateBestId('user')
    const parsed = parseBestId(value, 'user')

    assert.match(value, /^user_[0-9A-Za-z]{22}$/)
    assert.equal(parsed.value, value)
    assert.equal(parsed.prefix, 'user')
    assert.equal(parsed.suffix.length, 22)
    assert.equal(parsed.suffix, value.slice('user_'.length))
  })
})

describe('parseBestId', () => {
  it('rejects a mismatched expected prefix', () => {
    const value = generateBestId('user')

    assert.throws(
      () => parseBestId(value, 'order'),
      'Best ID prefix "user" does not match "order".',
    )
  })

  it('rejects invalid prefixes', () => {
    assert.throws(
      () => generateBestId('User'),
      'Best ID prefix can only contain lowercase letters and underscores.',
    )
    assert.throws(
      () => generateBestId('user-id'),
      'Best ID prefix can only contain lowercase letters and underscores.',
    )
    assert.throws(
      () => generateBestId('_user'),
      'Best ID prefix must not start or end with an underscore.',
    )
    assert.throws(
      () => generateBestId('user_'),
      'Best ID prefix must not start or end with an underscore.',
    )
    assert.throws(
      () => generateBestId('a'.repeat(64)),
      'Best ID prefix must be 63 characters or less.',
    )
  })

  it('rejects invalid suffix lengths and characters', () => {
    assert.throws(
      () => parseBestId('short'),
      'Best ID suffix must be exactly 22 Base62 characters.',
    )
    assert.throws(
      () => parseBestId('user_!!!!!!!!!!!!!!!!!!!!!!'),
      'Best ID suffix contains an invalid Base62 character: "!".',
    )
  })

  it('rejects suffixes that decode outside the UUID range', () => {
    assert.throws(
      () => parseBestId('zzzzzzzzzzzzzzzzzzzzzz'),
      'Best ID suffix exceeds the 128-bit UUID range.',
    )
  })

  it('rejects suffixes that are not UUIDv7 values', () => {
    assert.throws(
      () => parseBestId('0000000000000000000000'),
      'Best ID suffix does not encode a valid UUIDv7 value.',
    )
  })

  it('narrows the TypeScript types for generated and parsed ids', () => {
    const generated = generateBestId('user')
    const parsed = parseBestId(generated, 'user')

    expectTypeOf(generated).toEqualTypeOf<BestId<'user'>>()
    expectTypeOf(parsed.value).toEqualTypeOf<BestId<'user'>>()
    expectTypeOf(parsed.prefix).toEqualTypeOf<'user'>()
  })
})
