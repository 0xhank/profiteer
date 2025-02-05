import { Program } from "@coral-xyz/anchor";
import { Amm, AmmIdl, VaultIdl } from "@mercurial-finance/dynamic-amm-sdk";
import VaultImpl, { getVaultPdas, VaultIdl as VaultIdlType } from "@mercurial-finance/vault-sdk";
import { SEEDS } from "@mercurial-finance/vault-sdk/dist/cjs/src/vault/constants";
import { findAssociatedTokenPda, setComputeUnitLimit, SPL_ASSOCIATED_TOKEN_PROGRAM_ID } from "@metaplex-foundation/mpl-toolbox";
import {  Keypair, Pda, PublicKey, RpcGetAccountOptions, Signer, TransactionBuilder, Umi } from "@metaplex-foundation/umi";
import { fromWeb3JsInstruction, fromWeb3JsPublicKey, toWeb3JsInstruction, toWeb3JsKeypair, toWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { publicKey as publicKeySerializer, string } from '@metaplex-foundation/umi/serializers';
import { getOrCreateATAInstruction } from "@meteora-ag/stake-for-fee";
import { createInitializeMint2Instruction, getAssociatedTokenAddressSync, getMinimumBalanceForRentExemptMint, MINT_SIZE, NATIVE_MINT, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SystemProgram, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY, TransactionInstruction, TransactionMessage, VersionedTransaction, PublicKey as Web3PublicKey } from "@solana/web3.js";

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

    mint: Keypair;
    bondingCurvePda: Pda;
    bondingCurveTokenAccount: Pda;
    bondingCurveSolEscrow: Pda;
    whitelistPda: Pda;
    mintMetaPda: Pda;
    payer: PublicKey;

    constructor(sdk: PumpScienceSDK, mint: Keypair) {
        this.PumpScience = sdk;
        this.umi = sdk.umi;
        this.mint = mint;

        this.bondingCurvePda = findBondingCurvePda(this.umi, {
            mint: this.mint.publicKey,
        });
        this.bondingCurveTokenAccount = findAssociatedTokenPda(this.umi, {
            mint: this.mint.publicKey,
            owner: this.bondingCurvePda[0],
        });
        this.bondingCurveSolEscrow = this.umi.eddsa.findPda(PUMP_SCIENCE_PROGRAM_ID, [
            string({ size: 'variable' }).serialize('sol-escrow'),
            publicKeySerializer().serialize(this.mint.publicKey),
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
            mint: this.mint.publicKey,
            bondingCurve: this.bondingCurvePda[0],
            bondingCurveTokenAccount: this.bondingCurveTokenAccount[0],
            bondingCurveSolEscrow: this.bondingCurveSolEscrow[0],
            userTokenAccount: userTokenAccount[0],
            feeReceiver: FEE_RECIPIENT,
            clock: fromWeb3JsPublicKey(SYSVAR_CLOCK_PUBKEY),
            associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
            ...this.PumpScience.evtAuthAccs,
        }));
        return txBuilder;
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
    async createBondingCurve(params: CreateBondingCurveInstructionDataArgs, user: PublicKey, whitelist: boolean) {
        if (this.mint.publicKey.toString() !== this.mint.publicKey.toString()) {
            throw new Error("wrong mintKp provided");
        }
        const mintInstructions = await this.createMint(user, this.mint);

        const createBondingCurveBuilder = new TransactionBuilder()
            .add(setComputeUnitLimit(this.umi, { units: 600_000 }))
            .add(createBondingCurve(this.umi, {
                global: this.PumpScience.globalPda[0],
                creator: user as unknown as Signer,
                mint: this.mint.publicKey,
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
                payerKey: toWeb3JsPublicKey(this.payer),
                recentBlockhash: blockhash.blockhash,
                instructions: [...mintInstructions, ...instructions],
            }).compileToV0Message();
            const tx = new VersionedTransaction(message);
            tx.sign([toWeb3JsKeypair(this.mint)]);

            return tx

    }

    getUserTokenAccount(user: PublicKey) {
        return findAssociatedTokenPda(this.umi, {
            mint: this.mint.publicKey,
            owner: user,
        });
    }


    async migrate() {
        console.log("migrating")
        // get the vault program
        const vaultProgram = new Program<VaultIdlType>(VaultIdl, VAULT_PROGRAM_ID, this.PumpScience.provider);
        const meteoraProgram = new Program<Amm>(AmmIdl, AMM_PROGRAM_ID, this.PumpScience.provider);
        let preTxBuilder = new TransactionBuilder();

        // const global = this.PumpScience.globalPda[0];
        // const bondingCurve = this.bondingCurvePda[0];
        // const feeReceiver = FEE_RECIPIENT;
        // const feeReceiverTokenAccount = this.getUserTokenAccount(FEE_RECIPIENT)[0];
        const poolPubkey = this.bondingCurvePda[0];
        const poolPubkeyWeb3 = toWeb3JsPublicKey(poolPubkey);
        // const config = this.PumpScience.globalPda[0];
        const bondingCurveSolEscrow = this.bondingCurveSolEscrow[0];

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

    const payerPoolLp = getAssociatedTokenAddressSync(lpMint, toWeb3JsPublicKey(bondingCurveSolEscrow), true);

    const [aVaultLp] =   Web3PublicKey.findProgramAddressSync([aVault.toBuffer(), poolPubkeyWeb3.toBuffer()], meteoraProgram.programId)
    const [bVaultLp] = Web3PublicKey.findProgramAddressSync([bVault.toBuffer(), poolPubkeyWeb3.toBuffer()], meteoraProgram.programId)

    const [{ataPubKey: payerTokenA, ix: payerTokenAIx}, {ataPubKey: payerTokenB, ix: payerTokenBIx}, {ix: feeReceiverTokenIx}] = await Promise.all([
        getOrCreateATAInstruction(this.PumpScience.provider.connection, tokenAMint, toWeb3JsPublicKey(this.payer)),
        getOrCreateATAInstruction(this.PumpScience.provider.connection, tokenBMint, toWeb3JsPublicKey(this.payer)),
        getOrCreateATAInstruction(this.PumpScience.provider.connection, tokenBMint, toWeb3JsPublicKey(FEE_RECIPIENT)),
    ]);
        // Add addresses to lookup table
        if (payerTokenAIx) preInstructions.push(payerTokenAIx);
        if (payerTokenBIx) preInstructions.push(payerTokenBIx);
        if (feeReceiverTokenIx) preInstructions.push(feeReceiverTokenIx);


        preInstructions.map(ix => preTxBuilder = preTxBuilder.append({
            instruction: fromWeb3JsInstruction(ix),
            signers: [],
            bytesCreatedOnChain: 0
        }));

        // Create pool
        const params : CreatePoolInstructionAccounts = {
            global: this.PumpScience.globalPda[0],
            bondingCurve: this.bondingCurvePda[0],
            feeReceiver: FEE_RECIPIENT,
            pool: this.bondingCurvePda[0],
            config: this.PumpScience.globalPda[0],
            lpMint: fromWeb3JsPublicKey(lpMint),
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
            payerTokenA: fromWeb3JsPublicKey(payerTokenA),
            payerTokenB: fromWeb3JsPublicKey(payerTokenB),
            payerPoolLp: fromWeb3JsPublicKey(payerPoolLp),
            protocolTokenAFee: protocolTokenAFee,
            protocolTokenBFee: protocolTokenBFee,
            mintMetadata: this.mintMetaPda[0],
            rent: fromWeb3JsPublicKey(SYSVAR_RENT_PUBKEY),
            metadataProgram: tokenMetadataProgramId,
            vaultProgram: VAULT_PROGRAM_ID,
            associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
            meteoraProgram: AMM_PROGRAM_ID,
        }

        const createPoolIx = createPool(this.PumpScience.umi, params)

        let txBuilder = new TransactionBuilder().append(createPoolIx)

        // const [lockEscrowPK] = deriveLockEscrowPda(toWeb3JsPublicKey(this.bondingCurvePda[0]), toWeb3JsPublicKey(FEE_RECIPIENT), toWeb3JsPublicKey(AMM_PROGRAM_ID));
        // const lockPoolIx = lockPool(this.PumpScience.umi, {
        //     global: this.PumpScience.globalPda[0],
        //     bondingCurve: this.bondingCurvePda[0],
        //     bondingCurveSolEscrow: this.bondingCurveSolEscrow[0],
        //     pool: this.bondingCurvePda[0],
        //     lpMint: this.bondingCurvePda[0],
        //     aVaultLp: fromWeb3JsPublicKey(aVaultLpMint),
        //     bVaultLp: fromWeb3JsPublicKey(bVaultLpMint),
        //     tokenBMint: fromWeb3JsPublicKey(tokenBMint),
        //     aVault: fromWeb3JsPublicKey(aVault),
        //     bVault: fromWeb3JsPublicKey(bVault),
        //     aVaultLpMint: fromWeb3JsPublicKey(aVaultLpMint),
        //     bVaultLpMint: fromWeb3JsPublicKey(bVaultLpMint),
        //     payerPoolLp: fromWeb3JsPublicKey(payerPoolLp),
        //     payer: this.umi.identity,
        //     feeReceiver: FEE_RECIPIENT,
        //     tokenProgram: fromWeb3JsPublicKey(TOKEN_PROGRAM_ID),
        //     associatedTokenProgram: fromWeb3JsPublicKey(ASSOCIATED_TOKEN_PROGRAM_ID),
        //     systemProgram: fromWeb3JsPublicKey(SystemProgram.programId),
        //     lockEscrow: fromWeb3JsPublicKey(lockEscrowPK),
        //     escrowVault: this.getUserTokenAccount(FEE_RECIPIENT)[0],
        //     meteoraProgram: AMM_PROGRAM_ID,
        //     eventAuthority: this.PumpScience.evtAuthAccs.eventAuthority,
        // })

        // txBuilder = txBuilder.append(lockPoolIx)

        return {preTxBuilder, txBuilder};
    }
}
