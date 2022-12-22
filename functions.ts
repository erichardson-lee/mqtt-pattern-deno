import type { CleanTopic, FillTopic, MqttParameters } from "./parameters.d.ts";
import type { F } from "./ts-toolbelt/mod.ts";

const MULTI_P = "#" as const;
const SINGLE_P = "+" as const;
const SEPARATOR = "/" as const;

/**
 * Extract parameters from a topic based on the pattern provided
 * @param pattern Pattern to match against
 * @param topic Topic to extract parameters from
 */
export function exec<Pattern extends string>(
  pattern: Pattern,
  topic: string,
): MqttParameters<Pattern> | null {
  return matches(pattern, topic) ? extract(pattern, topic) : null;
}

/**
 * Tests if a topic is valid for a certain pattern.
 * @param pattern Pattern to match against
 * @param topic Topic to test
 */
export function matches(pattern: string, topic: string): boolean {
  const pSegments = pattern.split(SEPARATOR);
  const tSegments = topic.split(SEPARATOR);

  for (let sId = 0; sId < pSegments.length; sId++) {
    const pSegment = pSegments[sId];
    const pChar = pSegment[0];

    // If we get to a # segment, and haven't failed, succeed if it's the last
    // section of the pattern
    if (pChar === MULTI_P) return sId === pSegments.length - 1;

    // single parameter, move to the next segment and ignore
    if (pChar === SINGLE_P) continue;

    // If it's not a parameter and the segments don't match, fail
    if (
      pChar !== MULTI_P &&
      pChar !== SINGLE_P &&
      pSegment !== tSegments[sId]
    ) {
      return false;
    }
  }

  // If it's not returned false, then it _must_ match
  return true;
}

/**
 * Take a pattern and fill the parameters with the appropriate values
 * @param pattern Pattern to fill
 * @param params Parameters to insert into the pattern
 */
export function fill<
  Pattern extends string,
  Params extends MqttParameters<Pattern>,
>(pattern: Pattern, params: F.Narrow<Params>): FillTopic<Pattern, Params> {
  return pattern
    .split(SEPARATOR)
    .map((segment) => {
      const pChar = segment[0];
      const pName = segment.slice(1);

      //@ts-expect-error Error with the typing on the parameters
      const parameter = params[pName] as string | string[] | undefined;

      if (pChar === MULTI_P) {
        return (<string[] | undefined> parameter)?.join(SEPARATOR) ?? null;
      } else if (pChar === SINGLE_P) return "" + <string | undefined> parameter;
      else return segment;
    })
    .filter((a) => a != null) //  Remove null values
    .join(SEPARATOR) as FillTopic<Pattern, Params>;
}

/**
 * Extract parameter values from a topic using a pattern.
 *
 * This function doesn't check if the pattern matches before attempting
 * extraction, @see exec if you want to extract values, with assurances that the
 * topic actually matches the pattern..
 *
 * @deprecated use exec for safety on topic matching the pattern
 * @param pattern Pattern to extract using
 * @param topic Topic to extract values from
 */
export function extract<Pattern extends string>(
  pattern: Pattern,
  topic: string,
): MqttParameters<Pattern> {
  const pSegments = pattern.split(SEPARATOR);
  const tSegments = topic.split(SEPARATOR);

  const params: Record<string, string | string[]> = {};

  for (let sId = 0; sId < pSegments.length; sId++) {
    const pSegment = pSegments[sId];
    const pChar = pSegment[0];
    if (pSegment.length === 1) continue;

    if (pChar === SINGLE_P) {
      // single parameter
      const pName = pSegment.slice(1);
      const pValue = tSegments[sId];

      params[pName] = pValue;
      continue;
    }

    if (pChar === MULTI_P) {
      // Multilevel parameter, break out the loop
      const pName = pSegment.slice(1);
      const pValues = tSegments.slice(sId);

      params[pName] = pValues;
      break;
    }
  }

  return params as MqttParameters<Pattern>;
}

/**
 * Clean a pattern (remove any property names from wildcard segments)
 *
 * @param pattern Pattern to clean
 * @returns cleaned pattern safe for usage in subscriptions etc.
 */
export function clean<Pattern extends string>(
  pattern: Pattern,
): CleanTopic<Pattern> {
  return pattern
    .split(SEPARATOR)
    .map((tSegment) => {
      const pChar = tSegment[0];
      if (pChar === MULTI_P || pChar === SINGLE_P) return pChar;
      else return tSegment;
    })
    .join(SEPARATOR) as CleanTopic<Pattern>;
}
