const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Load deployment info
  const deploymentPath = path.join(__dirname, "../../deployment.json");
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ No deployment found. Run deploy.js first.");
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contractAddress = deployment.address;
  
  console.log("🎨 NFT Minting Interface\n");
  console.log(`Collection: ${deployment.name} (${deployment.symbol})`);
  console.log(`Address: ${contractAddress}`);
  console.log(`Network: ${deployment.network}\n`);
  
  // Get contract instance
  const NFTCollection = await hre.ethers.getContractFactory("NFTCollection");
  const nftCollection = NFTCollection.attach(contractAddress);
  
  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log(`👤 Connected as: ${signer.address}\n`);
  
  // Get contract info
  const totalSupply = await nftCollection.totalSupply();
  const maxSupply = await nftCollection.maxSupply();
  const mintPrice = await nftCollection.mintPrice();
  const paused = await nftCollection.paused();
  const publicSaleStart = await nftCollection.publicSaleStartTime();
  const presaleStart = await nftCollection.presaleStartTime();
  const currentTime = Math.floor(Date.now() / 1000);
  
  console.log("📊 Contract Status:");
  console.log(`   Total Supply: ${totalSupply}/${maxSupply}`);
  console.log(`   Mint Price: ${hre.ethers.formatEther(mintPrice)} ETH`);
  console.log(`   Paused: ${paused}`);
  console.log(`   Presale: ${currentTime >= presaleStart ? "Active" : "Not started"}`);
  console.log(`   Public Sale: ${currentTime >= publicSaleStart ? "Active" : "Not started"}\n`);
  
  // Interactive minting
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (query) => new Promise((resolve) => {
    readline.question(query, resolve);
  });
  
  const mintType = await question("Mint type (public/presale/owner): ");
  const amount = parseInt(await question("Number of NFTs to mint: "));
  
  if (isNaN(amount) || amount < 1) {
    console.error("❌ Invalid amount");
    readline.close();
    return;
  }
  
  try {
    const totalCost = mintPrice * BigInt(amount);
    
    console.log(`\n🔄 Minting ${amount} NFT(s)...`);
    console.log(`   Total cost: ${hre.ethers.formatEther(totalCost)} ETH`);
    
    let tx;
    
    if (mintType === "public") {
      tx = await nftCollection.publicMint(amount, {
        value: totalCost
      });
    } else if (mintType === "presale") {
      // For presale, you'd need to provide merkle proof
      const merkleProof = []; // Generate from whitelist
      tx = await nftCollection.presaleMint(amount, merkleProof, {
        value: totalCost
      });
    } else if (mintType === "owner") {
      const recipient = await question("Recipient address: ");
      tx = await nftCollection.ownerMint(recipient, amount);
    } else {
      console.error("❌ Invalid mint type");
      readline.close();
      return;
    }
    
    console.log(`⏳ Waiting for confirmation...`);
    await tx.wait();
    
    console.log(`✅ Successfully minted ${amount} NFT(s)!`);
    console.log(`   Transaction: ${tx.hash}`);
    
  } catch (error) {
    console.error("❌ Minting failed:", error.message);
  }
  
  readline.close();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });