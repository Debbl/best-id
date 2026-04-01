# best-id

Minimal typed IDs inspired by [typeid-js](https://github.com/jetify-com/typeid-js), backed by UUIDv7 and encoded as fixed-width Base62.

## Features

- Optional lowercase prefix, like `user_0T7AqK1dY4ZxN8mJ2pLsQ9`
- Prefix-free canonical form, like `0T7AqK1dY4ZxN8mJ2pLsQ9`
- Fixed 22-character Base62 suffix
- UUIDv7 under the hood, so values remain time-sortable
- Branded TypeScript types for safer prefix-aware APIs

## Install

```bash
pnpm add best-id
```

## Usage

```ts
import { generateBestId, parseBestId } from 'best-id'
import type { BestId } from 'best-id'

const userId = generateBestId('user')
//    ^? BestId<'user'>
// => 'user_0T7AqK1dY4ZxN8mJ2pLsQ9'

const anonymousId = generateBestId()
//    ^? BestId<''>
// => '0T7AqK1dY4ZxN8mJ2pLsQ9'

const parsedUserId = parseBestId(userId, 'user')
//    ^? ParsedBestId<'user'> & { prefix: 'user' }
// => { value: 'user_0T7AqK1dY4ZxN8mJ2pLsQ9', prefix: 'user', suffix: '0T7AqK1dY4ZxN8mJ2pLsQ9' }

const parsedAnonymousId = parseBestId(anonymousId)
//    ^? ParsedBestId<string>
// => { value: '0T7AqK1dY4ZxN8mJ2pLsQ9', prefix: '', suffix: '0T7AqK1dY4ZxN8mJ2pLsQ9' }

function loadUser(id: BestId<'user'>) {
  return id
}

loadUser(userId)
```

## API

### `generateBestId`

```ts
function generateBestId<TPrefix extends string = ''>(
  prefix?: TPrefix,
): BestId<TPrefix>
```

Generates a new Best ID. Prefixes must:

- be empty or 1-63 characters long
- only contain lowercase letters and underscores
- not start or end with an underscore

### `parseBestId`

```ts
function parseBestId(value: string): ParsedBestId<string>
function parseBestId<TPrefix extends string>(
  value: string,
  expectedPrefix: TPrefix,
): ParsedBestId<TPrefix> & { prefix: TPrefix }
```

Parses and validates a Best ID string. The suffix must be:

- exactly 22 characters long
- valid Base62 using `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`
- a valid UUIDv7 payload after decoding

## Format

Best IDs use the following canonical string form:

```txt
<prefix>_<suffix>
```

When no prefix is present, the canonical form is just the suffix:

```txt
<suffix>
```
