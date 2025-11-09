import { toNano } from '@ton/core';
import { RentalContract } from '../wrappers/RentalContract';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    console.log('🚀 Deploying Rental Marketplace Contract...');
    
    const rentalContract = provider.open(
        RentalContract.createFromConfig({}, await compile('RentalContract'))
    );

    await rentalContract.sendDeploy(provider.sender(), toNano('0.5')); // 0.5 TON for deployment

    await provider.waitForDeploy(rentalContract.address);

    console.log(`✅ Contract deployed at: ${rentalContract.address}`);
    console.log('📋 Contract Address:', rentalContract.address.toString());
    console.log('\n📚 Available Operations:');
    console.log('  - rentItem: Create a new rental');
    console.log('  - returnItem: Return a rented item');
    console.log('  - reportDispute: Report a dispute');
    console.log('  - resolveDispute: Resolve a dispute (owner only)');
    console.log('\n💡 Next steps:');
    console.log('  1. Test the contract with: npx blueprint test');
    console.log('  2. Interact with the contract via Telegram Mini App');
}
