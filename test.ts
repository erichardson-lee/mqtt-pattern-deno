import { clean, exec, extract, fill, matches } from "./mod.ts";
import {
  assert,
  assertEquals,
  assertFalse,
} from "https://deno.land/std@0.170.0/testing/asserts.ts";

// These tests were taken from the original MQTT-Pattern Library and modified to
// work with deno.

Deno.test("matches() supports patterns with no wildcards", () => {
  assert(matches("foo/bar/baz", "foo/bar/baz"), "Matched topic");
});

Deno.test("matches() doesn't match different topics", () => {
  assertFalse(matches("foo/bar/baz", "baz/bar/foo"), "Didn't match topic");
});

Deno.test("matches() supports patterns with # at the beginning", () => {
  assert(matches("#", "foo/bar/baz"), "Matched topic");
});

Deno.test("matches() supports patterns with # at the end", () => {
  assert(matches("foo/#", "foo/bar/baz"), "Matched topic");
});

Deno.test(
  "matches() supports patterns with # at the end and topic has no children",
  () => {
    assert(matches("foo/bar/#", "foo/bar"), "Matched childless topic");
  },
);

Deno.test("matches() doesn't support # wildcards with more after them", () => {
  assertFalse(matches("#/bar/baz", "foo/bar/baz"), "Didn't match topic");
});

Deno.test("matches() supports patterns with + at the beginning", () => {
  assert(matches("+/bar/baz", "foo/bar/baz"), "Matched topic");
});

Deno.test("matches() supports patterns with + at the end", () => {
  assert(matches("foo/bar/+", "foo/bar/baz"), "Matched topic");
});

Deno.test("matches() supports patterns with + in the middle", () => {
  assert(matches("foo/+/baz", "foo/bar/baz"), "Matched topic");
});

Deno.test("matches() supports patterns multiple wildcards", () => {
  assert(matches("foo/+/#", "foo/bar/baz"), "Matched topic");
});

Deno.test("matches() supports named wildcards", () => {
  assert(matches("foo/+something/#else", "foo/bar/baz"), "Matched topic");
});

Deno.test("matches() supports leading slashes", () => {
  assert(matches("/foo/bar", "/foo/bar"), "Matched topic");
  assertFalse(matches("/foo/bar", "/bar/foo"), "Didn't match invalid topic");
});

Deno.test(
  "extract() returns empty object of there's nothing to extract",
  () => {
    assertEquals(
      extract("foo/bar/baz", "foo/bar/baz"),
      {},
      "Extracted empty object",
    );
  },
);

Deno.test(
  "extract() returns empty object if wildcards don't have label",
  () => {
    assertEquals(
      extract("foo/+/#", "foo/bar/baz"),
      {},
      "Extracted empty object",
    );
  },
);

Deno.test("extract() returns object with an array for # wildcard", () => {
  assertEquals(
    extract("foo/#something", "foo/bar/baz"),
    {
      something: ["bar", "baz"],
    },
    "Extracted param",
  );
});

Deno.test("extract() returns object with a string for + wildcard", () => {
  assertEquals(
    extract("foo/+hello/+world", "foo/bar/baz"),
    {
      hello: "bar",
      world: "baz",
    },
    "Extracted params",
  );
});

Deno.test("extract() parses params from all wildcards", () => {
  assertEquals(
    extract("+hello/+world/#wow", "foo/bar/baz/fizz"),
    {
      hello: "foo",
      world: "bar",
      wow: ["baz", "fizz"],
    },
    "Extracted params",
  );
});

Deno.test("exec() returns null if it doesn't match", () => {
  assertEquals(exec("hello/world", "foo/bar/baz"), null, "Got null");
});

Deno.test("exec() returns params if they can be parsed", () => {
  assertEquals(
    exec("foo/+hello/#world", "foo/bar/baz"),
    {
      hello: "bar",
      world: ["baz"],
    },
    "Extracted params",
  );
});

Deno.test("fill() fills in pattern with both types of wildcards", () => {
  assertEquals(
    fill("foo/+hello/#world", {
      hello: "Hello",
      world: ["the", "world", "wow"],
    }),
    "foo/Hello/the/world/wow",
    "Filled in params",
  );
});

Deno.test("fill() fills missing + params with undefined", () => {
  //@ts-expect-error Intentially Missing Parameter
  assertEquals(fill("foo/+hello", {}), "foo/undefined", "Filled in params");
});

Deno.test("fill() ignores empty # params", () => {
  //@ts-expect-error Intentially Missing Parameter
  assertEquals(fill("foo/#hello", {}), "foo", "Filled in params");
});

Deno.test("fill() ignores non-named # params", () => {
  assertEquals(fill("foo/#", {}), "foo", "Filled in params");
});

Deno.test("fill() uses `undefined` for non-named + params", () => {
  assertEquals(fill("foo/+", {}), "foo/undefined", "Filled in params");
});

Deno.test("clean() removes parameter names", () => {
  assertEquals(
    clean("hello/+param1/world/#param2"),
    "hello/+/world/#",
    "Got hello/+/world/#",
  );
});

Deno.test("clean() works when there aren't any parameter names", () => {
  assertEquals(
    clean("hello/+/world/#"),
    "hello/+/world/#",
    "Got hello/+/world/#",
  );
});
