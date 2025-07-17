// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {BaseRequestType} from "./BaseRequestType.sol";

contract BooleanRequestType is BaseRequestType {
    bytes32 public override ID = keccak256("BOOLEAN_REQUEST_TYPE");

    function isValid(
        bytes memory dataToValidate
    ) external view virtual override(BaseRequestType) returns (bool _is) {
        abi.decode(dataToValidate, (bool));
        _is = true;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(BaseRequestType) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
