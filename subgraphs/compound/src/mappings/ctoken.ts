import {
  Borrow,
  LiquidateBorrow,
  Mint,
  Redeem,
  RepayBorrow,
  Transfer,
} from '../../generated/Comptroller/CToken'
import { Event } from '../../generated/schema'
import { getOrCreateAccount, markAccountAsBorrowed } from '../helpers/account'
import { getOrCreateAsset, toUSD } from '../helpers/asset'
import { cTokenDecimals, cTokenDecimalsBD, exponentToBigDecimal } from '../helpers/generic'
import { getOrCreateMarket, updateStatistics } from '../helpers/market'
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

  let underlyingAmount = event.params.mintAmount
    .toBigDecimal()
    .div(exponentToBigDecimal(asset.decimals))
    .truncate(asset.decimals)

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

  updateStatistics(protocol, market, account, eventEntry)
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
    .div(exponentToBigDecimal(asset.decimals))
    .truncate(asset.decimals)

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

  updateStatistics(protocol, market, account, eventEntry)
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
    .div(exponentToBigDecimal(asset.decimals))
    .truncate(asset.decimals)

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

  updateStatistics(protocol, market, account, eventEntry)
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
    .div(exponentToBigDecimal(asset.decimals))
    .truncate(asset.decimals)

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

  updateStatistics(protocol, market, account, eventEntry)
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
    .div(exponentToBigDecimal(asset.decimals))
    .truncate(asset.decimals)

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

  updateStatistics(protocol, market, account, eventEntry)
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

  let transferAmount = event.params.amount.toBigDecimal().div(cTokenDecimalsBD)

  let underlyingAmount = transferAmount.truncate(asset.decimals)

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

  updateStatistics(protocol, market, account, withdrawEntry)

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

  updateStatistics(protocol, market, to, depositEntry)
}
