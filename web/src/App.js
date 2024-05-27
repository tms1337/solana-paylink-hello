import "@solana/wallet-adapter-react-ui/styles.css";
import "./App.css";

import React, { useMemo } from "react";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";

// components
import SendTransactionForm from "./components/SendTransactionForm";

// filler
import { Buffer } from "buffer";
window.Buffer = Buffer; // Ensure Buffer is globally available

function App() {
  const wallets = useMemo(() => [new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider
      endpoint={
        "https://solana-mainnet.g.alchemy.com/v2/LjKLGXZEd0-047semdChx0Ba62BeVTJC/"
      }
    >
      {/* <WalletProvider wallets={wallets} autoConnect> */}
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <div className="h-screen bg-black flex items-center justify-center text-white">
            <SendTransactionForm />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
