/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Context, Pda, PublicKey, Signer, TransactionBuilder, transactionBuilder } from '@metaplex-foundation/umi';
import { Serializer, array, bool, mapSerializer, struct, u64, u8 } from '@metaplex-foundation/umi/serializers';
import { ResolvedAccount, ResolvedAccountsWithIndices, getAccountMetasAndSigners } from '../shared';

// Accounts.
export type SwapInstructionAccounts = {
    user: Signer;
    global: PublicKey | Pda;
    feeReceiver: PublicKey | Pda;
    mint: PublicKey | Pda;
    bondingCurve: PublicKey | Pda;
    bondingCurveTokenAccount: PublicKey | Pda;
    bondingCurveSolEscrow: PublicKey | Pda;
    userTokenAccount: PublicKey | Pda;
    systemProgram?: PublicKey | Pda;
    tokenProgram?: PublicKey | Pda;
    associatedTokenProgram: PublicKey | Pda;
    clock: PublicKey | Pda;
    eventAuthority: PublicKey | Pda;
    program: PublicKey | Pda;
};

  // Data.
  export type SwapInstructionData = { discriminator: Array<number>; baseIn: boolean; exactInAmount: bigint; minOutAmount: bigint;  };

export type SwapInstructionDataArgs = { baseIn: boolean; exactInAmount: number | bigint; minOutAmount: number | bigint;  };


  export function getSwapInstructionDataSerializer(): Serializer<SwapInstructionDataArgs, SwapInstructionData> {
  return mapSerializer<SwapInstructionDataArgs, any, SwapInstructionData>(struct<SwapInstructionData>([['discriminator', array(u8(), { size: 8 })], ['baseIn', bool()], ['exactInAmount', u64()], ['minOutAmount', u64()]], { description: 'SwapInstructionData' }), (value) => ({ ...value, discriminator: [248, 198, 158, 145, 225, 117, 135, 200] }) ) as Serializer<SwapInstructionDataArgs, SwapInstructionData>;
}



  
  // Args.
      export type SwapInstructionArgs =           SwapInstructionDataArgs
      ;
  
// Instruction.
export function swap(
  context: Pick<Context, "programs">,
                        input: SwapInstructionAccounts & SwapInstructionArgs,
      ): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey('pumpScience', 'J3nh6pDYtUbwZbGfTozRhHgPJnRVUR2aFAXCrqt9qo62');

  // Accounts.
  const resolvedAccounts = {
          user: { index: 0, isWritable: true as boolean, value: input.user ?? null },
          global: { index: 1, isWritable: false as boolean, value: input.global ?? null },
          feeReceiver: { index: 2, isWritable: true as boolean, value: input.feeReceiver ?? null },
          mint: { index: 3, isWritable: false as boolean, value: input.mint ?? null },
          bondingCurve: { index: 4, isWritable: true as boolean, value: input.bondingCurve ?? null },
          bondingCurveTokenAccount: { index: 5, isWritable: true as boolean, value: input.bondingCurveTokenAccount ?? null },
          bondingCurveSolEscrow: { index: 6, isWritable: true as boolean, value: input.bondingCurveSolEscrow ?? null },
          userTokenAccount: { index: 7, isWritable: true as boolean, value: input.userTokenAccount ?? null },
          systemProgram: { index: 8, isWritable: false as boolean, value: input.systemProgram ?? null },
          tokenProgram: { index: 9, isWritable: false as boolean, value: input.tokenProgram ?? null },
          associatedTokenProgram: { index: 10, isWritable: false as boolean, value: input.associatedTokenProgram ?? null },
          clock: { index: 11, isWritable: false as boolean, value: input.clock ?? null },
          eventAuthority: { index: 12, isWritable: false as boolean, value: input.eventAuthority ?? null },
          program: { index: 13, isWritable: false as boolean, value: input.program ?? null },
      } satisfies ResolvedAccountsWithIndices;

      // Arguments.
    const resolvedArgs: SwapInstructionArgs = { ...input };
  
    // Default values.
  if (!resolvedAccounts.systemProgram.value) {
        resolvedAccounts.systemProgram.value = context.programs.getPublicKey('splSystem', '11111111111111111111111111111111');
resolvedAccounts.systemProgram.isWritable = false
      }
      if (!resolvedAccounts.tokenProgram.value) {
        resolvedAccounts.tokenProgram.value = context.programs.getPublicKey('splToken', 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
resolvedAccounts.tokenProgram.isWritable = false
      }
      
  // Accounts in order.
      const orderedAccounts: ResolvedAccount[] = Object.values(resolvedAccounts).sort((a,b) => a.index - b.index);
  
  
  // Keys and Signers.
  const [keys, signers] = getAccountMetasAndSigners(orderedAccounts, "programId", programId);

  // Data.
      const data = getSwapInstructionDataSerializer().serialize(resolvedArgs as SwapInstructionDataArgs);
  
  // Bytes Created On Chain.
      const bytesCreatedOnChain = 0;
  
  return transactionBuilder([{ instruction: { keys, programId, data }, signers, bytesCreatedOnChain }]);
}
