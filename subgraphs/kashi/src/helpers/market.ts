import { Address } from '@graphprotocol/graph-ts'
import { Market } from '../../generated/schema'
import { KashiPair } from '../../generated/templates/KashiPair/KashiPair'
import { getOrCreateAsset } from './asset'
import { getConcatenatedId, PROTOCOL_ID } from './generic'
import { getOrCreateProtocol } from './protocol'

// kashiAddress only represents the kashi market the transactionis being sent from. internal ID will add the protocol number for distinction
// if id == assetId, the market will not be found, and then a market will be created as "protocol-assetId"
export function createMarket(kashiAddress: string): void {
  let marketId = getConcatenatedId([PROTOCOL_ID, kashiAddress]);
  let market = Market.load(marketId);
  if (!market) {
    let ks = KashiPair.bind(Address.fromString(kashiAddress));

    let tryAsset = ks.try_asset();
    let tryCollateral = ks.try_collateral();

    if(tryAsset.reverted || tryCollateral.reverted) return;

    let asset = getOrCreateAsset(tryAsset.value.toHexString());
    let collateral = getOrCreateAsset(tryCollateral.value.toHexString());
    let protocol = getOrCreateProtocol(PROTOCOL_ID)
    market = new Market(marketId);
    market.asset = asset.id;
    market.collateralAsset = collateral.id;
    market.protocol = protocol.id
    market.save()
  }
}
