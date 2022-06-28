import { Address } from "@graphprotocol/graph-ts";
import { Protocol } from "../../generated/schema";
import { EULER_ADDRESS, PROTOCOL_ID } from "./generic";

export function getOrCreateProtocol(id: string): Protocol {
  let protocol = Protocol.load(id);
  if (!protocol) {
    protocol = new Protocol(PROTOCOL_ID);
    protocol.address = Address.fromString(EULER_ADDRESS);
    protocol.name = "EULER";
    protocol.type = "POOLED";
    protocol.save();
  }
  return protocol;
}
