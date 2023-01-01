import {clusterApiUrl, Connection, PublicKey} from '@solana/web3.js';
import {Program, Provider, web3} from '@project-serum/anchor'
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import {useEffect, useState} from 'react';
import idl from './idl.json';
import kp from './keypair.json';
import {Buffer} from 'buffer';

const {SystemProgram, Keypair} = web3;
window.Buffer = Buffer

const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = Keypair.fromSecretKey(secret)
const ProgramId = new PublicKey(idl.metadata.address)
const network = clusterApiUrl('devnet')
const opts = {
  preflightCommitment: "processed"
}


// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [gifList, setGifList] = useState([])
  const checkIfWalletIsConnected = async() =>{
    try{
      const {solana} = window;
      if(solana){
        console.log("Phantom Wallet found!!")

        const response = await solana.connect({onlyIfTrusted: true})
        console.log('Connected with Public key: ', response.publicKey.toString())
        setWalletAddress(response.publicKey.toString())
      }
      else{
        console.log("Solana wallet not found!! You need to install Phantom Wallet!!")
      }
    }
    catch(err){
      console.error(err)
    }
  }
  const connectToWallet = async() =>{
    const  {solana} = window
    if(solana){
      const response = await solana.connect()
      console.log("Connected with Public Key: ", response.publicKey.toString())
      setWalletAddress(response.publicKey.toString())
    }
  }

  const renderNotConnectedContainer = () => (
    <button className= "cta-button connect-wallet-button"
    onClick={connectToWallet}>
      Connect to Wallet
    </button>
  )

  const sendGif = async() =>{
    if(inputValue.length > 0){
      console.log("Gif link: ", inputValue)
      try{
        const provider = getProvider()
        const program = new Program(idl, ProgramId, provider)
        await program.rpc.addGif(inputValue, {
          accounts :{
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey
          }
        })

        console.log("GIF sent to program", inputValue)
        await getGifList()
        setInputValue('')

      }catch(err){
        console.error(err)
      }
      setInputValue('')
    }
    else{
      console.log("Empty input. Try again!!!")
    }
  }

  const onInputChange = event => {
    const {value} = event.target
    setInputValue(value)
  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment)
    return new Provider(connection, window.solana, opts.preflightCommitment)
  }

  const renderConnectedContainer = () => {
    if(gifList === null){
      return <div className="connected-container">
        <button className="cta-button submit-gif-button" onClick={createBaseAccount}>
          Do One-Time Initialization for GIF Program Account
        </button>
      </div>
    }
    else {
      return(

            <div className="connected-container">
                <form onSubmit={event =>{
                  event.preventDefault()
                  sendGif()
                }}>
                  <input type="text" placeholder="Enter gif link!! " value={inputValue} onChange={onInputChange}/>
                  <button type="submit" className="cta-button submit-gif-button">Submit</button>
                </form>
                <div className="gif-grid">
                  {gifList.map((item, index) => (
                      <div className="gif-item sub-text" key={index}>
                        {item.userAddress.toString()}<br/>
                        Votes: {item.numVotes.toString()}
                        <img src={item.gifLink} alt={item.gifLink}/>
                        <button className="cta-button submit-gif-button" onClick={(e) => voteGif(e, index)}>Vote</button>
                      </div>

                  )
                  )}
                </div>
            </div>
      )
    }
  }

  useEffect(()=>{
    const onLoad = async () =>{
      await checkIfWalletIsConnected()
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  const getGifList = async() =>{
    try{
      const provider = getProvider()
      const program = new Program(idl, ProgramId, provider)
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey)

      console.log('Got account: ', account)
      setGifList(account.gifList)
    }
    catch(error){
      console.log('Getting Gif list error: ', error)
      setGifList(null)
    }
  }

  const createBaseAccount = async()=>{
    try{
      const provider = getProvider()
      const program = new Program(idl, ProgramId, provider)
      await program.rpc.startStuffOff({
        accounts:{
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId
        },
        signers: [baseAccount]
      })
      console.log('Created Base Account w/ address: ', baseAccount.publicKey.toString())
      await getGifList()
    } catch(err){
      console.log('Error creating baseAccount: ', err)
    }
  }

  const voteGif = async(event, index) => {
    try{
      const provider = getProvider()
      const program = new Program(idl, ProgramId, provider)
      await program.rpc.voteGif(index.toString(),{
        accounts:{
          baseAccount: baseAccount.publicKey,
          voteUser: provider.wallet.publicKey,
        }
      })
      console.log("Vote Gif from : ", provider.wallet.publicKey.toString())
      await getGifList()
    }
    catch(err){
      console.log("Error voting gif: ", err)
    }
  }

  useEffect(()=>{
      console.log('Fetching GIF  list...')
      getGifList()
  },[walletAddress])

  return (
    <div className="App">
      <div className={walletAddress ? "authed-container": "container"}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
