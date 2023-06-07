import { run } from "hardhat"

export async function verify(contractAddress: string, args?: any) {
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