import { exponentToBigDecimal, PROTOCOL_ID } from "../helpers/generic";
import { getOrCreateProtocol } from "../helpers/protocol";
import { Genesis, Deposit, Borrow, Withdraw, Repay, MarketActivated } from "../../generated/Euler/Euler"
import { getOrCreateMarket, updateStatistics } from "../helpers/market";
import { getOrCreateAsset, toUSD } from "../helpers/asset";
import { getOrCreateAccount, markAccountAsBorrowed } from "../helpers/account";
import { Event } from "../../generated/schema";
import { log } from "@graphprotocol/graph-ts";

export function handleGenesis(event: Genesis): void {
    getOrCreateProtocol(PROTOCOL_ID);
}

export function handleDeposit(event: Deposit): void {
    let market = getOrCreateMarket(event.params.underlying.toHexString());
    let asset = getOrCreateAsset(market.asset)
    let protocol = getOrCreateProtocol(market.protocol)
    let account = getOrCreateAccount(event.params.account.toHexString())
    let depositId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())

    log.warning("token: {}, Amount: {}", [asset.symbol, event.params.amount.toString()]);
    let underlyingAmount = event.params.amount
        .toBigDecimal()
        .div(exponentToBigDecimal(asset.decimals))
        .truncate(asset.decimals);
    
    let eventEntry = new Event(depositId)
    eventEntry.eventType = "DEPOSIT"
    eventEntry.market = market.id
    eventEntry.protocol = protocol.id
    eventEntry.account = account.id
    eventEntry.amount = underlyingAmount
    eventEntry.amountUSD = toUSD(market.asset, underlyingAmount);
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()
    eventEntry.save()

    updateStatistics(protocol, market, account, eventEntry);
}

export function handleBorrow(event: Borrow): void {
    let market = getOrCreateMarket(event.params.underlying.toHexString());
    let protocol = getOrCreateProtocol(market.protocol);
    let asset = getOrCreateAsset(market.asset);
    let account = getOrCreateAccount(event.params.account.toHexString());
  
    let borrowId = event.transaction.hash
      .toHexString()
      .concat('-')
      .concat(event.transactionLogIndex.toString());
    
    let borrowAmount = event.params.amount
      .toBigDecimal()
      .div(exponentToBigDecimal(asset.decimals))
      .truncate(asset.decimals);
  
    let eventEntry = new Event(borrowId);
    eventEntry.eventType = "BORROW";
    eventEntry.market = market.id;
    eventEntry.account = account.id;
    eventEntry.account = account.id;
    eventEntry.protocol = protocol.id;
    eventEntry.amount = borrowAmount;
    eventEntry.amountUSD = toUSD(asset.id, eventEntry.amount);
    eventEntry.blockTime = event.block.timestamp.toI32();
    eventEntry.blockNumber = event.block.number.toI32();
    eventEntry.save();

    markAccountAsBorrowed(account);
    updateStatistics(protocol, market, account, eventEntry);
  
}

export function handleWithdraw(event: Withdraw): void {
    let market = getOrCreateMarket(event.params.underlying.toHexString());
    let protocol = getOrCreateProtocol(market.protocol);
    let asset = getOrCreateAsset(market.asset);
    let account = getOrCreateAccount(event.params.account.toHexString());

    let withdrawId = event.transaction.hash
      .toHexString()
      .concat('-')
      .concat(event.transactionLogIndex.toString());

    let withdrawAmount = event.params.amount
      .toBigDecimal()
      .div(exponentToBigDecimal(asset.decimals))
      .truncate(asset.decimals);

    let eventEntry = new Event(withdrawId);
    eventEntry.eventType = "WITHDRAW";
    eventEntry.protocol = protocol.id;
    eventEntry.market = market.id;
    eventEntry.account = account.id;
    eventEntry.amount = withdrawAmount;
    eventEntry.amountUSD = toUSD(asset.id, eventEntry.amount);
    eventEntry.blockTime = event.block.timestamp.toI32();
    eventEntry.blockNumber = event.block.number.toI32();
    eventEntry.save();
    
    updateStatistics(protocol, market, account, eventEntry);
}

export function handleRepay(event: Repay): void {
    let market = getOrCreateMarket(event.params.underlying.toHexString());
    let protocol = getOrCreateProtocol(market.protocol);
    let asset = getOrCreateAsset(market.asset);
    let account = getOrCreateAccount(event.params.account.toHexString());

    let repayId = event.transaction.hash
      .toHexString()
      .concat('-')
      .concat(event.transactionLogIndex.toString());

    let repayAmount = event.params.amount
      .toBigDecimal()
      .div(exponentToBigDecimal(asset.decimals))
      .truncate(asset.decimals);

    let eventEntry = new Event(repayId);
    eventEntry.eventType = "REPAY";
    eventEntry.market = market.id;
    eventEntry.account = account.id;
    eventEntry.protocol = protocol.id;
    eventEntry.amount = repayAmount;
    eventEntry.amountUSD = toUSD(asset.id, eventEntry.amount);
    eventEntry.blockTime = event.block.timestamp.toI32();
    eventEntry.blockNumber = event.block.number.toI32();
    eventEntry.save();

    updateStatistics(protocol, market, account, eventEntry);
}

export function handleMarketActivated(event: MarketActivated): void {
    getOrCreateMarket(event.params.underlying.toHexString());
}