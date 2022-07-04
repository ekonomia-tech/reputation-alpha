import {
  Account, AccountInProtocol, Protocol
} from '../../generated/schema'
import { getConcatenatedId } from './generic'

export function getOrCreateAccount(id: string): Account {
  let account = Account.load(id)
  if (!account) {
    account = new Account(id)
    account.hasBorrowed = false
    account.lastBorrowPositionId = 0;
    account.lastDepositPositionId = 0;
    account.lastArbitraryPositionId = 0;
    account.save()
  }
  return account
}
export function markAccountAsBorrowed(account: Account): void {
  account.hasBorrowed = true
  account.save()
}

export function getOrCreateAccountInProtocol(
  protocol: Protocol,
  account: Account,
): AccountInProtocol {
  const acpId = getConcatenatedId([account.id, protocol.id])
  let acp = AccountInProtocol.load(acpId)
  if (!acp) {
    acp = new AccountInProtocol(acpId)
    acp.protocol = protocol.id
    acp.account = account.id
    acp.save()
  }
  return acp
}