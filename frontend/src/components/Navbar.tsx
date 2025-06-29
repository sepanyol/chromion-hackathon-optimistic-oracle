// components/Navbar.tsx
"use client";
import {
  useAppKitAccount,
  useAppKitNetwork,
  useDisconnect,
} from "@reown/appkit/react";
import { ChevronDown, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

interface NavbarProps {
  showNavigation?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showNavigation = false }) => {
  const pathname = usePathname();
  const { isConnected, address: walletAddress } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { caipNetwork } = useAppKitNetwork();

  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [networkName, setNetworkName] = useState("");

  const [notifications, setNotifications] = useState(3);

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

  const copyAddress = useCallback(() => {
    if (walletAddress) navigator.clipboard.writeText(walletAddress);
  }, [walletAddress]);

  useEffect(() => {
    if (isConnected && caipNetwork) setNetworkName(caipNetwork.name);
    else setNetworkName("");
  }, [isConnected, caipNetwork]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                <img alt="Logo" src="/logo.png" className="h-12" />
              </h1>
            </Link>

            {/* Navigation */}
            {showNavigation && (
              <nav className="hidden md:flex space-x-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      item.active
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Network Status (only show if wallet connected) */}
            {isConnected && (
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">
                  {networkName}
                </span>
              </div>
            )}

            {/* Wallet Connection */}
            {!isConnected ? (
              <div
              // onClick={handleConnectWallet}
              // className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <appkit-button />
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {walletAddress && (
                      <>
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </>
                    )}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Wallet Dropdown */}
                {showWalletDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm text-gray-500">Connected Wallet</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm font-medium text-gray-900 font-mono">
                          {walletAddress && (
                            <>
                              {walletAddress.slice(0, 12)}...
                              {walletAddress.slice(-8)}
                            </>
                          )}
                        </p>
                        <button
                          onClick={copyAddress}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
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
                            View on {caipNetwork.blockExplorers.default.name}
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

            {/* Notifications */}
            {/* <div className="relative">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {notifications}
                  </span>
                )}
              </button>
            </div> */}

            {/* Settings */}
            {/* <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5" />
            </button> */}

            {/* User Avatar */}
            {/* <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
              <span className="text-white text-sm font-medium">AJ</span>
            </div> */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
