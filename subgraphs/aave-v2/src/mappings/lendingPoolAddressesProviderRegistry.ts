
import { log } from '@graphprotocol/graph-ts';
import { AddressesProviderRegistered } from '../../generated/LendingPoolAddressesProviderRegistry/LendingPoolAddressesProviderRegistry'
import { LendingPoolAddressesProvider } from '../../generated/templates'
import { getOrCreateProtocol } from '../helpers/protocol'

export function handleAddressesProviderRegistered(event: AddressesProviderRegistered): void {
    LendingPoolAddressesProvider.create(event.params.newAddress)
    let protocol = getOrCreateProtocol("1");
    log.warning("protocol name: {}", [protocol.id.toString()]);
}