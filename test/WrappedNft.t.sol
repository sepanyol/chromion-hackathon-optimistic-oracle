// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "forge-std/Test.sol";
import "forge-std/StdCheats.sol";

import {IRequestFactory} from "./../src/interfaces/IRequestFactory.sol";
import {IBaseRequestContract} from "./../src/interfaces/IBaseRequestContract.sol";
import {WrappedNft} from "./../src/WrappedNft.sol";

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

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

    WrappedNft _nft;
    MyERC721 _originalNFT;

    function setUp() public {
        _nft = new WrappedNft(_factory);
        _nft.initialize();

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
}
