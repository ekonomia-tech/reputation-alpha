import { BigDecimal, log } from '@graphprotocol/graph-ts'
import { Event, Market, Position } from '../../generated/schema'
import {
  Borrow,
  Deposit,
  LiquidationCall,
  Repay,
  Withdraw
} from '../../generated/templates/LendingPool/LendingPool'
import { getOrCreateAccount } from '../helpers/account'
import { getOrCreateAsset, toUSD } from '../helpers/asset'
import { getOrCreateMarket } from '../helpers/market'
import { getNextPositionId, getPositionId } from '../helpers/position'
import { getOrCreateProtocol } from '../helpers/protocol'

export function handleBorrow(event: Borrow): void {
  let market = getOrCreateMarket(event.params.reserve.toHexString())
  let protocol = getOrCreateProtocol(market.protocol)
  let asset = getOrCreateAsset(market.asset)
  let account = getOrCreateAccount(event.params.user.toHexString())
  let onBehalfOf = getOrCreateAccount(event.params.onBehalfOf.toHexString())

  let borrowId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())

  let borrowAmount = event.params.amount
    .toBigDecimal()

  let eventEntry = new Event(borrowId)
  eventEntry.eventType = 'BORROW'
  eventEntry.market = market.id
  eventEntry.account = account.id

  if (account.id != onBehalfOf.id) {
    eventEntry.account = onBehalfOf.id
    eventEntry.executingAccount = account.id
  } else {
    eventEntry.account = account.id
  }

  eventEntry.protocol = protocol.id
  eventEntry.amount = borrowAmount
  eventEntry.amountUSD = toUSD(asset.id, eventEntry.amount)
  eventEntry.blockTime = event.block.timestamp.toI32()
  eventEntry.blockNumber = event.block.number.toI32()
  eventEntry.save()

  _handleBorrow(eventEntry);
}

export function handleDeposit(event: Deposit): void {
  let market = getOrCreateMarket(event.params.reserve.toHexString())
  let protocol = getOrCreateProtocol(market.protocol)
  let asset = getOrCreateAsset(market.asset)
  let account = getOrCreateAccount(event.params.user.toHexString())
  let onBehalfOf = getOrCreateAccount(event.params.onBehalfOf.toHexString())

  let depositId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())

  let depositAmount = event.params.amount
    .toBigDecimal()

  let eventEntry = new Event(depositId)
  eventEntry.eventType = 'DEPOSIT'
  eventEntry.market = market.id

  if (account.id != onBehalfOf.id) {
    eventEntry.account = onBehalfOf.id
    eventEntry.executingAccount = account.id
  } else {
    eventEntry.account = account.id
  }

  eventEntry.protocol = protocol.id
  eventEntry.amount = depositAmount
  eventEntry.amountUSD = toUSD(asset.id, eventEntry.amount)
  eventEntry.blockTime = event.block.timestamp.toI32()
  eventEntry.blockNumber = event.block.number.toI32()
  eventEntry.save()

  _handleDeposit(eventEntry);
}

export function handleWithdraw(event: Withdraw): void {
  let market = getOrCreateMarket(event.params.reserve.toHexString())
  let protocol = getOrCreateProtocol(market.protocol)
  let asset = getOrCreateAsset(market.asset)
  let account = getOrCreateAccount(event.params.user.toHexString())
  let to = getOrCreateAccount(event.params.to.toHexString())

  let withdrawId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())

  let withdrawAmount = event.params.amount
    .toBigDecimal()

  let eventEntry = new Event(withdrawId)
  eventEntry.eventType = 'WITHDRAW'
  eventEntry.protocol = protocol.id
  eventEntry.market = market.id
  eventEntry.account = account.id
  eventEntry.amount = withdrawAmount
  eventEntry.amountUSD = toUSD(asset.id, eventEntry.amount)
  eventEntry.blockTime = event.block.timestamp.toI32()
  eventEntry.blockNumber = event.block.number.toI32()
  eventEntry.to = to.id
  eventEntry.save()

  _handleWithdraw(eventEntry);
}

export function handleRepay(event: Repay): void {
  let market = getOrCreateMarket(event.params.reserve.toHexString())
  let protocol = getOrCreateProtocol(market.protocol)
  let asset = getOrCreateAsset(market.asset)
  let executingAccount = getOrCreateAccount(event.params.repayer.toHexString())
  let account = getOrCreateAccount(event.params.user.toHexString())

  let repayId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())

  let repayAmount = event.params.amount
    .toBigDecimal()

  let eventEntry = new Event(repayId)
  eventEntry.eventType = 'REPAY'
  eventEntry.market = market.id
  eventEntry.account = account.id
  eventEntry.executingAccount = executingAccount.id
  eventEntry.protocol = protocol.id
  eventEntry.amount = repayAmount
  eventEntry.amountUSD = toUSD(asset.id, eventEntry.amount)
  eventEntry.blockTime = event.block.timestamp.toI32()
  eventEntry.blockNumber = event.block.number.toI32()
  eventEntry.save()

  _handleRepay(eventEntry)
}

export function handleLiquidate(event: LiquidationCall): void {
  let market = getOrCreateMarket(event.params.debtAsset.toHexString())
  let protocol = getOrCreateProtocol(market.protocol)
  let asset = getOrCreateAsset(market.asset)
  let account = getOrCreateAccount(event.params.user.toHexString())
  let liquidator = getOrCreateAccount(event.params.liquidator.toHexString())

  let liquidationId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())

  log.warning("liquidation encountered: {}", [liquidationId])
  let LiquidateAmount = event.params.debtToCover
    .toBigDecimal()

  let eventEntry = new Event(liquidationId)
  eventEntry.eventType = 'LIQUIDATION'
  eventEntry.protocol = protocol.id
  eventEntry.market = market.id
  eventEntry.account = account.id
  eventEntry.liquidator = liquidator.id
  eventEntry.amount = LiquidateAmount
  eventEntry.amountUSD = toUSD(asset.id, eventEntry.amount)
  eventEntry.blockTime = event.block.timestamp.toI32()
  eventEntry.blockNumber = event.block.number.toI32()
  eventEntry.save()

  _handleLiquidation(eventEntry)
}

export function _handleBorrow(event: Event): void {
  let positionId = getPositionId(event);
  let position = Position.load(positionId);

  if (!position || !position.isActive) {
    positionId = getNextPositionId(event);
    position = new Position(positionId);
    position.protocol = event.protocol;
    position.account = event.account
    position.market = event.market;
    position.type = event.eventType;
    position.balance = BigDecimal.zero().minus(event.amount);
    position.borrowed = event.amount;
    position.repaid = BigDecimal.zero()
    position.deposited = BigDecimal.zero();
    position.withdrawn = BigDecimal.zero();
    position.isActive = true;
    position.events = [ event.id ];
    position.interestPaid = BigDecimal.zero()
    position.interestPaidUSD = BigDecimal.zero()
    position.closedPositions = [];
    position.isLiquidated = false;
    position.save();
    return;
  }

  position.balance = position.balance.minus(event.amount);
  position.borrowed = position.borrowed.plus(event.amount);

  let positionEvents = position.events;
  positionEvents.push(event.id);
  position.events = positionEvents;

  position.save();
}

export function _handleDeposit(event: Event): void {
  let positionId = getPositionId(event);
  let position = Position.load(positionId);

  if (!position || !position.isActive) {
    positionId = getNextPositionId(event);
    position = new Position(positionId);
    position.protocol = event.protocol;
    position.account = event.account
    position.market = event.market;
    position.type = event.eventType;
    position.balance = event.amount;
    position.borrowed = BigDecimal.zero()
    position.repaid = BigDecimal.zero()
    position.deposited = event.amount;
    position.withdrawn = BigDecimal.zero()
    position.isActive = true
    position.events = [ event.id ];
    position.interestPaid = BigDecimal.zero()
    position.interestPaidUSD = BigDecimal.zero()
    position.closedPositions = []
    position.isLiquidated = false;
    position.save();
    return;
  };

  let positionEvents = position.events;
  positionEvents.push(event.id);
  position.events = positionEvents;
  position.balance = position.balance.plus(event.amount);
  position.deposited = position.deposited.plus(event.amount);
  position.save();
}


export function _handleWithdraw(event: Event): void {
  let positionId = getPositionId(event);
  let position = Position.load(positionId);

  if (!position || !position.isActive) {
    positionId = getNextPositionId(event);
    position = new Position(positionId);
    position.protocol = event.protocol;
    position.account = event.account
    position.market = event.market;
    position.type = "WITHDRAW-LIQUIDATION";
    position.balance = event.amount;
    position.borrowed = BigDecimal.zero()
    position.repaid = BigDecimal.zero()
    position.deposited = BigDecimal.zero();
    position.withdrawn = event.amount;
    position.isActive = false;
    position.events = [ event.id ];
    position.interestPaid = BigDecimal.zero()
    position.interestPaidUSD = BigDecimal.zero()
    position.closedPositions = []
    position.isLiquidated = false;
    position.save();
    return;
  };

  position.balance = position.balance.minus(event.amount);
  position.withdrawn = position.withdrawn.plus(event.amount);

  let positionEvents = position.events;
  positionEvents.push(event.id);
  position.events = positionEvents;

  if(position.balance <= BigDecimal.zero()) {
    let market = Market.load(position.market);
    if (!market) {
      log.warning("[_handleWithdraw] Unable to find market {}", [position.market]);
      return;
    };
    position.isActive = false;
    position.interestPaid = position.withdrawn.minus(position.deposited);
    position.interestPaidUSD = toUSD(market.asset, position.interestPaid);
  };

  position.save();
}

// // In case of a repayment
// // 1. Check if there is an open BORROW position to the account
// //  a. if there is an open position:
// //    i. check if the executingAccount != null and executingAccount != account.
// //      I. if the accounts are different, treat as normal repayment, but mark the position as LIQUIDATED
// //      II. change the balances and close the position
// //    ii. if the executingAccount is empty, treat as normal repayment
// //      I. update balances and close the position if balance <= 0;
// //  b. if there is no open position
// //    i. check if there is a previous borrow position
// //      I. if there is a previous borrow position - update the balance and add the event. keep the position closed
// //      II. if there isnt any previous borrow position, create a new position, update the balance and close it

export function _handleRepay(event: Event): void {
  let positionId = getPositionId(event);
  let position = Position.load(positionId);
  let positionEvents: string[];

  if(!position) {
    positionId = getNextPositionId(event);
    position = new Position(positionId);
    position.protocol = event.protocol;
    position.account = event.account
    position.market = event.market;
    position.type = event.eventType;
    position.balance = BigDecimal.zero().plus(event.amount);
    position.borrowed = BigDecimal.zero()
    position.repaid = event.amount;
    position.deposited = BigDecimal.zero();
    position.withdrawn = BigDecimal.zero();
    position.isActive = false;
    position.events = [ event.id ];
    position.interestPaid = BigDecimal.zero();
    position.interestPaidUSD = BigDecimal.zero()
    position.closedPositions = [];
    position.isLiquidated = false;
    position.save();
    return;
  }
  
  
  position.balance = position.balance.plus(event.amount);
  position.repaid = position.repaid.plus(event.amount);

  positionEvents = position.events;
  positionEvents.push(event.id);
  position.events = positionEvents;

  if (position.repaid >= position.borrowed) {
    let market = Market.load(position.market);
    if (!market) {
      log.warning("[_handleRepay] Unable to find market {}", [position.market]);
      return;
    };
    position.interestPaid = position.repaid.minus(position.borrowed);
    position.interestPaidUSD = toUSD(market.asset, position.interestPaid);
    position.isActive = false;
  } else {
    if(event.executingAccount && event.executingAccount != event.account) {
      position.isLiquidated = true;
    }
  }
  position.save();
  
}

// In case of a liquidation
// 1. check if the borrow position exists of the account
//  a. exists - add the liquidation event to the position, market the position as liquidated but do not close it.
//      there will be a repayment event emitted that will close the position.
//  b. doesnt exits - pull out.
export function _handleLiquidation(event: Event): void {
  let positionId = getPositionId(event);
  let position = Position.load(positionId);

  if (!position) {
    log.warning("[_handleLiquidation] Liquidation processing failed - position {} not found", [positionId]);
    return;
  }

  position.isLiquidated = true;
  let positionEvents = position.events;
  positionEvents.push(event.id);
  position.events = positionEvents;

  position.balance = position.balance.plus(event.amount);
  position.repaid = position.repaid.plus(event.amount);
  
  if(position.balance >= BigDecimal.zero() ) {
    let market = Market.load(position.market);
    if (!market) {
      log.warning("[_handleLiquidation] Unable to find market {}", [position.market]);
      return;
    };

    position.isActive = false;
    position.interestPaid = position.repaid.minus(position.borrowed);
    position.interestPaidUSD = toUSD(market.asset, event.amount);
  };

  position.save();
}