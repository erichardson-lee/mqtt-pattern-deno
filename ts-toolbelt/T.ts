// deno-lint-ignore-file
import { Equals } from "./equals.ts";
export type Boolean = 0 | 1;

/**
 * Test should pass
 */
export type Pass = 1;

/**
 * Test should fail
 */
export type Fail = 0;

/**
 * Check or test the validity of a type
 * @param debug to debug with parameter hints (`ctrl+p`, `ctrl+shift+space`)
 * @example
 * ```ts
 * // see in `tst` folder
 * ```
 */
export function check<Type, Expect, Outcome extends Boolean>(
  debug?: Type,
): Equals<Equals<Type, Expect>, Outcome> {
  //@ts-expect-error Returns true 100% of the time
  return true;
}

/**
 * Validates a batch of [[check]]
 * @param checks a batch of [[check]]
 * @example
 * ```ts
 * // see in `tst` folder
 * ```
 */
export function checks(checks: 1[]): void {}
