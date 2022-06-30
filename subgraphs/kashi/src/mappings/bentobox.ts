import { LogDeploy } from '../../generated/BentoBox/BentoBox';
import { KashiPair } from '../../generated/templates';
import { PROTOCOL_ID } from '../helpers/generic';
import { getOrCreateProtocol } from '../helpers/protocol';
import { createMarket } from "../helpers/market";

export function handleLogDeploy(event: LogDeploy): void {
    KashiPair.create(event.params.cloneAddress);
    getOrCreateProtocol(PROTOCOL_ID);
    createMarket(event.params.cloneAddress.toHexString());
    
}