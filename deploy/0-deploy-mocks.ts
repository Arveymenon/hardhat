import { network } from "hardhat";
import { DeployOptions } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DECIMALS, DevelopmentChains, INITIAL_ANSWER } from "../helper/helper-hardhat-config";
import { DeployFunction } from "hardhat-deploy/types";


const deployMock: DeployFunction = async ({getNamedAccounts, deployments}: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts()
    const chainId: number = network.config.chainId!
    
    if(DevelopmentChains.includes(network.name)) {
        log("Mock deployment of the aggregator chain")
        const deployOptions: DeployOptions = {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER]
            
        }
        await deploy("MockV3Aggregator", deployOptions)
    }

    log("Mocks deployed!")
    log("---------------------------------------------")
}
deployMock.tags = ["all"]

export default deployMock;