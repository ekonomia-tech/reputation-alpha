import { MarketListed } from '../../generated/Comptroller/Comptroller'
import { CToken } from '../../generated/templates'
import { getOrCreateMarket } from '../helpers/market'

export function handleMarketListed(event: MarketListed): void {
  // Dynamically index all new listed tokens
  CToken.create(event.params.cToken)
  // Create the market for this token, since it's now been listed.
  getOrCreateMarket(event.params.cToken.toHexString())
}