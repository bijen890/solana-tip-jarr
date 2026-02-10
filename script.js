const YOUR_WALLET_ADDRESS = "REPLACE_WITH_YOUR_WALLET_ADDRESS";

let provider = null;
let connected = false;

// Check if Phantom is installed
const checkIfWalletIsConnected = async () => {
    if ("solana" in window) {
        provider = window.solana;
        if (provider.isPhantom) {
            console.log("Phantom wallet found!");
            return true;
        }
    }
    alert("Please install Phantom wallet from phantom.app!");
    return false;
};

// Connect wallet
document.getElementById('connect-btn').addEventListener('click', async () => {
    const exists = await checkIfWalletIsConnected();
    if (!exists) return;

    try {
        const response = await provider.connect();
        connected = true;
        document.getElementById('wallet-section').classList.add('hidden');
        document.getElementById('tip-section').classList.remove('hidden');
        
        const shortAddress = response.publicKey.toString().slice(0, 4) + "..." + response.publicKey.toString().slice(-4);
        document.getElementById('wallet-address').textContent = shortAddress;
        
        showStatus("Wallet connected!", "green");
    } catch (err) {
        showStatus("Connection failed", "red");
    }
});

// Disconnect
document.getElementById('disconnect-btn').addEventListener('click', () => {
    provider.disconnect();
    connected = false;
    document.getElementById('wallet-section').classList.remove('hidden');
    document.getElementById('tip-section').classList.add('hidden');
    showStatus("Disconnected", "gray");
});

// Send tip function
async function sendTip(amount) {
    if (!connected) return;
    
    showStatus("Sending " + amount + " SOL...", "blue");
    
    try {
        const connection = new solanaWeb3.Connection(
            solanaWeb3.clusterApiUrl('devnet'), 
            'confirmed'
        );
        
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: provider.publicKey,
                toPubkey: new solanaWeb3.PublicKey(YOUR_WALLET_ADDRESS),
                lamports: amount * solanaWeb3.LAMPORTS_PER_SOL
            })
        );
        
        transaction.feePayer = provider.publicKey;
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        
        const signature = await provider.signAndSendTransaction(transaction);
        showStatus("Success! Sent " + amount + " SOL", "green");
        
    } catch (err) {
        showStatus("Error: " + err.message, "red");
    }
}

// Send custom amount
function sendCustomTip() {
    const amount = document.getElementById('custom-amount').value;
    if (amount && amount > 0) {
        sendTip(parseFloat(amount));
    } else {
        showStatus("Please enter a valid amount", "red");
    }
}

// Show status messages
function showStatus(message, color) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = "mt-4 text-sm font-medium text-" + color + "-600";
}
