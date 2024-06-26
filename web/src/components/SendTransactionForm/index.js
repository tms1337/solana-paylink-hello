import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLocation } from "react-router-dom";

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

const getAddress = async (id) => {
  const addresses = {
    1: "4cXAExPzmuYC5bjGuPgNMzVWPXLXm6Tv3rsQeRvaCeQN",
    zmuYC5bjGuPg: "4cXAExPzmuYC5bjGuPgNMzVWPXLXm6Tv3rsQeRvaCeQN",
    2: "9X6Q...someAddress2",
  };
  return addresses[id] || "";
};

const SendTransactionForm = () => {
  const { publicKey, sendTransaction } = useWallet();
  const [toAddress, setToAddress] = useState("");
  const [value, setValue] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalColor, setModalColor] = useState("");
  const [showModal, setShowModal] = useState(false);
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
      setModalMessage("Wallet not connected");
      setModalColor("red");
      setShowModal(true);
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
      setModalMessage(`Transaction successful! Signature: ${signature}`);
      setModalColor("green");
      setShowModal(true);
    } catch (error) {
      console.error("Transaction failed", error);
      setModalMessage("Transaction failed");
      setModalColor("red");
      setShowModal(true);
    }
  };

  return (
    <div className="w-96 p-6 bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Send Solana</h1>

      <form className="flex flex-col space-y-4" onSubmit={handleSend}>
        <WalletMultiButton className="w-full p-2 bg-blue-600 rounded text-white font-semibold hover:bg-blue-700" />

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
      </form>
      {showModal && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50`}
          onClick={() => setShowModal(false)}
        >
          <div
            className={`p-4 rounded-lg shadow-lg text-white ${
              modalColor === "green" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {modalMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default SendTransactionForm;
