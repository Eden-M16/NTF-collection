#!/usr/bin/env node

/**
 * Interactive NFT Collection Creator
 * Guides users through creating and deploying an NFT collection
 */

const readline = require("readline");
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");
const chalk = require("chalk"); // Optional: for colored output

// Colors for console output (if chalk is not installed, use simple strings)
const colors = {
    green: (text) => text,
    blue: (text) => text,
    yellow: (text) => text,
    red: (text) => text,
    cyan: (text) => text,
    magenta: (text) => text
};

try {
    const chalkLib = require("chalk");
    colors.green = chalkLib.green;
    colors.blue = chalkLib.blue;
    colors.yellow = chalkLib.yellow;
    colors.red = chalkLib.red;
    colors.cyan = chalkLib.cyan;
    colors.magenta = chalkLib.magenta;
} catch (e) {
    // Chalk not installed, use default colors
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to ask questions
function question(query) {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

// Helper function to validate Ethereum address
function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Helper function to validate positive integer
function isValidPositiveInteger(value) {
    const num = parseInt(value);
    return !isNaN(num) && num > 0;
}

// Helper function to validate ETH amount
function isValidETHAmount(amount) {
    return /^\d*\.?\d+$/.test(amount) && parseFloat(amount) >= 0;
}

// Main collection creation flow
async function createCollection() {
    console.log(colors.cyan("\n🎨 === NFT COLLECTION CREATOR === 🎨\n"));
    console.log(colors.yellow("Welcome! Let's create your NFT collection step by step.\n"));
    
    // ========== STEP 1: COLLECTION BASICS ==========
    console.log(colors.blue("\n📋 STEP 1: Collection Basics\n"));
    
    const name = await question("Collection Name (e.g., CyberPunks 2.0): ");
    if (!name) {
        console.log(colors.red("❌ Collection name is required!"));
        rl.close();
        return;
    }
    
    const symbol = await question("Collection Symbol (e.g., CP2, max 10 chars): ");
    if (!symbol || symbol.length > 10) {
        console.log(colors.red("❌ Symbol is required and must be 10 chars or less!"));
        rl.close();
        return;
    }
    
    const maxSupply = await question("Max Supply (total number of NFTs): ");
    if (!isValidPositiveInteger(maxSupply)) {
        console.log(colors.red("❌ Please enter a valid positive number!"));
        rl.close();
        return;
    }
    
    // ========== STEP 2: MINTING PARAMETERS ==========
    console.log(colors.blue("\n💰 STEP 2: Minting Parameters\n"));
    
    const mintPriceETH = await question("Mint Price (in ETH, e.g., 0.05): ");
    if (!isValidETHAmount(mintPriceETH)) {
        console.log(colors.red("❌ Please enter a valid ETH amount!"));
        rl.close();
        return;
    }
    
    const maxMintPerWallet = await question("Max Mint Per Wallet (e.g., 3): ");
    if (!isValidPositiveInteger(maxMintPerWallet)) {
        console.log(colors.red("❌ Please enter a valid number!"));
        rl.close();
        return;
    }
    
    // ========== STEP 3: SALE TIMES ==========
    console.log(colors.blue("\n⏰ STEP 3: Sale Schedule\n"));
    
    const presaleDelayHours = await question("Presale start (hours from now, e.g., 1 for 1 hour): ");
    const publicDelayHours = await question("Public sale start (hours from presale, e.g., 24 for 1 day): ");
    
    const presaleStart = Math.floor(Date.now() / 1000) + (parseInt(presaleDelayHours) || 0) * 3600;
    const publicSaleStart = presaleStart + (parseInt(publicDelayHours) || 24) * 3600;
    
    console.log(colors.yellow(`\n📅 Schedule Summary:`));
    console.log(`   Presale: ${new Date(presaleStart * 1000).toLocaleString()}`);
    console.log(`   Public Sale: ${new Date(publicSaleStart * 1000).toLocaleString()}`);
    
    // ========== STEP 4: URI CONFIGURATION ==========
    console.log(colors.blue("\n🌐 STEP 4: Metadata & IPFS Configuration\n"));
    
    console.log(colors.yellow("You'll need IPFS hashes for your metadata. If you haven't uploaded yet:"));
    console.log("   1. Upload your images to IPFS (using Pinata or similar)");
    console.log("   2. Upload your metadata JSON files to IPFS");
    console.log("   3. Get the base URI (e.g., ipfs://QmHash/)\n");
    
    const baseURI = await question("Base URI (e.g., ipfs://QmHash/): ");
    const notRevealedURI = await question("Hidden URI (reveal placeholder, e.g., ipfs://QmHash/hidden.json): ");
    
    // ========== STEP 5: WHITELIST CONFIGURATION ==========
    console.log(colors.blue("\n🔐 STEP 5: Whitelist Configuration\n"));
    
    const hasWhitelist = await question("Do you want to enable whitelist/presale? (yes/no): ");
    let merkleRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
    
    if (hasWhitelist.toLowerCase() === "yes") {
        console.log(colors.yellow("\n📝 Whitelist Setup:"));
        console.log("   You'll need to generate a Merkle root from your whitelist addresses.");
        console.log("   Run: node utils/merkle-tree.js after creating your addresses.csv\n");
        
        const customRoot = await question("Enter Merkle Root (or press Enter to use placeholder): ");
        if (customRoot && customRoot.startsWith("0x")) {
            merkleRoot = customRoot;
        }
        
        console.log(colors.green(`✅ Merkle Root set to: ${merkleRoot}`));
    }
    
    // ========== STEP 6: NETWORK SELECTION ==========
    console.log(colors.blue("\n🌍 STEP 6: Network Selection\n"));
    
    const networks = {
        "1": { name: "Hardhat (Local)", value: "hardhat", testnet: true },
        "2": { name: "Sepolia (Ethereum Testnet)", value: "sepolia", testnet: true },
        "3": { name: "Mumbai (Polygon Testnet)", value: "mumbai", testnet: true },
        "4": { name: "BSC Testnet", value: "bscTestnet", testnet: true },
        "5": { name: "Base Goerli", value: "baseGoerli", testnet: true },
        "6": { name: "Ethereum Mainnet", value: "ethereum", testnet: false },
        "7": { name: "Polygon Mainnet", value: "polygon", testnet: false },
        "8": { name: "BSC Mainnet", value: "bsc", testnet: false },
        "9": { name: "Base Mainnet", value: "base", testnet: false }
    };
    
    console.log(colors.yellow("Available Networks:"));
    for (const [key, network] of Object.entries(networks)) {
        const testnetTag = network.testnet ? " (testnet)" : " (mainnet)";
        console.log(`   ${key}. ${network.name}${testnetTag}`);
    }
    
    const networkChoice = await question("\nSelect network (1-9): ");
    const selectedNetwork = networks[networkChoice];
    
    if (!selectedNetwork) {
        console.log(colors.red("❌ Invalid network selection!"));
        rl.close();
        return;
    }
    
    if (!selectedNetwork.testnet) {
        console.log(colors.red("\n⚠️  WARNING: You're deploying to MAINNET!"));
        const confirm = await question("Are you absolutely sure? Type 'yes' to continue: ");
        if (confirm.toLowerCase() !== "yes") {
            console.log(colors.yellow("Deployment cancelled."));
            rl.close();
            return;
        }
    }
    
    // ========== STEP 7: REVIEW AND DEPLOY ==========
    console.log(colors.blue("\n📋 STEP 7: Review Collection Details\n"));
    
    const mintPriceWei = ethers.parseEther(mintPriceETH);
    
    const config = {
        name,
        symbol,
        maxSupply: parseInt(maxSupply),
        mintPrice: mintPriceETH,
        mintPriceWei: mintPriceWei.toString(),
        maxMintPerWallet: parseInt(maxMintPerWallet),
        presaleStart,
        publicSaleStart,
        baseURI,
        notRevealedURI,
        merkleRoot,
        network: selectedNetwork.value,
        networkName: selectedNetwork.name
    };
    
    // Display summary
    console.log(colors.cyan("\n=== COLLECTION SUMMARY ===\n"));
    console.log(`${colors.yellow("Collection:")} ${config.name} (${config.symbol})`);
    console.log(`${colors.yellow("Max Supply:")} ${config.maxSupply}`);
    console.log(`${colors.yellow("Mint Price:")} ${config.mintPrice} ETH`);
    console.log(`${colors.yellow("Max per Wallet:")} ${config.maxMintPerWallet}`);
    console.log(`${colors.yellow("Presale:")} ${new Date(config.presaleStart * 1000).toLocaleString()}`);
    console.log(`${colors.yellow("Public Sale:")} ${new Date(config.publicSaleStart * 1000).toLocaleString()}`);
    console.log(`${colors.yellow("Base URI:")} ${config.baseURI}`);
    console.log(`${colors.yellow("Network:")} ${config.networkName}`);
    console.log(`${colors.yellow("Merkle Root:")} ${config.merkleRoot.substring(0, 20)}...`);
    
    const confirmDeploy = await question("\n✨ Deploy this collection? (yes/no): ");
    
    if (confirmDeploy.toLowerCase() !== "yes") {
        console.log(colors.yellow("Deployment cancelled."));
        rl.close();
        return;
    }
    
    // ========== STEP 8: DEPLOYMENT ==========
    console.log(colors.blue("\n🚀 STEP 8: Deploying Collection\n"));
    
    try {
        // Switch network in Hardhat
        await hre.switchNetwork(config.network);
        
        console.log(colors.yellow(`Deploying to ${config.networkName}...`));
        
        // Get contract factory
        const NFTCollection = await hre.ethers.getContractFactory("NFTCollection");
        
        // Deploy contract
        const nftCollection = await NFTCollection.deploy(
            config.name,
            config.symbol,
            config.maxSupply,
            config.mintPriceWei,
            config.maxMintPerWallet,
            config.presaleStart,
            config.publicSaleStart,
            config.baseURI,
            config.notRevealedURI,
            config.merkleRoot
        );
        
        await nftCollection.waitForDeployment();
        const contractAddress = await nftCollection.getAddress();
        
        console.log(colors.green(`\n✅ Collection deployed successfully!`));
        console.log(colors.green(`   Address: ${contractAddress}`));
        console.log(`   Explorer: https://${config.network === "sepolia" ? "sepolia." : ""}etherscan.io/address/${contractAddress}`);
        
        // ========== STEP 9: SAVE CONFIGURATION ==========
        const deploymentInfo = {
            ...config,
            contractAddress,
            deployedAt: new Date().toISOString(),
            deployedBy: await (await hre.ethers.getSigners())[0].getAddress(),
            transactionHash: nftCollection.deploymentTransaction().hash
        };
        
        // Save to file
        const deploymentPath = path.join(__dirname, "../../deployment.json");
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
        console.log(colors.green(`\n💾 Deployment info saved to: deployment.json`));
        
        // ========== STEP 10: VERIFICATION INSTRUCTIONS ==========
        console.log(colors.cyan("\n🔍 STEP 9: Verification Instructions\n"));
        console.log(colors.yellow("To verify your contract on block explorer, run:"));
        console.log(colors.green(`\nnpx hardhat verify --network ${config.network} ${contractAddress} "${config.name}" "${config.symbol}" ${config.maxSupply} ${config.mintPriceWei} ${config.maxMintPerWallet} ${config.presaleStart} ${config.publicSaleStart} "${config.baseURI}" "${config.notRevealedURI}" "${config.merkleRoot}"\n`));
        
        // ========== FINAL SUMMARY ==========
        console.log(colors.magenta("\n🎉 COLLECTION DEPLOYMENT COMPLETE! 🎉\n"));
        console.log("Next Steps:");
        console.log("   1. Verify contract on block explorer");
        console.log("   2. Upload metadata to IPFS if not done");
        console.log("   3. Update frontend with contract address");
        console.log("   4. Reveal metadata when ready (reveal() function)");
        console.log("   5. Start marketing and minting!\n");
        
    } catch (error) {
        console.log(colors.red(`\n❌ Deployment failed: ${error.message}`));
        console.log(colors.yellow("\nTroubleshooting:"));
        console.log("   - Check your private key in .env");
        console.log("   - Ensure you have enough funds for gas");
        console.log("   - Verify network RPC is working");
        console.log("   - Check contract compilation errors\n");
    }
    
    rl.close();
}

// Helper function to generate deployment script
async function generateDeployScript(config) {
    const scriptPath = path.join(__dirname, `../deploy-${config.symbol.toLowerCase()}.js`);
    
    const scriptContent = `// Auto-generated deployment script for ${config.name}
const hre = require("hardhat");

async function main() {
    const NAME = "${config.name}";
    const SYMBOL = "${config.symbol}";
    const MAX_SUPPLY = ${config.maxSupply};
    const MINT_PRICE = hre.ethers.parseEther("${config.mintPrice}");
    const MAX_MINT_PER_WALLET = ${config.maxMintPerWallet};
    const PRESALE_START = ${config.presaleStart};
    const PUBLIC_SALE_START = ${config.publicSaleStart};
    const BASE_URI = "${config.baseURI}";
    const NOT_REVEALED_URI = "${config.notRevealedURI}";
    const MERKLE_ROOT = "${config.merkleRoot}";

    console.log("Deploying ${config.name}...");
    
    const NFTCollection = await hre.ethers.getContractFactory("NFTCollection");
    const nftCollection = await NFTCollection.deploy(
        NAME, SYMBOL, MAX_SUPPLY, MINT_PRICE, MAX_MINT_PER_WALLET,
        PRESALE_START, PUBLIC_SALE_START, BASE_URI, NOT_REVEALED_URI, MERKLE_ROOT
    );
    
    await nftCollection.waitForDeployment();
    console.log("${config.name} deployed to:", await nftCollection.getAddress());
}

main().catch(console.error);
`;
    
    fs.writeFileSync(scriptPath, scriptContent);
    console.log(colors.green(`📝 Deployment script saved to: ${scriptPath}`));
}

// Export for use in other scripts
module.exports = {
    createCollection,
    generateDeployScript
};

// Run if called directly
if (require.main === module) {
    createCollection().catch(console.error);
}