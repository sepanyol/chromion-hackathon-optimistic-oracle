// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./interfaces/IBaseRequestContract.sol";
import "./types/RequestTypes.sol";

/// @title BaseRequestContract
/// @notice Core contract logic shared between Oracle and Requester Chains
/// @dev Enforces chain-specific execution through `isOracleChain` flag
abstract contract BaseRequestContract is IBaseRequestContract, Initializable {
    address public immutable factory;
    address public immutable paymentAsset;
    address public immutable trustee;
    bool public immutable isOracleChain; // wheter to decide if there needs to be an origin chain call

    bytes public requester;
    RequestTypes.AnswerType public answerType;
    uint40 public createdAt;
    uint40 public challengeWindow;
    RequestTypes.RequestStatus public status;

    bytes public originAddress;
    bytes public originChainId;

    string public question;
    string public context;
    string public truthMeaning;
    bytes public answer;

    uint96 public rewardAmount;

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }

    modifier onlyTrustee() {
        require(msg.sender == trustee, "Not authorized");
        _;
    }

    constructor(
        address _factory,
        address _paymentAsset,
        address _trustee,
        bool _isOracleChain
    ) {
        require(_factory != address(0), "Invalid factory");
        factory = _factory;
        paymentAsset = _paymentAsset;
        trustee = _trustee;
        isOracleChain = _isOracleChain;

        _disableInitializers();
    }

    function initialize(
        RequestTypes.RequestParams memory p
    ) external initializer onlyFactory {
        requester = p.requester;
        createdAt = uint40(block.timestamp);
        status = RequestTypes.RequestStatus.Pending;

        if (isOracleChain && p.isCrossChain) {
            originAddress = p.originAddress;
            originChainId = p.originChainId;
        }

        question = p.question;
        context = p.context;
        truthMeaning = p.truthMeaning;
        answerType = p.answerType;
        challengeWindow = p.challengeWindow;
        rewardAmount = p.rewardAmount;
    }

    function updateStatus(
        RequestTypes.RequestStatus _newStatus
    ) external onlyTrustee {
        _updateStatus(_newStatus);
    }

    function _updateStatus(RequestTypes.RequestStatus _newStatus) internal {
        status = _newStatus;
        emit RequestStatusUpdated(_newStatus);
    }

    /// @notice Called by OracleCoordinator when a valid answer is proposed
    /// @param _answer The proposed answer bytes (format depends on request type)
    function updateAnswer(bytes calldata _answer) external onlyTrustee {
        require(answer.length == 0, "Answer already set");
        answer = _answer;
        emit RequestAnswerUpdated(_answer);
        _updateStatus(RequestTypes.RequestStatus.Resolved);
    }

    function getFullPrompt() external view returns (string memory _answer) {
        return
            string(
                abi.encodePacked(
                    question,
                    " | ",
                    context,
                    " | ",
                    truthMeaning,
                    answer.length > 0
                        ? string(abi.encodePacked(" | ", answer))
                        : ""
                )
            );
    }
}
