// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";


/// @custom:security-contact lee.marreros@blockchainbites.co
contract BBitesToken is Initializable, ERC20Upgradeable, ERC20PermitUpgradeable, PausableUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // constructor() 
    // // ERC20("BBites Token", "BBTKN") 
    // // ERC20Permit("BBites token")
    // {
    //     // _disableInitializers();
    // // _mint(msg.sender, 1_000_000 * 10 ** decimals());
    // }
    function initialize() public initializer {
           __ERC20_init("BBites Token", "BBTKN");
           __Pausable_init();
           __AccessControl_init();
           __ERC20Permit_init("BBites Token");                   
           __UUPSUpgradeable_init();
   
           _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
           _grantRole(PAUSER_ROLE, msg.sender);
           _mint(msg.sender, 1_000_000 * 10 ** decimals());
           _grantRole(MINTER_ROLE, msg.sender);
           _grantRole(UPGRADER_ROLE, msg.sender);
       }
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    function mint(address _to, uint256 _amount) public onlyRole(MINTER_ROLE) whenNotPaused {

        _amount = 10000 * 10 ** decimals();
        _mint(_to, _amount);
    }
    function _authorizeUpgrade(address newImplementation) override internal virtual {
        
    }
    
}
