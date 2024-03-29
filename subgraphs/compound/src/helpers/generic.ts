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
export let cTokenDecimalsBD: BigDecimal = exponentToBigDecimal(8)
export let cTokenDecimals = 8

export const UNITROLLER_ADDRESS = '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b'
export const CETH_ADDRESS = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5'
export const DAI_V1_ADDRESS = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
export const MAKER_TOKEN = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2'

export const PROTOCOL_ID = '2'

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
