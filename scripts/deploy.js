require("dotenv").config();

const {
  getRole,
  verify,
  ex,
  printAddress,
  deploySC,
  deploySCNoUp,
} = require("../utils");

const { getRootFromMT } = require("../utils/merkleTree");

var MINTER_ROLE = getRole("MINTER_ROLE");
var BURNER_ROLE = getRole("BURNER_ROLE");

// Publicar NFT en Mumbai
async function deployMumbai() {
  var relAddMumbai ="0xd8f359E9B9e1Cfd37B930C58D4604cFd0f38def3"; // relayer mumbai
  var name = "CuyCollectionNft";
  var symbol = "CCN";
  // utiliza deploySC
  var proxyContract = await deploySC("CuyCollectionNft", [name, symbol]);
  var proxyContractAdd =await proxyContract.getAddress();
  // utiliza printAddress
  var implementationAddressNft = await printAddress("CuyCollectionNft",proxyContractAdd);

  // utiliza ex
  await ex(proxyContract,"updateRoot",[getRootFromMT()], "Failed");

  // utiliza ex
  await ex(proxyContract,"grantRole",[MINTER_ROLE, relAddMumbai], "Failed");


  // utiliza verify
  await verify(implementationAddressNft, "CuyCollectionNft",[]);

}
// Publicar UDSC, Public Sale y Bbites Token en Goerli
async function deployGoerli() {
  // var relAddGoerli ="0xaBCA5f8d0ccB068dA80035da5E8Ee85fd6866304"; // relayer goerli
  // var psC Contrato
  // deploySC;
  // var bbitesToken Contrato
  // var proxCoBBites = await deploySC("BBitesToken",[]);
  // var proxyAddBBites = await proxCoBBites.getAddress();
  // var impAddBBitesToken = await printAddress("BBitesToken", proxyAddBBites);
  // await ex(proxCoBBites, "grantRole",[MINTER_ROLE, relAddGoerli], "Failed");
  // await verify(impAddBBitesToken, "BBitesToken", []);

  // // deploySC;
  // var smartContractUsdc = await deploySCNoUp("USDCoin", []);
  // var usdcAddress = await smartContractUsdc.getAddress();
  // console.log(`Adress contrato USDC ${usdcAddress}`);
  // await verify(usdcAddress, "USDCoin", []);
  // deploySC;
  // set up
  // script para verificacion del contrato
  var proxyContractPS = await deploySC("PublicSale", ["0xEa9D31A77F464865371B6a5dEDb960C013588a62", "0xBD55b237D94f9850faC9452275aA6D43A3aDc615"]);
  await proxyContractPS.getAddress();
  var impPS = await printAddress("PublicSale", await proxyContractPS.getAddress());
  await verify(impPS, "PublicSale", []);
}

// deployMumbai()
deployGoerli()
  //
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
