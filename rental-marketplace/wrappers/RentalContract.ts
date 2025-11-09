import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type RentalContractConfig = {};

export interface RentalDetails {
    owner: Address;
    renter: Address;
    itemId: bigint;
    price: bigint;
    deposit: bigint;
    startTime: number;
    endTime: number;
    returned: boolean;
    dispute: boolean;
}

// Operation codes
export const Opcodes = {
    rentItem: 0x1,
    returnItem: 0x2,
    reportDispute: 0x3,
    resolveDispute: 0x4,
    adminWithdraw: 0x5,
};

export function rentalContractConfigToCell(config: RentalContractConfig): Cell {
    return beginCell().endCell();
}

export class RentalContract implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new RentalContract(address);
    }

    static createFromConfig(config: RentalContractConfig, code: Cell, workchain = 0) {
        const data = rentalContractConfigToCell(config);
        const init = { code, data };
        return new RentalContract(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    /**
     * Send rent item transaction
     * @param provider Contract provider
     * @param via Sender (renter)
     * @param itemId Unique item ID
     * @param owner Owner's address
     * @param price Rental price in TON
     * @param deposit Security deposit in TON
     * @param duration Rental duration in seconds
     */
    async sendRentItem(
        provider: ContractProvider,
        via: Sender,
        itemId: bigint,
        owner: Address,
        price: bigint,
        deposit: bigint,
        duration: number,
    ) {
        await provider.internal(via, {
            value: price + deposit + BigInt(100000000), // Add gas fee (0.1 TON)
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.rentItem, 32)
                .storeUint(itemId, 64)
                .storeAddress(owner)
                .storeCoins(price)
                .storeCoins(deposit)
                .storeUint(duration, 32)
                .endCell(),
        });
    }

    /**
     * Send return item transaction
     * @param provider Contract provider
     * @param via Sender (renter or owner)
     * @param itemId Item ID being returned
     */
    async sendReturnItem(provider: ContractProvider, via: Sender, itemId: bigint) {
        await provider.internal(via, {
            value: BigInt(50000000), // Gas fee (0.05 TON)
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.returnItem, 32)
                .storeUint(itemId, 64)
                .endCell(),
        });
    }

    /**
     * Send report dispute transaction
     * @param provider Contract provider
     * @param via Sender (renter or owner)
     * @param itemId Item ID with dispute
     * @param reason Dispute reason
     */
    async sendReportDispute(provider: ContractProvider, via: Sender, itemId: bigint, reason: string) {
        const reasonBytes = Buffer.from(reason, 'utf8');
        await provider.internal(via, {
            value: BigInt(50000000), // Gas fee
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.reportDispute, 32)
                .storeUint(itemId, 64)
                .storeUint(reasonBytes.length, 32)
                .storeBuffer(reasonBytes)
                .endCell(),
        });
    }

    /**
     * Send resolve dispute transaction
     * @param provider Contract provider
     * @param via Sender (owner)
     * @param itemId Item ID with dispute
     * @param approveRenterClaim Whether to approve renter's claim (return deposit)
     */
    async sendResolveDispute(
        provider: ContractProvider,
        via: Sender,
        itemId: bigint,
        approveRenterClaim: boolean,
    ) {
        await provider.internal(via, {
            value: BigInt(50000000), // Gas fee
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.resolveDispute, 32)
                .storeUint(itemId, 64)
                .storeUint(approveRenterClaim ? 1 : 0, 1)
                .endCell(),
        });
    }
}
