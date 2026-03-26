const fs = require("fs");
const path = require("path");
const { uploadFolderToIPFS } = require("../utils/pinata-upload");

async function generateMetadata() {
    // ===== CONFIGURE THESE VALUES =====
    const totalSupply = 10000; // Change to your total supply
    const collectionName = "CyberPunks 2.0";
    const collectionDescription = "A unique CyberPunk NFT from the CyberPunks 2.0 collection";
    const baseImageHash = "QmExampleBaseImageHash"; // Your base image IPFS hash
    const externalUrl = "https://yourwebsite.com/nft/";
    // ==================================
    
    const outputDir = path.join(__dirname, "../metadata/generated");
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log(`🎨 Generating metadata for ${totalSupply} NFTs...\n`);
    
    // Example trait lists for random generation
    const traits = {
        background: ["Blue", "Red", "Green", "Purple", "Yellow", "Black", "Orange", "Pink"],
        skin: ["Gold", "Silver", "Bronze", "Diamond", "Emerald", "Ruby", "Sapphire", "Amethyst"],
        eyes: ["Normal", "Laser", "Cyborg", "Alien", "Glowing", "Closed", "3D Glasses", "VR Headset"],
        mouth: ["Smile", "Frown", "Open", "Grin", "Surprised", "Neutral", "Tongue", "Mustache"],
        hat: ["None", "Crown", "Top Hat", "Baseball Cap", "Wizard Hat", "Sombrero", "Beanie", "Halo"],
        accessory: ["None", "Glasses", "Necklace", "Earrings", "Mask", "Scarf", "Headphones", "Cigarette"]
    };
    
    const metadataFiles = [];
    
    for (let i = 1; i <= totalSupply; i++) {
        // Generate random attributes
        const attributes = Object.entries(traits).map(([trait, values]) => ({
            trait_type: trait.charAt(0).toUpperCase() + trait.slice(1),
            value: values[Math.floor(Math.random() * values.length)]
        }));
        
        // Add rarity score (optional)
        const rarityScore = Math.random() * 100;
        attributes.push({
            trait_type: "Rarity Score",
            value: Math.floor(rarityScore)
        });
        
        const metadata = {
            name: `${collectionName} #${i}`,
            description: collectionDescription,
            image: `ipfs://${baseImageHash}/${i}.png`,
            attributes: attributes,
            external_url: `${externalUrl}${i}`,
            background_color: "000000"
        };
        
        const filePath = path.join(outputDir, `${i}.json`);
        fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
        metadataFiles.push(filePath);
        
        // Progress indicator
        if (i % 1000 === 0) {
            console.log(`   Generated ${i}/${totalSupply} metadata files...`);
        }
    }
    
    console.log(`\n✅ Generated ${totalSupply} metadata files in: ${outputDir}`);
    console.log(`   Total size: ${metadataFiles.length} files`);
    
    // Optional: Upload to IPFS
    const uploadToIPFS = process.argv.includes("--upload");
    
    if (uploadToIPFS) {
        console.log("\n📤 Uploading to IPFS via Pinata...");
        try {
            const result = await uploadFolderToIPFS(outputDir);
            console.log(`\n✅ Upload complete!`);
            console.log(`   Base URI: ${result.baseURI}`);
            console.log(`\n📝 Update your contract with:`);
            console.log(`   await nftCollection.setBaseURI("${result.baseURI}");`);
            console.log(`   or in deploy script, update BASE_URI variable`);
        } catch (error) {
            console.error("❌ Upload failed:", error.message);
        }
    }
    
    // Generate summary file
    const summary = {
        collectionName: collectionName,
        totalSupply: totalSupply,
        generatedAt: new Date().toISOString(),
        baseImageHash: baseImageHash,
        traits: traits,
        outputDirectory: outputDir
    };
    
    fs.writeFileSync(
        path.join(outputDir, "../metadata-summary.json"),
        JSON.stringify(summary, null, 2)
    );
    
    console.log("\n🎉 Metadata generation complete!");
    console.log(`📄 Summary saved to: metadata/metadata-summary.json`);
}

// Run the function
generateMetadata().catch(console.error);