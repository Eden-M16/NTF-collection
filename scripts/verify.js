const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Verifying NFT Collection on Block Explorer...\n");
    
    // Load deployment info
    const deploymentPath = path.join(__dirname, "../deployment.json");
    
    if (!fs.existsSync(deploymentPath)) {
        console.error("❌ No deployment found. Run deploy.js first.");
        process.exit(1);
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    const contractAddress = deployment.address;
    const network = deployment.network;
    
    console.log(`📋 Contract Details:`);
    console.log(`   Address: ${contractAddress}`);
    console.log(`   Network: ${network}`);
    console.log(`   Name: ${deployment.name}\n`);
    
    try {
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: [
                deployment.name,
                deployment.symbol,
                deployment.maxSupply,
                hre.ethers.parseEther(deployment.mintPrice),
                deployment.maxMintPerWallet,
                deployment.presaleStart,
                deployment.publicSaleStart,
                deployment.baseURI,
                deployment.notRevealedURI || "ipfs://QmExampleHidden/hidden.json",
                "0x0000000000000000000000000000000000000000000000000000000000000000"
            ]
        });
        
        console.log("✅ Contract verified successfully!");
        console.log(`\n🔗 View on ${network === "sepolia" ? "Sepolia Etherscan" : "Etherscan"}:`);
        console.log(`   https://${network === "sepolia" ? "sepolia." : ""}etherscan.io/address/${contractAddress}`);
        
    } catch (error) {
        if (error.message.includes("Already verified")) {
            console.log("✅ Contract is already verified!");
        } else {
            console.error("❌ Verification failed:", error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });