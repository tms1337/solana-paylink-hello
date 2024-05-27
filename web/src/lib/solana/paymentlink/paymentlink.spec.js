const solanaWeb3 = require("@solana/web3.js");
const borsh = require("borsh");
const { registerAddress, getAddress, getConnection } = require("./");

// Define AddressMapping class and schema within the test scope
class AddressMapping {
  constructor(properties) {
    this.mapping = properties.mapping || new Map();
  }
}

const schema = new Map([
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

// Mocking the solanaWeb3 methods for testing purposes
jest.mock("@solana/web3.js", () => {
  const originalModule = jest.requireActual("@solana/web3.js");

  const mockSerializedData = borsh.serialize(
    schema,
    new AddressMapping({
      mapping: new Map([
        [
          "YourGeneratedKeyHere",
          new originalModule.PublicKey("11111111111111111111111111111111"),
        ],
      ]),
    })
  );

  return {
    ...originalModule,
    sendAndConfirmTransaction: jest
      .fn()
      .mockResolvedValue("mockTransactionSignature"),
    clusterApiUrl: jest.fn().mockReturnValue("https://api.devnet.solana.com"),
    Keypair: {
      generate: jest.fn(() => ({
        publicKey: new originalModule.PublicKey(
          "11111111111111111111111111111111"
        ),
        secretKey: Buffer.alloc(64),
      })),
    },
    Connection: jest.fn().mockImplementation(() => ({
      requestAirdrop: jest.fn().mockResolvedValue("mockAirdropSignature"),
      confirmTransaction: jest.fn().mockResolvedValue("mockConfirmation"),
      getAccountInfo: jest.fn().mockResolvedValue({
        data: Buffer.from(mockSerializedData),
      }),
    })),
  };
});

describe("Solana Address Mapping", () => {
  const programId = new solanaWeb3.PublicKey(
    "11111111111111111111111111111111"
  );
  const payer = solanaWeb3.Keypair.generate();
  const mappingAccount = solanaWeb3.Keypair.generate();

  beforeEach(async () => {
    const connection = getConnection();
    await connection.requestAirdrop(
      payer.publicKey,
      solanaWeb3.LAMPORTS_PER_SOL
    );
  });

  test("should register a new address", async () => {
    await registerAddress(programId, payer, mappingAccount);
    expect(solanaWeb3.sendAndConfirmTransaction).toHaveBeenCalled();
  });

  test("should retrieve an address", async () => {
    const key = "YourGeneratedKeyHere";
    await getAddress(programId, payer, mappingAccount, key);
    expect(solanaWeb3.sendAndConfirmTransaction).toHaveBeenCalled();
    expect(solanaWeb3.Connection().getAccountInfo).toHaveBeenCalledWith(
      mappingAccount.publicKey
    );
  });
});
