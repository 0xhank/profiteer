const path = require("path");
const { generateIdl } = require("@metaplex-foundation/shank-js");

const idlDir = path.join(__dirname, "..", "idls");
const binaryInstallDir = path.join(__dirname, "..", ".crates");
const programDir = path.join(__dirname, "..", "programs");
export const programId = "3f8czWoabRYKVvqeGfM1uKNj5rC7Dudpi8R3TkP1fGQQ";

generateIdl({
  generator: "anchor",
  programName: "pump_science",
  programId,
  idlDir,
  binaryInstallDir,
  programDir: path.join(programDir, "pump-science"),
  rustbin: { locked: true },
});
