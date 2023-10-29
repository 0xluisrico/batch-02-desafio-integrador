// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IUniSwapV2Router02} from "./Interfaces.sol";

//PUBLICACION EN GOERLI (ETHEREUM).
contract PublicSale is PausableUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {

    modifier valueEther (uint256 _valueEther) {
        require (_valueEther >= 0.01 ether, "Value incorrecto");
        _;
    }
    modifier nftTokenUsdc(address _owner,uint256 _id) {

        require(_id >= 0 && _id <= 699, "Id nft invalid (0 - 699)");
        require(nftsDisponibles[_owner][_id] == false, "Id nft not available.");
        nftsDisponibles[_owner][_id] =  true;
        _;
    }    
    IUniSwapV2Router02 router;
    address constant routerAdd = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    // address BbtknAdd =0xbe4f9D67353BEBDad38d8dA2A71EB600Dd54c28a;
    IERC20Upgradeable bbtkn;
    // address UsdcAdd = 0xb476A56A856032d92Bd30101D14463333581E284;
    IERC20Upgradeable usdc;

    address[] path;
    // direccion del contrato del bbtkn

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant EXECUTER_ROLE = keccak256("EXECUTER_ROLE");

    // 00 horas del 30 de septiembre del 2023 GMT
    uint256 constant startDate = 1696032000;

    // Maximo price NFT
    uint256 constant MAX_PRICE_NFT = 90_000 * 10 ** 18;

    event PurchaseNftWithId(address account, uint256 id);

    mapping(address owner => mapping(uint256 _id =>  bool _disponibles)) public nftsDisponibles;

    function initialize(address _bbtknAdd, address _usdcAdd) public initializer {
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        router = IUniSwapV2Router02(routerAdd);    
        bbtkn = IERC20Upgradeable(_bbtknAdd);   
        usdc = IERC20Upgradeable(_usdcAdd);
        path = [_usdcAdd, _bbtknAdd];

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    function purchaseWithTokens(uint256 _id) public nftTokenUsdc(msg.sender,_id) {

        uint256 valueNft = valueNftTokenAndUsdc(_id);
        // require(usdc.allowance(msg.sender, address(this)) >= valueNft,"allowance invalid.");        
        //dar approve desde el frontend antes de  esto
        bbtkn.transferFrom(msg.sender, address(this), valueNft);

        emit PurchaseNftWithId(msg.sender, _id);
    }    
    function purchaseWithUSDC(uint256 _id, uint256 _amountIn) external nftTokenUsdc(msg.sender, _id) {
        // transfiere _amountIn de USDC a este contrato
        //Aprrove antes para que el contrato maneje sus usdx
        //Este aprrove fuera del public sale
        usdc.transferFrom(msg.sender, address(this), _amountIn);
        usdc.approve(routerAdd, _amountIn);
        //creamos el valor del NFT en BBTKN
        uint256 valueNftToken = valueNftTokenAndUsdc(_id);//valor del nft en tokens
        // llama a swapTokensForExactTokens: valor de retorno de este metodo es cuanto gastaste del token input
        uint256 amountDecimalsUsdc = _amountIn *10 **12;
        
        uint256[] memory amounts = router.swapTokensForExactTokens(valueNftToken, amountDecimalsUsdc, path, address(this), 1 minutes);
        // transfiere el excedente de USDC a msg.sender
        require(_amountIn > (amounts[0]),"value usdc invalid");
        usdc.transfer(msg.sender, _amountIn - amounts[0]/10 **12);

        emit PurchaseNftWithId(msg.sender, _id);
    }
    function purchaseWithEtherAndId(uint256 _id) public payable valueEther(msg.value) {
        if (msg.value > 0.1 ether) {
            uint256 returned = msg.value - 0.1 ether;
            payable(msg.sender).transfer(returned);            
        }
        require (_id >= 700 && _id <= 999 ,"Id NFT invalid.");
        require (nftsDisponibles[msg.sender][_id] == false, "id not available" );
        nftsDisponibles[msg.sender][_id] = true;
        // making the id unavailable
        emit PurchaseNftWithId(msg.sender, _id);
    }
    function depositEthForARandomNft() public payable valueEther(msg.value) {
        if (msg.value > 0.1 ether) {
            uint256 returned = msg.value - 0.1 ether;
            payable(msg.sender).transfer(returned);            
        }
        uint256 randomId = randomNum700_999();
        require (nftsDisponibles[msg.sender][randomId] == false, "id not available");
        nftsDisponibles[msg.sender][randomId] = true;
        
        emit PurchaseNftWithId(msg.sender, randomId);
    }
    receive() external payable {
        depositEthForARandomNft();
    }

    ////////////////////////////////////////////////////////////////////////
    /////////                    Helper Methods                    /////////
    ////////////////////////////////////////////////////////////////////////

    function randomNum700_999() internal view returns (uint256) {
        return (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 
            299) +
        700 +
        1;
    }
    //cambiar esta funcion a public 
    //ME FALTA POR DEPLOY CON PUBLIC 
    function valueNftTokenAndUsdc(uint256 _id) public view returns (uint256) {
        uint256 valueNft;
        require (_id >= 0 && _id <= 699, "Id NFT invalid.");
        if (_id >= 0 && _id <= 199) {
            valueNft = 1000 * 10 ** 18;
        }else if (_id >= 200 && _id <= 499) {
            valueNft = _id * (20 * 10 ** 18);
        }else if (_id >= 500 && _id <= 699) {
            valueNft = (10000 *10 ** 18 ) + ((block.timestamp - 1696032000)/86400)*2000 * 10 ** 18 ;
            if (valueNft > MAX_PRICE_NFT ) {
                valueNft = MAX_PRICE_NFT;
            }        
        }
        return valueNft;
    }
 
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(UPGRADER_ROLE)
        override
    {}

}
