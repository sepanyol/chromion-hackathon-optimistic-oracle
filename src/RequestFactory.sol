// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {RequestTypes} from "./types/RequestTypes.sol";
import {IRequestFactory} from "./interfaces/IRequestFactory.sol";
import {IOracleCoordinator} from "./interfaces/IOracleCoordinator.sol";
import {IOracleRelayer} from "./interfaces/IOracleRelayer.sol";
import {RequestContract} from "./RequestContract.sol";

/// @title RequestFactory
/// @notice Factory contract to deploy request contracts on either the OracleChain or the RequesterChain.
/// @dev Uses OpenZeppelin Clones to deploy lightweight proxies.
contract RequestFactory is IRequestFactory {
    /// @inheritdoc IRequestFactory
    address public immutable implementation;

    /// @inheritdoc IRequestFactory
    address public immutable paymentAsset;

    /// @inheritdoc IRequestFactory
    address public immutable oracleOrRelayer;

    /// @inheritdoc IRequestFactory
    address public immutable homeFactory;

    /// @inheritdoc IRequestFactory
    uint256 public immutable homeChainId;

    /// @inheritdoc IRequestFactory
    bool public immutable isOracleChain;

    /// @notice Emitted when a request contract is created.
    /// @param requestContract The deployed request contract address.
    /// @param requestParams The parameters used for request initialization.
    event RequestCreated(
        address indexed requestContract,
        RequestTypes.RequestParams requestParams
    );

    constructor(
        address _paymentAsset,
        address _oracleOrRelayer,
        address _homeFactory,
        uint256 _homeChainId,
        bool _isOracleChain
    ) {
        if (_paymentAsset == address(0)) revert("Invalid asset");
        if (_oracleOrRelayer == address(0)) revert("Invalid instance");
        if (_homeFactory == address(0) && !_isOracleChain)
            revert("Home factory address missing");
        if (_homeChainId == 0 && !_isOracleChain)
            revert("Home chain id is missing");

        paymentAsset = _paymentAsset;
        oracleOrRelayer = _oracleOrRelayer;
        homeFactory = _homeFactory;
        homeChainId = _homeChainId;
        isOracleChain = _isOracleChain; // redundancy to save gas, can be also retreived from implementation

        implementation = address(
            new RequestContract(
                address(this),
                _paymentAsset,
                _oracleOrRelayer,
                _isOracleChain
            )
        );
    }

    /// @inheritdoc IRequestFactory
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

        IERC20(paymentAsset).approve(oracleOrRelayer, _rewardAmount);

        // register @ oracle if this factory is on oracle chain
        // and send funds from msg.sender to oracle
        if (isOracleChain) {
            IOracleCoordinator(oracleOrRelayer).registerRequest(clone);
        } else {
            // if not on oracle chain, approve reward amount for relayer
            // and send a message to the oracle chain
            p.isCrossChain = true;
            p.originAddress = abi.encode(clone);
            p.originChainId = abi.encode(block.chainid);
            IOracleRelayer(oracleOrRelayer).sendMessageWithToken(
                IOracleRelayer(oracleOrRelayer).chainIdToChainSelector(
                    homeChainId
                ),
                abi.encode(
                    abi.encode(homeFactory),
                    abi.encodeWithSelector(
                        IRequestFactory.createRequest.selector,
                        p
                    )
                ),
                paymentAsset,
                _rewardAmount,
                true,
                false
            );
        }

        emit RequestCreated(clone, p);
        return clone;
    }
}
