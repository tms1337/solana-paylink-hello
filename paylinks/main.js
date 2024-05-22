const solanaWeb3 = require("@solana/web3.js");

async function getAddress(programId, key) {
  try {
    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("devnet"),
      "confirmed"
    );

    const payer = solanaWeb3.Keypair.generate();
    const airdropSignature = await connection.requestAirdrop(
      payer.publicKey,
      solanaWeb3.LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);

    const programKey = new solanaWeb3.PublicKey(programId);

    const transaction = new solanaWeb3.Transaction().add(
      new solanaWeb3.TransactionInstruction({
        keys: [{ pubkey: programKey, isSigner: false, isWritable: true }],
        programId: programKey,
        data: Buffer.from(`get${key.padEnd(10, "\0")}`),
      })
    );

    const signature = await solanaWeb3.sendAndConfirmTransaction(
      connection,
      transaction,
      [payer]
    );
    console.log(`Transaction confirmed with signature: ${signature}`);
    console.log(`Queried address for key ${key}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example usage
const programId = "YOUR_PROGRAM_ID_HERE";
const key = "examplekey";
getAddress(programId, key).catch(console.error);
