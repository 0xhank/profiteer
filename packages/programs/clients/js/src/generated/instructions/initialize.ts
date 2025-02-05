/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Context, Pda, PublicKey, Signer, TransactionBuilder, transactionBuilder } from '@metaplex-foundation/umi';
import { Serializer, array, mapSerializer, struct, u8 } from '@metaplex-foundation/umi/serializers';
import { ResolvedAccount, ResolvedAccountsWithIndices, getAccountMetasAndSigners } from '../shared';
import { GlobalSettingsInput, GlobalSettingsInputArgs, getGlobalSettingsInputSerializer } from '../types';

// Accounts.
export type InitializeInstructionAccounts = {
    authority?: Signer;
    global: PublicKey | Pda;
    systemProgram?: PublicKey | Pda;
    eventAuthority: PublicKey | Pda;
    program: PublicKey | Pda;
};

  // Data.
  export type InitializeInstructionData = { discriminator: Array<number>; params: GlobalSettingsInput;  };

export type InitializeInstructionDataArgs = { params: GlobalSettingsInputArgs;  };


  export function getInitializeInstructionDataSerializer(): Serializer<InitializeInstructionDataArgs, InitializeInstructionData> {
  return mapSerializer<InitializeInstructionDataArgs, any, InitializeInstructionData>(struct<InitializeInstructionData>([['discriminator', array(u8(), { size: 8 })], ['params', getGlobalSettingsInputSerializer()]], { description: 'InitializeInstructionData' }), (value) => ({ ...value, discriminator: [175, 175, 109, 31, 13, 152, 155, 237] }) ) as Serializer<InitializeInstructionDataArgs, InitializeInstructionData>;
}



  
  // Args.
      export type InitializeInstructionArgs =           InitializeInstructionDataArgs
      ;
  
// Instruction.
export function initialize(
  context: Pick<Context, "identity" | "programs">,
                        input: InitializeInstructionAccounts & InitializeInstructionArgs,
      ): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey('pumpScience', 'BjbuCn9cWxLZFmRc7zQ4hwV45SyqZA5YSMKpvUUeeHvw');

  // Accounts.
  const resolvedAccounts = {
          authority: { index: 0, isWritable: true as boolean, value: input.authority ?? null },
          global: { index: 1, isWritable: true as boolean, value: input.global ?? null },
          systemProgram: { index: 2, isWritable: false as boolean, value: input.systemProgram ?? null },
          eventAuthority: { index: 3, isWritable: false as boolean, value: input.eventAuthority ?? null },
          program: { index: 4, isWritable: false as boolean, value: input.program ?? null },
      } satisfies ResolvedAccountsWithIndices;

      // Arguments.
    const resolvedArgs: InitializeInstructionArgs = { ...input };
  
    // Default values.
  if (!resolvedAccounts.authority.value) {
        resolvedAccounts.authority.value = context.identity;
      }
      if (!resolvedAccounts.systemProgram.value) {
        resolvedAccounts.systemProgram.value = context.programs.getPublicKey('splSystem', '11111111111111111111111111111111');
resolvedAccounts.systemProgram.isWritable = false
      }
      
  // Accounts in order.
      const orderedAccounts: ResolvedAccount[] = Object.values(resolvedAccounts).sort((a,b) => a.index - b.index);
  
  
  // Keys and Signers.
  const [keys, signers] = getAccountMetasAndSigners(orderedAccounts, "programId", programId);

  // Data.
      const data = getInitializeInstructionDataSerializer().serialize(resolvedArgs as InitializeInstructionDataArgs);
  
  // Bytes Created On Chain.
      const bytesCreatedOnChain = 0;
  
  return transactionBuilder([{ instruction: { keys, programId, data }, signers, bytesCreatedOnChain }]);
}
