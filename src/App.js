import React, { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import "./App.css";
import { contractABI, contractAddress } from "./const";

const App = () => {
  const [donationAmount, setDonationAmount] = useState("");
  const [connectedAccount, setConnectedAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [totalDonations, setTotalDonations] = useState(0);

  const connectWallet = async () => {
    try {
      // Check if the current provider is connected
      await window.ethereum.enable();

      // Get the user"s account address
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      const account = accounts[0];

      // Set the connected account
      setConnectedAccount(account);
    } catch (error) {
      console.error(error);
      alert("An error occurred while connecting the wallet.");
    }
  };
  const disconnectWallet = () => {
    setConnectedAccount("");
    setContract(null);
  };

  useEffect(() => {
    if (connectedAccount && window.ethereum) {
      // Create a web3 instance
      const web3 = new Web3(window.ethereum);

      // Create contract instance
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      // Set the contract in state
      setContract(contract);
    }
  }, [connectedAccount]);
  // eslint-disable-next-line
  const donate = async () => {
    try {
      // Check if the contract is loaded
      if (!contract) {
        console.log("Contract is not loaded");
        return;
      }
      const donationAmountInWei = Web3.utils.toWei(donationAmount, "ether");
      // Send the donation transaction to the contract
      await contract.methods
        .donate()
        .send({ from: connectedAccount, value: donationAmountInWei });

      // Display success message
      alert("Donation successful!");
      setDonationAmount("");
      setTotalDonations(totalDonations);
    } catch (error) {
      console.error(error);
      alert("An error occurred during donation.");
    }
  };

  const fetchTotalDonations = useCallback(async () => {
    if (contract) {
      const total = await contract.methods.totalDonations().call();
      setTotalDonations(Web3.utils.fromWei(total, "ether"));
    }
  }, [contract]);

  useEffect(() => {
    fetchTotalDonations();
  }, [fetchTotalDonations, donate]);


  const withdraw = async () => {
    try {
      // Check if the contract is loaded
      if (!contract) {
        console.log("Contract is not loaded");
        return;
      }

      // Send the withdrawal transaction to the contract
      await contract.methods
        .withdrawDonations()
        .send({ from: connectedAccount });

      // Display success message
      alert("Withdrawal successful!");
      setTotalDonations(totalDonations);
    } catch (error) {
      console.error(error);
      alert("An error occurred during withdrawal.");
    }
  };

  return (
    <div>
      <h1>Orphanage Donation DApp</h1>
      <button
        className="connectButton"
        onClick={connectedAccount ? disconnectWallet : connectWallet}
      >
        {connectedAccount ? "Disconnect Wallet" : "Connect Wallet"}
      </button>

      <div className="connect">Connected Account: {connectedAccount}</div>
      <div className="input">
        <div className="totalDonations">
          <h2>Total Donations:</h2>
          <p>{totalDonations} CELO</p>
        </div>
        <p>Please enter the amount of Celo:</p>
        <input
          type="number"
          value={donationAmount}
          step={1}
          onChange={(e) => setDonationAmount(e.target.value)}
        />
      </div>

      <div>
        <button className="donate" onClick={donate} disabled={!donationAmount}>
          Donate
        </button>
        <div />
      </div>
      <div>
        <button className="withdraw" onClick={withdraw}>
          Withdraw Donations
        </button>
      </div>
    </div>
  );
};

export default App;
