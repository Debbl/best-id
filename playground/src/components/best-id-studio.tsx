'use client'

import {
  Binary,
  Braces,
  Copy,
  Fingerprint,
  Hash,
  RefreshCcw,
  ScanSearch,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { ThemeSwitcher } from '~/components/theme-switcher'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Textarea } from '~/components/ui/textarea'
import { bestIdToUuid, generateBestId, parseBestId } from '~/lib/best-id'
import { cn } from '~/lib/utils'
import type { BestId } from '~/lib/best-id'

const DEFAULT_PREFIX = 'user'
const DEFAULT_COUNT = 4
const MAX_COUNT = 12

interface GeneratedItem {
  id: BestId<string>
  prefix: string
  suffix: string
  uuid: string
}

interface ParsedSuccess {
  input: string
  key: string
  prefix: string
  status: 'valid'
  suffix: string
  uuid: string
}

interface ParsedFailure {
  error: string
  input: string
  key: string
  status: 'invalid'
}

type ParsedEntry = ParsedFailure | ParsedSuccess

function clampCount(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_COUNT
  }

  return Math.min(MAX_COUNT, Math.max(1, Math.trunc(value)))
}

function createGeneratedItem(id: BestId<string>): GeneratedItem {
  const parsed = parseBestId(id)

  return {
    id,
    prefix: parsed.prefix,
    suffix: parsed.suffix,
    uuid: bestIdToUuid(parsed.value),
  }
}

function createBatch(prefix: string, count: number): GeneratedItem[] {
  const normalizedPrefix = prefix.trim()

  return Array.from({ length: clampCount(count) }, () => {
    const nextId =
      normalizedPrefix === ''
        ? generateBestId()
        : generateBestId(normalizedPrefix)

    return createGeneratedItem(nextId)
  })
}

function parseEntries(input: string, expectedPrefix: string): ParsedEntry[] {
  const normalizedExpectedPrefix = expectedPrefix.trim()

  return input
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map((value, index) => {
      try {
        const parsed =
          normalizedExpectedPrefix === ''
            ? parseBestId(value)
            : parseBestId(value, normalizedExpectedPrefix)

        return {
          input: value,
          key: `line:${index}:${value}`,
          prefix: parsed.prefix,
          status: 'valid',
          suffix: parsed.suffix,
          uuid: bestIdToUuid(parsed.value),
        } satisfies ParsedSuccess
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : 'Unknown parsing error.',
          input: value,
          key: `line:${index}:${value}`,
          status: 'invalid',
        } satisfies ParsedFailure
      }
    })
}

const INITIAL_GENERATED = createBatch(DEFAULT_PREFIX, DEFAULT_COUNT)
const INITIAL_PARSE_TEXT = INITIAL_GENERATED.map((item) => item.id).join('\n')

export function BestIdStudio() {
  const [prefix, setPrefix] = useState(DEFAULT_PREFIX)
  const [count, setCount] = useState(DEFAULT_COUNT)
  const [expectedPrefix, setExpectedPrefix] = useState(DEFAULT_PREFIX)
  const [generatedItems, setGeneratedItems] =
    useState<GeneratedItem[]>(INITIAL_GENERATED)
  const [generatorError, setGeneratorError] = useState<string | null>(null)
  const [parserInput, setParserInput] = useState(INITIAL_PARSE_TEXT)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copiedTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current)
      }
    }
  }, [])

  const parsedEntries = parseEntries(parserInput, expectedPrefix)
  const validEntries = parsedEntries.filter((entry) => entry.status === 'valid')
  const invalidEntries = parsedEntries.length - validEntries.length

  async function copyText(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)

      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current)
      }

      copiedTimerRef.current = window.setTimeout(() => {
        setCopiedKey(null)
      }, 1600)
    } catch {
      setCopiedKey(null)
    }
  }

  function handleGenerate() {
    try {
      const nextItems = createBatch(prefix, count)

      setGeneratedItems(nextItems)
      setParserInput(nextItems.map((item) => item.id).join('\n'))
      setGeneratorError(null)
    } catch (error) {
      setGeneratorError(
        error instanceof Error ? error.message : 'Unable to generate Best IDs.',
      )
    }
  }

  function handleInspect(item: GeneratedItem) {
    setExpectedPrefix(item.prefix)
    setParserInput(item.id)
  }

  function handleReset() {
    setPrefix(DEFAULT_PREFIX)
    setCount(DEFAULT_COUNT)
    setExpectedPrefix(DEFAULT_PREFIX)
    setGeneratedItems(INITIAL_GENERATED)
    setParserInput(INITIAL_PARSE_TEXT)
    setGeneratorError(null)
  }

  return (
    <main className='relative isolate overflow-hidden'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(11,133,146,0.16),transparent_36%),radial-gradient(circle_at_80%_12%,rgba(255,166,77,0.18),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.68))] dark:bg-[radial-gradient(circle_at_top_left,rgba(69,214,201,0.12),transparent_32%),radial-gradient(circle_at_80%_12%,rgba(255,194,107,0.16),transparent_22%),linear-gradient(180deg,rgba(6,20,24,0.96),rgba(6,20,24,0.88))]' />

      <div className='mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8'>
        <motion.header
          animate={{ opacity: 1, y: 0 }}
          className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35 }}
        >
          <div className='max-w-3xl space-y-4'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge className='gap-1 rounded-full px-3 py-1' variant='outline'>
                <Sparkles className='size-3.5' />
                Interactive demo
              </Badge>
              <Badge
                className='gap-1 rounded-full px-3 py-1'
                variant='secondary'
              >
                <Fingerprint className='size-3.5' />
                UUIDv7 + Base62
              </Badge>
            </div>

            <div className='space-y-3'>
              <h1 className='max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl'>
                Generate typed IDs, then tear them back open.
              </h1>
              <p className='max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg'>
                This playground turns the current <code>best-id</code> package
                into a browser studio: make prefix-aware batches, inspect their
                UUID payloads, and validate arbitrary input one line at a time.
              </p>
            </div>
          </div>

          <ThemeSwitcher />
        </motion.header>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className='grid gap-4 lg:grid-cols-[1.2fr_0.8fr]'
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05, duration: 0.35 }}
        >
          <Card className='overflow-hidden border-border/60 bg-background/70'>
            <CardHeader className='gap-4 pb-4'>
              <div className='flex flex-wrap items-center gap-2'>
                <Badge variant='secondary'>Prefix aware</Badge>
                <Badge variant='outline'>22-char suffix</Badge>
                <Badge variant='outline'>Batch generation</Badge>
              </div>
              <CardTitle className='text-2xl sm:text-3xl'>
                A live surface for the parts that matter.
              </CardTitle>
              <CardDescription className='max-w-2xl text-base'>
                Leave the prefix empty for suffix-only IDs, or use a lowercase
                namespace like <code>user</code> and <code>order</code>. Every
                generated item below is immediately parseable into prefix,
                suffix, and canonical UUID.
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-4 sm:grid-cols-3'>
              {[
                {
                  icon: Hash,
                  label: 'Prefix rule',
                  value: 'lowercase + underscores',
                },
                {
                  icon: Binary,
                  label: 'Suffix length',
                  value: '22 fixed Base62 chars',
                },
                {
                  icon: Braces,
                  label: 'Underlying payload',
                  value: 'validated UUIDv7',
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className='rounded-2xl border border-border/60 bg-card/90 p-4'
                >
                  <Icon className='mb-4 size-5 text-primary' />
                  <p className='text-sm text-muted-foreground'>{label}</p>
                  <p className='mt-1 text-base font-medium'>{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className='border-border/60 bg-primary text-primary-foreground'>
            <CardHeader className='pb-4'>
              <CardTitle className='text-2xl'>Suggested flow</CardTitle>
              <CardDescription className='text-primary-foreground/75'>
                Generate a batch, inspect any single value, then paste in your
                own IDs to test prefix expectations and UUID conversion.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 text-sm'>
              {[
                'Pick a prefix and a count.',
                'Generate a batch and copy any ID or UUID.',
                'Send one ID or the whole batch to the parser.',
                'Validate arbitrary lines with or without an expected prefix.',
              ].map((step, index) => (
                <div
                  key={step}
                  className='flex items-start gap-3 rounded-2xl border border-white/15 bg-white/8 p-4'
                >
                  <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-white/16 font-mono text-xs font-semibold'>
                    0{index + 1}
                  </div>
                  <p className='leading-6'>{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.section>

        <section className='grid gap-6 xl:grid-cols-[1.02fr_0.98fr]'>
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: -16 }}
            transition={{ delay: 0.1, duration: 0.35 }}
          >
            <Card className='h-full border-border/60 bg-background/72'>
              <CardHeader className='pb-5'>
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div className='space-y-2'>
                    <Badge
                      className='gap-1 rounded-full px-3 py-1'
                      variant='secondary'
                    >
                      <WandSparkles className='size-3.5' />
                      Generator
                    </Badge>
                    <CardTitle className='text-2xl'>
                      Generate multiple IDs
                    </CardTitle>
                    <CardDescription>
                      Fresh IDs are created in the browser using the same source
                      file as the package root. Generating a new batch also
                      refreshes the parser input on the right.
                    </CardDescription>
                  </div>

                  <Button onClick={handleReset} type='button' variant='outline'>
                    <RefreshCcw className='size-4' />
                    Reset
                  </Button>
                </div>
              </CardHeader>

              <CardContent className='space-y-6'>
                <div className='grid gap-4 md:grid-cols-[1fr_148px_auto]'>
                  <div className='space-y-2'>
                    <Label htmlFor='generator-prefix'>Prefix</Label>
                    <Input
                      id='generator-prefix'
                      onChange={(event) => setPrefix(event.target.value)}
                      placeholder='user'
                      value={prefix}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='generator-count'>Count</Label>
                    <Input
                      id='generator-count'
                      max={MAX_COUNT}
                      min={1}
                      onChange={(event) => {
                        const nextValue = Number.parseInt(
                          event.target.value,
                          10,
                        )
                        setCount(clampCount(nextValue))
                      }}
                      type='number'
                      value={count}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label className='opacity-0' htmlFor='generator-action'>
                      Generate
                    </Label>
                    <Button
                      className='w-full'
                      id='generator-action'
                      onClick={handleGenerate}
                      type='button'
                    >
                      <WandSparkles className='size-4' />
                      Generate batch
                    </Button>
                  </div>
                </div>

                <div className='flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
                  <Badge variant='outline'>
                    {prefix.trim() === ''
                      ? 'Prefix-free mode'
                      : `Prefix: ${prefix.trim()}`}
                  </Badge>
                  <Badge variant='outline'>
                    {generatedItems.length} fresh IDs
                  </Badge>
                  <span>
                    Allowed prefix characters: lowercase letters and
                    underscores.
                  </span>
                </div>

                {generatorError && (
                  <div className='rounded-2xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive'>
                    {generatorError}
                  </div>
                )}

                <Separator />

                <div className='space-y-3'>
                  {generatedItems.map((item, index) => (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className='rounded-3xl border border-border/60 bg-card/85 p-4 shadow-sm'
                      initial={{ opacity: 0, y: 12 }}
                      key={item.id}
                      transition={{ delay: index * 0.03, duration: 0.24 }}
                    >
                      <div className='flex flex-wrap items-start justify-between gap-3'>
                        <div className='space-y-3'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <Badge variant='secondary'>#{index + 1}</Badge>
                            <Badge variant='outline'>
                              {item.prefix === '' ? 'prefix-free' : item.prefix}
                            </Badge>
                          </div>

                          <div className='space-y-2'>
                            <p className='font-mono text-[0.95rem] break-all'>
                              {item.id}
                            </p>
                            <p className='font-mono text-xs break-all text-muted-foreground'>
                              UUID {item.uuid}
                            </p>
                          </div>
                        </div>

                        <div className='flex flex-wrap gap-2'>
                          <Button
                            onClick={() => copyText(`id:${item.id}`, item.id)}
                            size='sm'
                            type='button'
                            variant='outline'
                          >
                            <Copy className='size-4' />
                            {copiedKey === `id:${item.id}`
                              ? 'Copied'
                              : 'Copy ID'}
                          </Button>
                          <Button
                            onClick={() =>
                              copyText(`uuid:${item.id}`, item.uuid)
                            }
                            size='sm'
                            type='button'
                            variant='ghost'
                          >
                            <Copy className='size-4' />
                            {copiedKey === `uuid:${item.id}`
                              ? 'Copied'
                              : 'Copy UUID'}
                          </Button>
                          <Button
                            onClick={() => handleInspect(item)}
                            size='sm'
                            type='button'
                            variant='ghost'
                          >
                            <ScanSearch className='size-4' />
                            Inspect
                          </Button>
                        </div>
                      </div>

                      <Separator className='my-4' />

                      <div className='grid gap-3 sm:grid-cols-2'>
                        <div className='rounded-2xl bg-background/80 p-3'>
                          <p className='mb-1 text-xs tracking-[0.22em] text-muted-foreground uppercase'>
                            Suffix
                          </p>
                          <p className='font-mono text-sm break-all'>
                            {item.suffix}
                          </p>
                        </div>
                        <div className='rounded-2xl bg-background/80 p-3'>
                          <p className='mb-1 text-xs tracking-[0.22em] text-muted-foreground uppercase'>
                            Prefix
                          </p>
                          <p className='text-sm'>
                            {item.prefix === '' ? 'No prefix' : item.prefix}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: 16 }}
            transition={{ delay: 0.14, duration: 0.35 }}
          >
            <Card className='h-full border-border/60 bg-background/72'>
              <CardHeader className='pb-5'>
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div className='space-y-2'>
                    <Badge
                      className='gap-1 rounded-full px-3 py-1'
                      variant='secondary'
                    >
                      <ScanSearch className='size-3.5' />
                      Parser
                    </Badge>
                    <CardTitle className='text-2xl'>
                      Parse arbitrary input
                    </CardTitle>
                    <CardDescription>
                      Paste one Best ID per line. Add an expected prefix if you
                      want mismatch errors, then inspect the prefix, suffix, and
                      UUID string for every valid line.
                    </CardDescription>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    <Badge variant='outline'>{validEntries.length} valid</Badge>
                    <Badge
                      variant={invalidEntries > 0 ? 'destructive' : 'outline'}
                    >
                      {invalidEntries} invalid
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='space-y-6'>
                <div className='grid gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='expected-prefix'>Expected prefix</Label>
                    <Input
                      id='expected-prefix'
                      onChange={(event) =>
                        setExpectedPrefix(event.target.value)
                      }
                      placeholder='Optional'
                      value={expectedPrefix}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='parser-input'>IDs to parse</Label>
                    <Textarea
                      className='min-h-48 font-mono'
                      id='parser-input'
                      onChange={(event) => setParserInput(event.target.value)}
                      placeholder='Paste one Best ID per line'
                      value={parserInput}
                    />
                  </div>
                </div>

                <Separator />

                <div className='space-y-3'>
                  {parsedEntries.length === 0 && (
                    <div className='rounded-3xl border border-dashed border-border/70 bg-card/70 p-6 text-sm leading-6 text-muted-foreground'>
                      Add one or more lines to start parsing. Empty lines are
                      ignored.
                    </div>
                  )}

                  {parsedEntries.map((entry) => (
                    <div
                      className={cn(
                        'rounded-3xl border p-4 shadow-sm',
                        entry.status === 'valid'
                          ? 'border-border/60 bg-card/85'
                          : 'border-destructive/30 bg-destructive/6',
                      )}
                      key={entry.key}
                    >
                      <div className='flex flex-wrap items-start justify-between gap-3'>
                        <div className='space-y-3'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <Badge
                              variant={
                                entry.status === 'valid'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {entry.status === 'valid' ? 'Valid' : 'Invalid'}
                            </Badge>
                            {entry.status === 'valid' && (
                              <Badge variant='outline'>
                                {entry.prefix === ''
                                  ? 'prefix-free'
                                  : entry.prefix}
                              </Badge>
                            )}
                          </div>

                          <p className='font-mono text-sm break-all'>
                            {entry.input}
                          </p>
                        </div>

                        <Button
                          onClick={() =>
                            copyText(`parsed:${entry.input}`, entry.input)
                          }
                          size='sm'
                          type='button'
                          variant='ghost'
                        >
                          <Copy className='size-4' />
                          {copiedKey === `parsed:${entry.input}`
                            ? 'Copied'
                            : 'Copy'}
                        </Button>
                      </div>

                      {entry.status === 'valid' ? (
                        <>
                          <Separator className='my-4' />

                          <div className='grid gap-3 md:grid-cols-3'>
                            <div className='rounded-2xl bg-background/80 p-3'>
                              <p className='mb-1 text-xs tracking-[0.22em] text-muted-foreground uppercase'>
                                Prefix
                              </p>
                              <p className='text-sm'>
                                {entry.prefix === ''
                                  ? 'No prefix'
                                  : entry.prefix}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-background/80 p-3'>
                              <p className='mb-1 text-xs tracking-[0.22em] text-muted-foreground uppercase'>
                                Suffix
                              </p>
                              <p className='font-mono text-xs break-all'>
                                {entry.suffix}
                              </p>
                            </div>
                            <div className='rounded-2xl bg-background/80 p-3'>
                              <p className='mb-1 text-xs tracking-[0.22em] text-muted-foreground uppercase'>
                                UUID
                              </p>
                              <p className='font-mono text-xs break-all'>
                                {entry.uuid}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className='mt-4 text-sm leading-6 text-destructive'>
                          {entry.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </div>
    </main>
  )
}
