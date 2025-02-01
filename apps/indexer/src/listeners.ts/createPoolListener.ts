import 
import { Connection } from "@solana/web3.js";
import {PUMP_SCIENCE_PROGRAM_ID} from "programs"
import {
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";

   export async function listenToCreateEvent(connection: Connection) {

  const program = anchor.workspace.Pump as Program<PumpScience>;
const subscriptionId = program.addEventListener("TransferEvent", (event) => {
  // Handle event...
});
       connection.onLogs(toWeb3JsPublicKey(PUMP_SCIENCE_PROGRAM_ID), (logs, context) => {
           console.log('New logs:', logs);
           // Parse the logs to find your specific event
           logs.logs.forEach(log => {
               if (log.includes('CreateEvent')) {
                   console.log('CreateEvent detected:', log);
                   // Further parse the log to extract event data
               }
           });
       });
   }