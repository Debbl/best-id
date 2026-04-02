import { assert, describe, expectTypeOf, it } from 'vitest'

import {
  bestIdFromString,
  generateBestId,
  getBestIdPrefix,
  getBestIdSuffix,
  splitBestId,
} from '../src/index.js'
import type { BestId, BestIdParts } from '../src/index.js'

describe('bestIdFromString', () => {
  it('returns a branded best id after validation', () => {
    const value = generateBestId('user')

    assert.equal(bestIdFromString(value, 'user'), value)
    assert.equal(bestIdFromString(value), value)
  })

  it('rejects a mismatched expected prefix', () => {
    const value = generateBestId('user')

    assert.throws(
      () => bestIdFromString(value, 'order'),
      'Best ID prefix "user" does not match "order".',
    )
  })

  it('narrows the TypeScript type when a prefix is provided', () => {
    const value = bestIdFromString(generateBestId('user'), 'user')

    expectTypeOf(value).toEqualTypeOf<BestId<'user'>>()
  })
})

describe('splitBestId', () => {
  it('returns the validated prefix and suffix parts', () => {
    const value = generateBestId('user')
    const parts = splitBestId(value, 'user')

    assert.deepEqual(parts, {
      prefix: 'user',
      suffix: value.slice('user_'.length),
    })
  })

  it('supports prefix-free ids', () => {
    const value = generateBestId()
    const parts = splitBestId(value)

    assert.deepEqual(parts, {
      prefix: '',
      suffix: value,
    })
  })

  it('narrows the prefix type when a branded id is provided', () => {
    const value = generateBestId('user')
    const parts = splitBestId(value)

    expectTypeOf(parts).toEqualTypeOf<BestIdParts<'user'>>()
  })
})

describe('best id accessors', () => {
  it('reads the prefix and suffix from a branded best id', () => {
    const value = generateBestId('user')

    assert.equal(getBestIdPrefix(value), 'user')
    assert.equal(getBestIdSuffix(value), value.slice('user_'.length))
  })

  it('preserves accessor types for typed ids', () => {
    const value = generateBestId('user')

    expectTypeOf(getBestIdPrefix(value)).toEqualTypeOf<'user'>()
    expectTypeOf(getBestIdSuffix(value)).toEqualTypeOf<string>()
  })
})
