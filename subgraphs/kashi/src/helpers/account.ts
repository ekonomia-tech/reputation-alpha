import {
  Account,
  AccountInMarket,
  AccountInProtocol,
  Market,
  Protocol,
} from '../../generated/schema'
import { getConcatenatedId } from './generic'

export function getOrCreateAccount(id: string): Account {
  let account = Account.load(id)
  if (!account) {
    account = new Account(id)
    account.hasBorrowed = false
    account.save()
  }
  return account
}
export function markAccountAsBorrowed(account: Account): void {
  account.hasBorrowed = true
  account.save()
}

