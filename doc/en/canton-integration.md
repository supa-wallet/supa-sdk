# Canton Network Integration

Detailed guide for Canton Network integration via Supa SDK.

## Table of Contents

- [What is Canton Network](#what-is-canton-network)
- [Why Stellar](#why-stellar)
- [Integration Architecture](#integration-architecture)
- [Key Conversion](#key-conversion)
- [Wallet Registration](#wallet-registration)
- [Transaction Signing](#transaction-signing)
- [Devnet Faucet](#devnet-faucet)
- [Advanced Usage](#advanced-usage)

---

## What is Canton Network

**Canton Network** is a distributed network for data synchronization and smart contract execution. The SDK integrates with Canton through Supa Backend API.

### Key Features

- **Ed25519 Signing** - Canton uses Ed25519 for cryptography
- **Base64 Format** - Canton API accepts data in base64
- **Stellar Wallets** - Privy uses Stellar for Ed25519 signing
- **Automatic Conversion** - SDK automatically converts formats

---

## Why Stellar

Canton Network requires **Ed25519** signatures. Privy.io provides Ed25519 through the **Stellar chain type**.

```
Canton (Ed25519) ← SDK ← Privy (Stellar = Ed25519)
```

### Advantages of Stellar in this Context

1. **Native Ed25519** - Stellar uses Ed25519 for all keys
2. **Privy Support** - full integration via `@privy-io/react-auth/extended-chains`
3. **Raw Hash Signing** - ability to sign arbitrary hashes
4. **Compatibility** - Stellar public keys are compatible with Canton

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Your Application                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Supa SDK                               │   │
│  │                                                     │   │
│  │  useAuth()  useCanton()  useAPI()                 │   │
│  └──────────────┬────────────────┬──────────────────┬─┘   │
└─────────────────┼────────────────┼──────────────────┼─────┘
                  │                │                  │
         ┌────────▼────────┐  ┌───▼────────┐  ┌─────▼──────┐
         │  Privy.io       │  │  Stellar   │  │   Supa     │
         │  Authentication │  │  Wallet    │  │   Backend  │
         └─────────────────┘  └────────────┘  └────────────┘
                                     │              │
                                     │              │
                              ┌──────▼──────────────▼──────┐
                              │    Canton Network          │
                              │    (Ed25519)               │
                              └────────────────────────────┘
```

### Component Responsibilities

1. **Supa SDK** - provides convenient hooks and automatic format conversion
2. **Privy.io** - authentication and wallet management
3. **Stellar Wallet** - Ed25519 key generation and signing
4. **Supa Backend** - Canton Network interface
5. **Canton Network** - distributed ledger and smart contracts

---

## Key Conversion

Canton Network uses **base64** format for public keys, while Privy returns keys in **hex** format.

### Conversion Process

```typescript
// Privy public key (hex with leading 00)
const privyPublicKey = "00e95cb2553361ed95250c74f854814675d971cacdbd5dc3ec5de627fff7b71518";

// Step 1: Remove leading 00
const cleanHex = "e95cb2553361ed95250c74f854814675d971cacdbd5dc3ec5de627fff7b71518";

// Step 2: Convert hex → bytes
const bytes = new Uint8Array(
  cleanHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
);

// Step 3: Convert bytes → base64
const base64 = Buffer.from(bytes).toString('base64');
// Result: "6Vyy...Hhg="
```

### SDK Implementation

SDK automatically handles this conversion:

```tsx
import { privyPublicKeyToCantonBase64 } from '@supa/sdk';

const wallet = stellarWallet; // from useCanton()
const publicKeyBase64 = privyPublicKeyToCantonBase64(wallet.publicKey);

// Ready to send to Canton API
console.log(publicKeyBase64); // "6Vyy...Hhg="
```

### Hash Conversion

Hashes also require conversion between formats:

```tsx
import { base64ToHex, hexToBase64 } from '@supa/sdk';

// Canton sends hash in base64
const cantonHash = "EiDjNqHetYYin8ypx87LAmJwzxhBX4rFMi4Z/sSsvdQ7bg==";

// Convert to hex for Privy signing
const hashHex = base64ToHex(cantonHash);
// "0x1220e336a1deb58622..."

// After signing, convert signature back to base64 for Canton
const signatureHex = "0xabcd1234...";
const signatureBase64 = hexToBase64(signatureHex);
```

---

## Wallet Registration

### Automatic Registration Flow

```tsx
import { useCanton } from '@supa/sdk';

function RegisterButton() {
  const { registerCanton, isRegistered, loading } = useCanton();

  if (isRegistered) {
    return <div>Already registered</div>;
  }

  return (
    <button onClick={registerCanton} disabled={loading}>
      {loading ? 'Registering...' : 'Register Canton Wallet'}
    </button>
  );
}
```

### What Happens Under the Hood

```typescript
async function registerCanton() {
  // 1. Check/create Stellar wallet
  let wallet = stellarWallet;
  if (!wallet) {
    wallet = await createStellarWallet();
  }

  // 2. Convert public key to base64
  const publicKey = privyPublicKeyToCantonBase64(wallet.publicKey);

  // 3. Call /canton/register/prepare
  const { hash } = await api.post('/canton/register/prepare', { publicKey });

  // 4. Convert hash from base64 to hex
  const hashHex = base64ToHex(hash);

  // 5. Sign hash via Privy (Stellar chainType)
  const { signature } = await signRawHash({
    address: wallet.address,
    chainType: 'stellar',
    hash: hashHex,
  });

  // 6. Convert signature to base64
  const signatureBase64 = hexToBase64(signature);

  // 7. Submit to /canton/register/submit
  await api.post('/canton/register/submit', { signature: signatureBase64 });
}
```

### Manual Registration (Advanced)

```tsx
import { useCanton, useAPI } from '@supa/sdk';
import { privyPublicKeyToCantonBase64, base64ToHex, hexToBase64 } from '@supa/sdk';
import { useSignRawHash } from '@privy-io/react-auth/extended-chains';

function ManualRegister() {
  const { stellarWallet } = useCanton();
  const api = useAPI();
  const { signRawHash } = useSignRawHash();

  const handleRegister = async () => {
    if (!stellarWallet) {
      alert('No Stellar wallet');
      return;
    }

    try {
      // Prepare
      const publicKey = privyPublicKeyToCantonBase64(stellarWallet.publicKey);
      const prepareResponse = await fetch(`${API_URL}/canton/register/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey }),
      });
      const { hash } = await prepareResponse.json();

      // Sign
      const hashHex = base64ToHex(hash);
      const result = await signRawHash({
        address: stellarWallet.address,
        chainType: 'stellar',
        hash: hashHex as `0x${string}`,
      });

      // Submit
      const signatureBase64 = hexToBase64(result.signature);
      await fetch(`${API_URL}/canton/register/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: signatureBase64 }),
      });

      alert('Registered successfully!');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return <button onClick={handleRegister}>Manual Register</button>;
}
```

---

## Transaction Signing

### Sign Arbitrary Hash

Canton Network may require signing arbitrary hashes for transactions.

```tsx
import { useCanton } from '@supa/sdk';

function SignTransaction() {
  const { signHash } = useCanton();

  const handleSign = async () => {
    // Hash from Canton (base64)
    const cantonHash = "EiDjNqHetYYin8ypx87LAmJwzxhBX4rFMi4Z/sSsvdQ7bg==";
    
    try {
      // SDK automatically handles conversion
      const signature = await signHash(cantonHash);
      
      // signature is in base64, ready for Canton
      console.log('Signature:', signature);
      
      // Send signature to Canton
      await sendToCantonAPI(signature);
    } catch (err) {
      console.error('Signing failed:', err);
    }
  };

  return <button onClick={handleSign}>Sign Transaction</button>;
}
```

### Sign with Additional Data

```tsx
import { useCanton } from '@supa/sdk';
import { base64ToHex, hexToBase64 } from '@supa/sdk';
import { useSignRawHash } from '@privy-io/react-auth/extended-chains';

function SignWithMetadata() {
  const { stellarWallet } = useCanton();
  const { signRawHash } = useSignRawHash();

  const signTransaction = async (txData: any) => {
    if (!stellarWallet) return;

    // Prepare transaction
    const response = await fetch('/api/canton/transaction/prepare', {
      method: 'POST',
      body: JSON.stringify(txData),
    });
    const { hash, metadata } = await response.json();

    // Sign
    const hashHex = base64ToHex(hash);
    const result = await signRawHash({
      address: stellarWallet.address,
      chainType: 'stellar',
      hash: hashHex as `0x${string}`,
    });

    // Submit
    const signature = hexToBase64(result.signature);
    await fetch('/api/canton/transaction/submit', {
      method: 'POST',
      body: JSON.stringify({ signature, metadata }),
    });
  };

  return (
    <button onClick={() => signTransaction({ amount: '100', recipient: 'addr123' })}>
      Send Transaction
    </button>
  );
}
```

---

## Devnet Faucet

Canton devnet provides a faucet for test tokens.

### Get Test Tokens

```tsx
import { useCanton } from '@supa/sdk';

function GetTokens() {
  const { tapDevnet, loading, error } = useCanton();

  const handleTap = async () => {
    try {
      const result = await tapDevnet('1000');
      console.log('Tap result:', result);
      alert('Received 1000 test tokens!');
    } catch (err) {
      console.error('Tap failed:', err);
    }
  };

  return (
    <>
      <button onClick={handleTap} disabled={loading}>
        {loading ? 'Getting tokens...' : 'Get 1000 Test Tokens'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </>
  );
}
```

### Custom Amount

```tsx
import { useCanton } from '@supa/sdk';
import { useState } from 'react';

function CustomTap() {
  const { tapDevnet, loading } = useCanton();
  const [amount, setAmount] = useState('1000');

  const handleTap = async () => {
    const result = await tapDevnet(amount);
    alert(`Received ${amount} tokens!`);
  };

  return (
    <div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />
      <button onClick={handleTap} disabled={loading}>
        Get Tokens
      </button>
    </div>
  );
}
```

---

## Advanced Usage

### Check Registration Status

```tsx
import { useCanton, useAPI } from '@supa/sdk';
import { useEffect, useState } from 'react';

function RegistrationStatus() {
  const { isRegistered } = useCanton();
  const api = useAPI();
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (isRegistered) {
      // Load additional details if needed
      loadCantonDetails();
    }
  }, [isRegistered]);

  const loadCantonDetails = async () => {
    try {
      const data = await fetch('/api/canton/status').then(r => r.json());
      setDetails(data);
    } catch (err) {
      console.error('Failed to load details:', err);
    }
  };

  return (
    <div>
      <p>Status: {isRegistered ? 'Registered' : 'Not Registered'}</p>
      {details && <pre>{JSON.stringify(details, null, 2)}</pre>}
    </div>
  );
}
```

### Multiple Stellar Wallets

```tsx
import { useCanton } from '@supa/sdk';

function MultiWallet() {
  const { stellarWallets, createStellarWallet } = useCanton();

  const addWallet = async () => {
    const newWallet = await createStellarWallet();
    console.log('Created wallet:', newWallet?.address);
  };

  return (
    <div>
      <h3>Your Wallets ({stellarWallets.length})</h3>
      {stellarWallets.map((wallet, idx) => (
        <div key={wallet.address}>
          <span>Wallet {idx + 1}:</span>
          <code>{wallet.address}</code>
        </div>
      ))}
      <button onClick={addWallet}>Add Wallet</button>
    </div>
  );
}
```

### Custom Signing Logic

```tsx
import { useSignRawHash } from '@privy-io/react-auth/extended-chains';
import { useCanton } from '@supa/sdk';
import { base64ToHex, hexToBase64 } from '@supa/sdk';

function CustomSigning() {
  const { stellarWallet } = useCanton();
  const { signRawHash } = useSignRawHash();

  const signCustomData = async (data: string) => {
    if (!stellarWallet) return;

    // Create hash from data
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Sign
    const result = await signRawHash({
      address: stellarWallet.address,
      chainType: 'stellar',
      hash: hashHex as `0x${string}`,
    });

    return hexToBase64(result.signature);
  };

  const handleSign = async () => {
    const signature = await signCustomData('Hello Canton!');
    console.log('Signature:', signature);
  };

  return <button onClick={handleSign}>Sign Custom Data</button>;
}
```

---

## Troubleshooting

### "No Stellar wallet found"

**Solution**: Wallet creation might be in progress. Wait or create explicitly:

```tsx
const { stellarWallet, createStellarWallet } = useCanton();

if (!stellarWallet) {
  await createStellarWallet();
}
```

### "Failed to register Canton wallet"

**Possible causes**:
1. Backend API is unavailable
2. Signature is invalid
3. Wallet is already registered

**Solution**: Check console for detailed error message.

### "Invalid signature format"

**Solution**: Ensure proper format conversion:

```tsx
// Correct
const hashHex = base64ToHex(cantonHashBase64);
const signature = await signRawHash({ hash: hashHex as `0x${string}` });
const signatureBase64 = hexToBase64(signature.signature);

// Incorrect - missing conversion
const signature = await signRawHash({ hash: cantonHashBase64 }); // Wrong!
```

### Signature Verification Failed

**Causes**:
1. Wrong public key sent to Canton
2. Hash modified between prepare and submit
3. Different wallet used for signing

**Solution**: Ensure the same wallet is used throughout the process.

---

## Best Practices

1. **Always check registration status** before attempting Canton operations
2. **Handle errors gracefully** - network issues are common
3. **Cache Stellar wallet** - avoid recreating on every render
4. **Use TypeScript** - types help prevent format errors
5. **Test on devnet first** - before moving to production

---

**Last Updated**: December 2025  
**SDK Version**: 0.1.0  
**Canton Network**: Ed25519 via Stellar
