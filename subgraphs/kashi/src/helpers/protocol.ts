import { Address } from '@graphprotocol/graph-ts'
import { Protocol } from '../../generated/schema'
import { PROTOCOL_ID, SHUSHI_BENTOBOX } from './generic'

export function getOrCreateProtocol(id: string): Protocol {
  let protocol = Protocol.load(id)
  if (!protocol) {
    protocol = new Protocol(PROTOCOL_ID)
    protocol.address = Address.fromString(SHUSHI_BENTOBOX)
    protocol.name = 'SUSHI KASHI'
    protocol.type = 'POOLED'
    protocol.save()
  }
  return protocol
}
