import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { BentoBox } from '../../generated/BentoBox/BentoBox';
import { Asset, Event, Market } from '../../generated/schema';
import { ERC20 } from '../../generated/templates/KashiPair/ERC20';
import { KashiPair, LogAddCollateral, LogBorrow, LogRemoveCollateral, LogRepay } from '../../generated/templates/KashiPair/KashiPair';
import { getOrCreateAccount } from '../helpers/account';
import { getOrCreateAsset, toUSD } from '../helpers/asset';
import { exponentToBigDecimal, getConcatenatedId, PROTOCOL_ID } from '../helpers/generic';
import { updateStatistics } from '../helpers/market';
import { getOrCreateProtocol } from '../helpers/protocol';


export function handleLogBorrow(event: LogBorrow): void {
    const market = Market.load(getConcatenatedId([PROTOCOL_ID, event.address.toHexString()]));
    if(!market) return;
    const protocol = getOrCreateProtocol(PROTOCOL_ID);
    const account = getOrCreateAccount(event.params.to.toHexString());
    
    const ksPair = KashiPair.bind(event.address);
    const asset = getOrCreateAsset(ksPair.asset().toHexString())

    let borrowedAmount = event.params.amount.divDecimal(exponentToBigDecimal(asset.decimals));

    let borrowId = event.transaction.hash
        .toHexString()
        .concat('-')
        .concat(event.transactionLogIndex.toString())

    let eventEntry = new Event(borrowId)
    eventEntry.market = market.id
    eventEntry.protocol = market.protocol
    eventEntry.eventType = "BORROW"
    eventEntry.account = account.id
    eventEntry.amount = borrowedAmount
    eventEntry.amountUSD = toUSD(market.asset, borrowedAmount);
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()

    eventEntry.save();

    updateStatistics(protocol, market, account, eventEntry)
}

export function handleLogRepay(event: LogRepay): void {

    const market = Market.load(getConcatenatedId([PROTOCOL_ID, event.address.toHexString()]));
    if(!market) return;
    const protocol = getOrCreateProtocol(PROTOCOL_ID);
    let asset = getOrCreateAsset(market.asset);
    let invoker = getOrCreateAccount(event.params.from.toHexString())
    let account = getOrCreateAccount(event.params.to.toHexString()) 
    
    // Check if this is a repayment or a liquidation
    // let isLiquidation = [invoker.id, market.id].indexOf(account.id) == -1
    // Keep false until as actual liquidation is being logged in the handleLogRemoveCollateral that is beig called on liquidation
    let isLiquidation = false

    let amount = event.params.amount
        .divDecimal(exponentToBigDecimal(asset.decimals))

    let repayId = event.transaction.hash
        .toHexString()
        .concat('-')
        .concat(event.transactionLogIndex.toString())

    let eventEntry = new Event(repayId)
    eventEntry.market = market.id
    eventEntry.protocol = market.protocol
    
    // If the user receiving the amount is not the one that invoked that repayment, the action is liquidation
    eventEntry.eventType = isLiquidation ? "LIQUIDATION" : "REPAY"
    eventEntry.liquidator = isLiquidation ? invoker.id : null
    eventEntry.account = account.id
    eventEntry.amount = amount
    eventEntry.amountUSD = toUSD(market.asset, amount);
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()

    eventEntry.save();

    updateStatistics(protocol, market, account, eventEntry)

}

export function handleLogAddCollateral(event: LogAddCollateral): void {

    const market = Market.load(getConcatenatedId([PROTOCOL_ID, event.address.toHexString()]));
    if(!market) return;
    const protocol = getOrCreateProtocol(PROTOCOL_ID);
    const ksPair = KashiPair.bind(event.address);
    let bentoBox = BentoBox.bind(ksPair.bentoBox());

    let collateral = getOrCreateAsset(ksPair.collateral().toHexString());
    let collateralAddress = Address.fromString(collateral.id);
    let account = getOrCreateAccount(event.params.from.toHexString()) 
    let to = getOrCreateAccount(event.params.to.toHexString());
    
    const collateralAdded = bentoBox
        .toAmount(collateralAddress , event.params.share, false)
        .divDecimal(exponentToBigDecimal(collateral.decimals))

    let collId = event.transaction.hash
        .toHexString()
        .concat('-')
        .concat(event.transactionLogIndex.toString())

    let eventEntry = new Event(collId)
    eventEntry.market = market.id
    eventEntry.protocol = market.protocol
    eventEntry.eventType = "DEPOSIT"
    eventEntry.account = account.id
    eventEntry.to = to.id
    eventEntry.amount = collateralAdded
    eventEntry.amountUSD = toUSD(collateralAddress.toHexString(), collateralAdded);
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()

    eventEntry.save();

    updateStatistics(protocol, market, account, eventEntry);
}

export function handleLogRemoveCollateral(event: LogRemoveCollateral): void {
    const market = Market.load(getConcatenatedId([PROTOCOL_ID, event.address.toHexString()]));
    if(!market) return;
    const protocol = getOrCreateProtocol(PROTOCOL_ID);
    const ksPair = KashiPair.bind(event.address);
    const bentoBox = BentoBox.bind(ksPair.bentoBox());

    let collateral = getOrCreateAsset(ksPair.collateral().toHexString());

    let invoker = getOrCreateAccount(event.params.from.toHexString())
    let account = getOrCreateAccount(event.params.to.toHexString()) 

    // Check if this is a repayment or a liquidation
    let isLiquidation = [invoker.id, market.id].indexOf(account.id) == -1
    
    const collateralRemoved = bentoBox
        .toAmount(ksPair.collateral(), event.params.share, false)
        .divDecimal(exponentToBigDecimal(collateral.decimals)) 

    let collId = event.transaction.hash
        .toHexString()
        .concat('-')
        .concat(event.transactionLogIndex.toString())

    let eventEntry = new Event(collId)
    eventEntry.market = market.id
    eventEntry.protocol = market.protocol
    eventEntry.eventType = isLiquidation ? "LIQUIDATION" : "WITHDRAW"
    eventEntry.account = account.id
    eventEntry.amount = collateralRemoved
    eventEntry.amountUSD = toUSD(collateral.id, collateralRemoved);
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()

    eventEntry.save();

    updateStatistics(protocol, market, account, eventEntry)
}
