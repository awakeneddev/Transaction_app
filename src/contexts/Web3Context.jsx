import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers, formatEther, isAddress, parseEther } from "ethers";
import { toast } from "react-toastify";
import TransactionArtifact from "../contracts/Transaction.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const init = async () => {
      checkIfWalletIsConnected();
      checkNetwork();
    };
    init();
  }, []);

  const checkNetwork = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      if (chainId !== "0xaa36a7") {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa56a7" }],
          });
        } catch {
          toast.error("Please switch to the Sepolia testnet in your wallet");
        }
      }
    }
  };

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return toast.error("Please Install MetaMask");

    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });

    if (accounts.length) {
      setAccount(accounts[0]);
      await getBalance(accounts[0]);
      await getTransactionHistory();
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return toast.error("Please Install MetaMask");

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      await getBalance(accounts[0]);
      await getTransactionHistory();
      toast.success("Wallet Connected Successfully");
    } catch {
      toast, error("Failed to connect wallet");
    }
  };

  const disconnectWallet = () => {
    setAccount("");
    setBalance("");
    setTransactions([]);
    toast.info("Wallet disconnected");
  };

  const getBalance = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);

      setBalance(formatEther(balance));
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  const sendTransaction = async (to, amount, keyword, message) => {
    if (!window.ethereum) return toast.error("Please install MetaMask.");
    try {
      // connect to Ethereum
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // initializing contract with signer
      const contract = new ethers.Contract(
        contractAddress,
        TransactionArtifact.abi,
        signer
      );
      if (!isAddress(to) || isNaN(amount) || amount <= 0) {
        throw new Error("Invalid input");
      }

      const parsedAmount = parseEther(amount.toString());
      const transaction = await contract.addToBlockchain(
        to,
        parsedAmount,
        message,
        keyword,
        { value: parsedAmount }
      );
      setIsProcessing(true);
      toast.info("Transaction is being processed...");
      await transaction.wait();
      setIsProcessing(false);
      toast.success("Transaction successful!");

      await getTransactionHistory();
      await getBalance(account);
    } catch (error) {
      toast.error("Transaction failed. Please try again.");
    }
  };

  const getTransactionHistory = async () => {
    if (!window.ethereum) return alert("Please install MetaMask.");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        TransactionArtifact.abi,
        provider
      );

      const transactions = await contract.getAllTransactions();
      const structuredTransactions = transactions.map((transaction, i) => {
        return {
          addressFrom: transaction.sender,
          addressTo: transaction.receiver,
          amount: formatEther(transaction.amount),
          message: transaction.message,
          timestamp: new Date(
            Number(transaction.timestamp) * 1000
          ).toLocaleString(),
          keyword: transaction.keyword,
        };
      });

      setTransactions(structuredTransactions);
    } catch (err) {
      console.error("Error getting transaction history", err);
    }
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        balance,
        transactions,
        connectWallet,
        disconnectWallet,
        sendTransaction,
        getTransactionHistory,
        isProcessing,
        setIsProcessing,
      }}
    >
      {" "}
      {children}{" "}
    </Web3Context.Provider>
  );
};
