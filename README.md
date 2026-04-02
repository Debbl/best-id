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
import {
  bestIdFromUuid,
  bestIdToUuid,
  generateBestId,
  getBestIdPrefix,
  parseBestId,
} from 'best-id'
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

const userUuid = bestIdToUuid(userId)
// => '0195f2f5-...'

const userIdAgain = bestIdFromUuid(userUuid, 'user')
//    ^? BestId<'user'>

getBestIdPrefix(userIdAgain)
// => 'user'
```

## API

The API naming follows the existing `best-id` style instead of mirroring `typeid-js` verbatim:

- `bestIdFromString` instead of `fromString`
- `splitBestId` instead of `parseTypeId`
- `getBestIdPrefix` / `getBestIdSuffix` instead of `getType` / `getSuffix`
- `bestIdToUuid` / `bestIdToUuidBytes`
- `bestIdFromUuid` / `bestIdFromUuidBytes`

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

### `bestIdFromString`

```ts
function bestIdFromString(value: string): BestId<string>
function bestIdFromString<TPrefix extends string>(
  value: string,
  expectedPrefix: TPrefix,
): BestId<TPrefix>
```

Validates a string Best ID and returns the branded `BestId` value directly.

### `splitBestId`

```ts
function splitBestId(value: string): BestIdParts<string>
function splitBestId<TPrefix extends string>(
  value: string,
  expectedPrefix: TPrefix,
): BestIdParts<TPrefix> & { prefix: TPrefix }
```

Returns the validated `prefix` and `suffix` parts of a Best ID.

### `getBestIdPrefix`

```ts
function getBestIdPrefix<TPrefix extends string>(
  value: BestId<TPrefix>,
): TPrefix
```

Returns the prefix from a branded Best ID.

### `getBestIdSuffix`

```ts
function getBestIdSuffix<TPrefix extends string>(value: BestId<TPrefix>): string
```

Returns the Base62 suffix from a branded Best ID.

### `bestIdToUuidBytes`

```ts
function bestIdToUuidBytes<TPrefix extends string>(
  value: BestId<TPrefix>,
): Uint8Array
```

Decodes a branded Best ID into its UUIDv7 bytes.

### `bestIdToUuid`

```ts
function bestIdToUuid<TPrefix extends string>(value: BestId<TPrefix>): string
```

Decodes a branded Best ID into a canonical UUID string.

### `bestIdFromUuidBytes`

```ts
function bestIdFromUuidBytes<TPrefix extends string = ''>(
  bytes: Uint8Array,
  prefix?: TPrefix,
): BestId<TPrefix>
```

Builds a Best ID from UUIDv7 bytes. Non-v7 bytes are rejected.

### `bestIdFromUuid`

```ts
function bestIdFromUuid<TPrefix extends string = ''>(
  uuid: string,
  prefix?: TPrefix,
): BestId<TPrefix>
```

Builds a Best ID from a UUIDv7 string. Non-v7 UUIDs are rejected.

## Format

Best IDs use the following canonical string form:

```txt
<prefix>_<suffix>
```

When no prefix is present, the canonical form is just the suffix:

```txt
<suffix>
```
