import { BigDecimal, log } from '@graphprotocol/graph-ts'
import {
  Borrow,
  LiquidateBorrow,
  Mint,
  Redeem,
  RepayBorrow,
  Transfer
} from '../../generated/Comptroller/CToken'
import { Event, Market, Position } from '../../generated/schema'
import { getOrCreateAccount, markAccountAsBorrowed } from '../helpers/account'
import { getOrCreateAsset, toUSD } from '../helpers/asset'
import { getOrCreateMarket } from '../helpers/market'
import { getNextPositionId, getPositionId } from '../helpers/position'
import { getOrCreateProtocol } from '../helpers/protocol'

export function handleMint(event: Mint): void {
  let market = getOrCreateMarket(event.address.toHexString())
  let asset = getOrCreateAsset(market.asset)
  let protocol = getOrCreateProtocol(market.protocol)
  let account = getOrCreateAccount(event.params.minter.toHexString())
  let mintId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())

  let underlyingAmount = event.params.mintAmount.toBigDecimal()

  let eventEntry = new Event(mintId)
  eventEntry.eventType = 'DEPOSIT'
  eventEntry.market = market.id
  eventEntry.protocol = protocol.id
  eventEntry.account = account.id
  eventEntry.amount = underlyingAmount
  eventEntry.amountUSD = toUSD(market.asset, underlyingAmount)
  eventEntry.blockTime = event.block.timestamp.toI32()
  eventEntry.blockNumber = event.block.number.toI32()
  eventEntry.save()

  _handleDeposit(eventEntry);
}

export function handleRedeem(event: Redeem): void {
  let market = getOrCreateMarket(event.address.toHexString())
  let asset = getOrCreateAsset(market.asset)
  let protocol = getOrCreateProtocol(market.protocol)
  let account = getOrCreateAccount(event.params.redeemer.toHexString())
  let redeemId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())

  let underlyingAmount = event.params.redeemAmount
    .toBigDecimal()

  let eventEntry = new Event(redeemId)
  eventEntry.eventType = 'WITHDRAW'
  eventEntry.market = market.id
  eventEntry.protocol = protocol.id
  eventEntry.account = account.id
  eventEntry.amount = underlyingAmount
  eventEntry.amountUSD = toUSD(market.asset, underlyingAmount)
  eventEntry.blockTime = event.block.timestamp.toI32()
  eventEntry.blockNumber = event.block.number.toI32()

  eventEntry.save()

  _handleWithdraw(eventEntry);
}

export function handleBorrow(event: Borrow): void {
  let market = getOrCreateMarket(event.address.toHexString())
  let asset = getOrCreateAsset(market.asset)
  let protocol = getOrCreateProtocol(market.protocol)
  let account = getOrCreateAccount(event.params.borrower.toHexString())
  let borrowId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())

  markAccountAsBorrowed(account)

  let underlyingAmount = event.params.borrowAmount
    .toBigDecimal()

  let eventEntry = new Event(borrowId)
  eventEntry.protocol = protocol.id
  eventEntry.eventType = 'BORROW'
  eventEntry.market = market.id
  eventEntry.protocol = protocol.id
  eventEntry.account = account.id
  eventEntry.amount = underlyingAmount
  eventEntry.amountUSD = toUSD(market.asset, underlyingAmount)
  eventEntry.blockTime = event.block.timestamp.toI32()
  eventEntry.blockNumber = event.block.number.toI32()

  eventEntry.save()

  _handleBorrow(eventEntry);
}

export function handleRepayBorrow(event: RepayBorrow): void {
  let market = getOrCreateMarket(event.address.toHexString())
  let asset = getOrCreateAsset(market.asset)
  let protocol = getOrCreateProtocol(market.protocol)
  let account = getOrCreateAccount(event.params.borrower.toHexString())
  let executingAccount = getOrCreateAccount(event.params.payer.toHexString())

  let repayId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())

  let underlyingAmount = event.params.repayAmount
    .toBigDecimal()

  let eventEntry = new Event(repayId)
  eventEntry.protocol = protocol.id
  eventEntry.eventType = 'REPAY'
  eventEntry.market = market.id
  eventEntry.protocol = protocol.id
  eventEntry.account = account.id
  eventEntry.executingAccount = executingAccount.id
  eventEntry.amount = underlyingAmount
  eventEntry.amountUSD = toUSD(market.asset, underlyingAmount)
  eventEntry.amount = underlyingAmount
  eventEntry.blockTime = event.block.timestamp.toI32()
  eventEntry.blockNumber = event.block.number.toI32()

  eventEntry.save()

  _handleRepay(eventEntry);
}

export function handleLiquidateBorrow(event: LiquidateBorrow): void {
  let market = getOrCreateMarket(event.address.toHexString())
  let asset = getOrCreateAsset(market.asset)
  let protocol = getOrCreateProtocol(market.protocol)
  let account = getOrCreateAccount(event.params.borrower.toHexString())
  let liquidator = getOrCreateAccount(event.params.liquidator.toHexString())
  let liquidationId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())

  let underlyingAmount = event.params.repayAmount
    .toBigDecimal()

  let eventEntry = new Event(liquidationId)
  eventEntry.protocol = protocol.id
  eventEntry.eventType = 'LIQUIDATION'
  eventEntry.market = market.id
  eventEntry.protocol = protocol.id
  eventEntry.account = account.id
  eventEntry.amount = underlyingAmount
  eventEntry.liquidator = liquidator.id
  eventEntry.amountUSD = toUSD(asset.id, eventEntry.amount)
  eventEntry.blockTime = event.block.timestamp.toI32()
  eventEntry.blockNumber = event.block.number.toI32()

  eventEntry.save()

  _handleLiquidation(eventEntry);
}

export function handleTransfer(event: Transfer): void {
  let market = getOrCreateMarket(event.address.toHexString())
  let asset = getOrCreateAsset(market.asset)
  let protocol = getOrCreateProtocol(market.protocol)
  let account = getOrCreateAccount(event.params.from.toHexString())
  let to = getOrCreateAccount(event.params.to.toHexString())
  let depositId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())
    .concat('-td')

  let withdrawId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())
    .concat('-tw')

  let underlyingAmount = event.params.amount.toBigDecimal();

  let withdrawEntry = new Event(withdrawId)
  withdrawEntry.protocol = protocol.id
  withdrawEntry.eventType = 'WITHDRAW'
  withdrawEntry.market = market.id
  withdrawEntry.protocol = protocol.id
  withdrawEntry.account = account.id
  withdrawEntry.amount = underlyingAmount
  withdrawEntry.amountUSD = toUSD(asset.id, withdrawEntry.amount)
  withdrawEntry.blockTime = event.block.timestamp.toI32()
  withdrawEntry.blockNumber = event.block.number.toI32()

  withdrawEntry.save()

  _handleWithdraw(withdrawEntry);

  let depositEntry = new Event(depositId)
  depositEntry.protocol = protocol.id
  depositEntry.eventType = 'DEPOSIT'
  depositEntry.market = market.id
  depositEntry.protocol = protocol.id
  depositEntry.to = to.id
  depositEntry.amount = underlyingAmount
  depositEntry.amountUSD = toUSD(asset.id, depositEntry.amount)
  depositEntry.blockTime = event.block.timestamp.toI32()
  depositEntry.blockNumber = event.block.number.toI32()

  depositEntry.save()

  _handleDeposit(depositEntry);
}

// In case of a deposit
// 1. Check if the user has an open position of a deposit
//  a. if the user has an open position, accrue the amount to the open position
//  b. if the user does not have an open position, open a position an immediately attach the deposit to it
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

// I case of a withdrawal:
// 1. check if there is an open deposit position linked to that account in that market
// NOTE - the account can belong to the liquidator - which might have an open DEPOSIT position on this market.
//        the calculation does not differentiate withdrawals of liquidated cTokens. 
//  a. if there is a position - add the withdraw event to the position events and change the balances
//    i. if the balance is <= 0 - close the position;
//    i. if the balance is > 0 - save the position and exit
//  b. if there is no position
//    i. open a new position and change the balance
//    ii. mark the new position type as "WITHDRAW-LIQUIDATION"
//    ii. close the position
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

// // In case of a borrow:
// //  1. check if the account has an open borrow position
// //    a. if the account has an open position, update the balances and add the event
// //    b. if the account does not have an open position, open a new position
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

  position.save();
}