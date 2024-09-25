import useAoSigner, { AoSigner } from "@/hooks/useAoSigner";
import {
  ConnectButton,
  useActiveAddress,
  useConnection,
} from "arweave-wallet-kit";
import React from "react";

export interface ConnectWalletBlockerProps {
  children: (walletId: string, aoSigner: AoSigner) => React.ReactNode;
}

export const ConnectWalletBlocker = ({
  children,
}: ConnectWalletBlockerProps) => {
  const { connected } = useConnection();
  const walletId = useActiveAddress();
  const { aoSigner } = useAoSigner();

  if (!connected || !walletId || !aoSigner) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <ConnectButton />
      </div>
    );
  }

  return children(walletId, aoSigner);
};
