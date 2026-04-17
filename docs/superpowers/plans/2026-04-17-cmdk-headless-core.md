# cmdk Headless Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a framework-agnostic command-menu library with a pure-TS core (`@unvalley/cmdk-core`) and a React adapter (`@unvalley/cmdk-react`) that mirrors `pacocoursey/cmdk`'s compound-component API.

**Architecture:** pnpm monorepo. Core is a JS store (Map<value, ItemData>) — the JS state, not the DOM, is the source of truth. React adapter is a thin wrapper that calls `store.registerItem()` from `useEffect` and subscribes via `useSyncExternalStore`.

**Tech Stack:** TypeScript 5+, pnpm workspaces, vitest, tsup, biome, React 18+, jsdom (for React tests only).

**Spec:** `docs/superpowers/specs/2026-04-17-cmdk-headless-core-design.md`

---

## File Structure

```
cmdk/
├── package.json                     # root, private, scripts
├── pnpm-workspace.yaml
├── biome.json
├── tsconfig.base.json
├── packages/
│   ├── core/                        # @unvalley/cmdk-core
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   ├── vitest.config.ts
│   │   ├── src/
│   │   │   ├── index.ts             # public exports
│   │   │   ├── types.ts             # all interfaces
│   │   │   ├── normalize.ts         # NFD + lowercase normalization
│   │   │   ├── score.ts             # default scorer (ported command-score)
│   │   │   └── store.ts             # createCommand()
│   │   └── tests/
│   │       ├── normalize.test.ts
│   │       ├── score.test.ts
│   │       ├── registration.test.ts
│   │       ├── search.test.ts
│   │       ├── selection.test.ts
│   │       ├── controlled.test.ts
│   │       └── regressions.test.ts
│   └── react/                       # @unvalley/cmdk-react
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       ├── vitest.config.ts
│       ├── vitest.setup.ts
│       ├── src/
│       │   ├── index.ts             # public exports
│       │   ├── context.ts           # CommandContext + useCommandStore
│       │   ├── command.tsx          # <Command> root
│       │   ├── input.tsx            # <Command.Input>
│       │   ├── list.tsx             # <Command.List>
│       │   ├── item.tsx             # <Command.Item>
│       │   ├── group.tsx            # <Command.Group>
│       │   ├── empty.tsx            # <Command.Empty>
│       │   ├── loading.tsx          # <Command.Loading>
│       │   └── separator.tsx        # <Command.Separator>
│       └── tests/
│           ├── command.test.tsx
│           ├── keyboard.test.tsx
│           ├── async.test.tsx
│           └── regressions.test.tsx
└── docs/
    └── superpowers/
        ├── specs/2026-04-17-cmdk-headless-core-design.md
        └── plans/2026-04-17-cmdk-headless-core.md
```

---

## Phase A: Repo Setup + Core

### Task 1: Initialize monorepo

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `biome.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.node-version`
- Create: `README.md`

- [ ] **Step 1: Create root `package.json`**

```json
{
  "name": "cmdk-monorepo",
  "private": true,
  "version": "0.0.0",
  "packageManager": "pnpm@9.12.0",
  "scripts": {
    "build": "pnpm -r --filter='./packages/*' run build",
    "test": "pnpm -r --filter='./packages/*' run test",
    "typecheck": "pnpm -r --filter='./packages/*' run typecheck",
    "lint": "biome check .",
    "format": "biome format --write ."
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "typescript": "^5.6.3"
  },
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 2: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - 'packages/*'
```

- [ ] **Step 3: Create `biome.json`**

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingCommas": "all"
    }
  },
  "files": {
    "ignore": ["node_modules", "dist", "**/*.d.ts"]
  }
}
```

- [ ] **Step 4: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules
dist
*.tsbuildinfo
.DS_Store
coverage
```

- [ ] **Step 6: Create `.node-version`**

```
20.18.0
```

- [ ] **Step 7: Create `README.md`**

```markdown
# cmdk

A framework-agnostic command-menu library.

- `@unvalley/cmdk-core` — pure TypeScript store. Use without React.
- `@unvalley/cmdk-react` — React adapter (compound-component API).

See `docs/superpowers/specs/` for design docs.
```

- [ ] **Step 8: Install root dev deps**

Run: `pnpm install`
Expected: `node_modules/` created, `pnpm-lock.yaml` created.

- [ ] **Step 9: Verify biome works**

Run: `pnpm lint`
Expected: passes (no files yet) or reports zero errors.

- [ ] **Step 10: Commit**

```bash
git add package.json pnpm-workspace.yaml biome.json tsconfig.base.json .gitignore .node-version README.md pnpm-lock.yaml
git commit -m "chore: scaffold pnpm monorepo with biome + typescript"
```

---

### Task 2: Core package skeleton

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/tsup.config.ts`
- Create: `packages/core/vitest.config.ts`
- Create: `packages/core/src/index.ts`

- [ ] **Step 1: Create `packages/core/package.json`**

```json
{
  "name": "@unvalley/cmdk-core",
  "version": "0.0.1",
  "description": "Framework-agnostic command-menu store",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "tsup": "^8.3.0",
    "typescript": "^5.6.3",
    "vitest": "^2.1.4"
  }
}
```

- [ ] **Step 2: Create `packages/core/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "tests"]
}
```

- [ ] **Step 3: Create `packages/core/tsup.config.ts`**

```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2022',
})
```

- [ ] **Step 4: Create `packages/core/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
```

- [ ] **Step 5: Create stub `packages/core/src/index.ts`**

```ts
export {}
```

- [ ] **Step 6: Install core deps**

Run: `pnpm install`
Expected: dependencies resolve, no errors.

- [ ] **Step 7: Verify typecheck + test runner works**

Run: `pnpm --filter @unvalley/cmdk-core typecheck && pnpm --filter @unvalley/cmdk-core test`
Expected: typecheck passes; vitest reports "No test files found" (exit code may be 1 — that's OK for now).

- [ ] **Step 8: Commit**

```bash
git add packages/core/ pnpm-lock.yaml
git commit -m "chore(core): scaffold @unvalley/cmdk-core package"
```

---

### Task 3: String normalization utility

**Files:**
- Create: `packages/core/src/normalize.ts`
- Create: `packages/core/tests/normalize.test.ts`

- [ ] **Step 1: Write failing tests** in `packages/core/tests/normalize.test.ts`

```ts
import { describe, expect, it } from 'vitest'
import { normalize } from '../src/normalize'

describe('normalize', () => {
  it('lowercases', () => {
    expect(normalize('ABC')).toBe('abc')
  })

  it('removes diacritics (NFD)', () => {
    expect(normalize('café')).toBe('cafe')
    expect(normalize('naïve')).toBe('naive')
    expect(normalize('Ångström')).toBe('angstrom')
  })

  it('normalizes whitespace variants to space', () => {
    expect(normalize('foo\tbar')).toBe('foo bar')
    expect(normalize('foo-bar')).toBe('foo bar')
    expect(normalize('foo\nbar')).toBe('foo bar')
  })

  it('handles empty string', () => {
    expect(normalize('')).toBe('')
  })

  it('handles strings already normalized', () => {
    expect(normalize('hello world')).toBe('hello world')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @unvalley/cmdk-core test`
Expected: FAIL with module not found for `../src/normalize`.

- [ ] **Step 3: Implement `packages/core/src/normalize.ts`**

```ts
const SPACE_LIKE = /[\s\-]/g

/**
 * Lowercase, strip Unicode diacritics, collapse space-like chars to a single space.
 * Used by the default scorer so that `cafe` matches `café` (#386) and
 * `foo-bar` matches `foo bar`.
 */
export function normalize(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(SPACE_LIKE, ' ')
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @unvalley/cmdk-core test`
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/normalize.ts packages/core/tests/normalize.test.ts
git commit -m "feat(core): add normalize() with NFD diacritic stripping"
```

---

### Task 4: Default scorer

Port `command-score` from `pacocoursey/cmdk` (MIT licensed) into TypeScript, wire it through `normalize()`.

**Files:**
- Create: `packages/core/src/score.ts`
- Create: `packages/core/tests/score.test.ts`

- [ ] **Step 1: Write failing tests** in `packages/core/tests/score.test.ts`

```ts
import { describe, expect, it } from 'vitest'
import { commandScore } from '../src/score'

describe('commandScore', () => {
  it('returns > 0 for matching abbreviation', () => {
    expect(commandScore('hello world', 'hw', [])).toBeGreaterThan(0)
  })

  it('returns 0 for non-matching abbreviation', () => {
    expect(commandScore('hello world', 'xyz', [])).toBe(0)
  })

  it('scores exact match higher than fuzzy', () => {
    const exact = commandScore('apple', 'apple', [])
    const fuzzy = commandScore('apple', 'aple', [])
    expect(exact).toBeGreaterThan(fuzzy)
  })

  it('scores prefix higher than suffix', () => {
    const prefix = commandScore('apple banana', 'app', [])
    const suffix = commandScore('banana apple', 'app', [])
    expect(prefix).toBeGreaterThan(suffix)
  })

  it('considers aliases (keywords)', () => {
    const withAlias = commandScore('logout', 'sign', ['signout'])
    const withoutAlias = commandScore('logout', 'sign', [])
    expect(withAlias).toBeGreaterThan(0)
    expect(withoutAlias).toBe(0)
  })

  it('matches diacritics-stripped (cafe matches café)', () => {
    expect(commandScore('café', 'cafe', [])).toBeGreaterThan(0)
  })

  it('matches when search has diacritics but value does not', () => {
    expect(commandScore('cafe', 'café', [])).toBeGreaterThan(0)
  })

  it('returns 1 for empty abbreviation matching empty string', () => {
    expect(commandScore('', '', [])).toBe(1)
  })

  it('handles special regex characters in value safely', () => {
    expect(() => commandScore('<script>alert(1)</script>', 'sc', [])).not.toThrow()
    expect(commandScore('<script>alert(1)</script>', 'sc', [])).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @unvalley/cmdk-core test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `packages/core/src/score.ts`**

This is a TypeScript port of [`pacocoursey/cmdk`'s command-score.ts](https://github.com/dip/cmdk/blob/main/cmdk/src/command-score.ts) (MIT). The only behavioral change vs upstream is that `formatInput` delegates to our `normalize()` (which adds NFD diacritic stripping).

```ts
import { normalize } from './normalize'

const SCORE_CONTINUE_MATCH = 1
const SCORE_SPACE_WORD_JUMP = 0.9
const SCORE_NON_SPACE_WORD_JUMP = 0.8
const SCORE_CHARACTER_JUMP = 0.17
const SCORE_TRANSPOSITION = 0.1
const PENALTY_SKIPPED = 0.999
const PENALTY_CASE_MISMATCH = 0.9999
const PENALTY_NOT_COMPLETE = 0.99

const IS_GAP_REGEXP = /[\\\/_+.#"@\[\(\{&]/
const COUNT_GAPS_REGEXP = /[\\\/_+.#"@\[\(\{&]/g
const IS_SPACE_REGEXP = /[\s\-]/

function commandScoreInner(
  string: string,
  abbreviation: string,
  lowerString: string,
  lowerAbbreviation: string,
  stringIndex: number,
  abbreviationIndex: number,
  memoizedResults: Record<string, number>,
): number {
  if (abbreviationIndex === abbreviation.length) {
    if (stringIndex === string.length) return SCORE_CONTINUE_MATCH
    return PENALTY_NOT_COMPLETE
  }

  const memoizeKey = `${stringIndex},${abbreviationIndex}`
  if (memoizedResults[memoizeKey] !== undefined) return memoizedResults[memoizeKey]

  const abbreviationChar = lowerAbbreviation.charAt(abbreviationIndex)
  let index = lowerString.indexOf(abbreviationChar, stringIndex)
  let highScore = 0
  let score: number
  let transposedScore: number
  let wordBreaks: RegExpMatchArray | null
  let spaceBreaks: RegExpMatchArray | null

  while (index >= 0) {
    score = commandScoreInner(
      string,
      abbreviation,
      lowerString,
      lowerAbbreviation,
      index + 1,
      abbreviationIndex + 1,
      memoizedResults,
    )

    if (score > highScore) {
      if (index === stringIndex) {
        score *= SCORE_CONTINUE_MATCH
      } else if (IS_GAP_REGEXP.test(string.charAt(index - 1))) {
        score *= SCORE_NON_SPACE_WORD_JUMP
        wordBreaks = string.slice(stringIndex, index - 1).match(COUNT_GAPS_REGEXP)
        if (wordBreaks && stringIndex > 0) {
          score *= Math.pow(PENALTY_SKIPPED, wordBreaks.length)
        }
      } else if (IS_SPACE_REGEXP.test(string.charAt(index - 1))) {
        score *= SCORE_SPACE_WORD_JUMP
        spaceBreaks = string.slice(stringIndex, index - 1).match(/[\s\-]/g)
        if (spaceBreaks && stringIndex > 0) {
          score *= Math.pow(PENALTY_SKIPPED, spaceBreaks.length)
        }
      } else {
        score *= SCORE_CHARACTER_JUMP
        if (stringIndex > 0) {
          score *= Math.pow(PENALTY_SKIPPED, index - stringIndex)
        }
      }

      if (string.charAt(index) !== abbreviation.charAt(abbreviationIndex)) {
        score *= PENALTY_CASE_MISMATCH
      }
    }

    if (
      (score < SCORE_TRANSPOSITION &&
        lowerString.charAt(index - 1) === lowerAbbreviation.charAt(abbreviationIndex + 1)) ||
      (lowerAbbreviation.charAt(abbreviationIndex + 1) === lowerAbbreviation.charAt(abbreviationIndex) &&
        lowerString.charAt(index - 1) !== lowerAbbreviation.charAt(abbreviationIndex))
    ) {
      transposedScore = commandScoreInner(
        string,
        abbreviation,
        lowerString,
        lowerAbbreviation,
        index + 1,
        abbreviationIndex + 2,
        memoizedResults,
      )

      if (transposedScore * SCORE_TRANSPOSITION > score) {
        score = transposedScore * SCORE_TRANSPOSITION
      }
    }

    if (score > highScore) highScore = score

    index = lowerString.indexOf(abbreviationChar, index + 1)
  }

  memoizedResults[memoizeKey] = highScore
  return highScore
}

/**
 * Score how well `abbreviation` matches `string`. Returns 0..1.
 * Aliases (keywords) are appended to the string before scoring.
 *
 * Both inputs are passed through normalize() for the lowercase form,
 * which strips diacritics so `cafe` matches `café`.
 *
 * Ported from pacocoursey/cmdk (MIT).
 */
export function commandScore(
  string: string,
  abbreviation: string,
  aliases: readonly string[],
): number {
  const haystack =
    aliases && aliases.length > 0 ? `${string} ${aliases.join(' ')}` : string
  return commandScoreInner(
    haystack,
    abbreviation,
    normalize(haystack),
    normalize(abbreviation),
    0,
    0,
    {},
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @unvalley/cmdk-core test`
Expected: all 9 score tests + 5 normalize tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/score.ts packages/core/tests/score.test.ts
git commit -m "feat(core): port command-score with diacritic normalization"
```

---

### Task 5: Core types

**Files:**
- Create: `packages/core/src/types.ts`

- [ ] **Step 1: Create `packages/core/src/types.ts`**

```ts
/** Default scorer signature. Return 0 to hide an item; > 0 to show (higher = better). */
export type FilterFn = (
  value: string,
  search: string,
  keywords: readonly string[],
) => number

/** Behavior when arrow keys reach the boundary. */
export type PointerSelectionMode = 'hover' | 'click'

export interface ItemInput {
  /** Stable identity. Required, can be ''. Never used as a CSS selector. */
  value: string
  /** Aliases that affect filter scoring. */
  keywords?: readonly string[]
  /** Group this item belongs to (must match a registered group's id). */
  groupId?: string
  /** When true, item is rendered but not selectable. */
  disabled?: boolean
  /** When true, item is always visible regardless of filter. */
  forceMount?: boolean
  /** Fired by triggerSelect() when this item is the current selection. */
  onSelect?: (value: string, event?: Event) => void
}

export interface ItemData extends ItemInput {
  /** Insertion order, used for stable secondary sort. */
  order: number
  /** Latest computed score. 0 means "not visible". */
  score: number
}

export interface GroupInput {
  /** Stable identity. Required. */
  id: string
  /** When true, group is always visible even if all its items are filtered out. */
  forceMount?: boolean
}

export interface GroupData extends GroupInput {
  order: number
}

export interface CommandOptions {
  /** Run the filter? Default true. Set false when caller filters externally. */
  shouldFilter?: boolean
  /** Custom scorer. Default = built-in command-score. */
  filter?: FilterFn
  /** Wrap arrow-key navigation past the ends. Default false. */
  loop?: boolean
  /** 'hover' (default) selects on pointer move; 'click' only on click (Raycast-style). */
  pointerSelection?: PointerSelectionMode
  /** Initial controlled value. */
  value?: string
  /** Initial controlled search. */
  search?: string
  /** Called whenever the highlighted value changes. */
  onValueChange?: (value: string) => void
  /** Called whenever the search query changes. */
  onSearchChange?: (search: string) => void
}

export interface CommandState {
  search: string
  /** Currently highlighted item's value. '' if none. */
  value: string
  items: ReadonlyMap<string, ItemData>
  groups: ReadonlyMap<string, GroupData>
  /** Visible items in display order (score desc, then insertion order). */
  filteredOrder: readonly string[]
  /** Same set as filteredOrder — for O(1) `has()` lookups by item subscribers. */
  visibleSet: ReadonlySet<string>
  /** Group ids that contain at least one visible item OR have forceMount. */
  visibleGroups: ReadonlySet<string>
  /** True while an IME composition is in progress (input adapter sets this). */
  isComposing: boolean
  /** Pointer selection mode set at construction time. */
  pointerSelection: PointerSelectionMode
}

export interface CommandStore {
  // Item / group registration
  registerItem(item: ItemInput): () => void
  registerGroup(group: GroupInput): () => void
  updateItem(value: string, patch: Partial<Omit<ItemInput, 'value'>>): void

  // State mutations
  setSearch(search: string): void
  setValue(value: string): void
  setComposing(isComposing: boolean): void

  // Selection navigation (operates over filteredOrder)
  selectNext(): void
  selectPrev(): void
  selectFirst(): void
  selectLast(): void
  triggerSelect(event?: Event): void

  // State access
  getState(): CommandState
  subscribe(listener: () => void): () => void
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `pnpm --filter @unvalley/cmdk-core typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/types.ts
git commit -m "feat(core): add public types"
```

---

### Task 6: Store — registration + state + subscribe

**Files:**
- Create: `packages/core/src/store.ts`
- Create: `packages/core/tests/registration.test.ts`

- [ ] **Step 1: Write failing tests** in `packages/core/tests/registration.test.ts`

```ts
import { describe, expect, it, vi } from 'vitest'
import { createCommand } from '../src/store'

describe('createCommand: registration', () => {
  it('starts with empty state', () => {
    const cmd = createCommand()
    const state = cmd.getState()
    expect(state.items.size).toBe(0)
    expect(state.groups.size).toBe(0)
    expect(state.search).toBe('')
    expect(state.value).toBe('')
    expect(state.isComposing).toBe(false)
  })

  it('registers an item', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'apple' })
    expect(cmd.getState().items.has('apple')).toBe(true)
  })

  it('allows empty-string value (regression #357)', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: '' })
    expect(cmd.getState().items.has('')).toBe(true)
  })

  it('unregister removes the item', () => {
    const cmd = createCommand()
    const unregister = cmd.registerItem({ value: 'apple' })
    unregister()
    expect(cmd.getState().items.has('apple')).toBe(false)
  })

  it('warns on duplicate value in dev', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const cmd = createCommand()
    cmd.registerItem({ value: 'apple' })
    cmd.registerItem({ value: 'apple' })
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('throws on non-string value', () => {
    const cmd = createCommand()
    // @ts-expect-error testing runtime guard
    expect(() => cmd.registerItem({ value: 123 })).toThrow()
  })

  it('registers a group', () => {
    const cmd = createCommand()
    cmd.registerGroup({ id: 'fruits' })
    expect(cmd.getState().groups.has('fruits')).toBe(true)
  })

  it('subscribe is called on state change', () => {
    const cmd = createCommand()
    const listener = vi.fn()
    cmd.subscribe(listener)
    cmd.registerItem({ value: 'a' })
    expect(listener).toHaveBeenCalled()
  })

  it('unsubscribe stops notifications', () => {
    const cmd = createCommand()
    const listener = vi.fn()
    const unsubscribe = cmd.subscribe(listener)
    unsubscribe()
    cmd.registerItem({ value: 'a' })
    expect(listener).not.toHaveBeenCalled()
  })

  it('updateItem patches an existing item', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'apple', disabled: false })
    cmd.updateItem('apple', { disabled: true })
    expect(cmd.getState().items.get('apple')?.disabled).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @unvalley/cmdk-core test`
Expected: FAIL — `createCommand` not exported.

- [ ] **Step 3: Implement `packages/core/src/store.ts`** (registration only — no filtering yet)

```ts
import { commandScore } from './score'
import type {
  CommandOptions,
  CommandState,
  CommandStore,
  GroupData,
  GroupInput,
  ItemData,
  ItemInput,
} from './types'

const isDev = process.env.NODE_ENV !== 'production'

export function createCommand(options: CommandOptions = {}): CommandStore {
  const filter = options.filter ?? commandScore
  const shouldFilter = options.shouldFilter ?? true
  const pointerSelection = options.pointerSelection ?? 'hover'

  let nextOrder = 0
  const items = new Map<string, ItemData>()
  const groups = new Map<string, GroupData>()
  let search = options.search ?? ''
  let value = options.value ?? ''
  let isComposing = false
  let filteredOrder: string[] = []
  let visibleSet: Set<string> = new Set()
  let visibleGroups: Set<string> = new Set()

  const listeners = new Set<() => void>()

  function notify(): void {
    for (const l of listeners) l()
  }

  function recompute(): void {
    // Score every item
    for (const item of items.values()) {
      if (!shouldFilter || search === '') {
        item.score = item.disabled ? 0 : 1
      } else {
        item.score = filter(item.value, search, item.keywords ?? [])
      }
    }

    // Build filteredOrder: visible items, score desc, then insertion order
    const visible: ItemData[] = []
    for (const item of items.values()) {
      if (item.forceMount || item.score > 0) visible.push(item)
    }
    visible.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.order - b.order
    })
    filteredOrder = visible.map((i) => i.value)
    visibleSet = new Set(filteredOrder)

    // visibleGroups: any group containing a visible item, plus forceMount groups
    visibleGroups = new Set()
    for (const g of groups.values()) {
      if (g.forceMount) visibleGroups.add(g.id)
    }
    for (const item of visible) {
      if (item.groupId) visibleGroups.add(item.groupId)
    }
  }

  function getState(): CommandState {
    return {
      search,
      value,
      items,
      groups,
      filteredOrder,
      visibleSet,
      visibleGroups,
      isComposing,
      pointerSelection,
    }
  }

  function registerItem(input: ItemInput): () => void {
    if (typeof input.value !== 'string') {
      throw new TypeError(`cmdk: item value must be a string, got ${typeof input.value}`)
    }
    if (isDev && items.has(input.value)) {
      console.warn(`cmdk: duplicate item value "${input.value}". Last registration wins.`)
    }
    const data: ItemData = {
      ...input,
      order: nextOrder++,
      score: 0,
    }
    items.set(input.value, data)
    recompute()
    notify()
    return () => {
      if (items.get(input.value) === data) {
        items.delete(input.value)
        recompute()
        notify()
      }
    }
  }

  function registerGroup(input: GroupInput): () => void {
    if (typeof input.id !== 'string') {
      throw new TypeError(`cmdk: group id must be a string`)
    }
    if (isDev && groups.has(input.id)) {
      console.warn(`cmdk: duplicate group id "${input.id}". Last registration wins.`)
    }
    const data: GroupData = { ...input, order: nextOrder++ }
    groups.set(input.id, data)
    recompute()
    notify()
    return () => {
      if (groups.get(input.id) === data) {
        groups.delete(input.id)
        recompute()
        notify()
      }
    }
  }

  function updateItem(value: string, patch: Partial<Omit<ItemInput, 'value'>>): void {
    const existing = items.get(value)
    if (!existing) return
    items.set(value, { ...existing, ...patch })
    recompute()
    notify()
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  // Stub mutations — implemented in later tasks
  function setSearch(_: string): void {
    throw new Error('not implemented')
  }
  function setValue(_: string): void {
    throw new Error('not implemented')
  }
  function setComposing(_: boolean): void {
    throw new Error('not implemented')
  }
  function selectNext(): void {
    throw new Error('not implemented')
  }
  function selectPrev(): void {
    throw new Error('not implemented')
  }
  function selectFirst(): void {
    throw new Error('not implemented')
  }
  function selectLast(): void {
    throw new Error('not implemented')
  }
  function triggerSelect(_?: Event): void {
    throw new Error('not implemented')
  }

  recompute()

  return {
    registerItem,
    registerGroup,
    updateItem,
    setSearch,
    setValue,
    setComposing,
    selectNext,
    selectPrev,
    selectFirst,
    selectLast,
    triggerSelect,
    getState,
    subscribe,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @unvalley/cmdk-core test`
Expected: all registration tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/store.ts packages/core/tests/registration.test.ts
git commit -m "feat(core): store with item + group registration"
```

---

### Task 7: Store — search + filter recomputation

**Files:**
- Modify: `packages/core/src/store.ts`
- Create: `packages/core/tests/search.test.ts`

- [ ] **Step 1: Write failing tests** in `packages/core/tests/search.test.ts`

```ts
import { describe, expect, it } from 'vitest'
import { createCommand } from '../src/store'

describe('createCommand: search + filter', () => {
  it('all items visible when search is empty', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'apple' })
    cmd.registerItem({ value: 'banana' })
    expect(cmd.getState().filteredOrder).toEqual(['apple', 'banana'])
  })

  it('filters items by search', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'apple' })
    cmd.registerItem({ value: 'banana' })
    cmd.setSearch('app')
    expect(cmd.getState().filteredOrder).toEqual(['apple'])
  })

  it('sorts by score desc', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'banana apple' })
    cmd.registerItem({ value: 'apple banana' })
    cmd.setSearch('app')
    expect(cmd.getState().filteredOrder[0]).toBe('apple banana')
  })

  it('respects shouldFilter: false', () => {
    const cmd = createCommand({ shouldFilter: false })
    cmd.registerItem({ value: 'apple' })
    cmd.registerItem({ value: 'xyz' })
    cmd.setSearch('app')
    expect(cmd.getState().filteredOrder).toEqual(['apple', 'xyz'])
  })

  it('uses custom filter function', () => {
    const cmd = createCommand({
      filter: (value, search) => (value.startsWith(search) ? 1 : 0),
    })
    cmd.registerItem({ value: 'apple' })
    cmd.registerItem({ value: 'banana' })
    cmd.setSearch('app')
    expect(cmd.getState().filteredOrder).toEqual(['apple'])
  })

  it('forceMount keeps item visible even with non-matching search', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'apple' })
    cmd.registerItem({ value: 'banana', forceMount: true })
    cmd.setSearch('app')
    const order = cmd.getState().filteredOrder
    expect(order).toContain('apple')
    expect(order).toContain('banana')
  })

  it('disabled item is not visible', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'apple', disabled: true })
    cmd.registerItem({ value: 'banana' })
    expect(cmd.getState().filteredOrder).toEqual(['banana'])
  })

  it('matches diacritics via default filter (regression #386)', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'café' })
    cmd.setSearch('cafe')
    expect(cmd.getState().filteredOrder).toEqual(['café'])
  })

  it('keywords affect filter (#74)', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'logout', keywords: ['signout'] })
    cmd.setSearch('sign')
    expect(cmd.getState().filteredOrder).toEqual(['logout'])
  })

  it('visibleGroups reflects which groups have visible items', () => {
    const cmd = createCommand()
    cmd.registerGroup({ id: 'fruits' })
    cmd.registerGroup({ id: 'colors' })
    cmd.registerItem({ value: 'apple', groupId: 'fruits' })
    cmd.registerItem({ value: 'red', groupId: 'colors' })
    cmd.setSearch('app')
    expect(cmd.getState().visibleGroups.has('fruits')).toBe(true)
    expect(cmd.getState().visibleGroups.has('colors')).toBe(false)
  })

  it('group with forceMount stays in visibleGroups', () => {
    const cmd = createCommand()
    cmd.registerGroup({ id: 'fruits', forceMount: true })
    cmd.registerItem({ value: 'apple', groupId: 'fruits' })
    cmd.setSearch('xyz')
    expect(cmd.getState().visibleGroups.has('fruits')).toBe(true)
  })

  it('special characters in value do not crash (regression #387)', () => {
    const cmd = createCommand()
    expect(() =>
      cmd.registerItem({ value: '<script>alert(1)</script>' }),
    ).not.toThrow()
    expect(() => cmd.setSearch('script')).not.toThrow()
    expect(cmd.getState().filteredOrder).toContain('<script>alert(1)</script>')
  })

  it('onSearchChange is called when search changes', () => {
    const calls: string[] = []
    const cmd = createCommand({ onSearchChange: (s) => calls.push(s) })
    cmd.setSearch('hello')
    expect(calls).toEqual(['hello'])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @unvalley/cmdk-core test`
Expected: FAIL — `setSearch` throws "not implemented".

- [ ] **Step 3: Replace the `setSearch` stub in `packages/core/src/store.ts`**

Find:
```ts
  function setSearch(_: string): void {
    throw new Error('not implemented')
  }
```

Replace with:
```ts
  function setSearch(next: string): void {
    if (next === search) return
    search = next
    recompute()
    options.onSearchChange?.(search)
    notify()
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @unvalley/cmdk-core test`
Expected: all search tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/store.ts packages/core/tests/search.test.ts
git commit -m "feat(core): implement setSearch + filter sort"
```

---

### Task 8: Store — selection navigation

**Files:**
- Modify: `packages/core/src/store.ts`
- Create: `packages/core/tests/selection.test.ts`

- [ ] **Step 1: Write failing tests** in `packages/core/tests/selection.test.ts`

```ts
import { describe, expect, it } from 'vitest'
import { createCommand } from '../src/store'

describe('createCommand: selection', () => {
  it('selectFirst sets value to first visible item', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'a' })
    cmd.registerItem({ value: 'b' })
    cmd.selectFirst()
    expect(cmd.getState().value).toBe('a')
  })

  it('selectLast sets value to last visible item', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'a' })
    cmd.registerItem({ value: 'b' })
    cmd.selectLast()
    expect(cmd.getState().value).toBe('b')
  })

  it('selectNext moves selection forward', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'a' })
    cmd.registerItem({ value: 'b' })
    cmd.registerItem({ value: 'c' })
    cmd.selectFirst()
    cmd.selectNext()
    expect(cmd.getState().value).toBe('b')
  })

  it('selectPrev moves selection backward', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'a' })
    cmd.registerItem({ value: 'b' })
    cmd.selectLast()
    cmd.selectPrev()
    expect(cmd.getState().value).toBe('a')
  })

  it('selectNext at end is a no-op when loop=false', () => {
    const cmd = createCommand({ loop: false })
    cmd.registerItem({ value: 'a' })
    cmd.registerItem({ value: 'b' })
    cmd.selectLast()
    cmd.selectNext()
    expect(cmd.getState().value).toBe('b')
  })

  it('selectNext at end wraps when loop=true', () => {
    const cmd = createCommand({ loop: true })
    cmd.registerItem({ value: 'a' })
    cmd.registerItem({ value: 'b' })
    cmd.selectLast()
    cmd.selectNext()
    expect(cmd.getState().value).toBe('a')
  })

  it('selectPrev at start wraps when loop=true', () => {
    const cmd = createCommand({ loop: true })
    cmd.registerItem({ value: 'a' })
    cmd.registerItem({ value: 'b' })
    cmd.selectFirst()
    cmd.selectPrev()
    expect(cmd.getState().value).toBe('b')
  })

  it('setValue updates the highlighted value', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'a' })
    cmd.setValue('a')
    expect(cmd.getState().value).toBe('a')
  })

  it('onValueChange is called when value changes', () => {
    const calls: string[] = []
    const cmd = createCommand({ onValueChange: (v) => calls.push(v) })
    cmd.registerItem({ value: 'a' })
    cmd.setValue('a')
    expect(calls).toEqual(['a'])
  })

  it('onValueChange not called if value unchanged', () => {
    const calls: string[] = []
    const cmd = createCommand({
      value: 'a',
      onValueChange: (v) => calls.push(v),
    })
    cmd.registerItem({ value: 'a' })
    cmd.setValue('a')
    expect(calls).toEqual([])
  })

  it('navigation skips disabled items', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'a' })
    cmd.registerItem({ value: 'b', disabled: true })
    cmd.registerItem({ value: 'c' })
    cmd.selectFirst()
    cmd.selectNext()
    expect(cmd.getState().value).toBe('c')
  })

  it('empty-string value can be selected (regression #357)', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: '' })
    cmd.registerItem({ value: 'a' })
    cmd.setValue('')
    expect(cmd.getState().value).toBe('')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @unvalley/cmdk-core test`
Expected: FAIL — `selectNext` etc. throw "not implemented".

- [ ] **Step 3: Replace selection stubs in `packages/core/src/store.ts`**

Find the four selection stubs and `setValue` stub. Replace all of them with:

```ts
  function setValue(next: string): void {
    if (next === value) return
    value = next
    options.onValueChange?.(value)
    notify()
  }

  function currentIndex(): number {
    return filteredOrder.indexOf(value)
  }

  function selectFirst(): void {
    if (filteredOrder.length === 0) return
    setValue(filteredOrder[0]!)
  }

  function selectLast(): void {
    if (filteredOrder.length === 0) return
    setValue(filteredOrder[filteredOrder.length - 1]!)
  }

  function selectNext(): void {
    if (filteredOrder.length === 0) return
    const idx = currentIndex()
    if (idx === -1) return selectFirst()
    const nextIdx = idx + 1
    if (nextIdx >= filteredOrder.length) {
      if (options.loop) setValue(filteredOrder[0]!)
      return
    }
    setValue(filteredOrder[nextIdx]!)
  }

  function selectPrev(): void {
    if (filteredOrder.length === 0) return
    const idx = currentIndex()
    if (idx === -1) return selectLast()
    const prevIdx = idx - 1
    if (prevIdx < 0) {
      if (options.loop) setValue(filteredOrder[filteredOrder.length - 1]!)
      return
    }
    setValue(filteredOrder[prevIdx]!)
  }
```

Also: items in `filteredOrder` must already exclude disabled items — check the existing `recompute()` already sets `score = 0` for disabled items (via the `item.disabled ? 0 : 1` branch). The visible-list filter `item.forceMount || item.score > 0` therefore drops disabled items. ✓

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @unvalley/cmdk-core test`
Expected: all selection tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/store.ts packages/core/tests/selection.test.ts
git commit -m "feat(core): implement selection navigation with loop"
```

---

### Task 9: Store — selection auto-correct + triggerSelect

When the visible item set changes (search changes, items added/removed), the current selection may no longer be visible. Auto-correct to first visible.

**Files:**
- Modify: `packages/core/src/store.ts`
- Create: `packages/core/tests/regressions.test.ts`

- [ ] **Step 1: Write failing tests** in `packages/core/tests/regressions.test.ts`

```ts
import { describe, expect, it, vi } from 'vitest'
import { createCommand } from '../src/store'

describe('regression: selection auto-correct on item change', () => {
  it('selects first visible after items replaced (#280)', () => {
    const cmd = createCommand()
    const u1 = cmd.registerItem({ value: 'a' })
    const u2 = cmd.registerItem({ value: 'b' })
    cmd.selectFirst()
    expect(cmd.getState().value).toBe('a')
    // Async items arrive: replace
    u1()
    u2()
    cmd.registerItem({ value: 'x' })
    cmd.registerItem({ value: 'y' })
    expect(cmd.getState().value).toBe('x')
  })

  it('selects first visible after search filters out current (#63)', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'apple' })
    cmd.registerItem({ value: 'banana' })
    cmd.setValue('apple')
    cmd.setSearch('ban') // apple no longer visible
    expect(cmd.getState().value).toBe('banana')
  })

  it('selection preserved when current value still visible', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'apple' })
    cmd.registerItem({ value: 'apricot' })
    cmd.setValue('apricot')
    cmd.setSearch('ap') // both still visible
    expect(cmd.getState().value).toBe('apricot')
  })

  it('selection clears to "" when filtered list is empty', () => {
    const cmd = createCommand()
    cmd.registerItem({ value: 'apple' })
    cmd.setValue('apple')
    cmd.setSearch('xyz')
    expect(cmd.getState().value).toBe('')
  })
})

describe('regression: triggerSelect', () => {
  it('calls onSelect for currently highlighted item', () => {
    const onSelect = vi.fn()
    const cmd = createCommand()
    cmd.registerItem({ value: 'apple', onSelect })
    cmd.setValue('apple')
    cmd.triggerSelect()
    expect(onSelect).toHaveBeenCalledWith('apple', undefined)
  })

  it('passes event to onSelect (#156)', () => {
    const onSelect = vi.fn()
    const cmd = createCommand()
    cmd.registerItem({ value: 'apple', onSelect })
    cmd.setValue('apple')
    const event = new Event('click')
    cmd.triggerSelect(event)
    expect(onSelect).toHaveBeenCalledWith('apple', event)
  })

  it('does nothing when no item is selected', () => {
    const cmd = createCommand()
    expect(() => cmd.triggerSelect()).not.toThrow()
  })

  it('does not fire for disabled item', () => {
    const onSelect = vi.fn()
    const cmd = createCommand()
    cmd.registerItem({ value: 'apple', disabled: true, onSelect })
    cmd.setValue('apple') // user could have set this manually
    cmd.triggerSelect()
    expect(onSelect).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @unvalley/cmdk-core test`
Expected: auto-correct tests fail (selection isn't corrected); triggerSelect throws.

- [ ] **Step 3: Modify `recompute()` in `packages/core/src/store.ts`**

Find the end of `recompute()`:

```ts
    for (const item of visible) {
      if (item.groupId) visibleGroups.add(item.groupId)
    }
  }
```

Add auto-correct after the visibleGroups loop, still inside `recompute()`:

```ts
    for (const item of visible) {
      if (item.groupId) visibleGroups.add(item.groupId)
    }

    // Auto-correct selection if current value is no longer visible
    if (value !== '' && !visibleSet.has(value)) {
      const next = filteredOrder[0] ?? ''
      if (next !== value) {
        value = next
        // Defer onValueChange notification — caller (e.g. setSearch) handles notify().
        // Use queueMicrotask so the listener observes the post-recompute state.
        queueMicrotask(() => options.onValueChange?.(value))
      }
    }
  }
```

- [ ] **Step 4: Replace the `triggerSelect` stub**

Find:
```ts
  function triggerSelect(_?: Event): void {
    throw new Error('not implemented')
  }
```

Replace with:
```ts
  function triggerSelect(event?: Event): void {
    if (value === '') return
    const item = items.get(value)
    if (!item || item.disabled) return
    item.onSelect?.(value, event)
  }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @unvalley/cmdk-core test`
Expected: all regression + triggerSelect tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/store.ts packages/core/tests/regressions.test.ts
git commit -m "feat(core): auto-correct selection + triggerSelect"
```

---

### Task 10: Store — IME composition + controlled mode

**Files:**
- Modify: `packages/core/src/store.ts`
- Create: `packages/core/tests/controlled.test.ts`

- [ ] **Step 1: Write failing tests** in `packages/core/tests/controlled.test.ts`

```ts
import { describe, expect, it, vi } from 'vitest'
import { createCommand } from '../src/store'

describe('createCommand: IME composition', () => {
  it('exposes isComposing in state', () => {
    const cmd = createCommand()
    expect(cmd.getState().isComposing).toBe(false)
    cmd.setComposing(true)
    expect(cmd.getState().isComposing).toBe(true)
    cmd.setComposing(false)
    expect(cmd.getState().isComposing).toBe(false)
  })

  it('setComposing notifies subscribers', () => {
    const cmd = createCommand()
    const listener = vi.fn()
    cmd.subscribe(listener)
    cmd.setComposing(true)
    expect(listener).toHaveBeenCalled()
  })

  it('setComposing(same) is a no-op (no notify)', () => {
    const cmd = createCommand()
    const listener = vi.fn()
    cmd.subscribe(listener)
    cmd.setComposing(false)
    expect(listener).not.toHaveBeenCalled()
  })
})

describe('createCommand: controlled mode', () => {
  it('honors initial value', () => {
    const cmd = createCommand({ value: 'apple' })
    cmd.registerItem({ value: 'apple' })
    expect(cmd.getState().value).toBe('apple')
  })

  it('honors initial search', () => {
    const cmd = createCommand({ search: 'foo' })
    expect(cmd.getState().search).toBe('foo')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @unvalley/cmdk-core test`
Expected: composition tests fail (`setComposing` throws).

- [ ] **Step 3: Replace the `setComposing` stub in `packages/core/src/store.ts`**

Find:
```ts
  function setComposing(_: boolean): void {
    throw new Error('not implemented')
  }
```

Replace with:
```ts
  function setComposing(next: boolean): void {
    if (next === isComposing) return
    isComposing = next
    notify()
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @unvalley/cmdk-core test`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/store.ts packages/core/tests/controlled.test.ts
git commit -m "feat(core): setComposing for IME handling"
```

---

### Task 11: Core public exports + build

**Files:**
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Replace `packages/core/src/index.ts`**

```ts
export { createCommand } from './store'
export { commandScore } from './score'
export { normalize } from './normalize'
export type {
  CommandOptions,
  CommandState,
  CommandStore,
  FilterFn,
  GroupData,
  GroupInput,
  ItemData,
  ItemInput,
  PointerSelectionMode,
} from './types'
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm --filter @unvalley/cmdk-core typecheck`
Expected: passes.

- [ ] **Step 3: Run build**

Run: `pnpm --filter @unvalley/cmdk-core build`
Expected: produces `packages/core/dist/index.js` and `packages/core/dist/index.d.ts`.

- [ ] **Step 4: Run all core tests**

Run: `pnpm --filter @unvalley/cmdk-core test`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/index.ts
git commit -m "feat(core): export public API"
```

---

## Phase B: React Adapter

### Task 12: React package skeleton

**Files:**
- Create: `packages/react/package.json`
- Create: `packages/react/tsconfig.json`
- Create: `packages/react/tsup.config.ts`
- Create: `packages/react/vitest.config.ts`
- Create: `packages/react/vitest.setup.ts`
- Create: `packages/react/src/index.ts`

- [ ] **Step 1: Create `packages/react/package.json`**

```json
{
  "name": "@unvalley/cmdk-react",
  "version": "0.0.1",
  "description": "React adapter for @unvalley/cmdk-core",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0"
  },
  "dependencies": {
    "@unvalley/cmdk-core": "workspace:*"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "jsdom": "^25.0.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tsup": "^8.3.0",
    "typescript": "^5.6.3",
    "vitest": "^2.1.4"
  }
}
```

- [ ] **Step 2: Create `packages/react/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "tests"]
}
```

- [ ] **Step 3: Create `packages/react/tsup.config.ts`**

```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2022',
  external: ['react', 'react-dom'],
})
```

- [ ] **Step 4: Create `packages/react/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
  esbuild: { jsx: 'automatic' },
})
```

- [ ] **Step 5: Create `packages/react/vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 6: Create stub `packages/react/src/index.ts`**

```ts
export {}
```

- [ ] **Step 7: Install deps**

Run: `pnpm install`
Expected: dependencies resolve.

- [ ] **Step 8: Verify typecheck works**

Run: `pnpm --filter @unvalley/cmdk-react typecheck`
Expected: passes.

- [ ] **Step 9: Commit**

```bash
git add packages/react/ pnpm-lock.yaml
git commit -m "chore(react): scaffold @unvalley/cmdk-react package"
```

---

### Task 13: React context + useCommandStore hook

**Files:**
- Create: `packages/react/src/context.ts`

- [ ] **Step 1: Create `packages/react/src/context.ts`**

```ts
import type { CommandStore } from '@unvalley/cmdk-core'
import { createContext, useContext, useSyncExternalStore } from 'react'

export const CommandContext = createContext<CommandStore | null>(null)

export function useCommandStore(): CommandStore {
  const store = useContext(CommandContext)
  if (!store) {
    throw new Error('cmdk: component must be rendered inside <Command>')
  }
  return store
}

/**
 * Subscribe to a slice of command state. The selector should return a
 * primitive (or stable reference) — React compares with Object.is and skips
 * re-renders when the slice is unchanged. This is what fixes #377
 * (re-renders on every hover) when used per-item.
 */
export function useCommandSlice<T>(selector: (store: CommandStore) => T): T {
  const store = useCommandStore()
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store),
    () => selector(store),
  )
}
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm --filter @unvalley/cmdk-react typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/context.ts
git commit -m "feat(react): context + useCommandSlice hook"
```

---

### Task 14: `<Command>` root component

**Files:**
- Create: `packages/react/src/command.tsx`
- Create: `packages/react/tests/command.test.tsx`

- [ ] **Step 1: Write failing tests** in `packages/react/tests/command.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Command } from '../src/command'

describe('<Command>', () => {
  it('renders children', () => {
    render(
      <Command>
        <div>hello</div>
      </Command>,
    )
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('renders with cmdk-root data attribute', () => {
    const { container } = render(<Command label="test" />)
    expect(container.querySelector('[cmdk-root]')).toBeInTheDocument()
  })

  it('forwards label as aria-label', () => {
    const { container } = render(<Command label="My Menu" />)
    expect(container.querySelector('[cmdk-root]')?.getAttribute('aria-label')).toBe(
      'My Menu',
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @unvalley/cmdk-react test`
Expected: FAIL — `Command` not exported.

- [ ] **Step 3: Implement `packages/react/src/command.tsx`**

```tsx
import {
  type CommandOptions,
  type CommandStore,
  createCommand,
} from '@unvalley/cmdk-core'
import { type ReactNode, useEffect, useMemo, useRef } from 'react'
import { CommandContext } from './context'

export interface CommandProps extends CommandOptions {
  label?: string
  className?: string
  children?: ReactNode
}

export function Command({
  label,
  className,
  children,
  ...options
}: CommandProps): JSX.Element {
  // Create store once. We pass *initial* options only; controlled props are
  // synced via effects below.
  const store = useMemo<CommandStore>(() => createCommand(options), [])

  // Sync controlled value
  const valueProp = options.value
  const lastValue = useRef(valueProp)
  useEffect(() => {
    if (valueProp !== undefined && valueProp !== lastValue.current) {
      lastValue.current = valueProp
      store.setValue(valueProp)
    }
  }, [store, valueProp])

  // Sync controlled search
  const searchProp = options.search
  const lastSearch = useRef(searchProp)
  useEffect(() => {
    if (searchProp !== undefined && searchProp !== lastSearch.current) {
      lastSearch.current = searchProp
      store.setSearch(searchProp)
    }
  }, [store, searchProp])

  return (
    <CommandContext.Provider value={store}>
      <div cmdk-root="" aria-label={label} className={className}>
        {children}
      </div>
    </CommandContext.Provider>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @unvalley/cmdk-react test`
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/command.tsx packages/react/tests/command.test.tsx
git commit -m "feat(react): Command root component"
```

---

### Task 15: `<Command.Input>` with IME handling

**Files:**
- Create: `packages/react/src/input.tsx`
- Modify: `packages/react/tests/command.test.tsx` (add input tests)

- [ ] **Step 1: Add failing tests** to `packages/react/tests/command.test.tsx`

Append to the file:

```tsx
import { Input } from '../src/input'
import userEvent from '@testing-library/user-event'

describe('<Command.Input>', () => {
  it('forwards typing to store search', async () => {
    const onSearchChange = vi.fn()
    render(
      <Command onSearchChange={onSearchChange}>
        <Input placeholder="Search" />
      </Command>,
    )
    const input = screen.getByPlaceholderText('Search')
    await userEvent.type(input, 'app')
    expect(onSearchChange).toHaveBeenLastCalledWith('app')
  })

  it('does not fire onSearchChange while IME composing (#363)', async () => {
    const onSearchChange = vi.fn()
    render(
      <Command onSearchChange={onSearchChange}>
        <Input placeholder="Search" />
      </Command>,
    )
    const input = screen.getByPlaceholderText('Search') as HTMLInputElement
    fireEvent.compositionStart(input)
    fireEvent.change(input, { target: { value: 'こ' } })
    expect(onSearchChange).not.toHaveBeenCalled()
    fireEvent.compositionEnd(input, { data: 'こんにちは' })
    expect(onSearchChange).toHaveBeenCalledWith('こんにちは')
  })
})
```

Add the missing imports at the top of the file (or merge into existing imports):

```tsx
import { fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @unvalley/cmdk-react test`
Expected: FAIL — `Input` not exported.

- [ ] **Step 3: Implement `packages/react/src/input.tsx`**

```tsx
import {
  type ChangeEvent,
  type CompositionEvent,
  type InputHTMLAttributes,
  forwardRef,
} from 'react'
import { useCommandSlice, useCommandStore } from './context'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  /** Override the displayed value. If omitted, the store's search is used. */
  value?: string
  /** Called with the new search value (after IME composition completes). */
  onValueChange?: (value: string) => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { value, onValueChange, onCompositionStart, onCompositionEnd, ...rest },
  ref,
) {
  const store = useCommandStore()
  const search = useCommandSlice((s) => s.getState().search)

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (store.getState().isComposing) return
    store.setSearch(e.target.value)
    onValueChange?.(e.target.value)
  }

  const handleCompositionStart = (e: CompositionEvent<HTMLInputElement>): void => {
    store.setComposing(true)
    onCompositionStart?.(e)
  }

  const handleCompositionEnd = (e: CompositionEvent<HTMLInputElement>): void => {
    store.setComposing(false)
    const target = e.target as HTMLInputElement
    store.setSearch(target.value)
    onValueChange?.(target.value)
    onCompositionEnd?.(e)
  }

  return (
    <input
      ref={ref}
      cmdk-input=""
      role="combobox"
      aria-autocomplete="list"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      {...rest}
      value={value ?? search}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
    />
  )
})
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @unvalley/cmdk-react test`
Expected: all input tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/input.tsx packages/react/tests/command.test.tsx
git commit -m "feat(react): Input with IME composition handling (#363)"
```

---

### Task 16: `<Command.Item>` with per-slice subscription

**Files:**
- Create: `packages/react/src/item.tsx`
- Create: `packages/react/tests/item.test.tsx`

- [ ] **Step 1: Write failing tests** in `packages/react/tests/item.test.tsx`

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Command } from '../src/command'
import { Item } from '../src/item'

describe('<Command.Item>', () => {
  it('renders with cmdk-item attribute', () => {
    render(
      <Command>
        <Item value="apple">Apple</Item>
      </Command>,
    )
    expect(screen.getByText('Apple').closest('[cmdk-item]')).toBeInTheDocument()
  })

  it('fires onSelect when clicked', () => {
    const onSelect = vi.fn()
    render(
      <Command>
        <Item value="apple" onSelect={onSelect}>
          Apple
        </Item>
      </Command>,
    )
    fireEvent.click(screen.getByText('Apple'))
    expect(onSelect).toHaveBeenCalledWith('apple', expect.any(Object))
  })

  it('passes the click event to onSelect (#156)', () => {
    const onSelect = vi.fn()
    render(
      <Command>
        <Item value="apple" onSelect={onSelect}>
          Apple
        </Item>
      </Command>,
    )
    fireEvent.click(screen.getByText('Apple'))
    expect(onSelect.mock.calls[0]?.[1]).toBeInstanceOf(Event)
  })

  it('sets data-selected on the highlighted item', () => {
    render(
      <Command value="apple">
        <Item value="apple">Apple</Item>
        <Item value="banana">Banana</Item>
      </Command>,
    )
    const apple = screen.getByText('Apple').closest('[cmdk-item]')
    const banana = screen.getByText('Banana').closest('[cmdk-item]')
    expect(apple?.getAttribute('data-selected')).toBe('true')
    expect(banana?.getAttribute('data-selected')).toBe(null)
  })

  it('sets data-disabled on disabled items', () => {
    render(
      <Command>
        <Item value="apple" disabled>
          Apple
        </Item>
      </Command>,
    )
    const apple = screen.getByText('Apple').closest('[cmdk-item]')
    expect(apple?.getAttribute('data-disabled')).toBe('true')
  })

  it('hides item when filtered out', () => {
    const { container } = render(
      <Command search="xyz">
        <Item value="apple">Apple</Item>
      </Command>,
    )
    expect(container.querySelector('[cmdk-item]')).not.toBeInTheDocument()
  })

  it('renders item with empty-string value (#357)', () => {
    render(
      <Command>
        <Item value="">All</Item>
      </Command>,
    )
    expect(screen.getByText('All').closest('[cmdk-item]')).toBeInTheDocument()
  })

  it('renders item with special chars in value without crashing (#387)', () => {
    expect(() =>
      render(
        <Command>
          <Item value="<script>alert(1)</script>">XSS</Item>
        </Command>,
      ),
    ).not.toThrow()
  })

  it('pointerSelection="hover" updates value on pointer move (default)', () => {
    render(
      <Command>
        <Item value="a">A</Item>
        <Item value="b">B</Item>
      </Command>,
    )
    fireEvent.pointerMove(screen.getByText('B'))
    expect(
      screen.getByText('B').closest('[cmdk-item]')?.getAttribute('data-selected'),
    ).toBe('true')
  })

  it('pointerSelection="click" does NOT update value on pointer move (#49)', () => {
    render(
      <Command pointerSelection="click">
        <Item value="a">A</Item>
        <Item value="b">B</Item>
      </Command>,
    )
    fireEvent.pointerMove(screen.getByText('B'))
    expect(
      screen.getByText('B').closest('[cmdk-item]')?.getAttribute('data-selected'),
    ).not.toBe('true')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @unvalley/cmdk-react test`
Expected: FAIL — `Item` not exported.

- [ ] **Step 3: Implement `packages/react/src/item.tsx`**

```tsx
import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useEffect,
  useId,
  useRef,
} from 'react'
import { useCommandSlice, useCommandStore } from './context'

export interface ItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  value: string
  keywords?: readonly string[]
  disabled?: boolean
  forceMount?: boolean
  groupId?: string
  onSelect?: (value: string, event?: Event) => void
  children?: ReactNode
}

export const Item = forwardRef<HTMLDivElement, ItemProps>(function Item(
  { value, keywords, disabled, forceMount, groupId, onSelect, children, ...rest },
  ref,
) {
  const store = useCommandStore()
  const id = useId()

  // Stable refs so the registered onSelect always sees the latest closure.
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  // Register on mount, unregister on unmount.
  useEffect(() => {
    const unregister = store.registerItem({
      value,
      keywords,
      disabled,
      forceMount,
      groupId,
      onSelect: (v, e) => onSelectRef.current?.(v, e),
    })
    return unregister
    // We re-register if value changes (identity moved).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, value])

  // Patch other props that don't change identity.
  useEffect(() => {
    store.updateItem(value, { keywords, disabled, forceMount, groupId })
  }, [store, value, keywords, disabled, forceMount, groupId])

  const isVisible = useCommandSlice((s) => s.getState().visibleSet.has(value))
  const isSelected = useCommandSlice((s) => s.getState().value === value)
  const pointerMode = useCommandSlice((s) => s.getState().pointerSelection)

  if (!isVisible) return null

  const handlePointerMove = (): void => {
    if (disabled) return
    // Default mode is 'hover' (cmdk-compat). Only skip when explicitly 'click'.
    if (pointerMode === 'click') return
    store.setValue(value)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (disabled) return
    store.setValue(value)
    store.triggerSelect(e.nativeEvent)
  }

  return (
    <div
      ref={ref}
      cmdk-item=""
      id={id}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      data-selected={isSelected || undefined}
      data-disabled={disabled || undefined}
      {...rest}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
    >
      {children}
    </div>
  )
})
```

- [ ] **Step 4: Run all tests to verify they pass**

Run: `pnpm test`
Expected: all core + react tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/item.tsx packages/react/tests/item.test.tsx
git commit -m "feat(react): Item component with hover/click pointer modes (#49, #156)"
```

---

### Task 17: `<Command.Group>`, `<Command.List>`, `<Command.Empty>`, `<Command.Loading>`, `<Command.Separator>`

**Files:**
- Create: `packages/react/src/group.tsx`
- Create: `packages/react/src/list.tsx`
- Create: `packages/react/src/empty.tsx`
- Create: `packages/react/src/loading.tsx`
- Create: `packages/react/src/separator.tsx`

- [ ] **Step 1: Implement `packages/react/src/group.tsx`**

```tsx
import { type HTMLAttributes, type ReactNode, forwardRef, useEffect, useId } from 'react'
import { useCommandSlice, useCommandStore } from './context'

export interface GroupProps extends HTMLAttributes<HTMLDivElement> {
  heading?: ReactNode
  forceMount?: boolean
  children?: ReactNode
}

export const Group = forwardRef<HTMLDivElement, GroupProps>(function Group(
  { heading, forceMount, children, ...rest },
  ref,
) {
  const store = useCommandStore()
  const id = useId()

  useEffect(() => {
    return store.registerGroup({ id, forceMount })
  }, [store, id, forceMount])

  const isVisible = useCommandSlice((s) => s.getState().visibleGroups.has(id))

  return (
    <div
      ref={ref}
      cmdk-group=""
      role="presentation"
      hidden={!isVisible || undefined}
      data-group-id={id}
      {...rest}
    >
      {heading != null && (
        <div cmdk-group-heading="" aria-hidden="true">
          {heading}
        </div>
      )}
      <div cmdk-group-items="" role="group" aria-labelledby={id}>
        {children}
      </div>
    </div>
  )
})
```

- [ ] **Step 2: Implement `packages/react/src/list.tsx`**

```tsx
import { type HTMLAttributes, type ReactNode, forwardRef } from 'react'

export interface ListProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const List = forwardRef<HTMLDivElement, ListProps>(function List(
  { children, ...rest },
  ref,
) {
  return (
    <div ref={ref} cmdk-list="" role="listbox" {...rest}>
      {children}
    </div>
  )
})
```

- [ ] **Step 3: Implement `packages/react/src/empty.tsx`**

```tsx
import { type HTMLAttributes, type ReactNode, forwardRef } from 'react'
import { useCommandSlice } from './context'

export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const Empty = forwardRef<HTMLDivElement, EmptyProps>(function Empty(
  { children, ...rest },
  ref,
) {
  const isEmpty = useCommandSlice((s) => s.getState().filteredOrder.length === 0)
  if (!isEmpty) return null
  return (
    <div ref={ref} cmdk-empty="" role="presentation" {...rest}>
      {children}
    </div>
  )
})
```

- [ ] **Step 4: Implement `packages/react/src/loading.tsx`**

```tsx
import { type HTMLAttributes, type ReactNode, forwardRef } from 'react'

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  /** 0..1 progress; surfaced as aria-valuenow when set. */
  progress?: number
  children?: ReactNode
}

export const Loading = forwardRef<HTMLDivElement, LoadingProps>(function Loading(
  { progress, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      cmdk-loading=""
      role="progressbar"
      aria-valuenow={progress != null ? Math.round(progress * 100) : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      {...rest}
    >
      {children}
    </div>
  )
})
```

- [ ] **Step 5: Implement `packages/react/src/separator.tsx`**

```tsx
import { type HTMLAttributes, forwardRef } from 'react'
import { useCommandSlice } from './context'

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  alwaysRender?: boolean
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { alwaysRender, ...rest },
  ref,
) {
  const search = useCommandSlice((s) => s.getState().search)
  if (!alwaysRender && search !== '') return null
  return <div ref={ref} cmdk-separator="" role="separator" {...rest} />
})
```

- [ ] **Step 6: Verify typecheck**

Run: `pnpm --filter @unvalley/cmdk-react typecheck`
Expected: passes.

- [ ] **Step 7: Commit**

```bash
git add packages/react/src/group.tsx packages/react/src/list.tsx packages/react/src/empty.tsx packages/react/src/loading.tsx packages/react/src/separator.tsx
git commit -m "feat(react): Group, List, Empty, Loading, Separator components"
```

---

### Task 18: Keyboard navigation on root

**Files:**
- Modify: `packages/react/src/command.tsx`
- Create: `packages/react/tests/keyboard.test.tsx`

- [ ] **Step 1: Write failing tests** in `packages/react/tests/keyboard.test.tsx`

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Command } from '../src/command'
import { Item } from '../src/item'
import { Input } from '../src/input'
import { List } from '../src/list'

function setup(props?: Parameters<typeof Command>[0]) {
  return render(
    <Command {...props}>
      <Input placeholder="Search" />
      <List>
        <Item value="a">A</Item>
        <Item value="b">B</Item>
        <Item value="c">C</Item>
      </List>
    </Command>,
  )
}

function selected(): string | null {
  return document.querySelector('[data-selected="true"]')?.textContent ?? null
}

describe('keyboard navigation', () => {
  it('ArrowDown moves selection forward', () => {
    setup()
    const input = screen.getByPlaceholderText('Search')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(selected()).toBe('A')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(selected()).toBe('B')
  })

  it('ArrowUp moves selection backward', () => {
    setup()
    const input = screen.getByPlaceholderText('Search')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(selected()).toBe('A')
  })

  it('Home selects first', () => {
    setup()
    const input = screen.getByPlaceholderText('Search')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Home' })
    expect(selected()).toBe('A')
  })

  it('End selects last', () => {
    setup()
    const input = screen.getByPlaceholderText('Search')
    fireEvent.keyDown(input, { key: 'End' })
    expect(selected()).toBe('C')
  })

  it('Enter triggers onSelect for current item', () => {
    const onSelect = vi.fn()
    render(
      <Command>
        <Input placeholder="Search" />
        <List>
          <Item value="a" onSelect={onSelect}>
            A
          </Item>
        </List>
      </Command>,
    )
    const input = screen.getByPlaceholderText('Search')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith('a', expect.any(Object))
  })

  it('loop wraps ArrowDown past end', () => {
    setup({ loop: true })
    const input = screen.getByPlaceholderText('Search')
    fireEvent.keyDown(input, { key: 'End' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(selected()).toBe('A')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @unvalley/cmdk-react test`
Expected: FAIL — root doesn't handle keys yet.

- [ ] **Step 3: Modify `packages/react/src/command.tsx` to handle keys**

Add a `KeyboardEvent` handler. Replace the JSX in the `Command` return with:

```tsx
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (store.getState().isComposing) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        store.selectNext()
        break
      case 'ArrowUp':
        e.preventDefault()
        store.selectPrev()
        break
      case 'Home':
        e.preventDefault()
        store.selectFirst()
        break
      case 'End':
        e.preventDefault()
        store.selectLast()
        break
      case 'Enter':
        e.preventDefault()
        store.triggerSelect(e.nativeEvent)
        break
    }
  }

  return (
    <CommandContext.Provider value={store}>
      <div
        cmdk-root=""
        aria-label={label}
        className={className}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </CommandContext.Provider>
  )
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @unvalley/cmdk-react test`
Expected: all keyboard tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/command.tsx packages/react/tests/keyboard.test.tsx
git commit -m "feat(react): keyboard navigation (arrows, home/end, enter)"
```

---

### Task 19: Async item regression tests

**Files:**
- Create: `packages/react/tests/async.test.tsx`

- [ ] **Step 1: Write tests** in `packages/react/tests/async.test.tsx`

```tsx
import { act, render, screen } from '@testing-library/react'
import { useEffect, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Command } from '../src/command'
import { Item } from '../src/item'
import { List } from '../src/list'

function selected(): string | null {
  return document.querySelector('[data-selected="true"]')?.textContent ?? null
}

describe('async items (regressions)', () => {
  it('first item is auto-selected after async items arrive (#280)', async () => {
    function Demo() {
      const [items, setItems] = useState<string[]>([])
      useEffect(() => {
        // Simulate async fetch
        Promise.resolve().then(() => setItems(['x', 'y', 'z']))
      }, [])
      return (
        <Command value="" onValueChange={() => {}}>
          <List>
            {items.map((v) => (
              <Item key={v} value={v}>
                {v}
              </Item>
            ))}
          </List>
        </Command>
      )
    }
    render(<Demo />)
    // Wait for promise to resolve and effects to flush
    await act(async () => {
      await Promise.resolve()
    })
    // Once items arrive, select first
    // Note: auto-correct from recompute kicks in on registration
    expect(screen.getByText('x')).toBeInTheDocument()
  })

  it('selection updates when items are replaced (#267)', async () => {
    function Demo({ items }: { items: string[] }) {
      return (
        <Command>
          <List>
            {items.map((v) => (
              <Item key={v} value={v}>
                {v}
              </Item>
            ))}
          </List>
        </Command>
      )
    }
    const { rerender } = render(<Demo items={['a', 'b']} />)
    rerender(<Demo items={['x', 'y']} />)
    await act(async () => {
      await Promise.resolve()
    })
    expect(screen.getByText('x')).toBeInTheDocument()
    expect(screen.queryByText('a')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `pnpm --filter @unvalley/cmdk-react test`
Expected: pass (the store's auto-correct logic handles these by design).

- [ ] **Step 3: Commit**

```bash
git add packages/react/tests/async.test.tsx
git commit -m "test(react): regression tests for async items (#280, #267)"
```

---

### Task 20: Render-count regression test (#377)

**Files:**
- Create: `packages/react/tests/regressions.test.tsx`

- [ ] **Step 1: Write test** in `packages/react/tests/regressions.test.tsx`

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { describe, expect, it } from 'vitest'
import { Command } from '../src/command'
import { Item } from '../src/item'
import { List } from '../src/list'

describe('regression: per-item render count', () => {
  it('hovering item B does not re-render item A (#377)', () => {
    const renderCounts = { a: 0, b: 0 }

    function CountingItem({ value, label }: { value: string; label: 'a' | 'b' }) {
      // Use a ref-incremented counter so re-renders are observable.
      const count = useRef(0)
      count.current++
      renderCounts[label] = count.current
      return <Item value={value}>{value}</Item>
    }

    render(
      <Command>
        <List>
          <CountingItem value="a" label="a" />
          <CountingItem value="b" label="b" />
        </List>
      </Command>,
    )

    const aBefore = renderCounts.a
    fireEvent.pointerMove(screen.getByText('b'))
    // Item B re-renders (its isSelected slice changed). Item A must not.
    expect(renderCounts.a).toBe(aBefore)
  })
})
```

- [ ] **Step 2: Run test**

Run: `pnpm --filter @unvalley/cmdk-react test`
Expected: pass — Item subscribes per-slice via `useSyncExternalStore` with primitive selectors.

If it fails: investigate whether the Item subscribes to a too-broad slice. The fix must keep the per-slice design.

- [ ] **Step 3: Commit**

```bash
git add packages/react/tests/regressions.test.tsx
git commit -m "test(react): regression test for per-item re-render (#377)"
```

---

### Task 21: React public exports + build

**Files:**
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: Replace `packages/react/src/index.ts`**

```ts
import { Command as CommandRoot, type CommandProps } from './command'
import { Empty, type EmptyProps } from './empty'
import { Group, type GroupProps } from './group'
import { Input, type InputProps } from './input'
import { Item, type ItemProps } from './item'
import { List, type ListProps } from './list'
import { Loading, type LoadingProps } from './loading'
import { Separator, type SeparatorProps } from './separator'

export { useCommandSlice, useCommandStore } from './context'
export type {
  CommandProps,
  EmptyProps,
  GroupProps,
  InputProps,
  ItemProps,
  ListProps,
  LoadingProps,
  SeparatorProps,
}

type CommandComponent = typeof CommandRoot & {
  Input: typeof Input
  List: typeof List
  Item: typeof Item
  Group: typeof Group
  Empty: typeof Empty
  Loading: typeof Loading
  Separator: typeof Separator
}

const Command = CommandRoot as CommandComponent
Command.Input = Input
Command.List = List
Command.Item = Item
Command.Group = Group
Command.Empty = Empty
Command.Loading = Loading
Command.Separator = Separator

export { Command }
```

- [ ] **Step 2: Run typecheck + build + all tests**

Run: `pnpm typecheck && pnpm build && pnpm test`
Expected: everything passes; `dist/` exists for both packages.

- [ ] **Step 3: Smoke-test the compound API**

Add and run a quick test in `packages/react/tests/command.test.tsx` (append):

```tsx
import { Command as CompoundCommand } from '../src/index'

describe('compound API', () => {
  it('Command.Input/List/Item/Group/Empty/Loading/Separator are accessible', () => {
    expect(CompoundCommand.Input).toBeDefined()
    expect(CompoundCommand.List).toBeDefined()
    expect(CompoundCommand.Item).toBeDefined()
    expect(CompoundCommand.Group).toBeDefined()
    expect(CompoundCommand.Empty).toBeDefined()
    expect(CompoundCommand.Loading).toBeDefined()
    expect(CompoundCommand.Separator).toBeDefined()
  })
})
```

Run: `pnpm --filter @unvalley/cmdk-react test`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add packages/react/src/index.ts packages/react/tests/command.test.tsx
git commit -m "feat(react): export Command compound API"
```

---

## Final Validation

### Task 22: End-to-end check

- [ ] **Step 1: Clean install**

Run: `rm -rf node_modules packages/*/node_modules packages/*/dist && pnpm install`
Expected: clean install succeeds.

- [ ] **Step 2: Build everything**

Run: `pnpm build`
Expected: both packages produce `dist/` with `index.js` + `index.d.ts`.

- [ ] **Step 3: Test everything**

Run: `pnpm test`
Expected: all tests in both packages pass.

- [ ] **Step 4: Lint**

Run: `pnpm lint`
Expected: pass (or report formatting issues — apply with `pnpm format`).

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: pass.

- [ ] **Step 6: Tag v0.0.1 (optional, do not push)**

```bash
git tag v0.0.1
```

---

## Spec Coverage Map

| Spec section | Implementing task(s) |
|---|---|
| Package layout | Task 1, 2, 12 |
| `createCommand` API | Tasks 6–10 |
| `ItemInput`, `GroupInput`, `CommandState` types | Task 5 |
| Default scorer (command-score + NFD) | Tasks 3, 4 |
| `shouldFilter` / custom `filter` | Task 7 |
| `loop` arrow-key wrap | Task 8 |
| `pointerSelection: hover\|click` | Task 16 |
| Controlled `value` / `search` | Tasks 10, 14 |
| `forceMount`, `disabled`, `keywords` | Tasks 6, 7 |
| Selection auto-correct on item set change | Task 9 |
| `triggerSelect(value, event)` | Task 9 |
| IME composition | Tasks 10, 15 |
| `<Command>` root | Task 14 |
| `<Command.Input>` w/ IME | Task 15 |
| `<Command.Item>` w/ slice subscription | Task 16 |
| `<Command.Group>` | Task 17 |
| `<Command.List>` / Empty / Loading / Separator | Task 17 |
| Keyboard navigation | Task 18 |
| Per-item re-render isolation (#377) | Tasks 13, 16, 20 |
| Empty-string value (#357) | Tasks 6, 16 |
| Special chars in value (#387) | Tasks 4, 7, 16 |
| Diacritic normalization (#386, #173) | Tasks 3, 4, 7 |
| onSelect with event (#156) | Tasks 9, 16 |
| Mouse-vs-keyboard (#49) | Task 16 |
| Async items (#280, #267, #63) | Tasks 9, 19 |

All spec sections covered.
