import useAoSigner from "@/hooks/useAoSigner";
import { useActiveAddress, useConnection } from "arweave-wallet-kit";
import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { ConnectText } from "../ConnectText";

export interface ConnectWalletSuggestionProps {
  children: React.ReactNode;
}

export const ConnectWalletSuggestion = ({
  children,
}: ConnectWalletSuggestionProps) => {
  const { connected } = useConnection();
  const walletId = useActiveAddress();
  const { aoSigner } = useAoSigner();

  if (!connected || !walletId || !aoSigner) {
    return (
      <HoverCard>
        <HoverCardTrigger className="cursor-not-allowed">
          <div className="pointer-events-none">{children}</div>
        </HoverCardTrigger>
        <HoverCardContent
          align="center"
          side="top"
          className="pl-4 pt-2 pb-3 pr-0"
        >
          <ConnectText />
        </HoverCardContent>
      </HoverCard>
    );
  }

  return children;
};
