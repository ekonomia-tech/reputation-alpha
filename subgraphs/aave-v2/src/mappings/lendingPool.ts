import { Account, Event } from '../../generated/schema';
import { Borrow, Deposit, LiquidationCall, Repay, Withdraw } from '../../generated/templates/LendingPool/LendingPool';
import { getOrCreateAccount, markAccountAsBorrowed } from '../helpers/account';
import { getOrCreateAsset, toUSD } from '../helpers/asset';
import { exponentToBigDecimal } from '../helpers/generic';
import { getOrCreateMarket, updateStatistics } from '../helpers/market';
import { getOrCreateProtocol } from '../helpers/protocol';

export function handleBorrow(event: Borrow): void {
    
    let market = getOrCreateMarket(event.params.reserve.toHexString());
    let protocol = getOrCreateProtocol(market.protocol);
    let asset = getOrCreateAsset(market.asset);
    let account = getOrCreateAccount(event.params.user.toHexString());
    let onBehalfOf = getOrCreateAccount(event.params.onBehalfOf.toHexString());
  
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

    if (account.id != onBehalfOf.id) {
      eventEntry.account = onBehalfOf.id
      eventEntry.executingAccount = account.id
    } else {
      eventEntry.account = account.id
    }

    eventEntry.protocol = protocol.id;
    eventEntry.amount = borrowAmount;
    eventEntry.amountUSD = toUSD(asset.id, eventEntry.amount);
    eventEntry.blockTime = event.block.timestamp.toI32();
    eventEntry.blockNumber = event.block.number.toI32();
    eventEntry.save();

    if (eventEntry.executingAccount) {
      updateStatistics(protocol, market, onBehalfOf, eventEntry);
      markAccountAsBorrowed(onBehalfOf);
      return
    }
    markAccountAsBorrowed(account);
    updateStatistics(protocol, market, account, eventEntry);
  
  }

export function handleDeposit(event: Deposit): void {
    
    let market = getOrCreateMarket(event.params.reserve.toHexString());
    let protocol = getOrCreateProtocol(market.protocol);
    let asset = getOrCreateAsset(market.asset);
    let account = getOrCreateAccount(event.params.user.toHexString());
    let onBehalfOf = getOrCreateAccount(event.params.onBehalfOf.toHexString());

    let depositId = event.transaction.hash
      .toHexString()
      .concat('-')
      .concat(event.transactionLogIndex.toString());

    let depositAmount = event.params.amount
      .toBigDecimal()
      .div(exponentToBigDecimal(asset.decimals))
      .truncate(asset.decimals);

    let eventEntry = new Event(depositId);
    eventEntry.eventType = "DEPOSIT";
    eventEntry.market = market.id;
    
    if (account.id != onBehalfOf.id) {
      eventEntry.account = onBehalfOf.id
      eventEntry.executingAccount = account.id
    } else {
      eventEntry.account = account.id
    }

    eventEntry.protocol = protocol.id;
    eventEntry.amount = depositAmount;
    eventEntry.amountUSD = toUSD(asset.id, eventEntry.amount);
    eventEntry.blockTime = event.block.timestamp.toI32();
    eventEntry.blockNumber = event.block.number.toI32();
    eventEntry.save();

    if (eventEntry.executingAccount) {
        updateStatistics(protocol, market, onBehalfOf, eventEntry);
        return;
    }
    updateStatistics(protocol, market, account, eventEntry);
}

export function handleWithdraw(event: Withdraw): void {
   
    let market = getOrCreateMarket(event.params.reserve.toHexString());
    let protocol = getOrCreateProtocol(market.protocol);
    let asset = getOrCreateAsset(market.asset);
    let account = getOrCreateAccount(event.params.user.toHexString());
    let to = getOrCreateAccount(event.params.to.toHexString());

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
    eventEntry.to = to.id;
    eventEntry.save();
    
    updateStatistics(protocol, market, account, eventEntry);
}

export function handleRepay(event: Repay): void {
   
    let market = getOrCreateMarket(event.params.reserve.toHexString());
    let protocol = getOrCreateProtocol(market.protocol);
    let asset = getOrCreateAsset(market.asset);
    let executingAccount = getOrCreateAccount(event.params.repayer.toHexString());
    let account = getOrCreateAccount(event.params.user.toHexString());

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
    eventEntry.executingAccount = executingAccount.id;  
    eventEntry.protocol = protocol.id;
    eventEntry.amount = repayAmount;
    eventEntry.amountUSD = toUSD(asset.id, eventEntry.amount);
    eventEntry.blockTime = event.block.timestamp.toI32();
    eventEntry.blockNumber = event.block.number.toI32();
    eventEntry.save();

    updateStatistics(protocol, market, account, eventEntry);
}

export function handleLiquidate(event: LiquidationCall): void {
   
    let market = getOrCreateMarket(event.params.debtAsset.toHexString())
    let protocol = getOrCreateProtocol(market.protocol);
    let asset = getOrCreateAsset(market.asset);
    let account = getOrCreateAccount(event.params.user.toHexString());
    let liquidator = getOrCreateAccount(event.params.liquidator.toHexString());

    let liquidationId = event.transaction.hash
      .toHexString()
      .concat('-')
      .concat(event.transactionLogIndex.toString());

    let LiquidateAmount = event.params.debtToCover
      .toBigDecimal()
      .div(exponentToBigDecimal(asset.decimals))
      .truncate(asset.decimals);

    let eventEntry = new Event(liquidationId);
    eventEntry.eventType = "LIQUIDATION"
    eventEntry.protocol = protocol.id;
    eventEntry.market = market.id;
    eventEntry.account = account.id;
    eventEntry.liquidator = liquidator.id;
    eventEntry.amount = LiquidateAmount;
    eventEntry.amountUSD = toUSD(asset.id, eventEntry.amount);
    eventEntry.blockTime = event.block.timestamp.toI32();
    eventEntry.blockNumber = event.block.number.toI32();
    eventEntry.save();
    
    updateStatistics(protocol, market, account, eventEntry);
}
