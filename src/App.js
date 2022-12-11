import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { useEffect, useState } from 'react';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TEST_GIFS = ['http://38.media.tumblr.com/5d5e32ca49a24950235db5c1b8d8152b/tumblr_nga9ovdcZT1s782pko1_500.gif', 
'http://25.media.tumblr.com/130e456576a8f6ce79d5bb91becca644/tumblr_my4g21pCoR1rsea4xo1_500.gif',
'http://24.media.tumblr.com/bd7eb363db61200453803679ec9a8654/tumblr_mwb0a09g6Y1ryy5i6o1_500.gif']

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
      setGifList([...gifList, inputValue])
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

  const renderConnectedContainer = () => (
    <div className="connected-container">
        <form onSubmit={event =>{
          event.preventDefault()
          sendGif()
        }}>
          <input type="text" placeholder="Enter gif link!! " value={inputValue} onChange={onInputChange}/>
          <button type="submit" className="cta-button submit-gif-button">Submit</button>
        </form>
        <div className="gif-grid">
          {gifList.map((gif) => (
              <div className="gif-item">
                 <img src={gif} alt={gif}/>
              </div>
          ))}
        </div>
    </div>
  )

  useEffect(()=>{
    const onLoad = async () =>{
      await checkIfWalletIsConnected()
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  useEffect(()=>{
      console.log('Fetching GIF  list...')
      setGifList(TEST_GIFS)
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
