const path = require("path");
const { generateIdl } = require("@metaplex-foundation/shank-js");

const idlDir = path.join(__dirname, "..", "idls");
const binaryInstallDir = path.join(__dirname, "..", ".crates");
const programDir = path.join(__dirname, "..", "programs");
const programId = "AKsYAeh8GeE2dvhfiPGURaNzC7SEDkNgmbrcDkmf4Qsz";

generateIdl({
  generator: "anchor",
  programName: "pump_science",
  programId,
  idlDir,
  binaryInstallDir,
  programDir: path.join(programDir, "pump-science"),
  rustbin: { locked: true },
});
