import { clean, exec, extract, fill, matches } from "./mod.ts";
import { T } from "./ts-toolbelt/mod.ts";

// Exec
const execv = exec("foo/bar/+baz", "foo/bar/test");
T.checks([
  T.check<typeof execv, { baz: string } | null, T.Pass>(),
  T.check<typeof execv, { baz: string[] } | null, T.Fail>(),
]);

// Matches
const matchv = matches("foo/bar/+baz", "foo/bar/test");
T.check<typeof matchv, boolean, T.Pass>();

// Fill
const fillv = fill("foo/bar/+baz/#test", {
  baz: "test",
  test: ["v1", "v2"],
});
T.check<typeof fillv, "foo/bar/test/v1/v2", T.Pass>();

// Extract
const extractv = extract("foo/bar/+baz", "foo/bar/test");
T.checks([
  T.check<typeof extractv, { baz: string }, T.Pass>(),
  T.check<typeof extractv, { baz: string[] }, T.Fail>(),
]);

// Clean
const cleanv = clean("foo/bar/+baz");
T.check<typeof cleanv, "foo/bar/+", T.Pass>();
