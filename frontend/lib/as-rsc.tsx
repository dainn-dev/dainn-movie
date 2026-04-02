import type { JSX } from "react"

/** Casts async Server Component for JSX (avoids TS2786 with `jsx: preserve` + tsc). Runtime unchanged. */
export function asRsc<P extends object = Record<string, never>>(
  C: (props: P) => Promise<JSX.Element>,
): (props: P) => JSX.Element {
  return C as unknown as (props: P) => JSX.Element
}
