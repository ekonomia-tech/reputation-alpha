// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal,
} from '@graphprotocol/graph-ts'

export class Protocol extends Entity {
  constructor(id: string) {
    super()
    this.set('id', Value.fromString(id))
  }

  save(): void {
    let id = this.get('id')
    assert(id != null, 'Cannot save Protocol entity without an ID')
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Protocol must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      )
      store.set('Protocol', id.toString(), this)
    }
  }

  static load(id: string): Protocol | null {
    return changetype<Protocol | null>(store.get('Protocol', id))
  }

  get id(): string {
    let value = this.get('id')
    return value!.toString()
  }

  set id(value: string) {
    this.set('id', Value.fromString(value))
  }

  get name(): string | null {
    let value = this.get('name')
    if (!value || value.kind == ValueKind.NULL) {
      return null
    } else {
      return value.toString()
    }
  }

  set name(value: string | null) {
    if (!value) {
      this.unset('name')
    } else {
      this.set('name', Value.fromString(<string>value))
    }
  }

  get type(): string | null {
    let value = this.get('type')
    if (!value || value.kind == ValueKind.NULL) {
      return null
    } else {
      return value.toString()
    }
  }

  set type(value: string | null) {
    if (!value) {
      this.unset('type')
    } else {
      this.set('type', Value.fromString(<string>value))
    }
  }

  get address(): Bytes | null {
    let value = this.get('address')
    if (!value || value.kind == ValueKind.NULL) {
      return null
    } else {
      return value.toBytes()
    }
  }

  set address(value: Bytes | null) {
    if (!value) {
      this.unset('address')
    } else {
      this.set('address', Value.fromBytes(<Bytes>value))
    }
  }

  get markets(): Array<string> {
    let value = this.get('markets')
    return value!.toStringArray()
  }

  set markets(value: Array<string>) {
    this.set('markets', Value.fromStringArray(value))
  }

  get accounts(): Array<string> {
    let value = this.get('accounts')
    return value!.toStringArray()
  }

  set accounts(value: Array<string>) {
    this.set('accounts', Value.fromStringArray(value))
  }

  get events(): Array<string> {
    let value = this.get('events')
    return value!.toStringArray()
  }

  set events(value: Array<string>) {
    this.set('events', Value.fromStringArray(value))
  }
}

export class Asset extends Entity {
  constructor(id: string) {
    super()
    this.set('id', Value.fromString(id))
  }

  save(): void {
    let id = this.get('id')
    assert(id != null, 'Cannot save Asset entity without an ID')
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Asset must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      )
      store.set('Asset', id.toString(), this)
    }
  }

  static load(id: string): Asset | null {
    return changetype<Asset | null>(store.get('Asset', id))
  }

  get id(): string {
    let value = this.get('id')
    return value!.toString()
  }

  set id(value: string) {
    this.set('id', Value.fromString(value))
  }

  get symbol(): string {
    let value = this.get('symbol')
    return value!.toString()
  }

  set symbol(value: string) {
    this.set('symbol', Value.fromString(value))
  }

  get name(): string {
    let value = this.get('name')
    return value!.toString()
  }

  set name(value: string) {
    this.set('name', Value.fromString(value))
  }

  get decimals(): i32 {
    let value = this.get('decimals')
    return value!.toI32()
  }

  set decimals(value: i32) {
    this.set('decimals', Value.fromI32(value))
  }
}

export class Market extends Entity {
  constructor(id: string) {
    super()
    this.set('id', Value.fromString(id))
  }

  save(): void {
    let id = this.get('id')
    assert(id != null, 'Cannot save Market entity without an ID')
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Market must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      )
      store.set('Market', id.toString(), this)
    }
  }

  static load(id: string): Market | null {
    return changetype<Market | null>(store.get('Market', id))
  }

  get id(): string {
    let value = this.get('id')
    return value!.toString()
  }

  set id(value: string) {
    this.set('id', Value.fromString(value))
  }

  get protocol(): string {
    let value = this.get('protocol')
    return value!.toString()
  }

  set protocol(value: string) {
    this.set('protocol', Value.fromString(value))
  }

  get asset(): string {
    let value = this.get('asset')
    return value!.toString()
  }

  set asset(value: string) {
    this.set('asset', Value.fromString(value))
  }

  get collateralAsset(): string | null {
    let value = this.get('collateralAsset')
    if (!value || value.kind == ValueKind.NULL) {
      return null
    } else {
      return value.toString()
    }
  }

  set collateralAsset(value: string | null) {
    if (!value) {
      this.unset('collateralAsset')
    } else {
      this.set('collateralAsset', Value.fromString(<string>value))
    }
  }
}

export class Account extends Entity {
  constructor(id: string) {
    super()
    this.set('id', Value.fromString(id))
  }

  save(): void {
    let id = this.get('id')
    assert(id != null, 'Cannot save Account entity without an ID')
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Account must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      )
      store.set('Account', id.toString(), this)
    }
  }

  static load(id: string): Account | null {
    return changetype<Account | null>(store.get('Account', id))
  }

  get id(): string {
    let value = this.get('id')
    return value!.toString()
  }

  set id(value: string) {
    this.set('id', Value.fromString(value))
  }

  get hasBorrowed(): boolean {
    let value = this.get('hasBorrowed')
    return value!.toBoolean()
  }

  set hasBorrowed(value: boolean) {
    this.set('hasBorrowed', Value.fromBoolean(value))
  }

  get protocols(): Array<string> {
    let value = this.get('protocols')
    return value!.toStringArray()
  }

  set protocols(value: Array<string>) {
    this.set('protocols', Value.fromStringArray(value))
  }

  get markets(): Array<string> {
    let value = this.get('markets')
    return value!.toStringArray()
  }

  set markets(value: Array<string>) {
    this.set('markets', Value.fromStringArray(value))
  }

  get positions(): Array<string> {
    let value = this.get('positions')
    return value!.toStringArray()
  }

  set positions(value: Array<string>) {
    this.set('positions', Value.fromStringArray(value))
  }
}

export class AccountInProtocol extends Entity {
  constructor(id: string) {
    super()
    this.set('id', Value.fromString(id))
  }

  save(): void {
    let id = this.get('id')
    assert(id != null, 'Cannot save AccountInProtocol entity without an ID')
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type AccountInProtocol must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      )
      store.set('AccountInProtocol', id.toString(), this)
    }
  }

  static load(id: string): AccountInProtocol | null {
    return changetype<AccountInProtocol | null>(store.get('AccountInProtocol', id))
  }

  get id(): string {
    let value = this.get('id')
    return value!.toString()
  }

  set id(value: string) {
    this.set('id', Value.fromString(value))
  }

  get protocol(): string {
    let value = this.get('protocol')
    return value!.toString()
  }

  set protocol(value: string) {
    this.set('protocol', Value.fromString(value))
  }

  get account(): string {
    let value = this.get('account')
    return value!.toString()
  }

  set account(value: string) {
    this.set('account', Value.fromString(value))
  }
}

export class AccountInMarket extends Entity {
  constructor(id: string) {
    super()
    this.set('id', Value.fromString(id))
  }

  save(): void {
    let id = this.get('id')
    assert(id != null, 'Cannot save AccountInMarket entity without an ID')
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type AccountInMarket must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      )
      store.set('AccountInMarket', id.toString(), this)
    }
  }

  static load(id: string): AccountInMarket | null {
    return changetype<AccountInMarket | null>(store.get('AccountInMarket', id))
  }

  get id(): string {
    let value = this.get('id')
    return value!.toString()
  }

  set id(value: string) {
    this.set('id', Value.fromString(value))
  }

  get market(): string {
    let value = this.get('market')
    return value!.toString()
  }

  set market(value: string) {
    this.set('market', Value.fromString(value))
  }

  get account(): string {
    let value = this.get('account')
    return value!.toString()
  }

  set account(value: string) {
    this.set('account', Value.fromString(value))
  }
}

export class Position extends Entity {
  constructor(id: string) {
    super()
    this.set('id', Value.fromString(id))
  }

  save(): void {
    let id = this.get('id')
    assert(id != null, 'Cannot save Position entity without an ID')
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Position must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      )
      store.set('Position', id.toString(), this)
    }
  }

  static load(id: string): Position | null {
    return changetype<Position | null>(store.get('Position', id))
  }

  get id(): string {
    let value = this.get('id')
    return value!.toString()
  }

  set id(value: string) {
    this.set('id', Value.fromString(value))
  }

  get protocol(): string {
    let value = this.get('protocol')
    return value!.toString()
  }

  set protocol(value: string) {
    this.set('protocol', Value.fromString(value))
  }

  get account(): string {
    let value = this.get('account')
    return value!.toString()
  }

  set account(value: string) {
    this.set('account', Value.fromString(value))
  }

  get market(): string {
    let value = this.get('market')
    return value!.toString()
  }

  set market(value: string) {
    this.set('market', Value.fromString(value))
  }

  get type(): string | null {
    let value = this.get('type')
    if (!value || value.kind == ValueKind.NULL) {
      return null
    } else {
      return value.toString()
    }
  }

  set type(value: string | null) {
    if (!value) {
      this.unset('type')
    } else {
      this.set('type', Value.fromString(<string>value))
    }
  }

  get balance(): BigDecimal {
    let value = this.get('balance')
    return value!.toBigDecimal()
  }

  set balance(value: BigDecimal) {
    this.set('balance', Value.fromBigDecimal(value))
  }

  get borrowed(): BigDecimal {
    let value = this.get('borrowed')
    return value!.toBigDecimal()
  }

  set borrowed(value: BigDecimal) {
    this.set('borrowed', Value.fromBigDecimal(value))
  }

  get repaid(): BigDecimal {
    let value = this.get('repaid')
    return value!.toBigDecimal()
  }

  set repaid(value: BigDecimal) {
    this.set('repaid', Value.fromBigDecimal(value))
  }

  get deposited(): BigDecimal {
    let value = this.get('deposited')
    return value!.toBigDecimal()
  }

  set deposited(value: BigDecimal) {
    this.set('deposited', Value.fromBigDecimal(value))
  }

  get withdrawn(): BigDecimal {
    let value = this.get('withdrawn')
    return value!.toBigDecimal()
  }

  set withdrawn(value: BigDecimal) {
    this.set('withdrawn', Value.fromBigDecimal(value))
  }

  get isActive(): boolean {
    let value = this.get('isActive')
    return value!.toBoolean()
  }

  set isActive(value: boolean) {
    this.set('isActive', Value.fromBoolean(value))
  }

  get events(): Array<string> {
    let value = this.get('events')
    return value!.toStringArray()
  }

  set events(value: Array<string>) {
    this.set('events', Value.fromStringArray(value))
  }

  get interestPaid(): BigDecimal {
    let value = this.get('interestPaid')
    return value!.toBigDecimal()
  }

  set interestPaid(value: BigDecimal) {
    this.set('interestPaid', Value.fromBigDecimal(value))
  }

  get closedPositions(): Array<string> {
    let value = this.get('closedPositions')
    return value!.toStringArray()
  }

  set closedPositions(value: Array<string>) {
    this.set('closedPositions', Value.fromStringArray(value))
  }

  get isLiquidated(): boolean {
    let value = this.get('isLiquidated')
    return value!.toBoolean()
  }

  set isLiquidated(value: boolean) {
    this.set('isLiquidated', Value.fromBoolean(value))
  }
}

export class Event extends Entity {
  constructor(id: string) {
    super()
    this.set('id', Value.fromString(id))
  }

  save(): void {
    let id = this.get('id')
    assert(id != null, 'Cannot save Event entity without an ID')
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Event must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      )
      store.set('Event', id.toString(), this)
    }
  }

  static load(id: string): Event | null {
    return changetype<Event | null>(store.get('Event', id))
  }

  get id(): string {
    let value = this.get('id')
    return value!.toString()
  }

  set id(value: string) {
    this.set('id', Value.fromString(value))
  }

  get protocol(): string {
    let value = this.get('protocol')
    return value!.toString()
  }

  set protocol(value: string) {
    this.set('protocol', Value.fromString(value))
  }

  get market(): string {
    let value = this.get('market')
    return value!.toString()
  }

  set market(value: string) {
    this.set('market', Value.fromString(value))
  }

  get account(): string {
    let value = this.get('account')
    return value!.toString()
  }

  set account(value: string) {
    this.set('account', Value.fromString(value))
  }

  get to(): string | null {
    let value = this.get('to')
    if (!value || value.kind == ValueKind.NULL) {
      return null
    } else {
      return value.toString()
    }
  }

  set to(value: string | null) {
    if (!value) {
      this.unset('to')
    } else {
      this.set('to', Value.fromString(<string>value))
    }
  }

  get executingAccount(): string | null {
    let value = this.get('executingAccount')
    if (!value || value.kind == ValueKind.NULL) {
      return null
    } else {
      return value.toString()
    }
  }

  set executingAccount(value: string | null) {
    if (!value) {
      this.unset('executingAccount')
    } else {
      this.set('executingAccount', Value.fromString(<string>value))
    }
  }

  get eventType(): string {
    let value = this.get('eventType')
    return value!.toString()
  }

  set eventType(value: string) {
    this.set('eventType', Value.fromString(value))
  }

  get amount(): BigDecimal {
    let value = this.get('amount')
    return value!.toBigDecimal()
  }

  set amount(value: BigDecimal) {
    this.set('amount', Value.fromBigDecimal(value))
  }

  get amountUSD(): BigDecimal {
    let value = this.get('amountUSD')
    return value!.toBigDecimal()
  }

  set amountUSD(value: BigDecimal) {
    this.set('amountUSD', Value.fromBigDecimal(value))
  }

  get blockTime(): i32 {
    let value = this.get('blockTime')
    return value!.toI32()
  }

  set blockTime(value: i32) {
    this.set('blockTime', Value.fromI32(value))
  }

  get blockNumber(): i32 {
    let value = this.get('blockNumber')
    return value!.toI32()
  }

  set blockNumber(value: i32) {
    this.set('blockNumber', Value.fromI32(value))
  }

  get liquidator(): string | null {
    let value = this.get('liquidator')
    if (!value || value.kind == ValueKind.NULL) {
      return null
    } else {
      return value.toString()
    }
  }

  set liquidator(value: string | null) {
    if (!value) {
      this.unset('liquidator')
    } else {
      this.set('liquidator', Value.fromString(<string>value))
    }
  }
}
