import { Address, BigDecimal, log } from '@graphprotocol/graph-ts';
import { BentoBox } from '../../generated/BentoBox/BentoBox';
import { Event, Market, Position } from '../../generated/schema';
import { KashiPair, LogAddCollateral, LogBorrow, LogRemoveCollateral, LogRepay } from '../../generated/templates/KashiPair/KashiPair';
import { getOrCreateAccount } from '../helpers/account';
import { getOrCreateAsset, toUSD } from '../helpers/asset';
import { getConcatenatedId, PROTOCOL_ID } from '../helpers/generic';
import { getNextPositionId, getPositionId } from '../helpers/position';
import { getOrCreateProtocol } from '../helpers/protocol';


export function handleLogBorrow(event: LogBorrow): void {
    const market = Market.load(getConcatenatedId([PROTOCOL_ID, event.address.toHexString()]));
    if(!market) {
        log.warning("market {} not found", [event.address.toHexString()])
        return;
    }
    const protocol = getOrCreateProtocol(PROTOCOL_ID);
    const account = getOrCreateAccount(event.params.from.toHexString());
    
    const ksPair = KashiPair.bind(event.address);
    const asset = getOrCreateAsset(ksPair.asset().toHexString())

    let borrowedAmount = event.params.amount.toBigDecimal();

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

    _handleBorrow(eventEntry);
}

export function handleLogRepay(event: LogRepay): void {

    const market = Market.load(getConcatenatedId([PROTOCOL_ID, event.address.toHexString()]));
    if(!market) return;
    const protocol = getOrCreateProtocol(PROTOCOL_ID);
    let asset = getOrCreateAsset(market.asset);
    let invoker = getOrCreateAccount(event.params.from.toHexString())
    let account = getOrCreateAccount(event.params.to.toHexString()) 
    
    // Check if this is a repayment or a liquidation
    let isLiquidation = invoker.id != account.id;

    let amount = event.params.amount.toBigDecimal();

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

    _handleRepay(eventEntry);

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
        .toBigDecimal();

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

    _handleDeposit(eventEntry);
}

export function handleLogRemoveCollateral(event: LogRemoveCollateral): void {
    const market = Market.load(getConcatenatedId([PROTOCOL_ID, event.address.toHexString()]));
    if(!market) return;
    const ksPair = KashiPair.bind(event.address);
    const bentoBox = BentoBox.bind(ksPair.bentoBox());

    let collateral = getOrCreateAsset(ksPair.collateral().toHexString());

    let invoker = getOrCreateAccount(event.params.to.toHexString())
    let account = getOrCreateAccount(event.params.from.toHexString()) 
    
    const collateralRemoved = bentoBox
        .toAmount(ksPair.collateral(), event.params.share, false)
        .toBigDecimal();

    let collId = event.transaction.hash
        .toHexString()
        .concat('-')
        .concat(event.transactionLogIndex.toString())

    let eventEntry = new Event(collId)
    eventEntry.market = market.id
    eventEntry.protocol = market.protocol
    eventEntry.eventType = "WITHDRAW"
    eventEntry.account = account.id
    eventEntry.executingAccount = invoker.id != account.id ? invoker.id : null;
    eventEntry.amount = collateralRemoved
    eventEntry.amountUSD = toUSD(collateral.id, collateralRemoved);
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()

    eventEntry.save();

    _handleWithdraw(eventEntry)
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
    
    if(event.executingAccount && event.executingAccount != event.account) {
        position.isLiquidated = true;
    }
    position.save();
  }
  
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