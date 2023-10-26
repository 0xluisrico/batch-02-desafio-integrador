var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers } = require("hardhat");
var { time } = require("@nomicfoundation/hardhat-network-helpers");

const { getRole, deploySC, deploySCNoUp, ex, pEth } = require("../utils");

const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");

// 00 horas del 30 de septiembre del 2023 GMT
var startDate = 1696032000;

describe("Testing",  () => {

    describe("Upgradeables Contracts", () =>{
        var upgradeableNft, UpgradeableBBitesTkn, upgradeablePS;
        describe("Set Up", () => {
            it("Publicando los contratos inteligentes actualizables", async () => {
                upgradeableNft = await hre.ethers.getContractFactory("CuyCollectionNft");
                upgradeableNft = await hre.upgrades.deployProxy(upgradeableNft,{
                    kind: "uups",
                });
                var implementationAddressNft = await hre.upgrades.erc1967.getImplementationAddress(
                    upgradeableNft.tarjet
                );
                console.log(`El address del proxy es : ${upgradeableNft.tarjet}`);
                console.log(`El address de implementacion es ${implementationAddressNft}`);

                var [owner, alice] = await ethers.getSigners();
                await upgradeableNft.safeMint(alice.address, 4);
                var balanceAlice = await upgradeableNft.balanceOf(alice.address);
                console.log(balanceAlice);
            });
        }); 
    });
    describe("NoUpgradeables Contracts", () =>{
        var usdCoin;
    });

});
