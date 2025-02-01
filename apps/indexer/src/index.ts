// #!/usr/bin/env node

import { Connection } from "@solana/web3.js";
import { listenToCreateEvent } from "./listeners.ts/createPoolListener";
import supabase from "./sbclient";
import { env } from "../bin/env";

/* --------------------------------- START --------------------------------- */
export const start = async () => {
  const connection = new Connection(env.RPC_URL, "confirmed")
  while (true) {
    listenToCreateEvent(connection)
  
  }
};
