# Supa SDK Demo

Demo application for **Supa SDK** with Privy.io and Canton Network integration examples.

## What's Inside

This demo showcases:

- Privy authentication (email, wallets, social networks)
- Stellar wallet creation for Canton Network
- Canton wallet registration on backend
- Test tokens from devnet faucet
- Transaction signing via Privy
- Supa Backend API integration
- Debug Panel - view all intermediate values (publicKey, hash, signature)

## Quick Start

### 1. Install Dependencies

```bash
cd demo
npm install
```

The SDK will be automatically installed from npm as `@supanovaapp/sdk`.

### 2. Environment Variables Setup

Create a `.env` file in the `demo` folder:

```env
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_PRIVY_CLIENT_ID=your_privy_client_id
VITE_API_BASE_URL=https://stage_api.supa.fyi
VITE_CANTON_NODE_ID=nodeId
```

> **Important**: Get Privy credentials at https://dashboard.privy.io

### 3. Run

```bash
npm run dev
```

Application will open at http://localhost:6969

## Development with Local SDK

If you want to test local changes to the SDK before publishing:

```bash
# From SDK root directory
npm run build && npm pack

# From demo directory
cd demo
npm install ../supa-sdk-0.1.0.tgz
npm run dev
```

## Project Structure

```
/demo
  /src
    - App.tsx           # Main component with full example
    - main.tsx          # Entry point
    - index.css         # Styles
  - vite.config.ts      # Vite configuration
  - package.json
  - README.md (this file)
```

## Demo Features

### 1. Step-by-Step Registration

Demo is divided into logical blocks:

```tsx
// Step 1: Login with Privy
<button onClick={() => auth.login()}>Login with Privy</button>

// Step 2: Register Canton (will automatically create Stellar)
<button onClick={() => canton.registerCanton()}>Register Canton</button>

// Step 3: Get test tokens
<button onClick={() => canton.tapDevnet('1000')}>Tap Devnet</button>
```

### 2. Debug Panel

Debug Panel shows all intermediate values:

- **publicKey** (hex from Privy)
- **publicKey** (base64 for Canton)
- **JWT Token** from Privy
- **hash** (from `/canton/register/prepare`)
- **signature** (after signing via Privy)

This helps developers understand what happens at each step.

### 3. Separate Test Buttons

Demo includes buttons for testing individual steps:

```tsx
// Test only /prepare
<button onClick={handleTestPrepareOnly}>
  Step 4: Test /prepare ONLY
</button>

// Test full flow prepare → sign → submit
<button onClick={handleTestPrepareSignSubmit}>
  Steps 4→5→6: prepare → sign → submit
</button>
```

## Vite Configuration

Demo uses the following Vite configuration:

```typescript
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['buffer'], // For Privy SDK compatibility
  },
});
```

> **Note**: Buffer polyfill is built into Supa SDK, no additional configuration required.

## Usage Examples

### Basic Login

```tsx
import { useAuth } from '@supa/sdk';

function LoginButton() {
  const { login, authenticated, user } = useAuth();

  return (
    <>
      {!authenticated ? (
        <button onClick={login}>Login</button>
      ) : (
        <p>Welcome, {user?.email?.address}!</p>
      )}
    </>
  );
}
```

### Canton Registration

```tsx
import { useCanton } from '@supa/sdk';

function RegisterCanton() {
  const { registerCanton, isRegistered, loading, error } = useCanton();

  return (
    <>
      {!isRegistered ? (
        <button onClick={registerCanton} disabled={loading}>
          Register Canton Wallet
        </button>
      ) : (
        <p>Canton wallet registered!</p>
      )}
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </>
  );
}
```

### Getting Test Tokens

```tsx
import { useCanton } from '@supa/sdk';

function TapDevnet() {
  const { tapDevnet, loading } = useCanton();

  const handleTap = async () => {
    try {
      const result = await tapDevnet('1000');
      console.log('Tap result:', result);
      alert('Tokens received!');
    } catch (err) {
      alert('Tap failed: ' + err.message);
    }
  };

  return (
    <button onClick={handleTap} disabled={loading}>
      Get Test Tokens
    </button>
  );
}
```

## Troubleshooting

### Error "Privy modal not opening"

Make sure that:
1. `VITE_PRIVY_APP_ID` is correct
2. Domain `localhost:6969` is added in Privy Dashboard
3. Correct `VITE_PRIVY_CLIENT_ID` is used

### Error "No Stellar wallet found"

Canton wallet requires a Stellar wallet. If wallet is not created automatically:

```tsx
const { createStellarWallet } = useCanton();
await createStellarWallet();
```

### Error "Canton wallet already exists"

Each user can have only **one** Canton wallet. For repeated testing:
- Use a different email for Privy login
- Or ask backend to delete existing Canton wallet

### CORS Errors

If you see CORS errors:
1. Check `VITE_API_BASE_URL`
2. Make sure backend API allows requests from `localhost:6969`

## Additional Resources

- **Main SDK README**: `/README.md` in project root
- **Privy Documentation**: https://docs.privy.io
- **Canton Network**: https://canton.network


## Working with Local SDK

Since this demo uses the local SDK version, when you make changes to the SDK source code:

```bash
# From SDK root directory, run the full command:
npm run build && npm pack && cd demo && rm -rf node_modules/@supa node_modules/.vite package-lock.json && npm i && npm run dev
```

This ensures clean rebuild and fresh dependencies.

## Developer Workflow

### 1. Testing from Scratch

```bash
# 1. Start demo
npm run dev

# 2. Open in browser
open http://localhost:6969

# 3. Follow UI:
#    - Login with Privy
#    - Register Canton Wallet
#    - Tap Devnet
#    - Check Debug Panel for details
```

### 2. Debugging Individual Steps

Use Debug Panel buttons:

- **"Test /prepare ONLY"** - check only transaction preparation
- **"prepare → sign → submit"** - check full registration flow

### 3. Viewing Logs

Open Console (F12) to view detailed logs:

```
[Supa SDK] Buffer polyfill initialized
[Stellar Utils] getStellarWallets
[Converters] Converting Privy publicKey to Canton base64
...
```

## Learning the SDK

Demo application is a great place to learn the SDK:

1. Read `src/App.tsx` - full integration example
2. See how hooks work: `useAuth`, `useCanton`
3. Study Debug Panel to understand data flow
4. Experiment with the code!

## Tips & Tricks

### Quick State Reset

To reset everything:
```bash
# Clear localStorage
localStorage.clear();

# Reload page
location.reload();
```

### Viewing JWT Token

Debug Panel shows:
- Raw JWT token from Privy
- Decoded payload (user ID, email, expiration)

### Copying Values

All values in Debug Panel can be copied for testing in Postman/Insomnia.

---

**Demo Version:** 0.1.0  
**SDK Version:** ^0.1.0  
**Vite:** 7+  
**React:** 19+

Happy coding!
