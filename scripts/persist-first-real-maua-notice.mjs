import { persistFirstRealMauaNotice } from "../workers/collector/persist-first-real-notice.mjs";

const result = await persistFirstRealMauaNotice();
console.log(JSON.stringify(result));
