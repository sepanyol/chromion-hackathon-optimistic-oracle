// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {ERC721Upgradeable, IERC721} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract WrappedNft is Initializable, ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable { 
    event DepositedNft(address indexed user, uint256 wNft, address indexed requesterNft, uint256 nftId);
    event FeedbackSubmitted(address indexed requester, string message, bool accepted);
    event WithdrawnNft(address indexed toRequester, uint256 tokenId, uint256 nftId);
    event NftNowActiveForSale(uint256 wrappedNftId, uint256 _NftId);
    event NftBought(uint256 wrappedNftId, address indexed buyer, uint256 nftId, uint256 price);

    struct Feedback {
        address requester;
        uint256 price;
        bool accepted;
    }

    IERC20 public mockUSDC;
    uint256 private wNftId;
    mapping(uint256 => Feedback) public feedbacks;
    mapping(uint256 => mapping(address => uint256)) public ownershipId; 
    mapping(uint256 => bool) public isActive;

    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC721_init("Wrapped NFT", "WNFT");
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    function depositNft(uint256 _NftId, address requesterNftAddress) external {
        require(msg.sender != address(0), "Invalid address");
        require(_NftId > 0, "Invalid token ID");
        require(requesterNftAddress != address(0), "Nft contract Address can't be a zero Address");

        IERC721(requesterNftAddress).transferFrom(msg.sender, address(this), _NftId);
        
        uint256 currentNftId = ++wNftId;
        ownershipId[currentNftId][requesterNftAddress] = _NftId;

        _safeMint(msg.sender, currentNftId);

        emit DepositedNft(msg.sender, currentNftId, requesterNftAddress, _NftId);
    }

    function withdrawNft(uint256 _wNftId, address requesterNftAddress, uint256 _NftId) external {
        require(ownershipId[_wNftId][requesterNftAddress] == _NftId, "You haven't deposited any NFT");
        require(!feedbacks[_wNftId].accepted, "Cannot withdraw NFT after accepting feedback");

        _burn(_wNftId);
        IERC721(requesterNftAddress).transferFrom(address(this), msg.sender, _NftId);

        delete ownershipId[_wNftId][requesterNftAddress];
        delete feedbacks[_wNftId];
        
        emit WithdrawnNft(msg.sender, _wNftId, _NftId);
    }

    function acceptAnswer(address requester, uint256 price, bool requesterfeedBack) external {
        require(!feedbacks[wNftId].accepted, "Feedback already accepted");
        require(price > 0, "Price cannot be zero");

        feedbacks[wNftId] = Feedback({
            requester: requester,
            price: price,
            accepted: requesterfeedBack
        });

        emit FeedbackSubmitted(requester, "", requesterfeedBack);
    }

    function setSaleActive(uint256 wrappedNftId, address requesterNftAddress, uint256 _NftId) external {
        require(ownerOf(wrappedNftId) == msg.sender, "You are not the owner");
        require(feedbacks[wrappedNftId].accepted, "Price not accepted");
        isActive[wrappedNftId] = true;
        emit NftNowActiveForSale(wrappedNftId, _NftId);
    } 

    function buy(address requester, uint256 wrappedNftId, address requesterNftAddress, uint256 NftId) external {
        require(requester != address(0), "Zero Address Not Allowed");
        require(feedbacks[wrappedNftId].accepted, "You cannot buy what has not been accepted");
        require(IERC20(mockUSDC).balanceOf(msg.sender) >= feedbacks[wrappedNftId].price, "Insufficient amount");
        require(isActive[wrappedNftId], "Not yet active for sale");
        
        IERC20(mockUSDC).transferFrom(msg.sender, requester, feedbacks[wrappedNftId].price);

        _burn(wrappedNftId);
        uint256 nftId = ownershipId[wrappedNftId][requesterNftAddress];

        IERC721(requesterNftAddress).transferFrom(address(this), msg.sender, nftId);

        delete ownershipId[wrappedNftId][requesterNftAddress];
        delete isActive[wrappedNftId];

        emit NftBought(wrappedNftId, msg.sender, nftId, feedbacks[wrappedNftId].price);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}

//Error: Couldn't find forge binary. Performed lookup: ["forge","C:\\Users\\NWAJAGU\\.cargo\\bin\\forge","C:\\Users\\NWAJAGU\\.foundry\\bin\\forge"]
