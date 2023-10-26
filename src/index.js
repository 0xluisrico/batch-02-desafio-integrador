import { Contract, ethers } from "ethers";
import usdcTknAbi from "../artifacts/contracts/USDCoin.sol/USDCoin.json";
import bbitesTokenAbi from "../artifacts/contracts/BBitesToken.sol/BBitesToken.json";
import publicSaleAbi from "../artifacts/contracts/PublicSale.sol/PublicSale.json";
import nftTknAbi from "../artifacts/contracts/CuyCollectionNft.sol/CuyCollectionNft.json";

// SUGERENCIA: vuelve a armar el MerkleTree en frontend
// Utiliza la libreria buffer
import buffer from "buffer/";
import walletAndIds from "../wallets/walletList";
import { MerkleTree } from "merkletreejs";
var Buffer = buffer.Buffer;
var merkleTree, root;

function hashToken(tokenId, account) {
  return Buffer.from(
    ethers
      .solidityPackedKeccak256(["uint256", "address"], [tokenId, account])
      .slice(2),
    "hex"
  );
}
function buildMerkleTree() {
  var elementosHasheados = walletAndIds.map(({id, address})=>{
    return hashToken(id, address);
  });
  merkleTree = new MerkleTree(elementosHasheados, ethers.keccak256, {
    sortPairs: true,
  });
  root = merkleTree.getHexRoot();
  console.log(root);
  return root;
}
// function buildProofs(id, address) {
//   hasheandoElemento = hashToken(id, address);
//   proofs = merkleTree.getHexProof(hasheandoElemento);
//   console.log(proofs);
//   // verificacion off-chain
//   var pertenece = merkleTree.verify(proofs, hasheandoElemento, root);
//   console.log(pertenece);
// }

var provider, signer, account;
var usdcTkContract, bbitesTknContract, pubSContract, nftContract;
var usdcAddress, bbitesTknAdd, pubSContractAdd;

function initSCsGoerli() {
  provider = new ethers.BrowserProvider(window.ethereum);

  usdcAddress ="0xBD55b237D94f9850faC9452275aA6D43A3aDc615";
  bbitesTknAdd = "0xEa9D31A77F464865371B6a5dEDb960C013588a62";
  pubSContractAdd = "0x052096c3Ee4e5ab86Fa88Ca8cFEFb132F49c3d2e";
   

  usdcTkContract = new Contract(usdcAddress, (usdcTknAbi.abi), provider);
  bbitesTknContract = new Contract(bbitesTknAdd, bbitesTokenAbi.abi, provider);
  pubSContract = new Contract(pubSContractAdd, publicSaleAbi.abi, provider);
}

function initSCsMumbai() {
  provider = new ethers.BrowserProvider(window.ethereum);

  var nftAddress = "0x8AAC764C98C4949cCeA35548Bc60b5E6f5ae114b";

  nftContract = new Contract(nftAddress, nftTknAbi.abi, provider);
}

async function setUpListeners() {
  // Connect to Metamask
  var bttn = document.getElementById("connect");
  var walletIdEl = document.getElementById("walletId"); 
  bttn.addEventListener("click", async () => {
    if (window.ethereum) { //se valida que tenga la extension de metamask en el browser
      [account] = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Billetera metamask", account);
      walletIdEl.innerHTML = account;

      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner(account);
    }
  });

  // USDC Balance - balanceOf
  var bttn = document.getElementById("usdcUpdate");
  bttn.addEventListener("click", async () => {
    var balance = await usdcTkContract.balanceOf(account);
    console.log(balance);
    var balanceEl = document.getElementById("usdcBalance");
    balanceEl.innerHTML = ethers.formatUnits(balance, 6);
  });

  // Bbites token Balance - balanceOf
  var bttn = document.getElementById("bbitesTknUpdate");
  bttn.addEventListener("click", async () => {
    var balanceBBtkn = await bbitesTknContract.balanceOf(account);
    console.log(balanceBBtkn);
    var balanceElBBtkn = document.getElementById("bbitesTknBalance");
    balanceElBBtkn.innerHTML = balanceBBtkn;
  });
  // APPROVE BBTKN
  // bbitesTknContract.approve
  var bttn = document.getElementById("approveButtonBBTkn");
  var approveInput = document.getElementById("approveInput");
  bttn.addEventListener("click", async () => {
    var amount = approveInput.value;
    var approve = await bbitesTknContract.connect(signer).approve(pubSContractAdd, amount);
    console.log(approve);
  });

  // APPROVE USDC
  // usdcTkContract.approve
  var bttn = document.getElementById("approveButtonUSDC");
  var approveInputUsdc = document.getElementById("approveInputUSDC").value;
  bttn.addEventListener("click", async () => {
    var approveUsdc = await usdcTkContract.connect(signer).approve(pubSContractAdd, approveInputUsdc);
    console.log(approveUsdc);
  });

  // purchaseWithTokens
  var bttn = document.getElementById("purchaseButton");
  var idInput = document.getElementById("purchaseInput");
  bttn.addEventListener("click", async () => {
    var id = idInput.value;
    var purchase = await pubSContract.connect(signer).purchaseWithTokens(id);
    console.log(purchase);
  });

  // purchaseWithUSDC
  var bttn = document.getElementById("purchaseButtonUSDC");
  var idInput = document.getElementById("purchaseInputUSDC");
  var amountInput = document.getElementById("amountInUSDCInput");
  bttn.addEventListener("click", async  () => {
    var id = idInput.value;
    var amount = amountInput.value;
    var purchase = await pubSContract.connect(signer).purchaseWithUSDC(id, amount);
    console.log(purchase);
  });

  // purchaseWithEtherAndId
  var bttn = document.getElementById("purchaseButtonEtherId");
  var idInput = document.getElementById("purchaseInputEtherId");
  bttn.addEventListener("click", async () => {
    var id = idInput.value;
      // purchaseWithEtherAndId(id)
    var purchase = await pubSContract.connect(signer).purchaseWithEtherAndId(id);
    console.log(purchase);
  });


  // send Ether
  var bttn = document.getElementById("sendEtherButton");
  bttn.addEventListener("click", async () => {
    var purchase = await pubSContract.connect(signer).depositEthForARandomNft();
    console.log(purchase);
  });

  // getPriceForId
  var bttn = document.getElementById("getPriceNftByIdBttn");
  var inputId = document.getElementById("priceNftIdInput");
  bttn.addEventListener("click", async () => {
    var id = inputId.value;
    var getPrice = await pubSContract.valueNftTokenAndUsdc(id);
    console.log(getPrice);
    var price = document.getElementById("priceNftByIdText");
    price.innerHTML = getPrice;
  });

  // getProofs
  var bttn = document.getElementById("getProofsButtonId");
  bttn.addEventListener("click", async () => {
    var id = document.getElementById("inputIdProofId").value;
    var address = document.getElementById("inputAccountProofId").value;
    var proofs = merkleTree.getHexProof(hashToken(id, address));
    navigator.clipboard.writeText(JSON.stringify(proofs));
  });

  // safeMintWhiteList
  var bttn = document.getElementById("safeMintWhiteListBttnId");
  bttn.addEventListener("click", async () => {
    var to = document.getElementById("whiteListToInputId").value;
    var tokenId = document.getElementById("whiteListToInputTokenId").value;
    var proofs = document.getElementById("whiteListProofsId").value;
    proofs = JSON.parse(proofs).map(ethers.hexlify);
    var safeMintWhiteList = await nftContract.safeMintWhiteList(to, tokenId, proofs);
    console.log(safeMintWhiteList); 
  });
  // usar ethers.hexlify porque es un array de bytes 32
  // var proofs = document.getElementById("whiteListToInputProofsId").value;
  // proofs = JSON.parse(proofs).map(ethers.hexlify);

  // buyBack
  var bttn = document.getElementById("buyBackBttn");
  bttn.addEventListener("click", async () =>{
    var id = document.getElementById("buyBackInputId").value;
    var buyBack = await nftContract.buyBack(id);
    console.log(buyBack);
  });
}

function setUpEventsContracts() {

  var pubSList = document.getElementById("pubSList");
  pubSContract.on("PurchaseNftWithId",(account, id) => {
    console.log("account", account);
    console.log("id", id);
  });
  pubSContract.on("PurchaseNftWithId",(account, id) => {
    console.log("account", account);
    console.log("id", id);
  });
  
  // pubSContract - "PurchaseNftWithId"

  var bbitesListEl = document.getElementById("bbitesTList");
  // bbitesCListener - "Transfer"

  var nftList = document.getElementById("nftList");
  // nftCListener - "Transfer"

  var burnList = document.getElementById("burnList");
  // nftCListener - "Burn"
  nftContract.on("Burn", (account, id) => {
    console.log("accoutn", account);
    console.log("Id", id);
  });
}

async function setUp() {
    window.ethereum.on("chainChanged", (chainId) => {
    window.location.reload();
  });
  
  initSCsGoerli();
  initSCsMumbai();
  setUpListeners();
  // setUpEventsContracts
  buildMerkleTree();

  
}

setUp()
  .then()
  .catch((e) => console.log(e));
