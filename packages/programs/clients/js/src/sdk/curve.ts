import { Program, } from "@coral-xyz/anchor";
import { Amm, AmmIdl, VaultIdl } from "@mercurial-finance/dynamic-amm-sdk";
import VaultImpl, { getVaultPdas, VaultIdl as VaultIdlType } from "@mercurial-finance/vault-sdk";
import { SEEDS } from "@mercurial-finance/vault-sdk/dist/cjs/src/vault/constants";
import { findAssociatedTokenPda, setComputeUnitLimit, SPL_ASSOCIATED_TOKEN_PROGRAM_ID } from "@metaplex-foundation/mpl-toolbox";
import { Keypair, Pda, PublicKey, RpcGetAccountOptions, Signer, TransactionBuilder, Umi } from "@metaplex-foundation/umi";
import { fromWeb3JsPublicKey, toWeb3JsInstruction, toWeb3JsKeypair, toWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { publicKey as publicKeySerializer, string } from '@metaplex-foundation/umi/serializers';
import { deriveLockEscrowPda, getOrCreateATAInstruction } from "@meteora-ag/stake-for-fee";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createInitializeMint2Instruction, getAssociatedTokenAddressSync, getMinimumBalanceForRentExemptMint, MINT_SIZE, NATIVE_MINT, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AddressLookupTableProgram, SystemProgram, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY, TransactionInstruction, TransactionMessage, VersionedTransaction, PublicKey as Web3PublicKey } from "@solana/web3.js";

import { deriveMintMetadata, derivePoolAddressWithConfig } from "@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/utils";
import {
    confirmTransaction,
    createBondingCurve,
    CreateBondingCurveInstructionDataArgs,
    createPool,
    fetchBondingCurve,
    findBondingCurvePda,
    lockPool,
    PUMP_SCIENCE_PROGRAM_ID,
    swap,
    SwapInstructionArgs
} from "..";
import { AMM_PROGRAM_ID, FEE_RECIPIENT, METEORA_CONFIG, tokenMetadataProgramId, VAULT_PROGRAM_ID } from "../constants";
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

    async swap(params: {
        direction: "buy" | "sell",
        user: PublicKey,
    } & Pick<SwapInstructionArgs, "exactInAmount" | "minOutAmount">) {
        const userTokenAccount = this.getUserTokenAccount(params.user);
        let txBuilder = new TransactionBuilder()
        .add(setComputeUnitLimit(this.umi, { units: 600_000 }))
        .add(swap(this.umi, {
            global: this.PumpScience.globalPda[0],
            user: params.user as unknown as Signer,
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
        }));
        const blockhash = await this.PumpScience.provider.connection.getLatestBlockhash({commitment: 'confirmed'});
        const instructions = txBuilder.getInstructions().map(ix => toWeb3JsInstruction(ix))

            const message = new TransactionMessage({
                payerKey: toWeb3JsPublicKey(params.user),
                recentBlockhash: blockhash.blockhash,
                instructions: [...instructions],
            }).compileToV0Message();

        const tx = new VersionedTransaction(message);
        return tx;
    }

    async createMint(user: PublicKey, mintKp: Keypair) {
    const lamports = await getMinimumBalanceForRentExemptMint(this.PumpScience.provider.connection);

    const createMintInstructions = 
         [
            SystemProgram.createAccount({
                fromPubkey: toWeb3JsPublicKey(user),
                newAccountPubkey: toWeb3JsPublicKey(mintKp.publicKey),
                space: MINT_SIZE,
                lamports,
                programId: TOKEN_PROGRAM_ID,
            }),
            createInitializeMint2Instruction(
                toWeb3JsPublicKey(mintKp.publicKey), 
                6, 
                toWeb3JsPublicKey(this.bondingCurvePda[0]),
                toWeb3JsPublicKey(this.bondingCurvePda[0]),
                TOKEN_PROGRAM_ID
            ),
        ]

    return createMintInstructions;
    }
    async createBondingCurve(params: CreateBondingCurveInstructionDataArgs, mintKp: Keypair, user: PublicKey, whitelist: boolean) {
        if (this.mint.toString() !== mintKp.publicKey.toString()) {
            throw new Error("wrong mintKp provided");
        }
        const mintInstructions = await this.createMint(user, mintKp);


        const createBondingCurveBuilder = new TransactionBuilder()
            .add(setComputeUnitLimit(this.umi, { units: 600_000 }))
            .add(createBondingCurve(this.umi, {
                global: this.PumpScience.globalPda[0],
                creator: user as unknown as Signer,
                mint: this.mint,
                bondingCurve: this.bondingCurvePda[0],
                bondingCurveTokenAccount: this.bondingCurveTokenAccount[0],
                bondingCurveSolEscrow: this.bondingCurveSolEscrow,
                metadata: this.mintMetaPda[0],
                ...this.PumpScience.evtAuthAccs,
                associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
                ...params,
                whitelist: whitelist ? this.whitelistPda[0] : undefined
            }));

            const blockhash = await this.PumpScience.provider.connection.getLatestBlockhash();
            const instructions = createBondingCurveBuilder.getInstructions().map(ix => toWeb3JsInstruction(ix))

            const message = new TransactionMessage({
                payerKey: toWeb3JsPublicKey(user),
                recentBlockhash: blockhash.blockhash,
                instructions: [...mintInstructions, ...instructions],
            }).compileToV0Message();

            const tx = new VersionedTransaction(message);
            tx.sign([toWeb3JsKeypair(mintKp)]);

            console.log("built tx")
            return tx

    }

    getUserTokenAccount(user: PublicKey) {
        return findAssociatedTokenPda(this.umi, {
            mint: this.mint,
            owner: user,
        });
    }


    async migrate(signer: Keypair) {
        // get the vault program
        const meteoraProgram = new Program<Amm>(AmmIdl, AMM_PROGRAM_ID, this.PumpScience.provider);

        const tokenAMint = NATIVE_MINT;
        const tokenBMint = new Web3PublicKey(this.mint);

        const bondingCurveSolEscrow = this.bondingCurveSolEscrow[0];

        const poolPubkey = derivePoolAddressWithConfig(tokenAMint, tokenBMint, toWeb3JsPublicKey(METEORA_CONFIG), toWeb3JsPublicKey(AMM_PROGRAM_ID));

        const protocolTokenAFee =  
            Web3PublicKey.findProgramAddressSync(
                [Buffer.from("fee"), tokenAMint.toBuffer(), poolPubkey.toBuffer()],
                toWeb3JsPublicKey(AMM_PROGRAM_ID),
            )

        const protocolTokenBFee =  
            Web3PublicKey.findProgramAddressSync(
                [Buffer.from("fee"), tokenBMint.toBuffer(), poolPubkey.toBuffer()],
                toWeb3JsPublicKey(AMM_PROGRAM_ID),
            )

        const { vaultPda: aVault, tokenVaultPda: aTokenVault, lpMintPda: aVaultLpMint }= getVaultPdas(tokenAMint, toWeb3JsPublicKey(VAULT_PROGRAM_ID));
        const { vaultPda: bVault, tokenVaultPda: bTokenVault, lpMintPda: bVaultLpMint }= getVaultPdas(tokenBMint, toWeb3JsPublicKey(VAULT_PROGRAM_ID));

        const vaultProgram = new Program<VaultIdlType>(VaultIdl, VAULT_PROGRAM_ID, this.PumpScience.provider);
        const [aVaultAccount, bVaultAccount] = await Promise.all([
            vaultProgram.account.vault.fetchNullable(aVault),
            vaultProgram.account.vault.fetchNullable(bVault),
        ]);
        const preInstructions: Array<TransactionInstruction> = [];
        if (!aVaultAccount) {
            const createVaultAIx = await VaultImpl.createPermissionlessVaultInstruction(this.PumpScience.provider.connection, toWeb3JsPublicKey(signer.publicKey), tokenAMint);
            preInstructions.push(createVaultAIx);
        }
        if (!bVaultAccount) {
            const createVaultBIx = await VaultImpl.createPermissionlessVaultInstruction(this.PumpScience.provider.connection, toWeb3JsPublicKey(signer.publicKey), tokenBMint);
            preInstructions.push(createVaultBIx);
        }

        const [lpMint] = Web3PublicKey.findProgramAddressSync(
            [Buffer.from(SEEDS.LP_MINT_PREFIX), poolPubkey.toBuffer()],
            meteoraProgram.programId,
        );

        const payerPoolLp = getAssociatedTokenAddressSync(lpMint, toWeb3JsPublicKey(bondingCurveSolEscrow), true);

        const [aVaultLp] = Web3PublicKey.findProgramAddressSync([aVault.toBuffer(), poolPubkey.toBuffer()], meteoraProgram.programId)
        const [bVaultLp] = Web3PublicKey.findProgramAddressSync([bVault.toBuffer(), poolPubkey.toBuffer()], meteoraProgram.programId)

        const signerWeb3 = toWeb3JsPublicKey(signer.publicKey);
        const [{ataPubKey: payerTokenA, ix: payerTokenAIx}, {ataPubKey: payerTokenB, ix: payerTokenBIx}, {ataPubKey: feeReceiverTokenAccount, ix: feeReceiverTokenAccountIx}] = await Promise.all([
            getOrCreateATAInstruction(this.PumpScience.provider.connection, tokenAMint, toWeb3JsPublicKey(bondingCurveSolEscrow), signerWeb3, true),
            getOrCreateATAInstruction(this.PumpScience.provider.connection, tokenBMint, toWeb3JsPublicKey(bondingCurveSolEscrow), signerWeb3, true),
            getOrCreateATAInstruction(this.PumpScience.provider.connection, tokenBMint, toWeb3JsPublicKey(FEE_RECIPIENT), signerWeb3, false)
        ]);

        // Add addresses to lookup table
        if (payerTokenAIx) {
            preInstructions.push(payerTokenAIx);
        }
        if (payerTokenBIx) {
            preInstructions.push(payerTokenBIx);
        }
        if (feeReceiverTokenAccountIx) {
            preInstructions.push(feeReceiverTokenAccountIx);
        }

        const blockhash = await this.PumpScience.provider.connection.getLatestBlockhash();

        const [mintMetadata] = deriveMintMetadata(lpMint);

        // Create pool
        const params = {
            global: this.PumpScience.globalPda[0],
            bondingCurve: this.bondingCurvePda[0],
            feeReceiver: FEE_RECIPIENT,
            pool: fromWeb3JsPublicKey(poolPubkey),
            config: METEORA_CONFIG,
            lpMint: fromWeb3JsPublicKey(lpMint),
            tokenAMint: fromWeb3JsPublicKey(tokenAMint),
            tokenBMint: fromWeb3JsPublicKey(tokenBMint),

            aVault: fromWeb3JsPublicKey(aVault),
            bVault: fromWeb3JsPublicKey(bVault),
            aTokenVault: fromWeb3JsPublicKey(aTokenVault),
            bTokenVault: fromWeb3JsPublicKey(bTokenVault),
            aVaultLp: fromWeb3JsPublicKey(aVaultLp),
            bVaultLp: fromWeb3JsPublicKey(bVaultLp),
            aVaultLpMint: fromWeb3JsPublicKey(aVaultLpMint),
            bVaultLpMint: fromWeb3JsPublicKey(bVaultLpMint),

            bondingCurveTokenAccount: this.bondingCurveTokenAccount[0],
            feeReceiverTokenAccount: fromWeb3JsPublicKey(feeReceiverTokenAccount),
            bondingCurveSolEscrow: this.bondingCurveSolEscrow[0],
            payerTokenA: fromWeb3JsPublicKey(payerTokenA),
            payerTokenB: fromWeb3JsPublicKey(payerTokenB),
            payerPoolLp: fromWeb3JsPublicKey(payerPoolLp),
            protocolTokenAFee: fromWeb3JsPublicKey(protocolTokenAFee[0]),
            protocolTokenBFee: fromWeb3JsPublicKey(protocolTokenBFee[0]),
            mintMetadata: fromWeb3JsPublicKey(mintMetadata),
            rent: fromWeb3JsPublicKey(SYSVAR_RENT_PUBKEY),
            metadataProgram: tokenMetadataProgramId,
            vaultProgram: VAULT_PROGRAM_ID,
            associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
            meteoraProgram: AMM_PROGRAM_ID,
        }

        const createPoolIx = createPool(this.PumpScience.umi, params)

        let txBuilder = new TransactionBuilder()
            .add(setComputeUnitLimit(this.umi, { units: 6_000_000 }))
            .add(createPoolIx)

        const [lockEscrowPK] = deriveLockEscrowPda(poolPubkey, toWeb3JsPublicKey(FEE_RECIPIENT), toWeb3JsPublicKey(AMM_PROGRAM_ID));
        const {ataPubKey: escrowAta } = await getOrCreateATAInstruction(this.PumpScience.provider.connection, lpMint, lockEscrowPK, toWeb3JsPublicKey(signer.publicKey), true);

        const lockParams = {
            global: this.PumpScience.globalPda[0],
            bondingCurve: this.bondingCurvePda[0],
            bondingCurveSolEscrow: this.bondingCurveSolEscrow[0],
            pool: fromWeb3JsPublicKey(poolPubkey),
            lpMint: fromWeb3JsPublicKey(lpMint),
            aVaultLp: fromWeb3JsPublicKey(aVaultLp),
            bVaultLp: fromWeb3JsPublicKey(bVaultLp),
            tokenBMint: fromWeb3JsPublicKey(tokenBMint),
            aVault: fromWeb3JsPublicKey(aVault),
            bVault: fromWeb3JsPublicKey(bVault),
            aVaultLpMint: fromWeb3JsPublicKey(aVaultLpMint),
            bVaultLpMint: fromWeb3JsPublicKey(bVaultLpMint),
            payerPoolLp: fromWeb3JsPublicKey(payerPoolLp),
            feeReceiver: FEE_RECIPIENT,
            tokenProgram: fromWeb3JsPublicKey(TOKEN_PROGRAM_ID),
            associatedTokenProgram: fromWeb3JsPublicKey(ASSOCIATED_TOKEN_PROGRAM_ID),
            systemProgram: fromWeb3JsPublicKey(SystemProgram.programId),
            lockEscrow: fromWeb3JsPublicKey(lockEscrowPK),
            escrowVault: fromWeb3JsPublicKey(escrowAta),
            meteoraProgram: AMM_PROGRAM_ID,
            eventAuthority: this.PumpScience.evtAuthAccs.eventAuthority,
        }
        const lockPoolIx = lockPool(this.PumpScience.umi, lockParams)

        txBuilder = txBuilder.append(lockPoolIx)
 
        const preInstructionsMessage = new TransactionMessage({
            payerKey: toWeb3JsPublicKey(signer.publicKey),
            recentBlockhash: blockhash.blockhash,
            instructions: [...preInstructions],
        }).compileToV0Message();

        const preTx = new VersionedTransaction(preInstructionsMessage);
        preTx.sign([toWeb3JsKeypair(signer)]);

        const paramValues : Array<Web3PublicKey> = Object.values(params).map(value => toWeb3JsPublicKey(value))
        const lookupTableAccount = await this.createLookupTable(signer, paramValues, blockhash.blockhash)

        const instructions = txBuilder.getInstructions().map(ix => toWeb3JsInstruction(ix))
        const instructionsMessage = new TransactionMessage({
            payerKey: toWeb3JsPublicKey(signer.publicKey),
            recentBlockhash: blockhash.blockhash,
            instructions: [...instructions],
        })
        .compileToV0Message([lookupTableAccount]);

        const tx = new VersionedTransaction(instructionsMessage);
        tx.sign([toWeb3JsKeypair(signer)]);
        return {preTx, tx};
    }

    async createLookupTable(signer: Keypair, addresses: Array<Web3PublicKey>, blockhash: string) {
        const slot = await this.PumpScience.provider.connection.getSlot()
        const [lookupTableInst, lookupTableAddress] = AddressLookupTableProgram.createLookupTable({
            authority: toWeb3JsPublicKey(signer.publicKey),
            payer: toWeb3JsPublicKey(signer.publicKey),
            recentSlot: slot - 200,
        });

        const chunks = [];
        for (let i = 0; i < addresses.length; i += 30) {
            chunks.push(addresses.slice(i, i + 30));
        }

        const extendInstructions = chunks.map(chunk => 
            AddressLookupTableProgram.extendLookupTable({
                payer: toWeb3JsPublicKey(signer.publicKey),
                authority: toWeb3JsPublicKey(signer.publicKey),
                lookupTable: lookupTableAddress,
                addresses: chunk
            })
        );

        for (let i = 0; i < chunks.length; i++) {
            const lutMsg = new TransactionMessage({
                payerKey: toWeb3JsPublicKey(signer.publicKey),
                recentBlockhash: blockhash,
                instructions: i === 0 ? [lookupTableInst, extendInstructions[i]] : [extendInstructions[i]]
            }).compileToV0Message();

            const lutVTx = new VersionedTransaction(lutMsg);
            lutVTx.sign([toWeb3JsKeypair(signer)])
            
            const lutId = await this.PumpScience.provider.connection.sendTransaction(lutVTx)
            await confirmTransaction(this.PumpScience.provider.connection, lutId)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const lookupTableAccount = await this.PumpScience.provider.connection.getAddressLookupTable(lookupTableAddress, { commitment: 'confirmed' })
        if (!lookupTableAccount.value) {
            throw new Error("Lookup table account not found");
        }

        return lookupTableAccount.value;
    }
}
