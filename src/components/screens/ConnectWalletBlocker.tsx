import { ConnectButton, useConnection } from "arweave-wallet-kit";
import React from "react";

export interface ConnectWalletBlockerProps {
  children?: React.ReactNode;
}

export const ConnectWalletBlocker = ({
  children,
}: ConnectWalletBlockerProps) => {
  const connection = useConnection();

  if (!connection.connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <ConnectButton />
      </div>
    );
  }

  return children;
};
