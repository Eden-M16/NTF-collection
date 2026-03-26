// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleNFT {
    uint256 private counter = 0;
    mapping(uint256 => address) public owners;
    mapping(address => uint256) public balances;
    
    event Minted(address indexed to, uint256 tokenId);
    
    function mint() public {
        counter++;
        owners[counter] = msg.sender;
        balances[msg.sender]++;
        emit Minted(msg.sender, counter);
    }
    
    function totalSupply() public view returns (uint256) {
        return counter;
    }
    
    function ownerOf(uint256 tokenId) public view returns (address) {
        require(owners[tokenId] != address(0), "NFT doesn't exist");
        return owners[tokenId];
    }
    
    function balanceOf(address owner) public view returns (uint256) {
        return balances[owner];
    }
}