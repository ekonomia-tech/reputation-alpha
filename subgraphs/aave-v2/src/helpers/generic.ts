import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts"

export function exponentToBigDecimal(decimals: i32): BigDecimal {
    let bd = BigDecimal.fromString('1')
    for (let i = 0; i < decimals; i++) {
      bd = bd.times(BigDecimal.fromString('10'))
    }
    return bd
}

export let zeroBD = BigDecimal.fromString('0')
export let zeroInt = BigInt.fromString('0');
export let mantissaFactorBD: BigDecimal = exponentToBigDecimal(18)

export const AAVE_V2_REGISTRY = "0x52D306e36E3B6B02c153d0266ff0f85d18BCD413"
export const PROTOCOL_ID = "1";

export function getConcatenatedId(list: string[]): string {
  let result = "";
  for(let i = 0; i < list.length; i++) {
    if (!list[i]) {
      continue
    }
    result = result.concat(list[i]);
    if (i+1 < list.length && list[i+1]) [
      result = result.concat('-')
    ]
  }
  return result;
}

