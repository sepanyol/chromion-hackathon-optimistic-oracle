// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;


import {ERC721Upgradeable,  IERC721} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
 

contract WrappedNft is Initializable, ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable { 

    event DepositedNft(address indexed user, uint256 wNft, address indexed requesterNft, uint256 nftId);
    event FeedbackSubmitted(address indexed requester, string message, bool accepted);

    struct Feedback {
        address requester;
        string message;
        bool accepted;
    }



    uint256 private wNftId;
    mapping(address requester => uint256 wrappedNftId) public wrappedNftIds;
    mapping(uint256 wrappedNftId => Feedback) public feedbacks;
    mapping(uint256 wrappedNftId => mapping(address requesterNft => uint256 requestNftId)) public ownershipId; 

    constructor() {
        _disableInitializers();
    }

    modifier withdrawIfOfferRejected(uint256 wrappedNftId) {
        require(feedbacks[wrappedNftId].accepted, "Offer already accepted");
        _;
    }

    function initialize() public initializer {
        __ERC721_init("Wrapped NFT", "WNFT");
        __Ownable_init();
        __UUPSUpgradeable_init();
        
    }

//the address of the nft of the user
    function depositNft(uint256 _NftId, address requesterNft) external {
        require(msg.sender != address(0), "Invalid address");
        require(_NftId > 0, "Invalid token ID");

        IERC721(requesterNft).transfer(msg.sender, address(this), _NftId);
        
        
        ownershipId[wNftId++][requesterNft] = _NftId;

        _safeMint(msg.sender, wNftId);

        emit DepositedNft(msg.sender, wNftId, requesterNft, _NftId);
    }

    function acceptAnswer(address requester, string memory message, bool requesterfeedBack) external {
        require(feedbacks[wrappedNftIds[requester]].accepted == false, "Feedback already accepted");
        //require(wrappedNftIds[requester] != 0, "Requester does not have a wrapped NFT");
        require(bytes(message).length > 0, "Message cannot be empty");

        feedbacks[wrappedNftIds[requester]] = Feedback({
            requester: requester,
            message: message,
            accepted: requesterfeedBack ? true : false
        });

        emit FeedbackSubmitted(requester, message, requesterfeedBack);
    }

    function withdrawNft(uint256 _tokenId) external withdrawIfOfferRejected(wrappedNftIds[msg.sender]) {
        require(wrappedNftIds[msg.sender] != 0, "You do not have a wrapped NFT");
        require(ownerOf(wrappedNftIds[msg.sender]) == msg.sender, "You are not the owner of this wrapped NFT");
        uint256 wrappedNftId = wrappedNftIds[msg.sender];

        _burn(wrappedNftId);
        delete feedbacks[wrappedNftId];
        delete wrappedNftIds[msg.sender];

        _transfer(address(this), msg.sender, _tokenId);

        emit WithdrawnNft(msg.sender, _tokenId, wrappedNftId);
    }

    function getFeedback(uint256 wrappedNftId) external view returns (Feedback memory) {
        require(wrappedNftId > 0 && wrappedNftId <= wNftId, "Invalid wrapped NFT ID");
        return feedbacks[wrappedNftId];
    }



    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}

//Error: Couldn't find forge binary. Performed lookup: ["forge","C:\\Users\\NWAJAGU\\.cargo\\bin\\forge","C:\\Users\\NWAJAGU\\.foundry\\bin\\forge"]
