// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {ERC721Upgradeable, IERC721} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IRequestFactory, RequestTypes} from "./interfaces/IRequestFactory.sol";
import {IBaseRequestContract} from "./interfaces/IBaseRequestContract.sol";

contract WrappedNft is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    uint256 public constant EVALUATION_REQUEST_COOLDOWN = 86400 * 7;
    address public immutable requestFactory;

    event DepositedNft(
        address indexed requester,
        address indexed originNFT,
        uint256 wNft,
        uint256 originId
    );
    event WithdrawnNft(
        address indexed requester,
        address indexed originNFT,
        uint256 wNft,
        uint256 originId
    );
    event FeedbackSubmitted(
        address indexed requester,
        string message,
        bool accepted
    );

    event NftNowActiveForSale(uint256 wrappedNftId, uint256 _NftId);
    event NftBought(
        address indexed buyer,
        uint256 wrappedNftId,
        uint256 nftId,
        uint256 price
    );

    struct AdditionalData {
        uint256 originId;
        uint256 price;
        uint256 lastEvaluationTime;
        address originNFT;
        address activeRequest; // set to address(0) when request resolves
        bool openToBuyer;
        address[] requests;
    }

    IERC20 public mockUSDC;
    uint256 private wNftId;

    mapping(uint256 => AdditionalData) public additionalData;

    constructor(address _requestFactory) {
        requestFactory = _requestFactory;
    }

    function initialize() public initializer {
        __ERC721_init("Wrapped NFT", "WNFT");
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
    }

    function deposit(
        uint256 _originId,
        address _originNFT
    ) external returns (uint256) {
        require(
            _originNFT != address(0),
            "Nft contract Address can't be a zero Address"
        );
        require(_originId > 0, "Invalid token ID");

        IERC721(_originNFT).transferFrom(msg.sender, address(this), _originId);

        uint256 currentNftId = ++wNftId;

        additionalData[currentNftId].originId = _originId;
        additionalData[currentNftId].originNFT = _originNFT;

        _safeMint(msg.sender, currentNftId);

        emit DepositedNft(msg.sender, _originNFT, currentNftId, _originId);

        return currentNftId;
    }

    function withdraw(uint256 _wNftId) external {
        require(ownerOf(_wNftId) == msg.sender, "You are not the owner");
        require(
            additionalData[_wNftId].activeRequest == address(0),
            "should have no active request"
        );

        _burn(_wNftId);

        IERC721(additionalData[_wNftId].originNFT).transferFrom(
            address(this),
            msg.sender,
            additionalData[_wNftId].originId
        );

        address originNFT = additionalData[_wNftId].originNFT;
        uint256 originId = additionalData[_wNftId].originId;

        delete additionalData[_wNftId];

        emit WithdrawnNft(msg.sender, originNFT, _wNftId, originId);
    }

    function evaluate(uint256 _wNftId, string memory _context) external {
        require(ownerOf(_wNftId) == msg.sender, "You are not the owner");
        require(
            !additionalData[_wNftId].openToBuyer,
            "sale is active, not allowed to evaluate now. close sale process"
        );
        // check if a request is already active
        require(
            additionalData[_wNftId].activeRequest == address(0),
            "should have no active request"
        );
        require(
            additionalData[wNftId].lastEvaluationTime +
                EVALUATION_REQUEST_COOLDOWN <=
                block.timestamp,
            "Cooldown still active"
        );

        address requestAddress = IRequestFactory(requestFactory).createRequest(
            RequestTypes.RequestParams({
                requester: abi.encode(msg.sender),
                originAddress: abi.encode(""),
                originChainId: abi.encode(""),
                answerType: RequestTypes.AnswerType.Value,
                challengeWindow: 86400,
                rewardAmount: 10e6,
                question: string.concat(
                    "What the value of the NFT (",
                    string(abi.encodePacked(address(this))),
                    ") with ID ",
                    string(abi.encode(_wNftId))
                ),
                context: _context,
                truthMeaning: "",
                isCrossChain: !IRequestFactory(requestFactory).isOracleChain()
            })
        );

        additionalData[_wNftId].activeRequest = requestAddress;
        additionalData[_wNftId].requests.push(requestAddress);

        // TODO emit EvaluatioNRequest()
    }

    function acceptProposedEvaluation(uint256 _wNftId) external {
        require(ownerOf(_wNftId) == msg.sender, "You are not the owner");
        require(
            additionalData[_wNftId].activeRequest != address(0),
            "No request existing"
        );
        require(
            IBaseRequestContract(additionalData[_wNftId].activeRequest)
                .status() == RequestTypes.RequestStatus.Resolved,
            "Request is not resolved yet"
        );

        additionalData[_wNftId].price = abi.decode(
            IBaseRequestContract(additionalData[_wNftId].activeRequest)
                .answer(),
            (uint256)
        );

        additionalData[_wNftId].lastEvaluationTime = block.timestamp;
        additionalData[_wNftId].activeRequest = address(0);

        // TODO emit ProposedEvaluationAccepted(request, nftaddress, nftid, msg.sender, price);
    }

    function updateOpenToBuyerSaleStatus(
        uint256 _wNftId,
        bool _status
    ) external {
        require(ownerOf(_wNftId) == msg.sender, "You are not the owner");
        require(additionalData[_wNftId].price > 0, "Price not available");
        require(
            additionalData[_wNftId].activeRequest == address(0),
            "Wait for current request in order to enable sale"
        );
        require(
            additionalData[_wNftId].openToBuyer != _status,
            "Status didn't change"
        );
        additionalData[_wNftId].openToBuyer = _status;

        // TODO _status ? emit NftNowActiveForSale(wrappedNftId, _NftId) ?  emit NftNowInactiveForSale(wrappedNftId, _NftId) ;
    }

    function getPrice(uint256 _wNftId) external view returns (uint256 _price) {
        _price = additionalData[_wNftId].price;
    }

    // TODO nonReentrant
    function buy(uint256 _wNftId) external {
        require(additionalData[_wNftId].openToBuyer, "Not open for sale yet");

        address _nftOwner = ownerOf(_wNftId);

        IERC20(mockUSDC).transferFrom(
            msg.sender,
            _nftOwner,
            additionalData[_wNftId].price
        );

        _burn(_wNftId);
        delete additionalData[_wNftId];

        IERC721(additionalData[_wNftId].originNFT).transferFrom(
            address(this),
            msg.sender,
            additionalData[_wNftId].originId
        );

        // TODO emit NftBought(
        //     wrappedNftId,
        //     msg.sender,
        //     nftId,
        //     feedbacks[wrappedNftId].price
        // );
    }

    // TODO 2-step confirmation
    // when someone wants to buy, the USDC has to be deposited
    // and the owner has to accept the payment in order to sell the NFT

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}

//Error: Couldn't find forge binary. Performed lookup: ["forge","C:\\Users\\NWAJAGU\\.cargo\\bin\\forge","C:\\Users\\NWAJAGU\\.foundry\\bin\\forge"]
