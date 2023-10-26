const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { ethers } = require("hardhat");
const walletList = require("../wallets/walletList");

var merkleTree, root;
function hashToken(id, address) {
  return Buffer.from(
    ethers
      .solidityPackedKeccak256(["uint256", "address"], [id, address])
      .slice(2),
    "hex"
  );
}
function buildMerkleTree() {
  var whiteListHash = walletList.map(({id, address})=>{
    return hashToken(id, address);
  });
  merkleTree = new MerkleTree(whiteListHash, keccak256, {
    sortPairs: true,
  });
  root = merkleTree.getHexRoot();
  console.log(root);
  return root;
  
}
function buildProofs(id, address) {
  // var tokenId = 7;
  // var account = "0x00b7cda410001f6e52a7f19000b3f767ec8aec7d";
  hasheandoElemento = hashToken(id, address);
  proofs = merkleTree.getHexProof(hasheandoElemento);
  console.log(proofs);

  // verificacion off-chain
  var pertenece = merkleTree.verify(proofs, hasheandoElemento, root);
  console.log(pertenece);
}

function getRootFromMT() {
  return buildMerkleTree();
}
buildMerkleTree();
module.exports = { getRootFromMT };


