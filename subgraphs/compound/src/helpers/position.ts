import { Event } from '../../generated/schema'
import { getOrCreateAccount } from './account'
import { getConcatenatedId } from './generic'

export function getPositionId(event: Event): string {
  let account = getOrCreateAccount(event.account);
  let eventCounter: i32 = 0;
  let eventType = "";
  if (["DEPOSIT", "WITHDRAW"].includes(event.eventType)) {
    eventCounter = account.lastDepositPositionId;
    eventType = "DEPOSIT";
  } else if (["BORROW", "REPAY", "LIQUIDATION"].includes(event.eventType)) {
    eventCounter = account.lastBorrowPositionId
    eventType = "BORROW";
  } else {
    eventCounter = account.lastArbitraryPositionId;
    eventType = "OTHER"
  }

  let positionId: string = getConcatenatedId([
    event.market,
    event.account,
    eventType,
    eventCounter.toString()
  ])

  return positionId;

}

export function getNextPositionId(event: Event): string {
  promoteEventCounter(event);
  return getPositionId(event);
}

export function promoteEventCounter(event: Event) : void {
  let account = getOrCreateAccount(event.account);
  if (["DEPOSIT", "WITHDRAW"].includes(event.eventType)) {
    account.lastDepositPositionId += 1;
  } else if (["BORROW", "REAPY"].includes(event.eventType)) {
    account.lastBorrowPositionId += 1;
  } else {
    account.lastArbitraryPositionId += 1;
  }
}
