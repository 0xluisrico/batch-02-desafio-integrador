const { ethers } = require("ethers");
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require("@openzeppelin/defender-relay-client/lib/ethers");

exports.handler = async function (data) {
  const payload = data.request.body.events;
  const provider = new DefenderRelayProvider(data);
  const signer = new DefenderRelaySigner(data, provider, { speed: "fast" });

  var onlyEvents = payload[0].matchReasons.filter((e) => e.type === "event");
  if (onlyEvents.length === 0) return;

  var event = onlyEvents.filter((ev) =>
  ev.signature.includes("Burn")
  );
  
  var {account, amount} = event[0].params;
  var BBitesToken ="0xEa9D31A77F464865371B6a5dEDb960C013588a62";
  var tokenAbi = ["function mint(address to, uint256 tokenId)"];
  var tokenContract = new ethers.Contract(BBitesToken, tokenAbi, signer);
  var tx = await tokenContract.mint(account, amount);
  var res = await tx.wait();
  return res;
}; 
