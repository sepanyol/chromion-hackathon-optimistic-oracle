// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "forge-std/Test.sol";
import "forge-std/StdCheats.sol";

import {IRequestFactory} from "./../src/interfaces/IRequestFactory.sol";
import {IBaseRequestContract} from "./../src/interfaces/IBaseRequestContract.sol";
import {WrappedNft} from "./../src/WrappedNft.sol";

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {RequestTypes} from "./../src/types/RequestTypes.sol";
import {MockUSDC} from "./../src/mocks/MockUSDC.sol";

contract MyERC721 is ERC721 {
    constructor() ERC721("Original NFT", "ONFT") {}

    function mint(address _to, uint256 _id) public {
        _mint(_to, _id);
    }
}

contract WrappedNftTest is Test {
    address _originNftOwner = address(0xb00b);
    address _factory = address(0x2345);
    address _request = address(0x9876);
    address notOwner = address(0x3445);
    address _buyer = address(0xdead);
    uint256 _expectedPrice = 1000e18;

    WrappedNft _nft;
    MyERC721 _originalNFT;
    MockUSDC mockUSDC;

    function setUp() public {
        mockUSDC = new MockUSDC();
        mockUSDC.mint(_buyer, _expectedPrice * 2);

        _nft = new WrappedNft(_factory);
        _nft.initialize(address(mockUSDC));

        _originalNFT = new MyERC721();
        _originalNFT.mint(_originNftOwner, 1);

        vm.mockCall(
            _factory,
            abi.encodeWithSelector(IRequestFactory.createRequest.selector),
            abi.encode(_request)
        );

        vm.mockCall(
            _factory,
            abi.encodeWithSelector(IRequestFactory.isOracleChain.selector),
            abi.encode(true)
        );

        vm.mockCall(
            _request,
            abi.encodeWithSelector(IBaseRequestContract.status.selector),
            abi.encode(true)
        );

        vm.mockCall(
            _request,
            abi.encodeWithSelector(IBaseRequestContract.answer.selector),
            abi.encode(true)
        );

        vm.mockCall(
            _request,
            abi.encodeWithSelector(IBaseRequestContract.status.selector),
            abi.encode(RequestTypes.RequestStatus.Resolved)
        );

        vm.mockCall(
            _request,
            abi.encodeWithSelector(IBaseRequestContract.answer.selector),
            abi.encode(abi.encode(_expectedPrice))
        );
    }

    function test_deposit_successful() public {
        vm.startPrank(_originNftOwner);

        _originalNFT.approve(address(_nft), 1);

        vm.expectEmit(true, true, false, false);
        emit WrappedNft.DepositedNft(
            _originNftOwner,
            address(_originalNFT),
            1,
            1
        );
        _nft.deposit(1, address(_originalNFT));

        vm.stopPrank();

        assertTrue(_originalNFT.ownerOf(1) == address(_nft));
        assertTrue(_nft.ownerOf(1) == address(_originNftOwner));
    }

    function test_deposit_RevertIf_OriginNftIsZero() public {
        vm.expectRevert("Nft contract Address can't be a zero Address");
        _nft.deposit(1, address(0));
    }

    function test_deposit_RevertIf_InvalidId() public {
        vm.expectRevert("Invalid token ID");
        _nft.deposit(0, address(0x1234));
    }

    function test_withdraw_successful() public {
        vm.startPrank(_originNftOwner);

        _originalNFT.approve(address(_nft), 1);
        uint256 _newNftId = _nft.deposit(1, address(_originalNFT));

        vm.expectEmit(true, true, false, false);
        emit WrappedNft.WithdrawnNft(
            _originNftOwner,
            address(_originalNFT),
            _newNftId,
            1
        );

        _nft.withdraw(_newNftId);
        vm.stopPrank();

        // _originalNFT.ownerOf(1)
        // assert(_originalNFT.ownerOf(1) == address(_nft));
        // assertTrue(_nft.ownerOf(1) == address(_originNftOwner));
    }

    function test_Withdraw_NotOwner() public {
        vm.startPrank(_originNftOwner);
        _originalNFT.approve(address(_nft), 1);
        uint256 _newNftId = _nft.deposit(1, address(_originalNFT));
        vm.stopPrank();

        vm.startPrank(notOwner);
        vm.expectRevert("You are not the owner");
        _nft.withdraw(_newNftId);
        vm.stopPrank();
    }

    function test_Withdraw_IfRequestIsActive() public {
        vm.startPrank(_originNftOwner);
        _originalNFT.approve(address(_nft), 1);
        uint256 _newNftId = _nft.deposit(1, address(_originalNFT));

        vm.warp(block.timestamp + 86400 * 7 + 1);
        _nft.evaluate(_newNftId, "Test evaluation context");

        (, , , , address activeRequest, ) = _nft.additionalData(_newNftId);
        assertTrue(activeRequest != address(0));

        vm.expectRevert("should have no active request");
        _nft.withdraw(_newNftId);

        vm.stopPrank();
    }

    function test_withdraw_BurnNftSuccessful() public {
        vm.startPrank(_originNftOwner);
        _originalNFT.approve(address(_nft), 1);
        uint256 _newNftId = _nft.deposit(1, address(_originalNFT));

        (, , , , address activeRequest, ) = _nft.additionalData(_newNftId);
        assertEq(activeRequest, address(0));

        _nft.withdraw(_newNftId);
        assertEq(_nft.balanceOf(_originNftOwner), 0);

        vm.stopPrank();
    }

    function test_evaluate() public {
        vm.startPrank(_originNftOwner);
        _originalNFT.approve(address(_nft), 1);
        uint256 _newNftId = _nft.deposit(1, address(_originalNFT));

        vm.warp(block.timestamp + 86400 * 7 + 1);
        _nft.evaluate(_newNftId, "Test evaluation context");
        (, , , , address activeRequest, bool openToBuyer) = _nft.additionalData(
            _newNftId
        );
        assertNotEq(activeRequest, address(0));
        assertEq(openToBuyer, false);
        vm.stopPrank();
    }

    function test_evaluate_Failed() public {
        vm.startPrank(_originNftOwner);
        _originalNFT.approve(address(_nft), 1);
        uint256 _newNftId = _nft.deposit(1, address(_originalNFT));
        vm.expectRevert("Cooldown still active");
        _nft.evaluate(_newNftId, "Test evaluation context");
        vm.stopPrank();
    }

    function test_acceptProposedEvaluation_pass() public {
        vm.startPrank(_originNftOwner);
        _originalNFT.approve(address(_nft), 1);
        uint256 _newNftId = _nft.deposit(1, address(_originalNFT));

        vm.warp(block.timestamp + 86400 * 7 + 1);
        _nft.evaluate(_newNftId, "Test evaluation context");

        _nft.acceptProposedEvaluation(_newNftId);
        (
            ,
            uint256 price,
            uint256 lastEvaluationTime,
            ,
            address activeRequest,

        ) = _nft.additionalData(_newNftId);
        assertEq(activeRequest, address(0));
        assertEq(price, _expectedPrice, "Price should be updated");
        assertEq(
            lastEvaluationTime,
            block.timestamp,
            "Last evaluation time should be current timestamp"
        );

        vm.stopPrank();
    }

    function test_acceptProposedEvaluation_RequestNotExist() public {
        vm.startPrank(_originNftOwner);
        _originalNFT.approve(address(_nft), 1);
        uint256 _newNftId = _nft.deposit(1, address(_originalNFT));

        vm.expectRevert("No request existing");
        _nft.acceptProposedEvaluation(_newNftId);
    }

    function test_acceptProposedEvaluation_RevertWhen_RequestNotResolved()
        public
    {
        vm.startPrank(_originNftOwner);
        _originalNFT.approve(address(_nft), 1);
        uint256 _newNftId = _nft.deposit(1, address(_originalNFT));

        vm.warp(block.timestamp + 86400 * 7 + 1);
        _nft.evaluate(_newNftId, "Test evaluation context");

        vm.mockCall(
            _request,
            abi.encodeWithSelector(IBaseRequestContract.status.selector),
            abi.encode(RequestTypes.RequestStatus.Pending)
        );

        vm.expectRevert("Request is not resolved yet");
        _nft.acceptProposedEvaluation(_newNftId);

        vm.stopPrank();
    }

    function test_updateOpenToBuyerSaleStatus_success() public {
        vm.startPrank(_originNftOwner);
        _originalNFT.approve(address(_nft), 1);
        uint256 _newNftId = _nft.deposit(1, address(_originalNFT));

        vm.warp(block.timestamp + 86400 * 7 + 1);
        _nft.evaluate(_newNftId, "Test evaluation context");

        _nft.acceptProposedEvaluation(_newNftId);
        _nft.updateOpenToBuyerSaleStatus(_newNftId, true);
        (, uint256 price, , , address activeRequest, bool openToBuyer) = _nft
            .additionalData(_newNftId);
        assertEq(price, _expectedPrice);
        assertEq(activeRequest, address(0));
        assertEq(openToBuyer, true);
    }

    function test_updateOpenToBuyerSaleStatus_RevertPriceNotAvailable() public {
        vm.startPrank(_originNftOwner);
        _originalNFT.approve(address(_nft), 1);
        uint256 _newNftId = _nft.deposit(1, address(_originalNFT));

        vm.expectRevert("Price not available");
        _nft.updateOpenToBuyerSaleStatus(_newNftId, true);
        //(, uint256 price,,, address activeRequest, bool openToBuyer) = _nft.additionalData(_newNftId);
        vm.stopPrank();
    }

    function test_updateOpenToBuyerSaleStatus_RevertWaitForCurrentRequestToEnableSale()
        public
    {
        vm.startPrank(_originNftOwner);
        _originalNFT.approve(address(_nft), 1);
        uint256 _newNftId = _nft.deposit(1, address(_originalNFT));

        // First complete the evaluation process to set the price
        vm.warp(block.timestamp + 86400 * 7 + 1);
        _nft.evaluate(_newNftId, "Test evaluation context");
        _nft.acceptProposedEvaluation(_newNftId);

        // Now start a new evaluation request to create an active request
        vm.warp(block.timestamp + 86400 * 7 + 1);
        _nft.evaluate(_newNftId, "Second evaluation context");

        // Verify active request is set and price exists
        (, uint256 price, , , address activeRequest, ) = _nft.additionalData(
            _newNftId
        );
        assertNotEq(activeRequest, address(0), "Active request should be set");
        assertEq(
            price,
            _expectedPrice,
            "Price should be set from previous evaluation"
        );

        // This should revert because there's an active request
        vm.expectRevert("Wait for current request in order to enable sale");
        _nft.updateOpenToBuyerSaleStatus(_newNftId, true);

        vm.stopPrank();
    }

    function test_updateOpenToBuyerSaleStatus_RevertWhen_StatusDidntChange()
        public
    {
        vm.startPrank(_originNftOwner);
        _originalNFT.approve(address(_nft), 1);
        uint256 _newNftId = _nft.deposit(1, address(_originalNFT));

        // Complete evaluation process to set price and clear active request
        vm.warp(block.timestamp + 86400 * 7 + 1);
        _nft.evaluate(_newNftId, "Test evaluation context");
        _nft.acceptProposedEvaluation(_newNftId);

        // First, successfully set status to true
        _nft.updateOpenToBuyerSaleStatus(_newNftId, true);

        // Verify status is now true
        (, , , , address activeRequest, bool openToBuyer) = _nft.additionalData(
            _newNftId
        );
        assertEq(activeRequest, address(0), "Should have no active request");
        assertEq(openToBuyer, true, "Status should be true");

        // Now try to set it to true again - this should revert
        vm.expectRevert("Status didn't change");
        _nft.updateOpenToBuyerSaleStatus(_newNftId, true);

        vm.stopPrank();
    }

    function test_updateOpenToBuyerSaleStatus_RevertWhen_StatusDidntChange_False()
        public
    {
        vm.startPrank(_originNftOwner);
        _originalNFT.approve(address(_nft), 1);
        uint256 _newNftId = _nft.deposit(1, address(_originalNFT));

        // Complete evaluation process to set price and clear active request
        vm.warp(block.timestamp + 86400 * 7 + 1);
        _nft.evaluate(_newNftId, "Test evaluation context");
        _nft.acceptProposedEvaluation(_newNftId);

        // Verify initial status is false (default)
        (, , , , address activeRequest, bool openToBuyer) = _nft.additionalData(
            _newNftId
        );
        assertEq(activeRequest, address(0), "Should have no active request");
        assertEq(openToBuyer, false, "Initial status should be false");

        // Try to set it to false again - this should revert
        vm.expectRevert("Status didn't change");
        _nft.updateOpenToBuyerSaleStatus(_newNftId, false);

        vm.stopPrank();
    }

    function test_getPrice() public {
        vm.startPrank(_originNftOwner);
        _originalNFT.approve(address(_nft), 1);
        uint256 _newNftId = _nft.deposit(1, address(_originalNFT));

        vm.warp(block.timestamp + 86400 * 7 + 1);
        _nft.evaluate(_newNftId, "Test evaluation context");
        _nft.acceptProposedEvaluation(_newNftId);

        (, uint256 price, , , address activeRequest, ) = _nft.additionalData(
            _newNftId
        );
        _nft.getPrice(_newNftId);
        assertEq(price, _expectedPrice);
        vm.stopPrank();
    }

    function test_getRequestInfo() public {
        vm.startPrank(_originNftOwner);
        _originalNFT.approve(address(_nft), 1);
        uint256 _newNftId = _nft.deposit(1, address(_originalNFT));

        vm.warp(block.timestamp + 86400 * 7 + 1);
        _nft.evaluate(_newNftId, "Test evaluation context");
        (, , , , address activeRequest, ) = _nft.additionalData(_newNftId);

        WrappedNft.RequestInfo memory requestInfo = _nft.getRequestInfo(
            _newNftId
        );

        assertEq(requestInfo.request, activeRequest);
        assertTrue(requestInfo.isResolved);
    }

    function test_getRequestInfo_Fails() public {
        vm.startPrank(_originNftOwner);
        _originalNFT.approve(address(_nft), 1);
        uint256 _newNftId = _nft.deposit(1, address(_originalNFT));

        vm.warp(block.timestamp + 86400 * 7 + 1);
        _nft.evaluate(_newNftId, "Test evaluation context");

        _nft.acceptProposedEvaluation(_newNftId);
        vm.expectRevert();
        _nft.getRequestInfo(_newNftId);
        vm.stopPrank();
    }

    function test_buy_successful() public {
        uint256 _newNftId = _setupNftForSale();

        // Record initial balances
        uint256 initialBuyerBalance = mockUSDC.balanceOf(_buyer);
        uint256 initialOwnerBalance = mockUSDC.balanceOf(_originNftOwner);

        vm.startPrank(_buyer);
        mockUSDC.approve(address(_nft), _expectedPrice);

        // Verify NFT is open for sale
        (, , , , address activeRequest, bool openToBuyer) = _nft.additionalData(
            _newNftId
        );
        assertTrue(openToBuyer, "NFT should be open for sale");
        assertEq(activeRequest, address(0), "Should have no active request");

        _nft.buy(_newNftId);

        vm.stopPrank();

        // Verify payment was transferred
        assertEq(
            mockUSDC.balanceOf(_buyer),
            initialBuyerBalance - _expectedPrice,
            "Buyer balance should decrease"
        );
        assertEq(
            mockUSDC.balanceOf(_originNftOwner),
            initialOwnerBalance + _expectedPrice,
            "Owner balance should increase"
        );

        // Verify wrapped NFT was burned
        vm.expectRevert(); // Should revert because NFT was burned
        _nft.ownerOf(_newNftId);

        // Verify original NFT was transferred to buyer
        assertEq(
            _originalNFT.ownerOf(1),
            _buyer,
            "Original NFT should be transferred to buyer"
        );
    }

    function _setupNftForSale() internal returns (uint256 _newNftId) {
        vm.startPrank(_originNftOwner);
        _originalNFT.approve(address(_nft), 1);
        _newNftId = _nft.deposit(1, address(_originalNFT));
        vm.warp(block.timestamp + 86400 * 7 + 1);
        _nft.evaluate(_newNftId, "Test evaluation context");
        _nft.acceptProposedEvaluation(_newNftId);
        _nft.updateOpenToBuyerSaleStatus(_newNftId, true);
        vm.stopPrank();
    }

    function test_buy_revert_not_open_for_sale() public {
        uint256 _newNftId = _setupNftForSale();

        // Set openToBuyer to false
        vm.prank(_originNftOwner);
        _nft.updateOpenToBuyerSaleStatus(_newNftId, false);

        vm.startPrank(_buyer);
        mockUSDC.approve(address(_nft), _expectedPrice);
        vm.expectRevert("Not open for sale yet");
        _nft.buy(_newNftId);
        vm.stopPrank();
    }

    function test_buy_revert_non_existent_nft() public {
        vm.startPrank(_buyer);
        mockUSDC.approve(address(_nft), _expectedPrice);
        vm.expectRevert();
        _nft.buy(999); // Non-existent NFT ID
        vm.stopPrank();
    }
}
