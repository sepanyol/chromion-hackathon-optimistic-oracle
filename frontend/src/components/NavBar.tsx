"use client";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  useAppKitAccount,
  useAppKitNetwork,
  useDisconnect,
} from "@reown/appkit/react";
import clsx from "clsx";
import { ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { Address } from "viem";
import { ButtonWalletConnect } from "./ButtonConnectWallet";
import { ShortAddress } from "./utilities/ShortAddress";

const NavBar: React.FC = () => {
  const pathname = usePathname();
  const { isConnected, address: walletAddress } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { caipNetwork } = useAppKitNetwork();

  const [showWalletDropdown, setShowWalletDropdown] = useState(false);

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      active: pathname.startsWith("/dashboard"),
    },
    {
      name: "Requester",
      href: "/requester",
      active: pathname.startsWith("/requester"),
    },
    { name: "Solver", href: "/solver", active: pathname.startsWith("/solver") },
    {
      name: "Challenger",
      href: "/challenger",
      active: pathname.startsWith("/challenger"),
    },
    {
      name: "Reviewer",
      href: "/reviewer",
      active: pathname.startsWith("/reviewer"),
    },
    {
      name: "RWA Valuation",
      href: "/rwa",
      active: pathname.startsWith("/rwa"),
    },
  ];

  const handleDisconnectWallet = () => {
    disconnect();
    setShowWalletDropdown(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <Disclosure as="nav" className="">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 right-0 flex items-center sm:hidden">
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-800 hover:bg-blue-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                <Bars3Icon
                  aria-hidden="true"
                  className="block size-6 group-data-open:hidden"
                />
                <XMarkIcon
                  aria-hidden="true"
                  className="hidden size-6 group-data-open:block"
                />
              </DisclosureButton>
            </div>
            <div className="flex w-full items-center justify-between sm:items-stretch">
              <div className="flex shrink-0 items-center">
                <Link href="/" className="flex items-center space-x-2 group">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent flex-shrink-0">
                    <img alt="Logo" src="/logo.png" className="h-12" />
                  </h1>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <div className="flex space-x-2 lg:space-x-4">
                  {navigationItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      aria-current={item.active ? "page" : undefined}
                      className={clsx([
                        item.active
                          ? "bg-[#5473f3] text-white"
                          : "text-gray-600 hover:bg-blue-700/10 ",
                        "rounded-md px-3 py-2 text-sm font-medium",
                      ])}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Wallet Connection */}
                {!isConnected ? (
                  <div
                    className="relative right-13 sm:right-auto"
                    // onClick={handleConnectWallet}
                    // className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                  >
                    <ButtonWalletConnect />
                    {/* <span className="equo-gradient rounded-full">
                      <appkit-button size="sm" />
                    </span> */}
                  </div>
                ) : (
                  <div className="relative right-13 sm:right-auto">
                    <button
                      onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {walletAddress && (
                          <>
                            {walletAddress.slice(0, 6)}...
                            {walletAddress.slice(-4)}
                          </>
                        )}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>

                    {/* Wallet Dropdown */}
                    {showWalletDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm text-gray-500">
                            Connected Wallet
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <ShortAddress address={walletAddress as Address} />
                          </div>
                        </div>
                        {caipNetwork && caipNetwork.blockExplorers && (
                          <div className="py-1">
                            <a
                              href={`${caipNetwork.blockExplorers.default.url}/address/${walletAddress}`}
                              target="_blank"
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>
                                View on{" "}
                                {caipNetwork.blockExplorers.default.name}
                              </span>
                            </a>
                            <button
                              onClick={handleDisconnectWallet}
                              className="cursor-pointer flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                            >
                              <span>Disconnect</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DisclosurePanel className="sm:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3">
            {navigationItems.map((item) => (
              <DisclosureButton
                key={item.name}
                as="a"
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={clsx([
                  item.active
                    ? "bg-[#5473f3] text-white"
                    : "text-gray-600 hover:bg-blue-700/10 ",
                  "block rounded-md px-3 py-2 text-base font-medium",
                ])}
              >
                {item.name}
              </DisclosureButton>
            ))}
          </div>
        </DisclosurePanel>
      </Disclosure>
    </header>
  );
};

export default NavBar;
