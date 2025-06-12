// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

/// @title RequestTypes
/// @notice Contains enums and structs used throughout the cross-chain request system.
library RequestTypes {
    /// @notice Represents the lifecycle status of a request.
    enum RequestStatus {
        /// @dev Request has been created but not yet opened for answering.
        Pending,
        /// @dev Request is open and accepting answer proposals.
        Open,
        /// @dev An answer has been proposed for the request.
        Proposed,
        /// @dev The proposed answer has been challenged.
        Challenged,
        /// @dev The request has been resolved successfully.
        Resolved,
        /// @dev The request has failed or could not be resolved.
        Failed
    }

    /// @notice Describes the type of answer expected for a request.
    enum AnswerType {
        /// @dev Boolean true/false response expected.
        Bool,
        /// @dev Arbitrary value (e.g. numeric or textual) expected.
        Value
    }

    /// @title RequestParams
    /// @notice Encapsulates all parameters needed to initialize a request.
    struct RequestParams {
        /// @notice Address of the original requester, ABI encoded.
        bytes requester;
        /// @notice Origin address of the equivalent request on another chain.
        bytes originAddress;
        /// @notice Chain ID where the request was originally created.
        bytes originChainId;
        /// @notice Specifies the type of answer required (Bool or Value).
        AnswerType answerType;
        /// @notice Duration (in seconds) during which the request can be challenged.
        uint40 challengeWindow;
        /// @notice Reward amount offered for resolving the request.
        uint96 rewardAmount;
        /// @notice The actual question being asked.
        string question;
        /// @notice Additional context to provide clarity around the question.
        string context;
        /// @notice Defines what constitutes a "true" answer.
        string truthMeaning;
        /// @notice Indicates if the request is to be propagated cross-chain.
        bool isCrossChain;
    }
}
