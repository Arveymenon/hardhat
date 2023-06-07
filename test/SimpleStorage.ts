import { assert, expect } from "chai";
import { ethers } from "hardhat"
import { SimpleStorage, SimpleStorage__factory } from "../typechain-types";

describe("Simple storage", () => {
    let ssf: SimpleStorage__factory;
    let ss: SimpleStorage;

    beforeEach(async () => {
        ssf = await ethers.getContractFactory("SimpleStorage");
        // ssf = await ethers.getContractFactory("SimpleStorage");
        ss = await ssf.deploy();
    })

    it("Should start with favorite number as 0", async () => {
        const currValue = await ss.retrieve();
        const expectedValue = "0";

        assert.equal<string>(currValue.toString(), expectedValue, "Not really equal")
    })

    it("Should be able to store value", async () => {
        const storeRes = await ss.store(27);
        await storeRes.wait(1);

        assert.equal<string>((await ss.retrieve()).toString(), "27");
    })

    it("Should be able to add people to the People array", async () => {
        const name = "Arvey"
        const favoriteNumber = 28

        const storeRes = await ss.addPerson(name, favoriteNumber);
        await storeRes.wait(1);
        
        expect((await ss.people(0)).name).equal(name);
        expect((await ss.people(0)).favoriteNumber).equal(favoriteNumber);
    })
})