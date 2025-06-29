// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {ERC721Upgradeable, IERC721} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

import {IRequestFactory, RequestTypes} from "./interfaces/IRequestFactory.sol";
import {IBaseRequestContract} from "./interfaces/IBaseRequestContract.sol";

contract WrappedNft is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    uint96 public constant REWARD = 10e6;
    uint256 public constant EVALUATION_REQUEST_COOLDOWN = 86400 * 7;
    address public immutable requestFactory;
    IERC20 public usdc;

    error NoActiveRequest();

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
    event NftBought(
        address indexed buyer,
        uint256 wrappedNftId,
        uint256 nftId,
        uint256 price
    );

    event ProposedEvaluationAccepted(
        address indexed request,
        uint256 nftid,
        address indexed caller,
        uint256 price
    );
    event EvaluatioNRequest(
        address indexed requestAddress,
        string _context,
        uint256 _wNftId
    );
    event NftNowActiveForSale(uint256 wrappedNftId);
    event NftNowInactiveForSale(uint256 wrappedNftId);

    struct AdditionalData {
        uint256 originId;
        uint256 price;
        uint256 lastEvaluationTime;
        address originNFT;
        address activeRequest; // set to address(0) when request resolves
        bool openToBuyer;
        address[] requests;
    }

    struct RequestInfo {
        bool isResolved;
        address request;
    }

    uint256 private wNftId;

    mapping(uint256 => AdditionalData) public additionalData;

    constructor(address _requestFactory) {
        requestFactory = _requestFactory;
        _disableInitializers();
    }

    function initialize(address _usdc) public initializer {
        __ERC721_init("Wrapped NFT", "WNFT");
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        usdc = IERC20(_usdc);
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

        // transfer reward to wrapped nft contract in order to send to factory
        require(usdc.transferFrom(msg.sender, address(this), REWARD));
        require(usdc.approve(requestFactory, REWARD));

        address requestAddress = IRequestFactory(requestFactory).createRequest(
            RequestTypes.RequestParams({
                requester: abi.encode(msg.sender),
                originAddress: abi.encode(""),
                originChainId: abi.encode(""),
                answerType: RequestTypes.AnswerType.Value,
                challengeWindow: 86400,
                rewardAmount: REWARD,
                question: string.concat(
                    "What the value of the NFT (",
                    Strings.toHexString(address(this)),
                    ") with ID ",
                    Strings.toString(_wNftId)
                ),
                context: _context,
                truthMeaning: "",
                isCrossChain: !IRequestFactory(requestFactory).isOracleChain()
            })
        );

        additionalData[_wNftId].activeRequest = requestAddress;
        additionalData[_wNftId].requests.push(requestAddress);

        emit EvaluatioNRequest(requestAddress, _context, _wNftId);
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
        address _requestId = additionalData[_wNftId].activeRequest;
        additionalData[_wNftId].activeRequest = address(0);

        emit ProposedEvaluationAccepted(
            _requestId,
            _wNftId,
            msg.sender,
            additionalData[_wNftId].price
        );
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

        if (_status) {
            emit NftNowActiveForSale(_wNftId);
        } else {
            emit NftNowInactiveForSale(_wNftId);
        }
    }

    function getPrice(uint256 _wNftId) external view returns (uint256 _price) {
        _price = additionalData[_wNftId].price;
    }

    // TODO function to check whether the issued request on the oracle is resolved or not
    function getRequestInfo(
        uint256 _wNftId
    ) external view returns (RequestInfo memory _requestInfo) {
        address _request = additionalData[_wNftId].activeRequest;

        if (_request != address(0)) {
            _requestInfo.request = _request;
            _requestInfo.isResolved =
                IBaseRequestContract(_request).status() ==
                RequestTypes.RequestStatus.Resolved;
        } else {
            revert NoActiveRequest();
        }

        return _requestInfo;
    }

    // TODO nonReentrant
    function buy(uint256 _wNftId) external {
        require(additionalData[_wNftId].openToBuyer, "Not open for sale yet");

        address _nftOwner = ownerOf(_wNftId);

        // Store the data we need BEFORE deleting
        address originNFT = additionalData[_wNftId].originNFT;
        uint256 originId = additionalData[_wNftId].originId;
        uint256 price = additionalData[_wNftId].price;

        // Transfer payment
        usdc.transferFrom(msg.sender, _nftOwner, price);

        // Burn the wrapped NFT and clean up data
        _burn(_wNftId);
        delete additionalData[_wNftId];

        IERC721(originNFT).transferFrom(address(this), msg.sender, originId);

        emit NftBought(msg.sender, _wNftId, originId, price);
    }

    // Fixed buy function - the critical bug is that you delete additionalData
    // before using it to transfer the original NFT

    // TODO 2-step confirmation
    // when someone wants to buy, the USDC has to be deposited
    // and the owner has to accept the payment in order to sell the NFT
    //function acceptPayment(){};

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
