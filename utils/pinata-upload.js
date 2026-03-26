const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

async function uploadToIPFS(filePath) {
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    
    try {
        const response = await axios.post(url, formData, {
            maxContentLength: "Infinity",
            headers: {
                "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
                "pinata_api_key": PINATA_API_KEY,
                "pinata_secret_api_key": PINATA_API_SECRET
            }
        });
        
        console.log(`✅ Uploaded: ${path.basename(filePath)}`);
        console.log(`   IPFS Hash: ${response.data.IpfsHash}`);
        console.log(`   IPFS URI: ipfs://${response.data.IpfsHash}`);
        
        return {
            hash: response.data.IpfsHash,
            uri: `ipfs://${response.data.IpfsHash}`
        };
    } catch (error) {
        console.error("❌ Upload failed:", error.response?.data || error.message);
        throw error;
    }
}

async function uploadJSONToIPFS(jsonData, fileName) {
    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
    
    try {
        const response = await axios.post(url, jsonData, {
            headers: {
                "Content-Type": "application/json",
                "pinata_api_key": PINATA_API_KEY,
                "pinata_secret_api_key": PINATA_API_SECRET
            }
        });
        
        console.log(`✅ Uploaded JSON: ${fileName}`);
        console.log(`   IPFS Hash: ${response.data.IpfsHash}`);
        console.log(`   IPFS URI: ipfs://${response.data.IpfsHash}`);
        
        return {
            hash: response.data.IpfsHash,
            uri: `ipfs://${response.data.IpfsHash}`
        };
    } catch (error) {
        console.error("❌ JSON upload failed:", error.response?.data || error.message);
        throw error;
    }
}

async function uploadFolderToIPFS(folderPath) {
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const formData = new FormData();
    
    // Read all files in folder
    const files = fs.readdirSync(folderPath);
    
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        formData.append("file", fs.createReadStream(filePath), {
            filepath: file
        });
    }
    
    try {
        const response = await axios.post(url, formData, {
            maxContentLength: "Infinity",
            headers: {
                "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
                "pinata_api_key": PINATA_API_KEY,
                "pinata_secret_api_key": PINATA_API_SECRET
            }
        });
        
        console.log(`✅ Uploaded folder: ${folderPath}`);
        console.log(`   IPFS Hash: ${response.data.IpfsHash}`);
        console.log(`   Base URI: ipfs://${response.data.IpfsHash}/`);
        
        return {
            hash: response.data.IpfsHash,
            baseURI: `ipfs://${response.data.IpfsHash}/`
        };
    } catch (error) {
        console.error("❌ Folder upload failed:", error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    uploadToIPFS,
    uploadJSONToIPFS,
    uploadFolderToIPFS
};