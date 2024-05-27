const solanaWeb3 = require("@solana/web3.js");
const borsh = require("borsh");

class AddressMapping {
  constructor(properties) {
    this.mapping = properties.mapping || new Map();
  }

  static schema = new Map([
    [
      AddressMapping,
      {
        kind: "struct",
        fields: [
          [
            "mapping",
            { kind: "map", key: "string", value: solanaWeb3.PublicKey },
          ],
        ],
      },
    ],
  ]);

  static deserialize(data) {
    return borsh.deserialize(AddressMapping.schema, AddressMapping, data);
  }

  serialize() {
    return borsh.serialize(AddressMapping.schema, this);
  }
}

const getConnection = () => {
  return new solanaWeb3.Connection(
    solanaWeb3.clusterApiUrl("devnet"),
    "confirmed"
  );
};

const registerAddress = async (programId, payer, mappingAccount) => {
  const connection = getConnection();

  const randomKey = Math.random().toString(36).substring(2, 12);
  const transaction = new solanaWeb3.Transaction().add(
    new solanaWeb3.TransactionInstruction({
      keys: [
        { pubkey: mappingAccount.publicKey, isSigner: false, isWritable: true },
        { pubkey: payer.publicKey, isSigner: true, isWritable: false },
      ],
      programId,
      data: Buffer.from(`register${randomKey}`),
    })
  );

  await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [payer]);
  console.log(`Address registered with key: ${randomKey}`);
};

const getAddress = async (programId, payer, mappingAccount, key) => {
  const connection = getConnection();

  const transaction = new solanaWeb3.Transaction().add(
    new solanaWeb3.TransactionInstruction({
      keys: [
        { pubkey: mappingAccount.publicKey, isSigner: false, isWritable: true },
      ],
      programId,
      data: Buffer.from(`get${key}`),
    })
  );

  await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [payer]);

  const accountInfo = await connection.getAccountInfo(mappingAccount.publicKey);
  const addressMapping = AddressMapping.deserialize(accountInfo.data);
  console.log(`Address for key ${key}: ${addressMapping.mapping.get(key)}`);
};

const exampleUsage = async () => {
  const connection = getConnection();

  const programId = new solanaWeb3.PublicKey("YourProgramIdHere");
  const payer = solanaWeb3.Keypair.generate();
  const mappingAccount = solanaWeb3.Keypair.generate();

  const airdropSignature = await connection.requestAirdrop(
    payer.publicKey,
    solanaWeb3.LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(airdropSignature);

  await registerAddress(programId, payer, mappingAccount);

  const key = "YourGeneratedKeyHere";
  await getAddress(programId, payer, mappingAccount, key);
};

module.exports = {
  getConnection,
  registerAddress,
  getAddress,
};
