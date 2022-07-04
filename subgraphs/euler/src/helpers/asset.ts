import { Asset } from '../../generated/schema'
import { ERC20 } from '../../generated/Euler/ERC20'
import { Address, BigDecimal, log } from '@graphprotocol/graph-ts'
import { getUsdPrice } from '../../Prices/index'
import { EULER_DECIMALS } from './generic'

export function getOrCreateAsset(assetAddress: string): Asset {
  let asset = Asset.load(assetAddress)
  if (asset) {
    return asset
  }
  let assetContract = ERC20.bind(Address.fromString(assetAddress))
  asset = new Asset(assetAddress)

  let assetName = assetContract.try_name()
  let assetSymbol = assetContract.try_symbol()
  let assetDecimals = EULER_DECIMALS

  asset.name = assetName.reverted ? 'UNKNOWN' : assetName.value
  asset.symbol = assetSymbol.reverted ? 'UNKNOWN' : assetSymbol.value
  asset.decimals = assetDecimals

  asset.save()
  return asset
}

export function toUSD(assetId: string, amount: BigDecimal): BigDecimal {
  return getUsdPrice(Address.fromString(assetId.toLowerCase()), amount)
}
