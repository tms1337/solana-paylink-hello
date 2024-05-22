const solanaWeb3 = require("@solana/web3.js");

const main = async () => {
  const connection = new solanaWeb3.Connection(
    solanaWeb3.clusterApiUrl("devnet"),
    "confirmed"
  );

  const payer = solanaWeb3.Keypair.generate();
  await connection.requestAirdrop(payer.publicKey, solanaWeb3.LAMPORTS_PER_SOL);

  const programId = new solanaWeb3.PublicKey("YOUR_PROGRAM_ID_HERE");

  const transaction = new solanaWeb3.Transaction().add(
    new solanaWeb3.TransactionInstruction({
      keys: [],
      programId,
      data: Buffer.alloc(0),
    })
  );

  await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [payer]);
  console.log("Hello, World!");
};

main().catch(console.error);
