import {
  Account
} from '../../generated/schema'

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

