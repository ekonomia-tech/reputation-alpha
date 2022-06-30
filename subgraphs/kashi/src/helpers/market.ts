import { Address } from '@graphprotocol/graph-ts'
import { Account, Event, Market, Protocol } from '../../generated/schema'
import { KashiPair } from '../../generated/templates/KashiPair/KashiPair'
import { getOrCreateAsset } from './asset'
import { getConcatenatedId, PROTOCOL_ID } from './generic'
import {
  getOrCreatePosition,
  isPartialRepayment,
  processPositionLiquidation,
  updateLastPositionPartialPayment,
  updatePosition,
} from './position'
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

export function updateStatistics(
  protocol: Protocol,
  market: Market,
  account: Account,
  event: Event,
): void {
  updateMarketPositions(protocol, account, market, event)
}

export function updateMarketPositions(
  protocol: Protocol,
  account: Account,
  market: Market,
  event: Event,
): void {
  if (!(account.id && market.id)) {
    return
  }

  // verify the event is not TRANSFER, in which case will not affect the position
  if (event.eventType == 'TRANSFER') {
    return
  }

  let position = getOrCreatePosition(protocol, account, market, event.eventType, '')

  // In case there is a liquidation event, the liquidated account will be revoked fro getting reputation out of that
  // position as a whole, whether partial or full
  if (event.eventType == 'LIQUIDATION') {
    processPositionLiquidation(position, event)
    return
  }

  // In case of a closed position, if there is a remainder of interest to be paid, but the balance is under 0, then the
  // repayment will be added to the last closed position as a repayment event
  if (isPartialRepayment(position, event)) {
    updateLastPositionPartialPayment(position, event)
    return
  }
  updatePosition(position, event)
}
