import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { BentoBox } from '../../generated/BentoBox/BentoBox'
import { Market } from '../../generated/schema'
import { ERC20 } from '../../generated/templates/KashiPair/ERC20'
import { KashiPair } from '../../generated/templates/KashiPair/KashiPair'

export function exponentToBigDecimal(decimals: i32): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = 0; i < decimals; i++) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

export let zeroBD = BigDecimal.fromString('0')
export let zeroInt = BigInt.fromString('0')
export let mantissaFactorBD: BigDecimal = exponentToBigDecimal(18)

export const BASE_DECIMALS = 18;

export const SHUSHI_BENTOBOX = '0xF5BCE5077908a1b7370B9ae04AdC565EBd643966'

export const PROTOCOL_ID = '4'

export function getConcatenatedId(list: string[]): string {
  let result = ''
  for (let i = 0; i < list.length; i++) {
    if (!list[i]) {
      continue
    }
    result = result.concat(list[i])
    if (i + 1 < list.length && list[i + 1]) [(result = result.concat('-'))]
  }
  return result
}


export interface MarketData {
  kashiPair: KashiPair;
  bentoBox: BentoBox;
  deployedCollateral: ERC20;
  deployedAsset: ERC20;
  market: Market;
}
