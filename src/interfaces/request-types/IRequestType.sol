// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IRequestType is IERC165 {
    function ID() external view returns (bytes32);

    function isValid(
        bytes memory dataToValidate
    ) external view returns (bool _is);
}
