import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { deployments, ethers, network } from "hardhat";
import { beforeEach } from "mocha"
import { DevelopmentChains } from "../../helper/helper-hardhat-config";
import { MockV3Aggregator } from "../../typechain-types";
import { FundMe } from "../../typechain-types/contracts";
import { BigNumber } from "ethers";

describe.only("FundMe", () => {
    
    let mockV3Aggregator: MockV3Aggregator;
    let fundMe: FundMe;
    let deployer: string
    const sentValue = ethers.utils.parseEther("1");

    beforeEach(async () => {
        if (!DevelopmentChains.includes(network.name)) {
            throw "You need to be on a development chain to run tests"
          }
        const accounts = await ethers.getSigners()
        deployer = accounts[0].address
        await deployments.fixture(["all"])

        fundMe = await ethers.getContract("FundMe",deployer)
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator",deployer);
    })

    describe("constructor", async () => {
        it("sets the aggregator addresses correctly", async () => {
            let response = await fundMe.s_priceFeed()
            expect(response).equals(mockV3Aggregator.address)
        })
    })

    describe("Fund", async () => {
        it("Fails if not enough funds is sent", async () => {
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
        })

        it("updates the amount funded data structure", async () => {
            await fundMe.fund({value: sentValue})
            expect(await fundMe.s_addressToAmountFunded(deployer)).equals(sentValue)
        })

        it("updates the amount funded to the array", async () => {
            const response = await fundMe.fund({value: sentValue})
            expect(await fundMe.s_funders(0)).equals(deployer).equals(response.from)
        })
    })

    describe("Withdraw", () => {
        beforeEach(async() => {
            await fundMe.fund({value: sentValue})
        })

        it("should withdraw eth from a single funder", async () => {
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })

        it("should withdraw eth from a single funder - cheaper", async () => {
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Act
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })

        it("Should revert all funder when there are multiple funders", async () => {
            const accounts = await ethers.getSigners()
            for(let i = 0; i < 6; i++){
                await fundMe.connect(accounts[i]).fund({value: sentValue})
            }
            
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            await expect(fundMe.s_funders(1)).to.be.reverted;
            for(let i = 0; i < 6; i++){
                expect((await fundMe.s_addressToAmountFunded(accounts[i].address)).toString()).equals("0")
            }
        })
        it("Cheaper Withdraw", async () => {
            const accounts = await ethers.getSigners()
            for(let i = 0; i < 6; i++){
                await fundMe.connect(accounts[i]).fund({value: sentValue})
            }
            
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            await expect(fundMe.s_funders(1)).to.be.reverted;
            for(let i = 0; i < 6; i++){
                expect((await fundMe.s_addressToAmountFunded(accounts[i].address)).toString()).equals("0")
            }
        })

        it("Only allows owner to withdraw", async() => {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1];

            const fundMeConnectedContract = await fundMe.connect(
                attacker
            )

            await expect(fundMeConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner");
        })
    })
})