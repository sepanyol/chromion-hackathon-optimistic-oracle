// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {Test, console} from "forge-std/Test.sol";

import {RequestScoringRegistry, IRequestScoringRegistry} from "./../src/RequestScoringRegistry.sol";

contract RequestScoringRegistryTest is Test {
    IRequestScoringRegistry _registry;

    function setUp() public {
        _registry = new RequestScoringRegistry();
    }

    function test_batch_successful() public {
        address[] memory _fakeAddy = new address[](1);
        _fakeAddy[0] = address(0xb00b);
        bytes16[] memory _fakeScore = new bytes16[](1);
        _fakeScore[0] = bytes16(0x000000000000000000000000000000FF);
        vm.expectEmit(true, true, false, false);
        emit IRequestScoringRegistry.AddedScoring(_fakeAddy[0], _fakeScore[0]);
        _registry.batch(_fakeAddy, _fakeScore);
    }

    function test_getScoring_successful() public {
        address[] memory _fakeAddy = new address[](2);
        _fakeAddy[0] = address(0xb00b1);
        _fakeAddy[1] = address(0xb00b2);
        bytes16[] memory _fakeScore = new bytes16[](2);
        _fakeScore[0] = bytes16(0x0000000000000000000000000000005A);
        _fakeScore[1] = bytes16(0x0000111406041012392146154332035A);
        _registry.batch(_fakeAddy, _fakeScore);

        IRequestScoringRegistry.RequestScoring memory _scoring = _registry
            .getScoring(_fakeAddy[0]);
        assertEq(_scoring.score, uint8(90));
        assertEq(_scoring.final_decision, uint8(0));

        _scoring = _registry.getScoring(_fakeAddy[1]);
        assertEq(_scoring.score, uint8(90));
        assertEq(_scoring.final_decision, uint8(3));

        assertEq(_scoring.heatmap.clarity, uint8(50));
        assertEq(_scoring.heatmap.logical_consistency, uint8(67));
        assertEq(_scoring.heatmap.completeness, uint8(21));
        assertEq(_scoring.heatmap.source_trust, uint8(70));
        assertEq(_scoring.heatmap.ambiguity, uint8(33));
        assertEq(_scoring.heatmap.time_reference, uint8(57));

        assertEq(_scoring.ratings.clarity, uint8(18));
        assertEq(_scoring.ratings.logical_consistency, uint8(16));
        assertEq(_scoring.ratings.completeness, uint8(4));
        assertEq(_scoring.ratings.source_trust, uint8(6));
        assertEq(_scoring.ratings.ambiguity, uint8(20));
        assertEq(_scoring.ratings.time_reference, uint8(17));
    }
}
