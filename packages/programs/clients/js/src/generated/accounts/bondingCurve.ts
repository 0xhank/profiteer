/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Account, Context, Pda, PublicKey, RpcAccount, RpcGetAccountOptions, RpcGetAccountsOptions, assertAccountExists, deserializeAccount, gpaBuilder, publicKey as toPublicKey } from '@metaplex-foundation/umi';
import { Serializer, array, bool, mapSerializer, publicKey as publicKeySerializer, string, struct, u64, u8 } from '@metaplex-foundation/umi/serializers';

  
  export type BondingCurve = Account<BondingCurveAccountData>;

  export type BondingCurveAccountData = { discriminator: Array<number>; mint: PublicKey; creator: PublicKey; initialRealTokenReserves: bigint; virtualSolReserves: bigint; virtualTokenReserves: bigint; realSolReserves: bigint; realTokenReserves: bigint; tokenTotalSupply: bigint; startSlot: bigint; complete: boolean; bump: number;  };

export type BondingCurveAccountDataArgs = { mint: PublicKey; creator: PublicKey; initialRealTokenReserves: number | bigint; virtualSolReserves: number | bigint; virtualTokenReserves: number | bigint; realSolReserves: number | bigint; realTokenReserves: number | bigint; tokenTotalSupply: number | bigint; startSlot: number | bigint; complete: boolean; bump: number;  };


  export function getBondingCurveAccountDataSerializer(): Serializer<BondingCurveAccountDataArgs, BondingCurveAccountData> {
  return mapSerializer<BondingCurveAccountDataArgs, any, BondingCurveAccountData>(struct<BondingCurveAccountData>([['discriminator', array(u8(), { size: 8 })], ['mint', publicKeySerializer()], ['creator', publicKeySerializer()], ['initialRealTokenReserves', u64()], ['virtualSolReserves', u64()], ['virtualTokenReserves', u64()], ['realSolReserves', u64()], ['realTokenReserves', u64()], ['tokenTotalSupply', u64()], ['startSlot', u64()], ['complete', bool()], ['bump', u8()]], { description: 'BondingCurveAccountData' }), (value) => ({ ...value, discriminator: [23, 183, 248, 55, 96, 216, 172, 96] }) ) as Serializer<BondingCurveAccountDataArgs, BondingCurveAccountData>;
}


export function deserializeBondingCurve(rawAccount: RpcAccount): BondingCurve {
  return deserializeAccount(rawAccount, getBondingCurveAccountDataSerializer());
}

export async function fetchBondingCurve(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions,
): Promise<BondingCurve> {
  const maybeAccount = await context.rpc.getAccount(toPublicKey(publicKey, false), options);
  assertAccountExists(maybeAccount, 'BondingCurve');
  return deserializeBondingCurve(maybeAccount);
}

export async function safeFetchBondingCurve(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions,
): Promise<BondingCurve | null> {
  const maybeAccount = await context.rpc.getAccount(toPublicKey(publicKey, false), options);
  return maybeAccount.exists
    ? deserializeBondingCurve(maybeAccount)
    : null;
}

export async function fetchAllBondingCurve(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions,
): Promise<BondingCurve[]> {
  const maybeAccounts = await context.rpc.getAccounts(publicKeys.map(key => toPublicKey(key, false)), options);
  return maybeAccounts.map((maybeAccount) => {
    assertAccountExists(maybeAccount, 'BondingCurve');
    return deserializeBondingCurve(maybeAccount);
  });
}

export async function safeFetchAllBondingCurve(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions,
): Promise<BondingCurve[]> {
  const maybeAccounts = await context.rpc.getAccounts(publicKeys.map(key => toPublicKey(key, false)), options);
  return maybeAccounts
    .filter((maybeAccount) => maybeAccount.exists)
    .map((maybeAccount) => deserializeBondingCurve(maybeAccount as RpcAccount));
}

export function getBondingCurveGpaBuilder(context: Pick<Context, 'rpc' | 'programs'>) {
  const programId = context.programs.getPublicKey('pumpScience', 'EjamzaR4XFnrUnuQAJDD5Eq92Fky9R7Ej4y52YZZgJ9z');
  return gpaBuilder(context, programId)
    .registerFields<{ 'discriminator': Array<number>, 'mint': PublicKey, 'creator': PublicKey, 'initialRealTokenReserves': number | bigint, 'virtualSolReserves': number | bigint, 'virtualTokenReserves': number | bigint, 'realSolReserves': number | bigint, 'realTokenReserves': number | bigint, 'tokenTotalSupply': number | bigint, 'startSlot': number | bigint, 'complete': boolean, 'bump': number }>({ 'discriminator': [0, array(u8(), { size: 8 })], 'mint': [8, publicKeySerializer()], 'creator': [40, publicKeySerializer()], 'initialRealTokenReserves': [72, u64()], 'virtualSolReserves': [80, u64()], 'virtualTokenReserves': [88, u64()], 'realSolReserves': [96, u64()], 'realTokenReserves': [104, u64()], 'tokenTotalSupply': [112, u64()], 'startSlot': [120, u64()], 'complete': [128, bool()], 'bump': [129, u8()] })
    .deserializeUsing<BondingCurve>((account) => deserializeBondingCurve(account))      .whereField('discriminator', [23, 183, 248, 55, 96, 216, 172, 96])
    ;
}

export function getBondingCurveSize(): number {
  return 130;
}

export function findBondingCurvePda(
  context: Pick<Context, 'eddsa' | 'programs'>,
      seeds: {
                                      /** The mint of the bonding curve tkn */
          mint: PublicKey;
                  }
  ): Pda {
  const programId = context.programs.getPublicKey('pumpScience', 'EjamzaR4XFnrUnuQAJDD5Eq92Fky9R7Ej4y52YZZgJ9z');
  return context.eddsa.findPda(programId, [
                  string({ size: 'variable' }).serialize("bonding-curve"),
                        publicKeySerializer().serialize(seeds.mint),
            ]);
}

export async function fetchBondingCurveFromSeeds(
  context: Pick<Context, 'eddsa' | 'programs' | 'rpc'>,
      seeds: Parameters<typeof findBondingCurvePda>[1],
    options?: RpcGetAccountOptions,
): Promise<BondingCurve> {
  return fetchBondingCurve(context, findBondingCurvePda(context, seeds), options);
}

export async function safeFetchBondingCurveFromSeeds(
  context: Pick<Context, 'eddsa' | 'programs' | 'rpc'>,
      seeds: Parameters<typeof findBondingCurvePda>[1],
    options?: RpcGetAccountOptions,
): Promise<BondingCurve | null> {
  return safeFetchBondingCurve(context, findBondingCurvePda(context, seeds), options);
}
