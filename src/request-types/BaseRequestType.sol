// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {IRequestType} from "./../interfaces/request-types/IRequestType.sol";
import {ERC165, IERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

abstract contract BaseRequestType is IRequestType, ERC165 {
    function ID() external view virtual override returns (bytes32);

    function isValid(
        bytes memory dataToValidate
    ) external view virtual override returns (bool _is) {}

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IRequestType).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
