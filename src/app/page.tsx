"use client";

import * as LitJsSdk from "@lit-protocol/lit-node-client";
import {
  checkAndSignAuthMessage,
  disconnectWeb3,
} from "@lit-protocol/auth-browser";
import { LOCAL_STORAGE_KEYS, LitNetwork } from "@lit-protocol/constants";
import { useEffect, useState } from "react";
import { benchmark } from "./utils";

import { useAccount, useConnect, useDisconnect } from "wagmi";

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  const [str, setStr] = useState("Project name ANTI-AI");
  const [lang, setLang] = useState("json");

  const [data, setData] = useState({
    data: {
      name: "Lit Protocol",
      description: "Threadshold cryptography for the win!",
    },
  });

  const go = async () => {
    let code = `import * as LitJsSdk from '@lit-protocol/lit-node-client';

const litNodeClient = new LitJsSdk.LitNodeClient({
litNetwork: 'cayenne',
});
await litNodeClient.connect();

// { ms } 
// { Loading... } 
const authSig = await LitJsSdk.checkAndSignAuthMessage({
chain: 'ethereum'
});

const accs = [
{
  contractAddress: '',
  standardContractType: '',
  chain: 'ethereum',
  method: 'eth_getBalance',
  parameters: [':userAddress', 'latest'],
  returnValueTest: {
    comparator: '>=',
    value: '0',
  },
},
];

// { ms }
const res = await LitJsSdk.encryptString({
accessControlConditions: accs,
authSig,
chain: 'ethereum',
dataToEncrypt: '${str}',
}, litNodeClient);

// { Loading... } 
const ciphertext = res.ciphertext;

// { Loading... } 
const dataToEncryptHash = res.dataToEncryptHash;

// { ms } 
// { Loading... }
const decryptedString = await LitJsSdk.decryptToString({
accessControlConditions: accs,
ciphertext,
dataToEncryptHash,
authSig: authSig,
chain: 'ethereum',
});

console.log("decryptedString:", "Loading...");

`;

    setLang("javascript");
    setData(code);

    const litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: "cayenne",
    });
    await litNodeClient.connect();

    // --------- NEXT STEP ---------
    const authRes = await benchmark(async () => {
      return LitJsSdk.checkAndSignAuthMessage({
        chain: "ethereum",
      });
    });
    code = code.replace("// { ms }", `// { ${authRes.duration} }`);
    code = code.replace(
      "// { Loading... }",
      `// { ${JSON.stringify(authRes.result)} }`
    );
    setData(code);

    const accs = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "eth_getBalance",
        parameters: [":userAddress", "latest"],
        returnValueTest: {
          comparator: ">=",
          value: "0",
        },
      },
    ];

    console.log("NETWORK PUB KEY:", litNodeClient.networkPubKey);

    // --------- NEXT STEP ---------
    const encryptRes = await benchmark(async () => {
      return LitJsSdk.encryptString(
        {
          accessControlConditions: accs,
          authSig: authRes.result,
          chain: "ethereum",
          dataToEncrypt: str,
        },
        litNodeClient
      );
    });

    code = code.replace("// { ms }", `// { ${encryptRes.duration} }`);
    code = code.replace(
      "// { Loading... }",
      `// [string] { ${encryptRes.result.ciphertext} }`
    );
    code = code.replace(
      "// { Loading... }",
      `// [Uint8Array] { ${JSON.stringify(
        encryptRes.result.dataToEncryptHash
      )} }`
    );

    console.log("encryptRes.duration", encryptRes.duration);
    console.log("encryptRes.result.ciphertext", encryptRes.result.ciphertext);
    console.log(
      "JSON.stringify(encryptRes.result.dataToEncryptHash)",
      JSON.stringify(encryptRes.result.dataToEncryptHash)
    );

    setData(code);

    // --------- NEXT STEP ---------
    const decryptRes = await benchmark(async () => {
      return LitJsSdk.decryptToString(
        {
          accessControlConditions: accs,
          ciphertext: encryptRes.result.ciphertext,
          dataToEncryptHash: encryptRes.result.dataToEncryptHash,
          authSig: authRes.result,
          chain: "ethereum",
        },
        litNodeClient
      );
    });

    code = code.replace("// { ms }", `// { ${decryptRes.duration} }`);
    code = code.replace(
      "// { Loading... }",
      `// [string] ${decryptRes.result}`
    );
    code = code.replace('"Loading..."', `"${decryptRes.result}"`);

    console.log("decryptRes.duration", decryptRes.duration);
    console.log("decryptRes.result", decryptRes.result);

    setData(code);
  };

  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === "connected" && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>

      <div>
        <table>
          <tr>
            <td>
              <label>String</label>
            </td>
          </tr>
          <tr>
            <td>
              <input
                type="text"
                value={str}
                onChange={(newStr) => {
                  setStr(newStr.target.value);
                }}
              />
            </td>
          </tr>
        </table>
        <button onClick={go}>Encrypt & Decrypt String!</button>
      </div>
    </>
  );
}



export default App;
