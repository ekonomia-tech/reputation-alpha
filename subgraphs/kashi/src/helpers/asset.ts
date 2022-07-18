import { Asset } from '../../generated/schema'
import { ERC20 } from '../../generated/templates/KashiPair/ERC20'
import { Address, BigDecimal, log } from '@graphprotocol/graph-ts'
import { getUsdPrice } from '../../Prices/index'
import { BASE_DECIMALS, exponentToBigDecimal } from './generic'


export function getOrCreateAsset(assetAddress: string): Asset {
  let asset = Asset.load(assetAddress)
  if (asset) {
    return asset
  }
  let assetContract = ERC20.bind(Address.fromString(assetAddress))
  asset = new Asset(assetAddress)

  let assetName = assetContract.try_name()
  let assetSymbol = assetContract.try_symbol()
  let assetDecimals = assetContract.try_decimals()

  asset.name = assetName.reverted ? 'UNKNOWN' : assetName.value
  asset.symbol = assetSymbol.reverted ? 'UNKNWON' : assetSymbol.value
  asset.decimals = assetDecimals.reverted ? BASE_DECIMALS : assetDecimals.value;

  asset.save()
  return asset
}

export function toUSD(assetId: string, amount: BigDecimal): BigDecimal {
  let asset = Asset.load(assetId);
  if (!asset) return BigDecimal.zero();
  return getUsdPrice(Address.fromString(assetId.toLowerCase())
  , amount
      .div(exponentToBigDecimal(asset.decimals))
      .truncate(asset.decimals)
  )
}
