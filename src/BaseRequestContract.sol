// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./interfaces/IBaseRequestContract.sol";
import "./types/RequestTypes.sol";

/// @title BaseRequestContract
/// @notice Core contract logic shared between Oracle and Requester Chains.
/// @dev Enforces chain-specific execution through `isOracleChain` flag.
abstract contract BaseRequestContract is IBaseRequestContract, Initializable {
    /// @notice Address of the factory that deployed this contract.
    address public immutable factory;

    /// @notice ERC20 token used for reward payment.
    address public immutable paymentAsset;

    /// @notice The trustee address allowed to update the request.
    address public immutable trustee;

    /// @notice Indicates whether this contract is on the OracleChain.
    bool public immutable isOracleChain;

    /// @notice The original requester encoded in bytes.
    bytes public requester;

    /// @notice Type of answer expected.
    RequestTypes.AnswerType public answerType;

    /// @notice Timestamp when the request was created.
    uint40 public createdAt;

    /// @notice Duration in seconds during which the request can be challenged.
    uint40 public challengeWindow;

    /// @notice Current status of the request.
    RequestTypes.RequestStatus public status;

    /// @notice Original address of the request on the source chain.
    bytes public originAddress;

    /// @notice Chain ID of the origin chain.
    bytes public originChainId;

    /// @notice The question being asked.
    string public question;

    /// @notice Contextual information related to the question.
    string public context;

    /// @notice Definition or explanation of what constitutes a true answer.
    string public truthMeaning;

    /// @notice Final answer returned by the oracle process.
    bytes public answer;

    /// @notice Reward amount offered for answering the request.
    uint96 public rewardAmount;

    /// @notice Modifier to restrict access to the factory.
    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }

    /// @notice Modifier to restrict access to the trustee.
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

    /// @inheritdoc IBaseRequestContract
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

    /// @inheritdoc IBaseRequestContract
    function updateStatus(
        RequestTypes.RequestStatus _newStatus
    ) external onlyTrustee {
        _updateStatus(_newStatus);
    }

    function _updateStatus(RequestTypes.RequestStatus _newStatus) internal {
        status = _newStatus;
        emit RequestStatusUpdated(_newStatus);
    }

    /// @inheritdoc IBaseRequestContract
    function updateAnswer(bytes calldata _answer) external onlyTrustee {
        require(answer.length == 0, "Answer already set");
        answer = _answer;
        emit RequestAnswerUpdated(_answer);
        _updateStatus(RequestTypes.RequestStatus.Resolved);
    }

    /// @inheritdoc IBaseRequestContract
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
