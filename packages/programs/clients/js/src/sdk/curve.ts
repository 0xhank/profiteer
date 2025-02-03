import { Program } from "@coral-xyz/anchor";
import { Amm, AmmIdl } from "@mercurial-finance/dynamic-amm-sdk";
import { getVaultPdas, VaultIdl } from "@mercurial-finance/vault-sdk";
import { findAssociatedTokenPda, SPL_ASSOCIATED_TOKEN_PROGRAM_ID } from "@metaplex-foundation/mpl-toolbox";
import { createSignerFromKeypair, Keypair, Pda, PublicKey, RpcGetAccountOptions, TransactionBuilder, Umi } from "@metaplex-foundation/umi";
import { fromWeb3JsPublicKey, toWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { publicKey as publicKeySerializer, string } from '@metaplex-foundation/umi/serializers';
import { NATIVE_MINT } from "@solana/spl-token";
import { SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY, PublicKey as Web3PublicKey } from "@solana/web3.js";
import {
    createBondingCurve,
    CreateBondingCurveInstructionDataArgs,
    createPool,
    CreatePoolInstructionAccounts,
    fetchBondingCurve,
    findBondingCurvePda,
    PUMP_SCIENCE_PROGRAM_ID,
    swap,
    SwapInstructionArgs
} from "..";
import { AMM_PROGRAM_ID, FEE_RECIPIENT, tokenMetadataProgramId, VAULT_PROGRAM_ID } from "../constants";
import { findWLPda } from "../utils";
import { PumpScienceSDK } from "./pump-science";

export class CurveSDK {
    PumpScience: PumpScienceSDK;
    umi: Umi;

    mint: PublicKey;
    bondingCurvePda: Pda;
    bondingCurveTokenAccount: Pda;
    bondingCurveSolEscrow: Pda;
    whitelistPda: Pda;
    mintMetaPda: Pda;

    constructor(sdk: PumpScienceSDK, mint: PublicKey) {
        this.PumpScience = sdk;
        this.umi = sdk.umi;
        this.mint = mint;

        this.bondingCurvePda = findBondingCurvePda(this.umi, {
            mint: this.mint,
        });
        this.bondingCurveTokenAccount = findAssociatedTokenPda(this.umi, {
            mint: this.mint,
            owner: this.bondingCurvePda[0],
        });
        this.bondingCurveSolEscrow = this.umi.eddsa.findPda(PUMP_SCIENCE_PROGRAM_ID, [
            string({ size: 'variable' }).serialize('sol-escrow'),
            publicKeySerializer().serialize(this.mint),
        ]);

        this.mintMetaPda = this.umi.eddsa.findPda(tokenMetadataProgramId, [
            string({ size: 'variable' }).serialize('metadata'),
            publicKeySerializer().serialize(tokenMetadataProgramId),
            publicKeySerializer().serialize(mint),
        ]);

        this.whitelistPda = findWLPda(this.umi, this.umi.identity.publicKey);
    }


    fetchData(options?: RpcGetAccountOptions) {
        return fetchBondingCurve(this.umi, this.bondingCurvePda[0], options);
    }

    swap(params: {
        direction: "buy" | "sell",
    } & Pick<SwapInstructionArgs, "exactInAmount" | "minOutAmount">) {
        const userTokenAccount = this.getUserTokenAccount(this.umi.identity.publicKey);
        return swap(this.umi, {
            global: this.PumpScience.globalPda[0],
            user: this.umi.identity,
            baseIn: params.direction !== "buy",
            exactInAmount: params.exactInAmount,
            minOutAmount: params.minOutAmount,
            mint: this.mint,
            bondingCurve: this.bondingCurvePda[0],
            bondingCurveTokenAccount: this.bondingCurveTokenAccount[0],
            bondingCurveSolEscrow: this.bondingCurveSolEscrow[0],
            userTokenAccount: userTokenAccount[0],
            feeReceiver: FEE_RECIPIENT,
            clock: fromWeb3JsPublicKey(SYSVAR_CLOCK_PUBKEY),
            associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
            ...this.PumpScience.evtAuthAccs,
        });
    }

    createBondingCurve(params: CreateBondingCurveInstructionDataArgs, mintKp: Keypair, whitelist: boolean) {
        // check mintKp is this.mint
        console.log("creating mint ===>>>", this.mint.toString());
        console.log("bondingCurveTokenAccount ===>>>", this.bondingCurveTokenAccount[0].toString());
        console.log("bondingCurvePda ===>>>", this.bondingCurvePda[0].toString());

        if (mintKp.publicKey.toString() !== this.mint.toString()) {
            throw new Error("wrong mintKp provided");
        }

        // Create bonding curve
        const createBondingCurveIx = createBondingCurve(this.umi, {
            global: this.PumpScience.globalPda[0],
            creator: this.umi.identity,
            mint: createSignerFromKeypair(this.umi, mintKp),
            bondingCurve: this.bondingCurvePda[0],
            bondingCurveTokenAccount: this.bondingCurveTokenAccount[0],
            bondingCurveSolEscrow: this.bondingCurveSolEscrow,
            metadata: this.mintMetaPda[0],
            ...this.PumpScience.evtAuthAccs,
            associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
            ...params,
            whitelist: whitelist ? this.whitelistPda[0] : undefined
        });

        console.log("this.whitelistPda[0]---->>>>", this.whitelistPda[0]);

        // Combine all instructions
        return new TransactionBuilder()
            .add(createBondingCurveIx);
    }

    getUserTokenAccount(user: PublicKey) {
        return findAssociatedTokenPda(this.umi, {
            mint: this.mint,
            owner: user,
        });
    }

    migrate() {

        const vaultProgramId = (VAULT_PROGRAM_ID);
        const meteoraProgramId = (AMM_PROGRAM_ID);

    const tokenAMint = NATIVE_MINT;
    const tokenBMint = new Web3PublicKey(this.mint);

    const [
        { vaultPda: aVault, tokenVaultPda: aTokenVault, lpMintPda: aLpMintPda },
        { vaultPda: bVault, tokenVaultPda: bTokenVault, lpMintPda: bLpMintPda },
    ] = [getVaultPdas(tokenAMint, toWeb3JsPublicKey(vaultProgramId)), getVaultPdas(tokenBMint, toWeb3JsPublicKey(vaultProgramId))];

    let aVaultLpMint = aLpMintPda;
    let bVaultLpMint = bLpMintPda;
 
    const params : CreatePoolInstructionAccounts = {
        global: this.PumpScience.globalPda[0],
        bondingCurve: this.bondingCurvePda[0],
        feeReceiver: FEE_RECIPIENT,
        pool: this.bondingCurvePda[0],
        config: this.PumpScience.globalPda[0],
        lpMint: this.bondingCurvePda[0],
        aVaultLp: fromWeb3JsPublicKey(aVaultLpMint),
        bVaultLp: fromWeb3JsPublicKey(bVaultLpMint),
        tokenAMint: fromWeb3JsPublicKey(tokenAMint),
        tokenBMint: fromWeb3JsPublicKey(tokenBMint),
        aVault: fromWeb3JsPublicKey(aVault),
        bVault: fromWeb3JsPublicKey(bVault),
        aTokenVault: fromWeb3JsPublicKey(aTokenVault),
        bTokenVault: fromWeb3JsPublicKey(bTokenVault),
        aVaultLpMint: fromWeb3JsPublicKey(aVaultLpMint),
        bVaultLpMint: fromWeb3JsPublicKey(bVaultLpMint),
        bondingCurveTokenAccount: this.bondingCurveTokenAccount[0],
        feeReceiverTokenAccount: this.getUserTokenAccount(FEE_RECIPIENT)[0],
        bondingCurveSolEscrow: this.bondingCurveSolEscrow[0],
        payerTokenA: this.getUserTokenAccount(this.umi.identity.publicKey)[0],
        payerTokenB: this.getUserTokenAccount(FEE_RECIPIENT)[0],
        payerPoolLp: this.getUserTokenAccount(this.umi.identity.publicKey)[0],
        protocolTokenAFee: this.getUserTokenAccount(FEE_RECIPIENT)[0],
        protocolTokenBFee: this.getUserTokenAccount(FEE_RECIPIENT)[0],
        mintMetadata: this.mintMetaPda[0],
        rent: fromWeb3JsPublicKey(SYSVAR_RENT_PUBKEY),
        metadataProgram: tokenMetadataProgramId,
        vaultProgram: (vaultProgramId),
        associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
        meteoraProgram: (meteoraProgramId),
    }

        const txBuilder = createPool(this.PumpScience.umi, params)
        return txBuilder;
    }
}
