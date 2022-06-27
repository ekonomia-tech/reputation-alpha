import { BigDecimal } from "@graphprotocol/graph-ts";
import { Position, Event, Protocol, Market, Account } from "../../generated/schema";
import { getOrCreateAccount } from "./account";
import { getConcatenatedId } from "./generic";
import { getOrCreateMarket } from "./market";
import { getOrCreateProtocol } from "./protocol";

export function getOrCreatePosition(protocol: Protocol, account: Account, market: Market, eventType: string, loc: string): Position {
    let type = ["BORROW", "REPAY"].includes(eventType) ? "BOR" : "LEN"; 
    let positionId = getConcatenatedId([protocol.id, account.id, market.id, type, loc])  
    let position = Position.load(positionId);
      if (position) {
        return position
      }
      position = new Position(positionId);
      position.protocol = protocol.id;
      position.account = account.id;
      position.market = market.id;
      position.type = type;
      position.balance = BigDecimal.zero();
      position.borrowed = BigDecimal.zero();
      position.repaid = BigDecimal.zero();
      position.deposited = BigDecimal.zero();
      position.withdrawn = BigDecimal.zero();
      position.isActive = true;
      position.events = [];
      position.interestPaid = BigDecimal.zero();
      position.closedPositions = [];
      position.isLiquidated = false;
  
      return position;
      
  }
  
  export function calculatePositionBalance(position: Position): BigDecimal {
    let balance = BigDecimal.zero();
    for(let i = 0; i < position.events.length; i++) {
      let current = Event.load(position.events[i]);
      if (!current) {
        continue;
      }
      if (["BORROW", "WITHDRAW"].includes(current.eventType)) {
        balance = balance.minus(current.amount);
      } else if (["REPAY", "DEPOSIT"].includes(current.eventType)){
        balance = balance.plus(current.amount);
      }
    }
  
    return balance
  }
  
  export function updatePosition(position: Position, event: Event): void {
    
    let potentialInterest = BigDecimal.zero();
    let newPos: Position;
    
    let pEvents = position.events;
    pEvents.push(event.id);
    position.events = pEvents;
    position.save();
  
    if (position.type == "BOR") {
      if (event.eventType == "BORROW") {
        position.borrowed = position.borrowed.plus(event.amount);
      } else {
        position.repaid = position.repaid.plus(event.amount);
      }
      
      // Calculate the status of the position and the interest if repaid in any form.
      potentialInterest = position.repaid.minus(position.borrowed)
      
      if (potentialInterest >= BigDecimal.zero()) {
        
        // If repaid > borrow, it means the position has been repaid and the remainder is
        // the interest. In this case we create a new postion that will act as legacy
        // and will be added to the closedPositions[] array
        // The original position will be reset and will be reused to identify an active position in the market.
        
        newPos = createChildPosition(position, potentialInterest)
        let cEvents = position.closedPositions;
        cEvents.push(newPos.id);
        position.closedPositions = cEvents;
        position.save();
  
  
        position = resetPositionStats(position);
        position.save();
      }
      
    } else {
      if (event.eventType == "DEPOSIT") {
        position.deposited = position.deposited.plus(event.amount);
      } else {
        position.withdrawn = position.withdrawn.plus(event.amount);
      }
  
      // Calculate the status of the position and the interest if repaid in any form.
      potentialInterest = position.withdrawn.minus(position.deposited);
      
      if (potentialInterest > BigDecimal.zero()) {
  
        // If withdrawn > deposit, it means the position has been withdrawn and the remainder is
        // the interest. In this case we create a new postion that will act as legacy
        // and will be added to the closedPositions[] array
        // The original position will be reset and will be reused to identify an active position in the market.
  
        newPos = createChildPosition(position, potentialInterest);
        let cEvents = position.closedPositions;
        cEvents.push(newPos.id);
        position.closedPositions = cEvents;
        position.save();
  
        position = resetPositionStats(position);
        position.save();

      }
    }
    position.balance = calculatePositionBalance(position);
    position.save();
  }
  
  export function processPositionLiquidation(position: Position, event: Event): void {
    
    // create a new closed position from the original position due to liquidation, giving 0 interest
    let newPos = createChildPosition(position, BigDecimal.zero());
  
    // marking the new closed position as liquidated
    newPos.isLiquidated = true;
  
    // Add liquidation event to the new position to be closed
    let pEvents = position.events;
    pEvents.push(event.id);
    newPos.events = pEvents;
  
    // Add new position to the closed position of the parent position container
    let closedPositions = position.closedPositions;
    closedPositions.push(newPos.id);
    position.closedPositions = closedPositions;
  
    // reset paretn position and save
    position = resetPositionStats(position);
    position.save();
  
  }
  
  
  
  export function resetPositionStats(position: Position): Position {
    position.balance = BigDecimal.zero();
    position.borrowed = BigDecimal.zero();
    position.repaid = BigDecimal.zero();
    position.deposited = BigDecimal.zero();
    position.withdrawn = BigDecimal.zero();
    position.isActive = false;
    position.events = [];
    position.interestPaid = BigDecimal.zero();
  
    return position;
  }
  
  export function createChildPosition(position: Position, interest: BigDecimal): Position {
    
    let loc = (position.closedPositions.length + 1).toString();
    let type = position.type == "BOR" ? "BORROW" : "DEPOSIT";
    let protocol = getOrCreateProtocol(position.protocol);
    let account = getOrCreateAccount(position.account);
    let market = getOrCreateMarket(position.market.split("-")[1]);
    let newPos = getOrCreatePosition(protocol, account, market, type, loc);
    
    newPos.borrowed = position.borrowed;
    newPos.repaid = position.repaid;
    newPos.deposited = position.deposited;
    newPos.withdrawn = position.withdrawn;
    newPos.closedPositions = [];
    newPos.isActive = false;
    newPos.interestPaid = interest;
    newPos.events = position.events;
    newPos.save();
  
    return newPos;
  }
  
  export function isPartialRepayment(position: Position, event: Event ): boolean {
      return !position.isActive && event.eventType == "REPAY" && event.amount > BigDecimal.zero();
  }
  
  export function getLastClosedPosition(position: Position): Position {
    return new Position(position.closedPositions[position.closedPositions.length - 1]);
  }
  
  export function updateLastPositionPartialPayment(position: Position, event: Event): void {
    let lastPosition = Position.load(position.closedPositions[position.closedPositions.length - 1]);
    if (!lastPosition) return;
    let updatedEvents = lastPosition.events;
    updatedEvents.push(event.id);
    lastPosition.events = updatedEvents;
    lastPosition.interestPaid = lastPosition.interestPaid.plus(event.amount);
    lastPosition.repaid = lastPosition.repaid.plus(event.amount) ;
    lastPosition.save();
  }
  
  export function shouldProcess(eventType: string): boolean {
    return !["LIQUIDATION", "TRANSFER"].includes(eventType);
  }