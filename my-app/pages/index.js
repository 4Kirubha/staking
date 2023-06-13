import Head from "next/head";
import {providers,BigNumber,Contract,utils} from "ethers";
import Web3Modal from "web3modal";
import React,{ useEffect,useState,useRef} from "react";
import styles from "../styles/Home.module.css"
import { 
  TOKEN_ADDRESS,
  STAKING_ADDRESS,
  TOKEN_ABI,
  STAKING_ABI
} from "../constants";

export default function Home(){
  const zero = BigNumber.from(0);
  const[walletConnected,setWalletConnected] = useState(false);
  const[tokenAmount,setTokenAmount] = useState(zero);
  const[tokensToBeStake,setTokensToBeStake] = useState(zero);
  const[isOwner,setIsOwner] = useState(false);
  const web3ModalRef = useRef();

    const getSignerOrProvider = async(needSigner = false) => {
      const provider = await  web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const {chainId} = await web3Provider.getNetwork();

      if(chainId != 11155111){
        window.alert("Change the network to Sepolia");
        throw new Error("Change network to Sepolia");
      }
      if(needSigner){
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    };


    async function mint(){
      try{
        const signer = await getSignerOrProvider(true);
        const tokenContract = new Contract(TOKEN_ADDRESS,TOKEN_ABI,signer);
        const value = 0.001 * tokenAmount;
        if(value > 0){
          const tx = await tokenContract.mint(tokenAmount,{value: utils.parseEther(value.toString())});
          await tx.wait();
          window.alert("You successfully minted a RED Token")
        }else{
          window.alert("Enter the valid amount of tokens!")
        }
      }catch(err){
        console.error(err);
      } 
    }

    async function staking(){
      try{
        const signer = await getSignerOrProvider(true);
        const tokenContract = new Contract(TOKEN_ADDRESS,TOKEN_ABI,signer);
        if(tokensToBeStake > 0){
          const approveTx = await tokenContract.approve(STAKING_ADDRESS,tokensToBeStake);
          await approveTx.wait();
          const stakingContract = new Contract(STAKING_ADDRESS,STAKING_ABI,signer);
          const tx = await stakingContract.stake(tokensToBeStake);
          await tx.wait();
          window.alert("You successfully staked RED Tokens");
        }else{
          window.alert("Enter the valid amount of tokens to stake!")
        }
      }catch(err){
        console.error(err);
      } 
    }

    async function UnStaking(){
      try{
        const signer = await getSignerOrProvider(true);
        const stakingContract = new Contract(STAKING_ADDRESS,STAKING_ABI,signer);
        const tx = await stakingContract.unstake();
        await tx.wait();
        window.alert("You successfully UnStaked RED Tokens")
      }catch(err){
        console.error(err);
      } 
    }

    async function withdraw(){
      try{
        const signer = await getSignerOrProvider(true);
        const stakingContract = new Contract(STAKING_ADDRESS,STAKING_ABI,signer);
        const tx = await stakingContract.withdraw();
        await tx.wait()
        window.alert("Tokens successfully withdrawn")
      }catch(err){
        console.error(err);
      } 
    }

    async function claimRewards(){
      try{
        const signer = await getSignerOrProvider(true);
        const stakingContract = new Contract(STAKING_ADDRESS,STAKING_ABI,signer);
        const tx = await stakingContract.distributeRewards();
        await tx.wait();
        window.alert("Rewards claimed Successfully");
      }catch(err){
      console.error(err.message);
      }
    }

    async function connectWallet(){
      try{
        await getSignerOrProvider();
        setWalletConnected(true);
      }catch(err){
        console.error(err);
      }
    }

    async function getOwner(){
      try{
        const provider = await getSignerOrProvider();
        const stakingContract = new Contract(STAKING_ADDRESS,STAKING_ABI,provider);
        const _owner = await stakingContract.owner();
  
        const signer = await getSignerOrProvider(true);
        const address = await signer.getAddress();
        if(address.toLowerCase() === _owner.toLowerCase()){
          setIsOwner(true);
        }
      }catch(err){
      console.error(err.message);
      }
    }

    useEffect(() =>{
      if(!walletConnected){
        web3ModalRef.current = new Web3Modal({
          network:"sepolia",
          providerOptions:{},
          disableInjectedProvider: false,
        });
        connectWallet();
      }
    },[walletConnected])

    function renderButton(){
      if(!walletConnected){
        return (<button onClick={connectWallet} className={styles.button}>Connect your wallet</button>);
      }return(
        <div style={{ display: "flex-col" }}>
          <input type="number"
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className={styles.input}>
          </input>
          <button onClick={mint} className={styles.button}>MINT</button>
          <button onClick={UnStaking} className={styles.button}>UNSTAKE</button>
          <div>
            <div>
              <input type="number"
                onChange={(e) => setTokensToBeStake(BigNumber.from(e.target.value))}
                className={styles.input}>
              </input>
              <button onClick={staking} className={styles.button}>STAKE</button>
              <button onClick={withdraw} className={styles.button}>WITHDRAW</button>
            </div>
          </div>
            <button onClick={claimRewards} className={styles.button1}>CLAIM REWARDS</button>
        </div>
      )
    }
   return (
      <div>
        <Head>
          <title>Red Staking</title>
          <meta name="description" content="staking-dapp" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Welcome to RED!</h1>
            <div className={styles.description}>
                Users can 
                 <li>
                  Mint RED tokens with a token price of 0.001 ETH.
                 </li>
                 <li>
                  Stake RED tokens and get annual reward of 5% with Reward Tokens.
                 </li>
                 <li>
                  Unstake their tokens with reward proportional to staked duartion.
                 </li>
            </div>
            {renderButton()}
          </div>
          <div>
            <img className={styles.image} src="./krypto.svg" />
          </div>
        </div>
        <footer className={styles.footer}>
          Made with &#10084; by RED
        </footer>
      </div>
    );
  }