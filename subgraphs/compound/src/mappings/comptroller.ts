import { MarketListed } from "../../generated/Comptroller/Comptroller"
import { CToken } from "../../generated/templates"
import { getOrCreateMarket } from "../helpers/market"

export function handleMarketListed(event: MarketListed): void {
    // Dynamically index all new listed tokens
    CToken.create(event.params.cToken)
    // Create the market for this token, since it's now been listed.
    getOrCreateMarket(event.params.cToken.toHexString())
}

// export function handleMarketEntered(event: MarketEntered): void {
//     let market = getOrCreateMarket(event.params.cToken.toHexString())
//     let account = getOrCreateAccount(event.params.account.toHexString())
//     let protocol = getProtocol(market.protocol)
//     getOrCreateAccountInProtocol(protocol.id, account.id)
//     getOrCreateAccountInMarket(market.id, account.id)
// }