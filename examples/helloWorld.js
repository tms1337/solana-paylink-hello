const solanaWeb3 = require("@solana/web3.js");

async function checkBalance(address) {
  // Connect to the Solana mainnet
  const connection = new solanaWeb3.Connection(
    solanaWeb3.clusterApiUrl("mainnet-beta"),
    "confirmed"
  );

  // Convert the address to a PublicKey
  const publicKey = new solanaWeb3.PublicKey(address);

  // Get the balance of the address
  const balance = await connection.getBalance(publicKey);

  // Convert the balance from lamports to SOL and print it
  console.log(
    `Balance for ${address}: ${balance / solanaWeb3.LAMPORTS_PER_SOL} SOL`
  );
}

// Example usage
const address = "9H1MgRe1STYVhcgZw2gqvm3Wtziqmodn4GDb3qv2YumH";
checkBalance(address).catch(console.error);
