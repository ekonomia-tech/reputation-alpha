import { Address } from "@graphprotocol/graph-ts";
import { Protocol } from "../../generated/schema";
import { AAVE_V2_REGISTRY, PROTOCOL_ID } from "./generic";

export function getOrCreateProtocol(id: string): Protocol {
  let protocol = Protocol.load(id);
  if (!protocol) {
    protocol = new Protocol(PROTOCOL_ID);
    protocol.address = Address.fromString(AAVE_V2_REGISTRY);
    protocol.name = "AAVE-V2";
    protocol.type = "POOLED";
    protocol.save();
  }
  return protocol;
}
