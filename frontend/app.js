// Contract ABI (simplified - use full ABI from compiled contract)
const CONTRACT_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function maxSupply() view returns (uint256)",
    "function mintPrice() view returns (uint256)",
    "function maxMintPerWallet() view returns (uint256)",
    "function paused() view returns (bool)",
    "function publicSaleStartTime() view returns (uint256)",
    "function publicMint(uint256 amount) payable",
    "function ownerMint(address to, uint256 amount)"
];

let web3;
let contract;
let userAddress;
let contractAddress;

// CONTRACT ADDRESS - UPDATE AFTER DEPLOYMENT
const CONTRACT_ADDRESS = "0xYourContractAddressHere";

async function init() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        
        // Check if already connected
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
            userAddress = accounts[0];
            updateUIForConnectedWallet();
        }
        
        // Load contract info
        await loadContractInfo();
    } else {
        showStatus("Please install MetaMask!", "error");
        document.getElementById("connectBtn").disabled = true;
    }
}

async function loadContractInfo() {
    try {
        const name = await contract.methods.name().call();
        const symbol = await contract.methods.symbol().call();
        const mintPrice = await contract.methods.mintPrice().call();
        const totalSupply = await contract.methods.totalSupply().call();
        const maxSupply = await contract.methods.maxSupply().call();
        const maxPerWallet = await contract.methods.maxMintPerWallet().call();
        
        document.getElementById("collectionName").textContent = `${name} (${symbol})`;
        document.getElementById("mintPrice").textContent = `${web3.utils.fromWei(mintPrice, "ether")} ETH`;
        document.getElementById("supply").textContent = `${totalSupply}/${maxSupply}`;
        document.getElementById("maxPerWallet").textContent = maxPerWallet;
    } catch (error) {
        console.error("Error loading contract info:", error);
        showStatus("Failed to load collection info", "error");
    }
}

async function connectWallet() {
    try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        userAddress = accounts[0];
        updateUIForConnectedWallet();
        showStatus(`Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`, "success");
    } catch (error) {
        console.error("Connection failed:", error);
        showStatus("Failed to connect wallet", "error");
    }
}

function updateUIForConnectedWallet() {
    document.getElementById("connectBtn").style.display = "none";
    document.getElementById("walletInfo").style.display = "block";
    document.getElementById("walletInfo").textContent = `🦊 Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    document.getElementById("mintBtn").disabled = false;
}

async function mintNFT() {
    const amount = parseInt(document.getElementById("mintAmount").value);
    
    if (isNaN(amount) || amount < 1) {
        showStatus("Please enter a valid amount", "error");
        return;
    }
    
    const mintBtn = document.getElementById("mintBtn");
    mintBtn.disabled = true;
    mintBtn.textContent = "🔄 Minting...";
    
    try {
        const mintPrice = await contract.methods.mintPrice().call();
        const totalCost = web3.utils.toBN(mintPrice).mul(web3.utils.toBN(amount));
        
        showStatus(`Minting ${amount} NFT(s)...`, "loading");
        
        const tx = await contract.methods.publicMint(amount).send({
            from: userAddress,
            value: totalCost.toString(),
            gas: 300000
        });
        
        showStatus(`✅ Success! Minted ${amount} NFT(s). Tx: ${tx.transactionHash.slice(0, 10)}...`, "success");
        
        // Refresh supply info
        await loadContractInfo();
        
    } catch (error) {
        console.error("Mint failed:", error);
        showStatus(`❌ Mint failed: ${error.message}`, "error");
    } finally {
        mintBtn.disabled = false;
        mintBtn.textContent = "✨ Mint NFT";
    }
}

function showStatus(message, type) {
    const statusDiv = document.getElementById("status");
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = "block";
    
    if (type !== "loading") {
        setTimeout(() => {
            statusDiv.style.display = "none";
        }, 5000);
    }
}

// Event listeners
document.getElementById("connectBtn").addEventListener("click", connectWallet);
document.getElementById("mintBtn").addEventListener("click", mintNFT);

// Initialize
init();