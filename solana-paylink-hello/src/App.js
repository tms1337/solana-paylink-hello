import "@solana/wallet-adapter-react-ui/styles.css";
import "./App.css";

import React, { useEffect, useState, useMemo } from "react";
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
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { useLocation } from "react-router-dom";
import { Buffer } from "buffer";
window.Buffer = Buffer; // Ensure Buffer is globally available

const getAddress = async (id) => {
  const addresses = {
    1: "4cXAExPzmuYC5bjGuPgNMzVWPXLXm6Tv3rsQeRvaCeQN",
    2: "9X6Q...someAddress2",
  };
  return addresses[id] || "";
};

const SendTransactionForm = () => {
  const { publicKey, sendTransaction, wallet, connected } = useWallet();
  const [toAddress, setToAddress] = useState("");
  const [value, setValue] = useState("");
  const location = useLocation();

  useEffect(() => {
    const fetchAddress = async () => {
      const params = new URLSearchParams(location.search);
      const id = params.get("id");
      if (id) {
        const address = await getAddress(id);
        setToAddress(address);
      }
    };

    fetchAddress();
  }, [location]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!publicKey) {
      alert("Wallet not connected");
      return;
    }

    const connection = new Connection(
      "https://solana-mainnet.g.alchemy.com/v2/LjKLGXZEd0-047semdChx0Ba62BeVTJC",
      "confirmed"
    );
    const toPubkey = new PublicKey(toAddress);
    const lamports = value * LAMPORTS_PER_SOL;

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: toPubkey,
        lamports,
      })
    );

    try {
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
      alert("Transaction successful! Signature: " + signature);
    } catch (error) {
      console.error("Transaction failed", error);
      alert("Transaction failed");
    }
  };

  // useEffect(() => {
  //   if (!connected) {
  //     wallet?.adapter?.connect();
  //   }
  // }, [connected, wallet]);

  return (
    <div className="w-96 p-6 bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Send Solana</h1>
      <form className="flex flex-col space-y-4" onSubmit={handleSend}>
        <div>
          <label className="block mb-2 text-sm font-medium">To:</label>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-white"
            placeholder="Solana Address"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">Value:</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-white"
            placeholder="Enter your value"
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 rounded text-white font-semibold hover:bg-blue-700"
        >
          Send
        </button>
        <WalletMultiButton className="w-full p-2 bg-blue-600 rounded text-white font-semibold hover:bg-blue-700" />
      </form>
    </div>
  );
};

function App() {
  const wallets = useMemo(() => [new SolflareWalletAdapter()], []);

  // useEffect(() => {
  //   const wallet = wallets[0];
  //   wallet.connect();
  // }, [wallets]);

  return (
    <ConnectionProvider
      endpoint={
        "https://solana-mainnet.g.alchemy.com/v2/LjKLGXZEd0-047semdChx0Ba62BeVTJC/"
      }
    >
      <WalletProvider wallets={wallets} autoConnect>
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
