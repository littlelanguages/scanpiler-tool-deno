import * as Assert from "https://deno.land/std@0.63.0/testing/asserts.ts";
import { exec } from "https://deno.land/x/exec/mod.ts";

import { denoCommand } from "./mod.ts";

test("backtracking");
test("comments");
test("scanpiler");
test("simple");

function test(name: string) {
  Deno.test(name, async () => {
    await assertTest(name);
  });
}

async function assertTest(name: string) {
  await denoCommand(
    `./test/${name}/${name}.ll`,
    { directory: undefined, force: true, verbose: true },
  );
  const result = await exec(`cd ./test/${name}  ; deno test`);
  Assert.assertEquals(result.status.code, 0);
}