// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

library RequestTypes {
    enum RequestStatus {
        Pending,
        Open,
        Proposed,
        Challenged,
        Resolved,
        Failed
    }

    enum AnswerType {
        Bool,
        Value
    }

    struct RequestParams {
        bytes requester;
        bytes originAddress;
        bytes originChainId;
        AnswerType answerType;
        uint40 challengeWindow;
        uint96 rewardAmount;
        string question;
        string context;
        string truthMeaning;
        bool isCrossChain;
    }
}
