import { resolve } from "node:path";

import { collectPmsp } from "../workers/collector/pmsp-source.mjs";

const args = process.argv.slice(2);
const stateFlag = args.indexOf("--state");
const statePath = stateFlag >= 0 && args[stateFlag + 1]
  ? resolve(process.cwd(), args[stateFlag + 1])
  : resolve(process.cwd(), "work/pmsp-collection-state.json");

const result = await collectPmsp({ statePath });
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.runStatus === "failed" ? 1 : 0;
