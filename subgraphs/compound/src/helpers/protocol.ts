import { Address } from "@graphprotocol/graph-ts";
import { Protocol } from "../../generated/schema";
import { PROTOCOL_ID, UNITROLLER_ADDRESS } from "./generic";

export function getOrCreateProtocol(id: string): Protocol {
  let protocol = Protocol.load(id);
  if (!protocol) {
    protocol = new Protocol(PROTOCOL_ID);
    protocol.address = Address.fromString(UNITROLLER_ADDRESS);
    protocol.name = "COMPOUND";
    protocol.type = "POOLED";
    protocol.save();
  }
  return protocol;
}
