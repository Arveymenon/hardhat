import { ethers, run, network } from 'hardhat';

async function main(){
  const SimpleStorageFactory = ethers.getContractFactory("SimpleStorage");
  console.log("Deploying...");
  const SimpleStorage = await (await SimpleStorageFactory).deploy();
  SimpleStorage.deployed();

  const address = SimpleStorage.address;
  console.log("Contract Address", address);

  if(network.config.chainId === 11155111 && process.env.VERIFICATION_API_KEY) {
    await SimpleStorage.deployTransaction.wait(6)
    await verify(address)
  }
  
  console.log(`Current Favorite Number ${await SimpleStorage.retrieve()}`);
  
  const txnResponse = await SimpleStorage.store(24343);
  (await txnResponse).wait(2)
  
  console.log(`New Favorite Number ${await SimpleStorage.retrieve()}`);
}

async function verify(contractAddress: string, args?: any) {
  console.log("Verifying Contracts...")
  try {
    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: args
    })
  } catch (error: any & {message: string}) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified")
    } else {
      console.log(error)
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});