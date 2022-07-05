import { Market } from '../../generated/schema'
import { getOrCreateAsset } from './asset'
import { getConcatenatedId, PROTOCOL_ID } from './generic'
import { getOrCreateProtocol } from './protocol'

// id can be either "protocolId-assetId" or "assetId"
// if id == assetId, the market will not be found, and then a market will be created as "protocol-assetId"
export function getOrCreateMarket(id: string): Market {
  let market = Market.load(id)
  if (!market) {
    let marketId = id.indexOf('-') == -1 ? getConcatenatedId([PROTOCOL_ID, id]) : id
    let asset = getOrCreateAsset(id)
    let protocol = getOrCreateProtocol(PROTOCOL_ID)
    market = new Market(marketId)
    market.asset = asset.id
    market.protocol = protocol.id
    market.save()
  }
  return market
}
