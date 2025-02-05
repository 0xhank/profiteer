const path = require("path");
const { generateIdl } = require("@metaplex-foundation/shank-js");

const idlDir = path.join(__dirname, "..", "idls");
const binaryInstallDir = path.join(__dirname, "..", ".crates");
const programDir = path.join(__dirname, "..", "programs");
const programId = "BjbuCn9cWxLZFmRc7zQ4hwV45SyqZA5YSMKpvUUeeHvw";

generateIdl({
  generator: "anchor",
  programName: "pump_science",
  programId,
  idlDir,
  binaryInstallDir,
  programDir: path.join(programDir, "pump-science"),
  rustbin: { locked: true },
});
