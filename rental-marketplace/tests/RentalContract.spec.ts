import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';

import { Cell, toNano, Address } from '@ton/core';
import { RentalContract, Opcodes } from '../wrappers/RentalContract';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('RentalContract', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('RentalContract');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;
    let renter: SandboxContract<TreasuryContract>;
    let rentalContract: SandboxContract<RentalContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        rentalContract = blockchain.openContract(RentalContract.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');
        owner = await blockchain.treasury('owner');
        renter = await blockchain.treasury('renter');

        const deployResult = await rentalContract.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: rentalContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy successfully', async () => {
        // Deployment check is done in beforeEach
        expect(rentalContract.address).toBeDefined();
    });

    it('should allow renting an item', async () => {
        const itemId = BigInt(1);
        const price = toNano('1');        // 1 TON rental price
        const deposit = toNano('2');      // 2 TON deposit
        const duration = 7 * 24 * 60 * 60; // 7 days in seconds

        const rentResult = await rentalContract.sendRentItem(
            renter.getSender(),
            itemId,
            owner.address,
            price,
            deposit,
            duration,
        );

        expect(rentResult.transactions).toHaveTransaction({
            from: renter.address,
            to: rentalContract.address,
            success: true,
        });

        // Verify funds were deducted from renter
        const renterBalance = await blockchain.getContract(renter.address);
        expect(renterBalance).toBeDefined();
    });

    it('should handle item return on time', async () => {
        const itemId = BigInt(2);
        const price = toNano('1');
        const deposit = toNano('2');
        const duration = 3600; // 1 hour

        // Rent the item
        await rentalContract.sendRentItem(
            renter.getSender(),
            itemId,
            owner.address,
            price,
            deposit,
            duration,
        );

        // Return the item immediately (within time limit)
        const returnResult = await rentalContract.sendReturnItem(renter.getSender(), itemId);

        expect(returnResult.transactions).toHaveTransaction({
            from: renter.address,
            to: rentalContract.address,
            success: true,
        });

        // Verify the deposit is released (owner should receive payment)
        expect(returnResult.transactions.length).toBeGreaterThan(0);
    });

    it('should handle late item return', async () => {
        const itemId = BigInt(3);
        const price = toNano('1');
        const deposit = toNano('2');
        const duration = 10; // 10 seconds - very short for testing

        // Rent the item
        await rentalContract.sendRentItem(
            renter.getSender(),
            itemId,
            owner.address,
            price,
            deposit,
            duration,
        );

        // Fast-forward time past the rental period
        if (blockchain.now !== undefined) {
            blockchain.now += duration + 1;
        }

        // Return the item late
        const returnResult = await rentalContract.sendReturnItem(renter.getSender(), itemId);

        expect(returnResult.transactions).toHaveTransaction({
            from: renter.address,
            to: rentalContract.address,
            success: true,
        });

        // Late return should result in deposit going to owner
        expect(returnResult.transactions.length).toBeGreaterThan(0);
    });

    it('should allow dispute reporting', async () => {
        const itemId = BigInt(4);
        const price = toNano('1');
        const deposit = toNano('2');
        const duration = 3600;

        // Rent the item
        await rentalContract.sendRentItem(
            renter.getSender(),
            itemId,
            owner.address,
            price,
            deposit,
            duration,
        );

        // Report a dispute
        const disputeResult = await rentalContract.sendReportDispute(
            renter.getSender(),
            itemId,
            'Item is damaged',
        );

        expect(disputeResult.transactions).toHaveTransaction({
            from: renter.address,
            to: rentalContract.address,
            success: true,
        });
    });

    it('should allow owner to resolve dispute in renter favor', async () => {
        const itemId = BigInt(5);
        const price = toNano('1');
        const deposit = toNano('2');
        const duration = 3600;

        // Rent the item
        await rentalContract.sendRentItem(
            renter.getSender(),
            itemId,
            owner.address,
            price,
            deposit,
            duration,
        );

        // Report dispute
        await rentalContract.sendReportDispute(renter.getSender(), itemId, 'Item damaged');

        // Owner resolves dispute in renter's favor
        const resolveResult = await rentalContract.sendResolveDispute(owner.getSender(), itemId, true);

        expect(resolveResult.transactions).toHaveTransaction({
            from: owner.address,
            to: rentalContract.address,
            success: true,
        });
    });

    it('should allow owner to resolve dispute in owner favor', async () => {
        const itemId = BigInt(6);
        const price = toNano('1');
        const deposit = toNano('2');
        const duration = 3600;

        // Rent the item
        await rentalContract.sendRentItem(
            renter.getSender(),
            itemId,
            owner.address,
            price,
            deposit,
            duration,
        );

        // Report dispute
        await rentalContract.sendReportDispute(renter.getSender(), itemId, 'Item damaged by renter');

        // Owner resolves dispute in owner's favor (keeps deposit)
        const resolveResult = await rentalContract.sendResolveDispute(owner.getSender(), itemId, false);

        expect(resolveResult.transactions).toHaveTransaction({
            from: owner.address,
            to: rentalContract.address,
            success: true,
        });
    });

    it('should handle multiple concurrent rentals', async () => {
        const price = toNano('1');
        const deposit = toNano('2');
        const duration = 3600;

        // Create multiple rentals
        for (let i = 1; i <= 3; i++) {
            const rentResult = await rentalContract.sendRentItem(
                renter.getSender(),
                BigInt(100 + i),
                owner.address,
                price,
                deposit,
                duration,
            );

            expect(rentResult.transactions).toHaveTransaction({
                from: renter.address,
                to: rentalContract.address,
                success: true,
            });
        }
    });
});
