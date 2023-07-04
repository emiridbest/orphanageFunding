
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


contract OrphanageDonation {
    address public owner;
    uint256 public totalDonations;
    mapping(address => uint256) public donations;

    event DonationReceived(address indexed donor, uint256 amount);
    event DonationWithdrawn(address indexed orphanage, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function donate() external payable {
        require(msg.value > 0, "Donation amount should be greater than 0");
        totalDonations += msg.value;
        donations[msg.sender] += msg.value;
        emit DonationReceived(msg.sender, msg.value);
    }

    function withdrawDonations() external onlyOwner {
        require(totalDonations > 0, "No donations available to withdraw");
        uint256 balance = address(this).balance;
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
        totalDonations = 0;
        emit DonationWithdrawn(owner, balance);
    }
}
