import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { verify } from "../utils/verify"
import { networkConfig, DevelopmentChains } from "../helper/helper-hardhat-config"

const deployFundMe: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  let { deployer } = await getNamedAccounts()
  const chainId: number = network.config.chainId!

  let ethUsdPriceFeedAddress: string
  if (chainId == 31337) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId].ethToUsd!
  }
  log("----------------------------------------------------")
  log("Deploying FundMe and waiting for confirmations...")
  log(networkConfig[chainId])

  if (!deployer) {
    // Set a default deployer address if it is undefined
    const accounts = await hre.ethers.getSigners();
    deployer = accounts[0].address;
  }
  
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[chainId].blockConfirmations || 0,
  })
  log(`FundMe deployed at ${fundMe.address}`)
  if (
    DevelopmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, [ethUsdPriceFeedAddress])
  }
}
export default deployFundMe
deployFundMe.tags = ["all", "fundMe"]