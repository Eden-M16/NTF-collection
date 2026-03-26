
require("dotenv").config();

// Helper function to get private key
const getPrivateKey = () => {
    if (!process.env.PRIVATE_KEY) {
        console.warn("⚠️  WARNING: PRIVATE_KEY not found in .env file");
        return [];
    }
    return [process.env.PRIVATE_KEY];
};

// Network configurations
const networks = {
    // ========== Ethereum Mainnet ==========
    ethereum: {
        name: "Ethereum Mainnet",
        chainId: 1,
        rpcUrl: process.env.ETHEREUM_RPC || `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
        explorerUrl: "https://etherscan.io",
        explorerApi: "https://api.etherscan.io/api",
        gasPrice: "auto",
        gasLimit: 3000000,
        currency: "ETH",
        accounts: getPrivateKey()
    },
    
    // ========== Ethereum Testnets ==========
    sepolia: {
        name: "Sepolia Testnet",
        chainId: 11155111,
        rpcUrl: process.env.SEPOLIA_RPC || `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
        explorerUrl: "https://sepolia.etherscan.io",
        explorerApi: "https://api-sepolia.etherscan.io/api",
        gasPrice: "auto",
        gasLimit: 3000000,
        currency: "ETH",
        faucet: "https://sepoliafaucet.com",
        accounts: getPrivateKey()
    },
    
    goerli: {
        name: "Goerli Testnet",
        chainId: 5,
        rpcUrl: process.env.GOERLI_RPC || `https://goerli.infura.io/v3/${process.env.INFURA_KEY}`,
        explorerUrl: "https://goerli.etherscan.io",
        explorerApi: "https://api-goerli.etherscan.io/api",
        gasPrice: "auto",
        gasLimit: 3000000,
        currency: "ETH",
        faucet: "https://goerlifaucet.com",
        accounts: getPrivateKey()
    },
    
    // ========== Polygon Mainnet ==========
    polygon: {
        name: "Polygon Mainnet",
        chainId: 137,
        rpcUrl: process.env.POLYGON_RPC || `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
        explorerUrl: "https://polygonscan.com",
        explorerApi: "https://api.polygonscan.com/api",
        gasPrice: "auto",
        gasLimit: 3000000,
        currency: "MATIC",
        accounts: getPrivateKey()
    },
    
    // ========== Polygon Testnet ==========
    mumbai: {
        name: "Mumbai Testnet",
        chainId: 80001,
        rpcUrl: process.env.MUMBAI_RPC || `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_KEY}`,
        explorerUrl: "https://mumbai.polygonscan.com",
        explorerApi: "https://api-testnet.polygonscan.com/api",
        gasPrice: "auto",
        gasLimit: 3000000,
        currency: "MATIC",
        faucet: "https://faucet.polygon.technology",
        accounts: getPrivateKey()
    },
    
    // ========== Binance Smart Chain ==========
    bsc: {
        name: "BSC Mainnet",
        chainId: 56,
        rpcUrl: process.env.BSC_RPC || "https://bsc-dataseed.binance.org",
        explorerUrl: "https://bscscan.com",
        explorerApi: "https://api.bscscan.com/api",
        gasPrice: "auto",
        gasLimit: 3000000,
        currency: "BNB",
        accounts: getPrivateKey()
    },
    
    bscTestnet: {
        name: "BSC Testnet",
        chainId: 97,
        rpcUrl: process.env.BSC_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545",
        explorerUrl: "https://testnet.bscscan.com",
        explorerApi: "https://api-testnet.bscscan.com/api",
        gasPrice: "auto",
        gasLimit: 3000000,
        currency: "BNB",
        faucet: "https://testnet.binance.org/faucet-smart",
        accounts: getPrivateKey()
    },
    
    // ========== Avalanche ==========
    avalanche: {
        name: "Avalanche Mainnet",
        chainId: 43114,
        rpcUrl: process.env.AVALANCHE_RPC || "https://api.avax.network/ext/bc/C/rpc",
        explorerUrl: "https://snowtrace.io",
        explorerApi: "https://api.snowtrace.io/api",
        gasPrice: "auto",
        gasLimit: 3000000,
        currency: "AVAX",
        accounts: getPrivateKey()
    },
    
    fuji: {
        name: "Avalanche Fuji Testnet",
        chainId: 43113,
        rpcUrl: process.env.FUJI_RPC || "https://api.avax-test.network/ext/bc/C/rpc",
        explorerUrl: "https://testnet.snowtrace.io",
        explorerApi: "https://api-testnet.snowtrace.io/api",
        gasPrice: "auto",
        gasLimit: 3000000,
        currency: "AVAX",
        faucet: "https://faucet.avax-test.network",
        accounts: getPrivateKey()
    },
    
    // ========== Arbitrum ==========
    arbitrum: {
        name: "Arbitrum Mainnet",
        chainId: 42161,
        rpcUrl: process.env.ARBITRUM_RPC || `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
        explorerUrl: "https://arbiscan.io",
        explorerApi: "https://api.arbiscan.io/api",
        gasPrice: "auto",
        gasLimit: 3000000,
        currency: "ETH",
        accounts: getPrivateKey()
    },
    
    arbitrumGoerli: {
        name: "Arbitrum Goerli",
        chainId: 421613,
        rpcUrl: process.env.ARBITRUM_GOERLI_RPC || `https://arbitrum-goerli.infura.io/v3/${process.env.INFURA_KEY}`,
        explorerUrl: "https://goerli.arbiscan.io",
        explorerApi: "https://api-goerli.arbiscan.io/api",
        gasPrice: "auto",
        gasLimit: 3000000,
        currency: "ETH",
        faucet: "https://faucet.arbitrum.io",
        accounts: getPrivateKey()
    },
    
    // ========== Optimism ==========
    optimism: {
        name: "Optimism Mainnet",
        chainId: 10,
        rpcUrl: process.env.OPTIMISM_RPC || `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
        explorerUrl: "https://optimistic.etherscan.io",
        explorerApi: "https://api-optimistic.etherscan.io/api",
        gasPrice: "auto",
        gasLimit: 3000000,
        currency: "ETH",
        accounts: getPrivateKey()
    },
    
    optimismGoerli: {
        name: "Optimism Goerli",
        chainId: 420,
        rpcUrl: process.env.OPTIMISM_GOERLI_RPC || `https://optimism-goerli.infura.io/v3/${process.env.INFURA_KEY}`,
        explorerUrl: "https://goerli-optimism.etherscan.io",
        explorerApi: "https://api-goerli-optimism.etherscan.io/api",
        gasPrice: "auto",
        gasLimit: 3000000,
        currency: "ETH",
        faucet: "https://faucet.optimism.io",
        accounts: getPrivateKey()
    },
    
    // ========== Base ==========
    base: {
        name: "Base Mainnet",
        chainId: 8453,
        rpcUrl: process.env.BASE_RPC || "https://mainnet.base.org",
        explorerUrl: "https://basescan.org",
        explorerApi: "https://api.basescan.org/api",
        gasPrice: "auto",
        gasLimit: 3000000,
        currency: "ETH",
        accounts: getPrivateKey()
    },
    
    baseGoerli: {
        name: "Base Goerli",
        chainId: 84531,
        rpcUrl: process.env.BASE_GOERLI_RPC || "https://goerli.base.org",
        explorerUrl: "https://goerli.basescan.org",
        explorerApi: "https://api-goerli.basescan.org/api",
        gasPrice: "auto",
        gasLimit: 3000000,
        currency: "ETH",
        faucet: "https://faucet.triangleplatform.com/base/goerli",
        accounts: getPrivateKey()
    },
    
    // ========== Local Development ==========
    hardhat: {
        name: "Hardhat Local",
        chainId: 31337,
        rpcUrl: "http://127.0.0.1:8545",
        explorerUrl: "",
        explorerApi: "",
        gasPrice: "auto",
        gasLimit: 30000000,
        currency: "ETH",
        accounts: [
            "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Default Hardhat account 0
            "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"  // Default Hardhat account 1
        ]
    },
    
    localhost: {
        name: "Localhost",
        chainId: 31337,
        rpcUrl: "http://127.0.0.1:8545",
        explorerUrl: "",
        explorerApi: "",
        gasPrice: "auto",
        gasLimit: 30000000,
        currency: "ETH",
        accounts: getPrivateKey()
    }
};

// Helper function to get network config by name
function getNetwork(networkName) {
    const network = networks[networkName];
    if (!network) {
        throw new Error(`Network "${networkName}" not found. Available networks: ${Object.keys(networks).join(", ")}`);
    }
    return network;
}

// Helper function to get all network names
function getNetworkNames() {
    return Object.keys(networks);
}

// Helper function to get testnets only
function getTestnets() {
    return Object.keys(networks).filter(name => 
        name.includes("test") || 
        name.includes("goerli") || 
        name.includes("sepolia") || 
        name.includes("mumbai") ||
        name === "hardhat" ||
        name === "localhost"
    );
}

// Helper function to get mainnets only
function getMainnets() {
    return Object.keys(networks).filter(name => 
        !name.includes("test") && 
        !name.includes("goerli") && 
        !name.includes("sepolia") && 
        !name.includes("mumbai") &&
        name !== "hardhat" &&
        name !== "localhost"
    );
}

// Export configurations
module.exports = {
    networks,
    getNetwork,
    getNetworkNames,
    getTestnets,
    getMainnets
};
