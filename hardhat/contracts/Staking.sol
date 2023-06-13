//SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is ERC20,Ownable{
    ERC20 redToken;
    struct StakingInfo {
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        uint256 reward;
    }
    mapping(address => StakingInfo) public stakingInfo;
    uint256 public totalStaked;
    uint256 public rewardRate = 5;
    uint256 public minStakingDuration = 7 days;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsDistributed(address indexed user,uint256 amount);

    constructor(ERC20 _redToken)ERC20("Reward Red","RR") {
        redToken = _redToken;
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        uint amountWithDecimals = amount * 10**18;
        require(redToken.transferFrom(msg.sender,address(this), amountWithDecimals), "Transfer failed");

        StakingInfo storage info = stakingInfo[msg.sender];

        if (info.amount > 0) {
            uint256 rewards = calculateRewards(info.amount, info.startTime, info.endTime);
            info.reward += rewards;
            info.endTime = block.timestamp + minStakingDuration;
        } else {
            info.startTime = block.timestamp;
            info.endTime = block.timestamp + minStakingDuration;
        }
        info.amount += amountWithDecimals;
        totalStaked += amountWithDecimals;

        emit Staked(msg.sender, amount);
    }

    function unstake() external {
        StakingInfo storage info = stakingInfo[msg.sender];

        //require(block.timestamp >= info.endTime,"Staking duration not yet reached");
        require(info.amount > 0, "No tokens staked");

        uint256 rewards = calculateRewards(info.amount, info.startTime, block.timestamp);
        info.reward += rewards;
        require(redToken.transfer(msg.sender, info.amount), "Transfer failed");
        _mint(msg.sender,info.reward);
        totalStaked -= info.amount;
        delete stakingInfo[msg.sender];

        emit Unstaked(msg.sender, info.amount);
    }

    function distributeRewards() external {
        StakingInfo storage info = stakingInfo[msg.sender];
        uint256 rewards = calculateRewards(info.amount, info.startTime, block.timestamp);
        info.reward += rewards;
        uint rewardsToBeDistributed = info.reward;
        require(rewardsToBeDistributed > 0,"No rewards available");
        info.reward = 0;
        info.startTime = block.timestamp;
        _mint(msg.sender,rewardsToBeDistributed);
        emit RewardsDistributed(msg.sender,rewardsToBeDistributed);
    }

    function calculateRewards(uint256 amount, uint256 startTime, uint256 endTime) public view returns (uint256){
        uint256 duration = endTime - startTime;
        uint256 rewards = amount * duration * rewardRate/(100 * 86400);
        return rewards;
    }

    function getStakedAmount() external view returns (uint256) {
        return stakingInfo[msg.sender].amount;
    }

    function getRewards() external view returns (uint256) {
        StakingInfo storage info = stakingInfo[msg.sender];
        return calculateRewards(info.amount,info.startTime,block.timestamp);
    }

    function withdraw() external {
        StakingInfo storage info = stakingInfo[msg.sender];
        require(info.amount > 0, "No Tokens staked");
        require(redToken.transfer(msg.sender, info.amount), "Transfer failed");
        _mint(msg.sender, info.reward);

        totalStaked -= info.amount;
        delete stakingInfo[msg.sender];
    }

    function setRewardRateAndMinDuration(uint256 _rewardRate, uint256 _minStakingDuration) external onlyOwner{
        rewardRate = _rewardRate;
        minStakingDuration = _minStakingDuration;
    }
}