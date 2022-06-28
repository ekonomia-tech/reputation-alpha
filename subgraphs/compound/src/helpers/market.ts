import { Address } from "@graphprotocol/graph-ts";
import { getOrCreatePosition, isPartialRepayment, processPositionLiquidation, updateLastPositionPartialPayment, updatePosition } from "./position";
import { ERC20 } from "../../generated/Comptroller/ERC20";
import { Account, Event, Market, Protocol } from "../../generated/schema";
import { CToken } from "../../generated/templates/CToken/CToken";
import { getOrCreateAsset } from "./asset";
import { CETH_ADDRESS, DAI_V1_ADDRESS, getConcatenatedId, PROTOCOL_ID } from "./generic";
import { getOrCreateProtocol } from "./protocol";

export function getOrCreateMarket(id: string): Market {
    let marketId = getConcatenatedId([PROTOCOL_ID, id.toString()]);
    let market = Market.load(marketId);
    if (market) {
        return market
    }

    let contract = CToken.bind(Address.fromString(id))
    let protocol = getOrCreateProtocol(PROTOCOL_ID);

    let assetAddress: Address;
    let assetSymbol: string
    let assetName: string
    let assetDecimals: i32

    market = new Market(marketId);
    // It is CETH, which has a slightly different interface
    if (id == CETH_ADDRESS ) {
      assetAddress = Address.fromString(
        '0x0000000000000000000000000000000000000000',
      )
      assetDecimals = 18
      assetName = 'Ether'
      assetSymbol = 'ETH'
      // It is all other CERC20 contracts
    } else {
      assetAddress = contract.underlying();
      let underlyingContract = ERC20.bind(assetAddress as Address)
      assetDecimals = underlyingContract.decimals()
      if (assetAddress.toHexString() != DAI_V1_ADDRESS) {
        let tryName = underlyingContract.try_name();
        let trySymbol = underlyingContract.try_symbol();
        assetName = tryName.reverted ? "" : tryName.value;
        assetSymbol = trySymbol.reverted ? "" : trySymbol.value;
      } else {
        assetName = 'Dai Stablecoin v1.0 (DAI)'
        assetSymbol = 'DAI'
      }
    }

    let asset = getOrCreateAsset(assetAddress.toHexString());
    asset.name = assetName
    asset.symbol = assetSymbol
    asset.decimals = assetDecimals
    asset.save()

    market.protocol = protocol.id
    market.asset = asset.id
    market.save()
    
    return market
}


export function updateStatistics(protocol: Protocol, market: Market, account: Account, event: Event): void {
  updateMarketPositions(protocol, account, market, event)
}

export function updateMarketPositions(protocol: Protocol, account: Account, market: Market, event: Event): void {

if (!(account.id && market.id)) {
  return
}

// verify the event is not TRANSFER, in which case will not affect the position
if (event.eventType == "TRANSFER") {
  return;
}

let position = getOrCreatePosition(protocol, account, market, event.eventType, '');

// In case there is a liquidation event, the liquidated account will be revoked fro getting reputation out of that 
// position as a whole, whether partial or full
if (event.eventType == "LIQUIDATION") {
  processPositionLiquidation(position, event);
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

