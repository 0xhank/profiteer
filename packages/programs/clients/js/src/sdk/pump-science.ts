import { Keypair, keypairIdentity, Pda, Program, PublicKey, Umi } from "@metaplex-foundation/umi";
import { createSplAssociatedTokenProgram, createSplTokenProgram } from '@metaplex-foundation/mpl-toolbox';
import { PUMP_SCIENCE_PROGRAM_ID, createPumpScienceProgram, fetchGlobal, findGlobalPda } from "../generated";
import { findEvtAuthorityPda } from "../utils";
import { AdminSDK } from "./admin";
import { CurveSDK } from "./curve";
import { WlSDK } from "./whitelist";
import { AnchorProvider } from "@coral-xyz/anchor";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

export class PumpScienceSDK {
    umi: Umi;

    programId: PublicKey;

    program: Program;

    globalPda: Pda;

    evtAuthPda: Pda;

    evtAuthAccs: {
        eventAuthority: PublicKey,
        program: PublicKey
    }

    provider: AnchorProvider;
    masterKp: Keypair;

    constructor(provider: AnchorProvider, masterKp: Keypair) {
        this.provider = provider;
        this.masterKp = masterKp;
        this.umi = createUmi(this.provider.connection.rpcEndpoint).use(keypairIdentity(this.masterKp));
        const pumpScienceProgram = createPumpScienceProgram();
        this.programId = PUMP_SCIENCE_PROGRAM_ID;
        this.program = pumpScienceProgram;
        this.umi.programs.add(createSplAssociatedTokenProgram());
        this.umi.programs.add(createSplTokenProgram());
        this.umi.programs.add(pumpScienceProgram);
        this.globalPda = findGlobalPda(this.umi);
        this.evtAuthPda = findEvtAuthorityPda(this.umi);
        this.evtAuthAccs = {
            eventAuthority: this.evtAuthPda[0],
            program: PUMP_SCIENCE_PROGRAM_ID,
        };

    }

    async fetchGlobalData() {
        return fetchGlobal(this.umi, this.globalPda);
    }

    getAdminSDK() {
        return new AdminSDK(this);
    }

    getCurveSDK(mint: PublicKey) {
        return new CurveSDK(this, mint);
    }

    getWlSDK(creator: PublicKey) {
        return new WlSDK(this, creator);
    }
}
