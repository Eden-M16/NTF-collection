const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTCollection", function () {
    let NFTCollection;
    let nftCollection;
    let owner;
    let addr1;
    let addr2;
    let addrs;
    
    const NAME = "TestNFT";
    const SYMBOL = "TNFT";
    const MAX_SUPPLY = 1000;
    const MINT_PRICE = ethers.parseEther("0.05");
    const MAX_MINT_PER_WALLET = 3;
    const PRESALE_START = Math.floor(Date.now() / 1000) + 3600;
    const PUBLIC_SALE_START = PRESALE_START + 86400;
    const BASE_URI = "ipfs://test/";
    const NOT_REVEALED_URI = "ipfs://hidden/";
    const MERKLE_ROOT = ethers.ZeroHash;
    
    beforeEach(async function () {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        
        NFTCollection = await ethers.getContractFactory("NFTCollection");
        nftCollection = await NFTCollection.deploy(
            NAME, SYMBOL, MAX_SUPPLY, MINT_PRICE, MAX_MINT_PER_WALLET,
            PRESALE_START, PUBLIC_SALE_START, BASE_URI, NOT_REVEALED_URI, MERKLE_ROOT
        );
        await nftCollection.waitForDeployment();
    });
    
    describe("Deployment", function () {
        it("Should set the correct name and symbol", async function () {
            expect(await nftCollection.name()).to.equal(NAME);
            expect(await nftCollection.symbol()).to.equal(SYMBOL);
        });
        
        it("Should set the correct max supply", async function () {
            expect(await nftCollection.maxSupply()).to.equal(MAX_SUPPLY);
        });
        
        it("Should set the correct mint price", async function () {
            expect(await nftCollection.mintPrice()).to.equal(MINT_PRICE);
        });
        
        it("Should set the correct owner", async function () {
            expect(await nftCollection.owner()).to.equal(owner.address);
        });
    });
    
    describe("Public Mint", function () {
        it("Should not allow minting before public sale starts", async function () {
            await expect(
                nftCollection.connect(addr1).publicMint(1, { value: MINT_PRICE })
            ).to.be.revertedWith("Public sale not started");
        });
        
        it("Should allow minting during public sale", async function () {
            // Advance time to public sale start
            await ethers.provider.send("evm_setNextBlockTimestamp", [PUBLIC_SALE_START]);
            await ethers.provider.send("evm_mine");
            
            await expect(
                nftCollection.connect(addr1).publicMint(1, { value: MINT_PRICE })
            ).to.emit(nftCollection, "Minted");
            
            expect(await nftCollection.totalSupply()).to.equal(1);
            expect(await nftCollection.balanceOf(addr1.address)).to.equal(1);
        });
        
        it("Should enforce max mint per wallet", async function () {
            await ethers.provider.send("evm_setNextBlockTimestamp", [PUBLIC_SALE_START]);
            await ethers.provider.send("evm_mine");
            
            await nftCollection.connect(addr1).publicMint(MAX_MINT_PER_WALLET, {
                value: MINT_PRICE * BigInt(MAX_MINT_PER_WALLET)
            });
            
            await expect(
                nftCollection.connect(addr1).publicMint(1, { value: MINT_PRICE })
            ).to.be.revertedWith("Exceeds wallet limit");
        });
        
        it("Should require correct payment", async function () {
            await ethers.provider.send("evm_setNextBlockTimestamp", [PUBLIC_SALE_START]);
            await ethers.provider.send("evm_mine");
            
            await expect(
                nftCollection.connect(addr1).publicMint(1, { value: MINT_PRICE - 1n })
            ).to.be.revertedWith("Insufficient funds");
        });
    });
    
    describe("Owner Mint", function () {
        it("Should allow owner to mint", async function () {
            await nftCollection.ownerMint(addr1.address, 5);
            expect(await nftCollection.balanceOf(addr1.address)).to.equal(5);
        });
        
        it("Should not allow non-owner to mint", async function () {
            await expect(
                nftCollection.connect(addr1).ownerMint(addr2.address, 1)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
        
        it("Should enforce max supply on owner mint", async function () {
            await nftCollection.ownerMint(owner.address, MAX_SUPPLY);
            
            await expect(
                nftCollection.ownerMint(owner.address, 1)
            ).to.be.revertedWith("Exceeds max supply");
        });
    });
    
    describe("Withdraw", function () {
        it("Should allow owner to withdraw funds", async function () {
            await ethers.provider.send("evm_setNextBlockTimestamp", [PUBLIC_SALE_START]);
            await ethers.provider.send("evm_mine");
            
            await nftCollection.connect(addr1).publicMint(1, { value: MINT_PRICE });
            
            const initialBalance = await ethers.provider.getBalance(owner.address);
            const tx = await nftCollection.withdraw();
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * tx.gasPrice;
            
            const finalBalance = await ethers.provider.getBalance(owner.address);
            const expectedBalance = initialBalance + MINT_PRICE - gasUsed;
            
            expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther("0.01"));
        });
        
        it("Should not allow non-owner to withdraw", async function () {
            await expect(
                nftCollection.connect(addr1).withdraw()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
        
        it("Should not withdraw if no funds", async function () {
            await expect(
                nftCollection.withdraw()
            ).to.be.revertedWith("No funds to withdraw");
        });
    });
    
    describe("Token URI", function () {
        it("Should return hidden URI before reveal", async function () {
            await ethers.provider.send("evm_setNextBlockTimestamp", [PUBLIC_SALE_START]);
            await ethers.provider.send("evm_mine");
            
            await nftCollection.connect(addr1).publicMint(1, { value: MINT_PRICE });
            
            const tokenURI = await nftCollection.tokenURI(0);
            expect(tokenURI).to.equal(NOT_REVEALED_URI);
        });
        
        it("Should return actual URI after reveal", async function () {
            await ethers.provider.send("evm_setNextBlockTimestamp", [PUBLIC_SALE_START]);
            await ethers.provider.send("evm_mine");
            
            await nftCollection.connect(addr1).publicMint(1, { value: MINT_PRICE });
            
            await nftCollection.reveal();
            
            const tokenURI = await nftCollection.tokenURI(0);
            expect(tokenURI).to.equal(`${BASE_URI}0.json`);
        });
    });
    
    describe("Pause Functionality", function () {
        it("Should allow owner to pause", async function () {
            await nftCollection.pause(true);
            expect(await nftCollection.paused()).to.equal(true);
        });
        
        it("Should prevent minting when paused", async function () {
            await nftCollection.pause(true);
            
            await ethers.provider.send("evm_setNextBlockTimestamp", [PUBLIC_SALE_START]);
            await ethers.provider.send("evm_mine");
            
            await expect(
                nftCollection.connect(addr1).publicMint(1, { value: MINT_PRICE })
            ).to.be.revertedWith("Contract is paused");
        });
        
        it("Should allow minting after unpause", async function () {
            await nftCollection.pause(true);
            await nftCollection.pause(false);
            
            await ethers.provider.send("evm_setNextBlockTimestamp", [PUBLIC_SALE_START]);
            await ethers.provider.send("evm_mine");
            
            await expect(
                nftCollection.connect(addr1).publicMint(1, { value: MINT_PRICE })
            ).to.emit(nftCollection, "Minted");
        });
    });
    
    describe("Admin Functions", function () {
        it("Should allow owner to set base URI", async function () {
            const newBaseURI = "ipfs://new/";
            await nftCollection.setBaseURI(newBaseURI);
            expect(await nftCollection.baseURI()).to.equal(newBaseURI);
        });
        
        it("Should allow owner to set mint price", async function () {
            const newPrice = ethers.parseEther("0.1");
            await nftCollection.setMintPrice(newPrice);
            expect(await nftCollection.mintPrice()).to.equal(newPrice);
        });
        
        it("Should allow owner to set max mint per wallet", async function () {
            const newMax = 10;
            await nftCollection.setMaxMintPerWallet(newMax);
            expect(await nftCollection.maxMintPerWallet()).to.equal(newMax);
        });
    });
});