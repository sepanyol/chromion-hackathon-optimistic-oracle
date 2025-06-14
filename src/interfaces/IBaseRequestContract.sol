// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {RequestTypes} from "../types/RequestTypes.sol";

/// @title IBaseRequestContract
/// @notice Interface for interacting with request contracts across chains
/// @dev Used by the OracleCoordinator, Relayer, and other system modules
interface IBaseRequestContract {
    /// @notice Emitted when the request is initialized
    /// @param requester The user who created the request
    event RequestInitialized(address indexed requester);

    /// @notice Emitted when the request is initialized from another chain
    /// @param requester The user who created the request
    event RequestInitialized(bytes requester);

    /// @notice Emitted when the request is forwarded to the Oracle Chain
    /// @param relayer The address of the relayer contract
    event RequestForwarded(address indexed relayer);

    /// @notice Emitted when a status update is performed by the oracle coordinator or relayer
    /// @param newStatus The updated status of the request
    event RequestStatusUpdated(RequestTypes.RequestStatus newStatus);

    /// @notice Emitted when an answer update is performed by the oracle coordinator or relayer
    /// @param answer The updated answer of the request
    event RequestAnswerUpdated(bytes answer);

    /// @notice Initializes a request contract instance with provided parameters.
    /// @dev Can only be called once by the factory. Sets metadata and request configuration.
    /// @param p The request parameters to initialize the contract with.
    function initialize(RequestTypes.RequestParams memory p) external;

    /// @notice Returns the address of the user who created the request
    /// @return The requester address
    function requester() external view returns (bytes memory);

    /// @notice Returns the total reward amount allocated for this request
    /// @return The reward amount in USDC (6 decimals)
    function rewardAmount() external view returns (uint96);

    /// @notice Returns the challenge window set for this request
    /// @return Duration in seconds
    function challengeWindow() external view returns (uint40);

    /// @notice Returns the current status of the request
    /// @return The current request status
    function status() external view returns (RequestTypes.RequestStatus);

    /// @notice Returns the timestamp when the request was created
    /// @return The creation time as a UNIX timestamp
    function createdAt() external view returns (uint40);

    /// @notice Returns a flag to check whether this request is on oracle chain or not
    /// @return Flag
    function isOracleChain() external view returns (bool);

    /// @notice Returns the question that defines the request
    /// @return A natural-language question string
    function question() external view returns (string memory);

    /// @notice Returns the context that provides background for the question
    /// @return Additional explanation of the context
    function context() external view returns (string memory);

    /// @notice Returns the interpretation of "true" for the answer
    /// @return A natural-language explanation of what "true" means
    function truthMeaning() external view returns (string memory);

    /// @notice Returns the answer in bytes in order to process it
    /// @return The answer in bytes
    function answer() external view returns (bytes memory);

    /// @notice Original address of the request on the source chain.
    /// @return The origin address in bytes
    function originAddress() external view returns (bytes memory);

    /// @notice Chain ID of the origin chain.
    /// @return The origin Chain ID in bytes
    function originChainId() external view returns (bytes memory);

    /// @notice Updates the current status of the request.
    /// @dev Can only be called by the trustee (e.g., OracleCoordinator).
    /// @param _newStatus The new status to apply.
    function updateStatus(RequestTypes.RequestStatus _newStatus) external;

    /// @notice Called by OracleCoordinator when a valid answer is proposed.
    /// @param _answer The proposed answer bytes (format depends on request type).
    function updateAnswer(bytes calldata _answer) external;

    /// @notice Returns a concatenated string including question, context, truthMeaning, and optionally the answer.
    /// @return _answer A human-readable full prompt string for UI or off-chain processing.
    function getFullPrompt() external view returns (string memory);
}
