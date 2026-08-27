# best-id

Minimal typed IDs inspired by [typeid-js](https://github.com/jetify-com/typeid-js), backed by UUID and encoded as fixed-width Base62.

## Features

- Optional lowercase prefix, like `user_0T7AqK1dY4ZxN8mJ2pLsQ9`
- Prefix-free canonical form, like `0T7AqK1dY4ZxN8mJ2pLsQ9`
- Fixed 22-character Base62 suffix
- UUIDv7 under the hood by default, so values remain time-sortable
- Optional UUIDv4 mode via `createBestId({ version: 'v4' })` when sortability is not wanted
- Branded TypeScript types for safer prefix-aware APIs

## Install

```bash
pnpm add best-id
```

## Usage

```ts
import {
  bestIdFromSuffix,
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

const sameUserId = bestIdFromSuffix('0T7AqK1dY4ZxN8mJ2pLsQ9', 'user')
// => 'user_0T7AqK1dY4ZxN8mJ2pLsQ9'
```

## Version modes

Every Best ID is a 128-bit UUID rendered as 22 Base62 characters, so the string
format is identical across versions. Only generation and validation differ, and
the UUID version is self-describing inside the payload — no migration or format
change is needed to mix modes.

| Mode           | Generates | Accepts                          | Time-sortable      |
| -------------- | --------- | -------------------------------- | ------------------ |
| `v7` (default) | UUIDv7    | UUIDv7 only                      | Yes                |
| `v4`           | UUIDv4    | UUIDv4 only                      | No                 |
| `any`          | UUIDv7    | any RFC 9562 UUID (versions 1-8) | Only for v7 values |

`createBestId` returns an instance bound to one mode. The top-level exports are
the `v7` instance, so existing code keeps its behaviour unchanged.

```ts
import { createBestId, getBestIdVersion } from 'best-id'

const randomId = createBestId({ version: 'v4' })

const userId = randomId.generate('user')
//    ^? BestId<'user'>
// => 'user_5Kx0mQ8bTfR2vLpA7nWzJd'

randomId.parse(userId, 'user')
randomId.toUuid(userId)
// => 'b1f4c0d2-...-4...' (a UUIDv4)

getBestIdVersion(userId)
// => 4
```

All modes share the same prefix rules, the 22-character Base62 suffix and the
128-bit range check. Only the UUID version check differs, so a `v4` instance
rejects v7 payloads and vice versa:

```ts
randomId.parse(generateBestId('user'), 'user')
// Error: Best ID suffix does not encode a valid UUIDv4 value.
```

Use `any` to read mixed or legacy data, then dispatch on `getBestIdVersion`:

```ts
const mixedId = createBestId({ version: 'any' })

mixedId.parse(someExistingValue)
```

Note that `any` still requires a valid RFC variant and a version between 1 and
8, so the nil UUID and arbitrary 128-bit blobs are rejected.

## API

The API naming follows the existing `best-id` style instead of mirroring `typeid-js` verbatim:

- `bestIdFromString` instead of `fromString`
- `bestIdFromSuffix` for the `typeidUnboxed` case where an existing suffix is supplied
- `splitBestId` instead of `parseTypeId`
- `getBestIdPrefix` / `getBestIdSuffix` instead of `getType` / `getSuffix`
- `bestIdToUuid` / `bestIdToUuidBytes`
- `bestIdFromUuid` / `bestIdFromUuidBytes`
- `createBestId` for an instance bound to a UUID version mode
- `getBestIdVersion` to read the UUID version of any Best ID

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
- a valid UUID payload for the instance's version mode after decoding

### `bestIdFromSuffix`

```ts
function bestIdFromSuffix<TPrefix extends string = ''>(
  suffix: string,
  prefix?: TPrefix,
): BestId<TPrefix>
```

Builds a Best ID from a validated Base62 suffix and an optional prefix.

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

Decodes a branded Best ID into its UUID bytes.

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

Builds a Best ID from UUID bytes. Bytes that do not match the instance's version mode are rejected.

### `bestIdFromUuid`

```ts
function bestIdFromUuid<TPrefix extends string = ''>(
  uuid: string,
  prefix?: TPrefix,
): BestId<TPrefix>
```

Builds a Best ID from a UUID string. UUIDs that do not match the instance's version mode are rejected.

### `createBestId`

```ts
function createBestId(options?: BestIdOptions): BestIdFactory
```

Creates a Best ID instance bound to a single version mode. The returned object
exposes the same operations without the `bestId` naming prefix: `generate`,
`parse`, `fromString`, `fromSuffix`, `split`, `getPrefix`, `getSuffix`,
`toUuid`, `toUuidBytes`, `fromUuid`, `fromUuidBytes`, plus a readonly `version`.

### `getBestIdVersion`

```ts
function getBestIdVersion(value: string): number
```

Returns the UUID version encoded in a Best ID suffix, without enforcing any
version policy. Malformed suffixes still throw.

## Format

Best IDs use the following canonical string form:

```txt
<prefix>_<suffix>
```

When no prefix is present, the canonical form is just the suffix:

```txt
<suffix>
```
