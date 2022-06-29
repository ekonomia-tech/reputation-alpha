import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'

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
export const EULER_DECIMALS = 18

export const EULER_ADDRESS = '0x27182842E098f60e3D576794A5bFFb0777E025d3'

export const PROTOCOL_ID = '3'

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
