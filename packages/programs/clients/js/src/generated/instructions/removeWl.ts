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

// Accounts.
export type RemoveWlInstructionAccounts = {
    global: PublicKey | Pda;
    whitelist: PublicKey | Pda;
    admin: Signer;
    systemProgram?: PublicKey | Pda;
};

  // Data.
  export type RemoveWlInstructionData = { discriminator: Array<number>;  };

export type RemoveWlInstructionDataArgs = {  };


  export function getRemoveWlInstructionDataSerializer(): Serializer<RemoveWlInstructionDataArgs, RemoveWlInstructionData> {
  return mapSerializer<RemoveWlInstructionDataArgs, any, RemoveWlInstructionData>(struct<RemoveWlInstructionData>([['discriminator', array(u8(), { size: 8 })]], { description: 'RemoveWlInstructionData' }), (value) => ({ ...value, discriminator: [85, 103, 2, 89, 195, 122, 124, 32] }) ) as Serializer<RemoveWlInstructionDataArgs, RemoveWlInstructionData>;
}




// Instruction.
export function removeWl(
  context: Pick<Context, "programs">,
                        input: RemoveWlInstructionAccounts,
      ): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey('pumpScience', 'J3nh6pDYtUbwZbGfTozRhHgPJnRVUR2aFAXCrqt9qo62');

  // Accounts.
  const resolvedAccounts = {
          global: { index: 0, isWritable: true as boolean, value: input.global ?? null },
          whitelist: { index: 1, isWritable: true as boolean, value: input.whitelist ?? null },
          admin: { index: 2, isWritable: true as boolean, value: input.admin ?? null },
          systemProgram: { index: 3, isWritable: false as boolean, value: input.systemProgram ?? null },
      } satisfies ResolvedAccountsWithIndices;

  
    // Default values.
  if (!resolvedAccounts.systemProgram.value) {
        resolvedAccounts.systemProgram.value = context.programs.getPublicKey('splSystem', '11111111111111111111111111111111');
resolvedAccounts.systemProgram.isWritable = false
      }
      
  // Accounts in order.
      const orderedAccounts: ResolvedAccount[] = Object.values(resolvedAccounts).sort((a,b) => a.index - b.index);
  
  
  // Keys and Signers.
  const [keys, signers] = getAccountMetasAndSigners(orderedAccounts, "programId", programId);

  // Data.
      const data = getRemoveWlInstructionDataSerializer().serialize({});
  
  // Bytes Created On Chain.
      const bytesCreatedOnChain = 0;
  
  return transactionBuilder([{ instruction: { keys, programId, data }, signers, bytesCreatedOnChain }]);
}
