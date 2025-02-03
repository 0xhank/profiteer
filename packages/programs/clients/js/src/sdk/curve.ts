import { Program } from "@coral-xyz/anchor";
import { Amm, AmmIdl, PROGRAM_ID, VaultIdl } from "@mercurial-finance/dynamic-amm-sdk";
import { METAPLEX_PROGRAM } from "@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/constants";
import VaultImpl, { getVaultPdas, VaultIdl as VaultIdlType } from "@mercurial-finance/vault-sdk";
import { SEEDS } from "@mercurial-finance/vault-sdk/dist/cjs/src/vault/constants";
import { findAssociatedTokenPda, SPL_ASSOCIATED_TOKEN_PROGRAM_ID } from "@metaplex-foundation/mpl-toolbox";
import { createSignerFromKeypair, Keypair, Pda, PublicKey, RpcGetAccountOptions, TransactionBuilder, Umi } from "@metaplex-foundation/umi";
import { fromWeb3JsInstruction, fromWeb3JsPublicKey, toWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { publicKey as publicKeySerializer, string } from '@metaplex-foundation/umi/serializers';
import { getOrCreateATAInstruction } from "@meteora-ag/stake-for-fee";
import { ASSOCIATED_TOKEN_PROGRAM_ID, NATIVE_MINT, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AddressLookupTableProgram, SystemProgram, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY, TransactionInstruction, PublicKey as Web3PublicKey } from "@solana/web3.js";
import {
    createBondingCurve,
    CreateBondingCurveInstructionDataArgs,
    createPool,
    CreatePoolInstructionAccounts,
    fetchBondingCurve,
    findBondingCurvePda,
    lockPool,
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
    payer: PublicKey;

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
        this.payer = this.umi.identity.publicKey;
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


    async migrate() {

        console.log("migrating")
        // get the vault program
        const vaultProgram = new Program<VaultIdlType>(VaultIdl, VAULT_PROGRAM_ID, this.PumpScience.provider);
        const meteoraProgram = new Program<Amm>(AmmIdl, AMM_PROGRAM_ID, this.PumpScience.provider);
        const txBuilder = new TransactionBuilder();

        const global = this.PumpScience.globalPda[0];
        const bondingCurve = this.bondingCurvePda[0];
        const feeReceiver = FEE_RECIPIENT;
        const feeReceiverTokenAccount = this.getUserTokenAccount(FEE_RECIPIENT)[0];
        const poolPubkey = this.bondingCurvePda[0];
        const poolPubkeyWeb3 = toWeb3JsPublicKey(poolPubkey);
        const config = this.PumpScience.globalPda[0];
        const bondingCurveSolEscrow = this.bondingCurveSolEscrow[0];
        const payerPoolLp = this.getUserTokenAccount(this.umi.identity.publicKey)[0];
        const protocolTokenAFee = this.getUserTokenAccount(FEE_RECIPIENT)[0];
        const protocolTokenBFee = this.getUserTokenAccount(FEE_RECIPIENT)[0];
        
        

        const tokenAMint = NATIVE_MINT;
        const tokenBMint = new Web3PublicKey(this.mint);
        const preInstructions: Array<TransactionInstruction> = [];

        const { vaultPda: aVault, tokenVaultPda: aTokenVault, lpMintPda: aLpMintPda }= getVaultPdas(tokenAMint, toWeb3JsPublicKey(VAULT_PROGRAM_ID));
        const { vaultPda: bVault, tokenVaultPda: bTokenVault, lpMintPda: bLpMintPda }= getVaultPdas(tokenBMint, toWeb3JsPublicKey(VAULT_PROGRAM_ID));

        // first: create vault accounts
        // second: 

        let aVaultLpMint = aLpMintPda;
        let bVaultLpMint = bLpMintPda;

        const [aVaultAccount, bVaultAccount] = await Promise.all([
            vaultProgram.account.vault.fetchNullable(aVault),
            vaultProgram.account.vault.fetchNullable(bVault),
        ]);
        if (!aVaultAccount) {
            const createVaultAIx = await VaultImpl.createPermissionlessVaultInstruction(
                this.PumpScience.provider.connection,
                toWeb3JsPublicKey(this.PumpScience.masterKp.publicKey),
                tokenAMint
            );
            preInstructions.push(createVaultAIx);
        } else {
            aVaultLpMint = aVaultAccount.lpMint; // Old vault doesn't have lp mint pda
        }

        if (!bVaultAccount) {
            const createVaultBIx = await VaultImpl.createPermissionlessVaultInstruction(
                this.PumpScience.provider.connection,
                toWeb3JsPublicKey(this.PumpScience.masterKp.publicKey),
                tokenBMint
            );
            preInstructions.push(createVaultBIx);
        } else {
            bVaultLpMint = bVaultAccount.lpMint; // Old vault doesn't have lp mint pda
        }

    const [lpMint] = Web3PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.LP_MINT_PREFIX), poolPubkeyWeb3.toBuffer()],
        meteoraProgram.programId,
    );

    const [aVaultLp] =   Web3PublicKey.findProgramAddressSync([aVault.toBuffer(), poolPubkeyWeb3.toBuffer()], meteoraProgram.programId)
    const [bVaultLp] = Web3PublicKey.findProgramAddressSync([bVault.toBuffer(), poolPubkeyWeb3.toBuffer()], meteoraProgram.programId)

    const [{ataPubKey: payerTokenA, ix: payerTokenAIx}, {ataPubKey: payerTokenB, ix: payerTokenBIx}] = await Promise.all([
        getOrCreateATAInstruction(this.PumpScience.provider.connection, tokenAMint, toWeb3JsPublicKey(this.payer)),
        getOrCreateATAInstruction(this.PumpScience.provider.connection, tokenBMint, toWeb3JsPublicKey(this.payer)),
    ]);
        // Add addresses to lookup table
        if (payerTokenAIx) preInstructions.push(payerTokenAIx);
        if (payerTokenBIx) preInstructions.push(payerTokenBIx);
        
    const addresses : Web3PublicKey[] = [
        toWeb3JsPublicKey(global),
        toWeb3JsPublicKey(bondingCurve),
        toWeb3JsPublicKey(feeReceiver),
        toWeb3JsPublicKey(feeReceiverTokenAccount),
        toWeb3JsPublicKey(poolPubkey),
        toWeb3JsPublicKey(config),
        lpMint,
        tokenAMint,
        tokenBMint,
        aVault,
        bVault,
        aTokenVault,
        bTokenVault,
        aLpMintPda,
        bLpMintPda,
        aVaultLpMint,
        bVaultLpMint,
        payerTokenA,
        payerTokenB,
        toWeb3JsPublicKey(bondingCurveSolEscrow),
        toWeb3JsPublicKey(payerPoolLp),
        toWeb3JsPublicKey(protocolTokenAFee),
        toWeb3JsPublicKey(protocolTokenBFee),
        toWeb3JsPublicKey(this.payer),
        toWeb3JsPublicKey(this.mintMetaPda[0]),
        SYSVAR_RENT_PUBKEY,
        METAPLEX_PROGRAM,
        vaultProgram.programId,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
        SystemProgram.programId,
        new Web3PublicKey(PROGRAM_ID),
    ]
        const slot = await this.umi.rpc.getSlot();
        // const [createLookupTableInstruction, lookupTableId] = AddressLookupTableProgram.createLookupTable({
        //     authority: toWeb3JsPublicKey(this.umi.identity.publicKey),
        //     payer: toWeb3JsPublicKey(this.umi.identity.publicKey),
        //     recentSlot: slot - 200,
        // });


        // const addAddressesInstruction = AddressLookupTableProgram.extendLookupTable({
        //     payer: toWeb3JsPublicKey(this.umi.identity.publicKey),
        //     authority: toWeb3JsPublicKey(this.umi.identity.publicKey),
        //     lookupTable: lookupTableId,
        //     addresses: addresses.slice(0, 30) // Max 30 addresses per extend
        // });

        // // Add lookup table instructions to transaction
        // preInstructions.push(createLookupTableInstruction);
        // preInstructions.push(addAddressesInstruction);

        // preInstructions.map(ix => txBuilder.add({instruction: fromWeb3JsInstruction(ix),
        //     signers: [],
        //     bytesCreatedOnChain: 0
        // }));
        console.log("preInstructions ===>>>", preInstructions.length);
        console.log("txBuilder ===>>>", txBuilder.items.length);

        // Create pool
        const params : CreatePoolInstructionAccounts = {
            global: this.PumpScience.globalPda[0],
            bondingCurve: this.bondingCurvePda[0],
            feeReceiver: FEE_RECIPIENT,
            pool: this.bondingCurvePda[0],
            config: this.PumpScience.globalPda[0],
            lpMint: this.bondingCurvePda[0],
            aVaultLp: fromWeb3JsPublicKey(aVaultLp),
            bVaultLp: fromWeb3JsPublicKey(bVaultLp),
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
            vaultProgram: VAULT_PROGRAM_ID,
            associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
            meteoraProgram: AMM_PROGRAM_ID,
        }

        const createPoolIx = createPool(this.PumpScience.umi, params)

        console.log("createPoolIx:", createPoolIx);

        txBuilder.add(createPoolIx)

        console.log("txBuilder after createPool:", txBuilder.items);

        const lockPoolIx = lockPool(this.PumpScience.umi, {
            global: this.PumpScience.globalPda[0],
            bondingCurve: this.bondingCurvePda[0],
            bondingCurveSolEscrow: this.bondingCurveSolEscrow[0],
            pool: this.bondingCurvePda[0],
            lpMint: this.bondingCurvePda[0],
            aVaultLp: fromWeb3JsPublicKey(aVaultLpMint),
            bVaultLp: fromWeb3JsPublicKey(bVaultLpMint),
            tokenBMint: fromWeb3JsPublicKey(tokenBMint),
            aVault: fromWeb3JsPublicKey(aVault),
            bVault: fromWeb3JsPublicKey(bVault),
            aVaultLpMint: fromWeb3JsPublicKey(aVaultLpMint),
            bVaultLpMint: fromWeb3JsPublicKey(bVaultLpMint),
            payerPoolLp: this.getUserTokenAccount(this.umi.identity.publicKey)[0],
            payer: this.umi.identity,
            feeReceiver: FEE_RECIPIENT,
            tokenProgram: fromWeb3JsPublicKey(TOKEN_PROGRAM_ID),
            associatedTokenProgram: fromWeb3JsPublicKey(ASSOCIATED_TOKEN_PROGRAM_ID),
            systemProgram: fromWeb3JsPublicKey(SystemProgram.programId),
            lockEscrow: this.bondingCurveSolEscrow[0],
            escrowVault: this.getUserTokenAccount(FEE_RECIPIENT)[0],
            meteoraProgram: AMM_PROGRAM_ID,
            eventAuthority: this.PumpScience.evtAuthAccs.eventAuthority,
        })

        txBuilder.add(lockPoolIx)

        console.log("txBuilder ===>>>", txBuilder.items.length);

        return txBuilder;
    }
}
