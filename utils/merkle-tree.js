const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

/**
 * Generate Merkle Tree from whitelist addresses
 * @param {Array} addresses - Array of wallet addresses
 * @returns {Object} Merkle tree and root
 */
function generateMerkleTree(addresses) {
    // Hash each address
    const leaves = addresses.map(addr => keccak256(addr));
    
    // Create merkle tree
    const merkleTree = new MerkleTree(leaves, keccak256, {
        sortPairs: true
    });
    
    // Get root hash
    const root = merkleTree.getRoot().toString("hex");
    const rootHex = `0x${root}`;
    
    console.log("🌳 Merkle Tree Generated");
    console.log(`   Total Addresses: ${addresses.length}`);
    console.log(`   Merkle Root: ${rootHex}`);
    
    return {
        tree: merkleTree,
        root: rootHex,
        leaves
    };
}

/**
 * Generate proof for a specific address
 * @param {MerkleTree} merkleTree - The merkle tree
 * @param {string} address - Wallet address
 * @returns {Array} Merkle proof
 */
function getProof(merkleTree, address) {
    const leaf = keccak256(address);
    const proof = merkleTree.getHexProof(leaf);
    
    console.log(`🔑 Proof for ${address}:`);
    console.log(`   Proof: [${proof.join(", ")}]`);
    
    return proof;
}

/**
 * Verify a proof
 * @param {string} root - Merkle root
 * @param {string} address - Wallet address
 * @param {Array} proof - Merkle proof
 * @returns {boolean} Valid or not
 */
function verifyProof(root, address, proof) {
    const leaf = keccak256(address);
    const isValid = MerkleTree.verify(proof, leaf, root);
    
    console.log(`🔍 Verification for ${address}: ${isValid ? "✅ Valid" : "❌ Invalid"}`);
    
    return isValid;
}

/**
 * Generate whitelist from CSV file
 * @param {string} csvPath - Path to CSV file with addresses
 * @returns {Array} Array of addresses
 */
function loadWhitelistFromCSV(csvPath) {
    const fs = require("fs");
    const content = fs.readFileSync(csvPath, "utf8");
    const lines = content.split("\n");
    
    // Skip header if exists
    const addresses = lines
        .map(line => line.trim())
        .filter(line => line.length > 0 && line.startsWith("0x"));
    
    console.log(`📄 Loaded ${addresses.length} addresses from ${csvPath}`);
    
    return addresses;
}

/**
 * Generate whitelist JSON file
 * @param {Array} addresses - Array of addresses
 * @param {string} outputPath - Output file path
 */
function saveWhitelistJSON(addresses, outputPath) {
    const fs = require("fs");
    const { root, leaves } = generateMerkleTree(addresses);
    
    const whitelistData = {
        root: root,
        totalAddresses: addresses.length,
        addresses: addresses,
        generatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(whitelistData, null, 2));
    console.log(`💾 Whitelist saved to: ${outputPath}`);
    
    return whitelistData;
}

// Example usage
if (require.main === module) {
    // Example whitelist addresses
    const whitelistAddresses = [
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
    ];
    
    // Generate tree
    const { tree, root } = generateMerkleTree(whitelistAddresses);
    
    // Get proof for first address
    const proof = getProof(tree, whitelistAddresses[0]);
    
    // Verify proof
    verifyProof(root, whitelistAddresses[0], proof);
    
    // Save to file
    saveWhitelistJSON(whitelistAddresses, "./whitelist.json");
}

module.exports = {
    generateMerkleTree,
    getProof,
    verifyProof,
    loadWhitelistFromCSV,
    saveWhitelistJSON
};