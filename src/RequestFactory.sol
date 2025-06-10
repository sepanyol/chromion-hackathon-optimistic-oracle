// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {RequestTypes} from "./types/RequestTypes.sol";
import {IOracleCoordinator} from "./interfaces/IOracleCoordinator.sol";
import {RequestContract} from "./RequestContract.sol";

contract RequestFactory {
    address public immutable implementation;
    address public immutable paymentAsset;
    address public immutable oracleCoordinator;
    address public immutable oracleRelayer;
    bool public immutable isOracleChain;

    event RequestCreated(
        address indexed requestContract,
        RequestTypes.RequestParams requestParams
    );

    constructor(
        address _paymentAsset,
        address _oracleCoordinator,
        address _oracleRelayer,
        bool _isOracleChain
    ) {
        require(_paymentAsset != address(0), "Invalid asset");
        require(_oracleCoordinator != address(0), "Invalid coordinator");
        require(_oracleRelayer != address(0), "Invalid relayer");

        paymentAsset = _paymentAsset;
        oracleCoordinator = _oracleCoordinator;
        oracleRelayer = _oracleRelayer;
        isOracleChain = _isOracleChain; // redundancy to save gas, can be also retreived from implementation

        implementation = address(
            new RequestContract(
                address(this),
                _paymentAsset,
                _oracleCoordinator,
                _oracleRelayer,
                _isOracleChain
            )
        );
    }

    function createRequest(
        RequestTypes.RequestParams memory p
    ) external returns (address clone) {
        uint256 _rewardAmount = p.rewardAmount;

        require(
            IERC20(paymentAsset).transferFrom(
                msg.sender,
                address(this),
                _rewardAmount
            ),
            "Funding failed"
        );

        clone = Clones.clone(implementation);

        RequestContract(clone).initialize(p);

        // register @ oracle if this factory is on oracle chain
        // and send funds from msg.sender to oracle
        if (isOracleChain) {
            IERC20(paymentAsset).approve(oracleCoordinator, _rewardAmount);
            IOracleCoordinator(oracleCoordinator).registerRequest(clone);
        } else {
            // if not on oracle chain, approve reward amount for relayer
            // and send a message to the oracle chain
            IERC20(paymentAsset).approve(oracleRelayer, _rewardAmount);
            p.originAddress = abi.encodePacked(clone);
            p.originChainId = abi.encodePacked(block.chainid);
            // TODO relayer call
            // IOracleRelayer(oracleRelayer).sendMessageWithToken();
        }

        emit RequestCreated(clone, p);
        return clone;
    }
}
