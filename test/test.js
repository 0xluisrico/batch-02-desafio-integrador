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

    describe("Upgradeables Smarts Contracts", () =>{
        describe("NFT Collection", () => {
            async function deployFixture() {
                var CuyCollectionUpgradeable, cuyCollectionProxy;
                const [owner, alice, bob] = await hre.ethers.getSigners();
                CuyCollectionUpgradeable = await hre.ethers.getContractFactory("CuyCollectionNft");
                var name = "CuyCollectionNft";
                var symbol = "CCN";
  
                cuyCollectionProxy = await deploySC("CuyCollectionNft", [name, symbol]);
                return {owner, alice, bob, cuyCollectionProxy};
            }
            describe("safeMint", () => {
                var one_ether = `0x${ethers.parseEther("1").toString(16)}`;
                
                it("Minteando alice", async () => {
                    var {cuyCollectionProxy, alice} = await loadFixture(deployFixture);
                    await cuyCollectionProxy.safeMint(alice.address, 0);

                    var balanceAlice = await cuyCollectionProxy.balanceOf(alice.address);
                    expect(balanceAlice).to.equal(1);
                });
            });  
        }); 
        describe("BBitesToken", () => {
            async function deployFixture() {
                var BBitesTokenUpgradeable, BBitesTokenProxy;
                const [owner, alice, bob] = await hre.ethers.getSigners();
                BBitesTokenUpgradeable = await hre.ethers.getContractFactory("BBitesToken");
                BBitesTokenProxy = await deploySC("BBitesToken",[]);
                return {owner, alice, bob, BBitesTokenProxy};
            }
            describe("Mint", () => {
                it("Minteando Bob", async () => {
                    var {BBitesTokenProxy, bob} = await loadFixture(deployFixture);
                    await BBitesTokenProxy.mint(bob.address, 1000);
                    
                    var balanceBob = await BBitesTokenProxy.balanceOf(bob.address);
                    expect(balanceBob).to.equal(10000000000000000000000n)
                });
            });
        });
        describe("Public Sale", () => {
            async function deployFixture() {
                var publicSaleUpgradeable, publicSaleProxy;
                const [owner, alice, bob] = await hre.ethers.getSigners();
                publicSaleUpgradeable = await hre.ethers.getContractFactory("CuyCollectionNft");
                publicSaleProxy = await deploySC("PublicSale",["0xEa9D31A77F464865371B6a5dEDb960C013588a62", "0xBD55b237D94f9850faC9452275aA6D43A3aDc615"]);
                return {owner, alice, bob, publicSaleProxy};
            }
            it("Comprando nft no disponible con tokens", async () => {
                var {publicSaleProxy, alice} = await loadFixture(deployFixture);
                await expect(
                    publicSaleProxy.purchaseWithTokens(1000)
                  ).to.be.revertedWith("Id nft invalid (0 - 699)");
            });
            it("Comprando nft no disponible con usdc", async () => {
                var {publicSaleProxy, alice} = await loadFixture(deployFixture);
                await expect(
                    publicSaleProxy.purchaseWithUSDC(1000, 12)
                  ).to.be.revertedWith("Id nft invalid (0 - 699)");
            });
            it("Comprando nft con 0 usdc", async () => {
                var {publicSaleProxy, alice} = await loadFixture(deployFixture);
                await expect(
                    publicSaleProxy.purchaseWithUSDC(200, 0)
                  ).to.be.revertedWith("value usdc invalid");
            });
        }); 
    });
    describe("SmartContract USDC", () =>{

        async function deployFixture() {
            var USDCoin;
            const [owner, alice, bob] = await hre.ethers.getSigners();
            USDCoin = await ethers.getContractFactory("USDCoin");
            var usdCoin= await deploySCNoUp("USDCoin", []);
            return { owner, alice, bob, usdCoin };
        }
        describe("Mint", () => {
            it("Minteando Alice", async () => {
                var {usdCoin, alice} = await loadFixture(deployFixture);
                await usdCoin.mint(alice.address, 1000);
                
                var balanceAlice = await usdCoin.balanceOf(alice.address);
                expect(balanceAlice).to.equal(1000n)
            });
        });

    });

});
