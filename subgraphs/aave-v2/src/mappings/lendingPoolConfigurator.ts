import { ReserveInitialized } from '../../generated/templates/LendingPoolConfigurator/LendingPoolConfigurator'
import { getOrCreateAsset } from '../helpers/asset'
import { getOrCreateProtocol } from '../helpers/protocol'
import { getOrCreateMarket } from "../helpers/market";
import { getConcatenatedId } from '../helpers/generic';

export function handleReserveInitialized(event: ReserveInitialized): void {
    let asset = getOrCreateAsset(event.params.asset.toHexString())   
    getOrCreateMarket(asset.id);
    
}