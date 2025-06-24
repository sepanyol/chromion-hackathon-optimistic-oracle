// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

interface IRequestScoringRegistry {
    event AddedScoring(address indexed request, bytes16 scoring);

    struct RequestScoringHeatmap {
        uint8 clarity;
        uint8 logical_consistency;
        uint8 completeness;
        uint8 source_trust;
        uint8 ambiguity;
        uint8 time_reference;
    }

    struct RequestScoringRatings {
        uint8 clarity;
        uint8 logical_consistency;
        uint8 completeness;
        uint8 source_trust;
        uint8 ambiguity;
        uint8 time_reference;
    }

    struct RequestScoring {
        uint8 score;
        RequestScoringHeatmap heatmap;
        RequestScoringRatings ratings;
        uint8 final_decision;
    }

    function batch(
        address[] calldata _address,
        bytes16[] calldata _scoring
    ) external;

    function getScoring(
        address _address
    ) external view returns (RequestScoring memory _scoring);
}
