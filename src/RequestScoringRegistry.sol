// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IRequestScoringRegistry} from "./interfaces/IRequestScoringRegistry.sol";

contract RequestScoringRegistry is IRequestScoringRegistry, Ownable {
    // bytes16 positions
    // 0x000000000000000000000000000000FF .score
    // 0x0000000000000000000000000000FF00 .final_decision
    // 0x00000000000000000000000000FF0000 .heatmap.clarity
    // 0x000000000000000000000000FF000000 .heatmap.logical_consistency
    // 0x0000000000000000000000FF00000000 .heatmap.completeness
    // 0x00000000000000000000FF0000000000 .heatmap.source_trust
    // 0x000000000000000000FF000000000000 .heatmap.ambiguity
    // 0x0000000000000000FF00000000000000 .heatmap.time_reference
    // 0x00000000000000FF0000000000000000 .ratings.clarity
    // 0x000000000000FF000000000000000000 .ratings.logical_consistency
    // 0x0000000000FF00000000000000000000 .ratings.completeness
    // 0x00000000FF0000000000000000000000 .ratings.source_trust
    // 0x000000FF000000000000000000000000 .ratings.ambiguity
    // 0x0000FF00000000000000000000000000 .ratings.time_reference

    mapping(address => bytes16) _registry;

    constructor() Ownable(msg.sender) {}

    function batch(
        address[] calldata _address,
        bytes16[] calldata _scoring
    ) external onlyOwner {
        for (uint256 i = 0; i < _address.length; ) {
            _registry[_address[i]] = _scoring[i];
            emit AddedScoring(_address[i], _scoring[i]);
            unchecked {
                i++;
            }
        }
    }

    function getScoring(
        address _address
    ) external view returns (RequestScoring memory _scoring) {
        bytes16 $s = _registry[_address];
        _scoring.score = uint8(uint128(($s << 120) >> 120));
        _scoring.final_decision = uint8(uint128(($s << 112) >> 120));
        _scoring.heatmap.clarity = uint8(uint128(($s << 104) >> 120));
        _scoring.heatmap.logical_consistency = uint8(uint128(($s << 96) >> 120));
        _scoring.heatmap.completeness = uint8(uint128(($s << 88) >> 120));
        _scoring.heatmap.source_trust = uint8(uint128(($s << 80) >> 120));
        _scoring.heatmap.ambiguity = uint8(uint128(($s << 72) >> 120));
        _scoring.heatmap.time_reference = uint8(uint128(($s << 64) >> 120));
        _scoring.ratings.clarity = uint8(uint128(($s << 56) >> 120));
        _scoring.ratings.logical_consistency = uint8(uint128(($s << 48) >> 120));
        _scoring.ratings.completeness = uint8(uint128(($s << 40) >> 120));
        _scoring.ratings.source_trust = uint8(uint128(($s << 32) >> 120));
        _scoring.ratings.ambiguity = uint8(uint128(($s << 24) >> 120));
        _scoring.ratings.time_reference = uint8(uint128(($s << 16) >> 120));
    }
}
