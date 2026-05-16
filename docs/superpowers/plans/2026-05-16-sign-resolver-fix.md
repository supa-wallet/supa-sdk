# Sign Resolver Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every signing path in the SDK go through `resolveSigningWalletFromCandidates` (the Canton-public-key-matching resolver), so multi-chain users never produce a "bad signature" by signing the prepared backend hash with the wrong wallet.

**Architecture:** Expose the existing `CantonProvider.resolveSigningWallet` (which already calls the pure pubkey-matching helper at `src/providers/canton/signingWalletResolver.ts:154`) via `CantonContextValue`. Wire the four standalone signing hooks (`useSendTransaction`, `useSendMultipleTransactions`, `useInitializationTransactions`, `useSignMessage`) to consume it via `useCantonContext()` instead of picking the wallet from `useCantonWallet()` + a `withExport`-flag chainType.

**Tech Stack:** TypeScript, React, Privy (`@privy-io/react-auth`, `@privy-io/react-auth/solana`, `@privy-io/react-auth/extended-chains`), Vite (SDK build), Bun (tg app install). Repos: `supa-sdk` (SDK), `supa-app` (tg app, sibling dir `../supa-app`).

---

## File Structure

**SDK files modified:**

- `src/providers/canton/types.ts` — add `resolveSigningWallet` + re-export `SigningWalletInfo` so consumers can type their callers
- `src/providers/CantonProvider.tsx` — expose `resolveSigningWallet` in `contextValue`
- `src/hooks/useSendTransaction.ts` — replace bare `cantonWallet.address` + hardcoded `'solana'` with resolver call
- `src/hooks/useSendMultipleTransactions.ts` — replace bare `cantonWallet.address` + `withExport`-derived chainType with resolver call (resolve once before the per-tx loop)
- `src/hooks/useInitializationTransactions.ts` — same as above
- `src/hooks/useSignMessage.ts` — replace bare `cantonWallet.address` + `cantonWallet.chainType` with resolver call
- `package.json` — version bump `0.2.45` → `0.2.46`

**SDK build artifact produced:** `supanovaapp-sdk-0.2.46.tgz` (via `npm pack`)

**tg app files modified:**

- `package.json` — bump dep range so caret resolves 0.2.46 (`^0.2.45` already does; the lockfile must be refreshed)
- `bun.lock` — refreshed via `bun install`
- `switch-sdk.sh` — bump `PACK_PATH` and `NPM_VERSION` constants to 0.2.46 so future dev toggles match

**Out of scope (left unchanged):**

- `src/providers/canton/signingWalletResolver.ts` — already correct, do not touch
- `src/hooks/useSignRawHashWithModal.ts` — already correct, picks Privy method off the chainType the caller passes
- `src/hooks/signing/signingHelpers.ts` — unchanged
- `CantonProvider.registerCanton` signFunction at `src/providers/CantonProvider.tsx:415-459` — the wallet identity there is the just-produced one whose `getPublicKeyBase64` was sent to the backend; chainType comes off that exact wallet, so it can't mismatch. Leave it.
- Tests — SDK has no test infrastructure (only `vite build` + `tsc --noEmit`). Verification is `type-check` per task + final build.

---

## Task 1: Expose `resolveSigningWallet` via `CantonContextValue`

**Files:**
- Modify: `src/providers/canton/types.ts:32-125`
- Modify: `src/providers/CantonProvider.tsx:1013-1041`

- [ ] **Step 1: Add `SigningWalletInfo` import + `resolveSigningWallet` field to `CantonContextValue`**

Edit `src/providers/canton/types.ts`. At the top of the file, after the `CantonWallet` import, add an import for `SigningWalletInfo`:

```ts
import type { SigningWalletInfo } from './signingWalletResolver';
```

Then inside the `CantonContextValue` interface, right after the `signHash` declaration (currently at line 67-68), add the new method:

```ts
  /**
   * Resolve the signing wallet by matching `cantonUser.publicKey` against
   * available Privy wallets (stellar + solana). Returns the wallet whose
   * derived Canton public key matches the registered one, falling back to
   * the configured default chain when no match is possible.
   *
   * Use this from any hook that needs to sign a prepared Canton hash, to
   * avoid the "bad signature" failure mode where the wrong-chain wallet
   * signs a backend hash prepared for a different public key.
   */
  resolveSigningWallet: () => Promise<SigningWalletInfo>;
```

- [ ] **Step 2: Add `resolveSigningWallet` to `contextValue` object in `CantonProvider`**

Edit `src/providers/CantonProvider.tsx`. The `resolveSigningWallet` callback is already defined at line 113-132. Add it to the `contextValue` object literal at line 1013-1041. Place it next to `signHash`:

```ts
  const contextValue: CantonContextValue = {
    cantonWallet,
    cantonWallets,
    createCantonWallet,
    registerCanton,
    isRegistered,
    cantonUser,
    getMe,
    getActiveContracts,
    cantonBalances,
    getBalances,
    tapDevnet,
    resolveSigningWallet,
    signHash,
    signMessage,
    sendTransaction,
    sendCantonCoin,
    calculateTransferFee,
    setupTransferPreapproval,
    getPendingIncomingTransfers,
    respondToIncomingTransfer,
    getTransactions,
    getPriceHistory,
    resetState,
    loading,
    error,
    clearError,
  };
```

- [ ] **Step 3: Type-check**

Run from `supa-sdk/`:

```bash
npm run type-check
```

Expected: exits 0, no errors.

- [ ] **Step 4: Commit**

```bash
git -C /Users/molodcovdanila/Documents/webdev/supa-sdk add src/providers/canton/types.ts src/providers/CantonProvider.tsx
git -C /Users/molodcovdanila/Documents/webdev/supa-sdk commit -m "feat(canton): expose resolveSigningWallet via CantonContext"
```

---

## Task 2: Fix `useSendTransaction` to resolve wallet by Canton pubkey

**Files:**
- Modify: `src/hooks/useSendTransaction.ts:1-161`

- [ ] **Step 1: Replace hardcoded chainType + bare cantonWallet with resolver call**

Edit `src/hooks/useSendTransaction.ts`.

a) Update the imports block at the top. Add `useCantonContext` import (path is the same file CantonProvider re-exports from). Replace:

```ts
import { useSupaContext } from '../providers/SupaProvider';
import { useSignRawHashWithModal } from './useSignRawHashWithModal';
import { useCantonWallet } from './useCantonWallet';
```

with:

```ts
import { useSupaContext } from '../providers/SupaProvider';
import { useCantonContext } from '../providers/CantonProvider';
import { useSignRawHashWithModal } from './useSignRawHashWithModal';
import { useCantonWallet } from './useCantonWallet';
```

b) Inside `useSendTransaction()`, after the existing `const { cantonWallet, cantonWallets } = useCantonWallet();` line (currently line 52), add:

```ts
  const { resolveSigningWallet } = useCantonContext();
```

(Keep `useCantonWallet()` because the hook's return value still exposes `cantonWallets` / `cantonWallet` to consumers via `UseSendTransactionReturn`.)

c) Inside the `sendTransaction` callback body, before the `cantonService.prepareTransaction(...)` call (currently line 92), insert a resolver call and use its result instead of `cantonWallet.address` + `'solana'`:

Before:

```ts
        // Step 3: Sign hash with automatic modal
        const hashHex = base64ToHex(prepareResponse.hash);
        const signResult = await signRawHashWithModal(
          { address: cantonWallet.address, chainType: 'solana', hash: hashHex as `0x${string}` },
          {
```

After:

```ts
        // Step 3: Sign hash with automatic modal
        const { wallet: signingWallet, chainType: signingChainType } =
          await resolveSigningWallet();
        const hashHex = base64ToHex(prepareResponse.hash);
        const signResult = await signRawHashWithModal(
          {
            address: signingWallet.address,
            chainType: signingChainType,
            hash: hashHex as `0x${string}`,
          },
          {
```

d) Update the `useCallback` dependency array at the bottom of the callback (currently line 150). Replace:

```ts
    [cantonWallet, signRawHashWithModal, cantonService]
```

with:

```ts
    [cantonWallet, resolveSigningWallet, signRawHashWithModal, cantonService]
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git -C /Users/molodcovdanila/Documents/webdev/supa-sdk add src/hooks/useSendTransaction.ts
git -C /Users/molodcovdanila/Documents/webdev/supa-sdk commit -m "fix(sign): useSendTransaction resolves wallet via Canton pubkey"
```

---

## Task 3: Fix `useSendMultipleTransactions` to resolve wallet by Canton pubkey

**Files:**
- Modify: `src/hooks/useSendMultipleTransactions.ts:86-298`

- [ ] **Step 1: Wire resolver, resolve once before the per-tx sign loop**

Edit `src/hooks/useSendMultipleTransactions.ts`.

a) Add the `useCantonContext` import alongside the existing imports near the top of the file:

```ts
import { useCantonContext } from '../providers/CantonProvider';
```

b) Inside `useSendMultipleTransactions()`, after `const { cantonWallet, cantonWallets } = useCantonWallet();` (currently line 89), add:

```ts
  const { resolveSigningWallet } = useCantonContext();
```

c) Replace the `config.withExport`-derived chainType + bare-address block (currently lines 183-193) with a single resolver call placed before the sign loop. Before:

```ts
        // Step 4: Sign sequentially to avoid wallet/provider concurrency issues
        const chainType = config.withExport ? 'solana' : 'stellar';
        const signedTxs: CantonSubmitRegisterRequestDto[] = [];

        for (let i = 0; i < prepared.length; i++) {
          const p = prepared[i]!;
          try {
            const hashHex = base64ToHex(p.hash);
            const signResult = await signRawHashWithModal(
              { address: cantonWallet.address, chainType, hash: hashHex as `0x${string}` },
              { skipModal: true }
            );
```

After:

```ts
        // Step 4: Sign sequentially to avoid wallet/provider concurrency issues.
        // Resolve the signing wallet once via Canton pubkey match so every tx
        // in the batch is signed with the same key the backend prepared against.
        const { wallet: signingWallet, chainType: signingChainType } =
          await resolveSigningWallet();
        const signedTxs: CantonSubmitRegisterRequestDto[] = [];

        for (let i = 0; i < prepared.length; i++) {
          const p = prepared[i]!;
          try {
            const hashHex = base64ToHex(p.hash);
            const signResult = await signRawHashWithModal(
              {
                address: signingWallet.address,
                chainType: signingChainType,
                hash: hashHex as `0x${string}`,
              },
              { skipModal: true }
            );
```

d) Update the `useCallback` deps array (currently line 298). Replace:

```ts
    [cantonService, cantonWallet, config.withExport, signRawHashWithModal, signTransactionConfirm]
```

with:

```ts
    [cantonService, cantonWallet, resolveSigningWallet, signRawHashWithModal, signTransactionConfirm]
```

(Drop `config.withExport` — no longer used inside the callback.)

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git -C /Users/molodcovdanila/Documents/webdev/supa-sdk add src/hooks/useSendMultipleTransactions.ts
git -C /Users/molodcovdanila/Documents/webdev/supa-sdk commit -m "fix(sign): useSendMultipleTransactions resolves wallet via Canton pubkey"
```

---

## Task 4: Fix `useInitializationTransactions` to resolve wallet by Canton pubkey

**Files:**
- Modify: `src/hooks/useInitializationTransactions.ts:1-118`

- [ ] **Step 1: Wire resolver, drop withExport-derived chainType**

Edit `src/hooks/useInitializationTransactions.ts`.

a) Add the `useCantonContext` import:

```ts
import { useCantonContext } from '../providers/CantonProvider';
```

b) Inside `useInitializationTransactions()`, after `const { cantonWallet } = useCantonWallet();` (currently line 28), add:

```ts
  const { resolveSigningWallet } = useCantonContext();
```

c) Replace the chainType derivation + bare-address sign call (currently lines 55-66). Before:

```ts
      const chainType = config.withExport ? 'solana' : 'stellar';
      console.log('[Init Txs] Chain type:', chainType);

      // Sign sequentially to avoid wallet/provider concurrency issues.
      const signedTxs: CantonSubmitRegisterRequestDto[] = [];
      for (const tx of prepared) {
        console.log('[Init Txs] Signing transaction:', tx.hash);
        const hashHex = base64ToHex(tx.hash);
        const signResult = await signRawHashWithModal(
          { address: cantonWallet.address, chainType, hash: hashHex as `0x${string}` },
          { skipModal: true }
        );
```

After:

```ts
      // Resolve the signing wallet via Canton pubkey match so the batch is
      // signed with the same wallet the backend's prepared hashes target.
      const { wallet: signingWallet, chainType: signingChainType } =
        await resolveSigningWallet();
      console.log('[Init Txs] Signing wallet:', signingWallet.address, 'chain:', signingChainType);

      // Sign sequentially to avoid wallet/provider concurrency issues.
      const signedTxs: CantonSubmitRegisterRequestDto[] = [];
      for (const tx of prepared) {
        console.log('[Init Txs] Signing transaction:', tx.hash);
        const hashHex = base64ToHex(tx.hash);
        const signResult = await signRawHashWithModal(
          {
            address: signingWallet.address,
            chainType: signingChainType,
            hash: hashHex as `0x${string}`,
          },
          { skipModal: true }
        );
```

d) Update the `useCallback` deps (currently line 114). Replace:

```ts
  }, [cantonWallet, cantonService, config.withExport, signRawHashWithModal]);
```

with:

```ts
  }, [cantonWallet, cantonService, resolveSigningWallet, signRawHashWithModal]);
```

(Drop `config.withExport` — no longer used.)

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git -C /Users/molodcovdanila/Documents/webdev/supa-sdk add src/hooks/useInitializationTransactions.ts
git -C /Users/molodcovdanila/Documents/webdev/supa-sdk commit -m "fix(sign): useInitializationTransactions resolves wallet via Canton pubkey"
```

---

## Task 5: Fix `useSignMessage` to resolve wallet by Canton pubkey

**Files:**
- Modify: `src/hooks/useSignMessage.ts:1-120`

- [ ] **Step 1: Wire resolver, drop bare cantonWallet.chainType**

Edit `src/hooks/useSignMessage.ts`.

a) Add the `useCantonContext` import:

```ts
import { useCantonContext } from '../providers/CantonProvider';
```

b) Inside `useSignMessage()`, after `const { cantonWallet, cantonWallets } = useCantonWallet();` (currently line 40), add:

```ts
  const { resolveSigningWallet } = useCantonContext();
```

c) Inside the `signFunction` (currently lines 73-90), resolve the wallet at the top and pass its identity to `signRawHashWithModal`. Before:

```ts
        const signFunction = async (hashHex: string): Promise<string> => {
          const result = await signRawHashWithModal(
            { address: cantonWallet.address, chainType: cantonWallet.chainType, hash: hashHex as `0x${string}` },
            {
              skipModal,
              title,
              description,
              confirmText,
              rejectText,
              infoText: 'Signing a message proves ownership of your wallet without exposing private keys or making any blockchain transactions.',
              displayHash: showTechnicalDetails ? undefined : (displayContent || message),
              showTechnicalDetails,
            }
          );

          if (!result) throw new Error('User rejected signature');
          return result.signature;
        };
```

After:

```ts
        const signFunction = async (hashHex: string): Promise<string> => {
          const { wallet: signingWallet, chainType: signingChainType } =
            await resolveSigningWallet();
          const result = await signRawHashWithModal(
            {
              address: signingWallet.address,
              chainType: signingChainType,
              hash: hashHex as `0x${string}`,
            },
            {
              skipModal,
              title,
              description,
              confirmText,
              rejectText,
              infoText: 'Signing a message proves ownership of your wallet without exposing private keys or making any blockchain transactions.',
              displayHash: showTechnicalDetails ? undefined : (displayContent || message),
              showTechnicalDetails,
            }
          );

          if (!result) throw new Error('User rejected signature');
          return result.signature;
        };
```

d) Update the `useCallback` deps (currently line 109). Replace:

```ts
    [cantonWallet, signRawHashWithModal, cantonService]
```

with:

```ts
    [cantonWallet, resolveSigningWallet, signRawHashWithModal, cantonService]
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git -C /Users/molodcovdanila/Documents/webdev/supa-sdk add src/hooks/useSignMessage.ts
git -C /Users/molodcovdanila/Documents/webdev/supa-sdk commit -m "fix(sign): useSignMessage resolves wallet via Canton pubkey"
```

---

## Task 6: Bump SDK version, build, pack tgz

**Files:**
- Modify: `package.json:3`
- Generated: `supanovaapp-sdk-0.2.46.tgz` (in `supa-sdk/`)

- [ ] **Step 1: Bump version**

Edit `package.json`. Change:

```json
    "version": "0.2.45",
```

to:

```json
    "version": "0.2.46",
```

- [ ] **Step 2: Type-check (full sweep)**

```bash
npm run type-check
```

Expected: exits 0.

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: Vite produces `dist/index.esm.js`, `dist/index.cjs.js`, `dist/index.d.ts`. Exits 0.

- [ ] **Step 4: Pack tgz**

```bash
npm pack
```

Expected: produces `supanovaapp-sdk-0.2.46.tgz` in `supa-sdk/` working dir.

- [ ] **Step 5: Commit version + dist (if dist is tracked) and tag**

Check whether `dist/` is gitignored:

```bash
git -C /Users/molodcovdanila/Documents/webdev/supa-sdk check-ignore dist
```

If `dist` prints (i.e. ignored), only stage `package.json`. Otherwise also stage `dist/`. Then:

```bash
git -C /Users/molodcovdanila/Documents/webdev/supa-sdk add package.json
# (and `git add dist` if dist is NOT ignored)
git -C /Users/molodcovdanila/Documents/webdev/supa-sdk commit -m "chore(release): 0.2.46"
```

Tag locally (matches the commit-only-version pattern from prior bumps like `bfe9a38 0.2.45`):

```bash
git -C /Users/molodcovdanila/Documents/webdev/supa-sdk tag v0.2.46
```

(Do NOT `git push --force` or push tags here — user pushes/publishes manually.)

---

## Task 7: Bump SDK in tg app

**Files:**
- Modify: `../supa-app/package.json` (`"@supanovaapp/sdk"` range)
- Modify: `../supa-app/switch-sdk.sh` (PACK_PATH, NPM_VERSION constants)
- Refreshed: `../supa-app/bun.lock`

- [ ] **Step 1: Update `switch-sdk.sh` constants to 0.2.46**

Edit `/Users/molodcovdanila/Documents/webdev/supa-app/switch-sdk.sh`. Replace lines:

```bash
PACK_PATH="file:../supanovaapp-sdk-0.2.17.tgz"
NPM_VERSION="^0.2.17"
```

with:

```bash
PACK_PATH="file:../supa-sdk/supanovaapp-sdk-0.2.46.tgz"
NPM_VERSION="^0.2.46"
```

(The original `PACK_PATH` looks for the tgz one dir above `supa-app/`. The new path points to the SDK working dir where `npm pack` from Task 6 dropped it. Both repos are siblings under `webdev/`.)

- [ ] **Step 2: Update `package.json` dep range to `^0.2.46`**

Edit `/Users/molodcovdanila/Documents/webdev/supa-app/package.json`. Change:

```json
    "@supanovaapp/sdk": "^0.2.45",
```

to:

```json
    "@supanovaapp/sdk": "^0.2.46",
```

- [ ] **Step 3: Refresh lockfile**

The published-to-npm path is the user's responsibility (`npm publish` from `supa-sdk/`). For local verification before publish, switch to pack mode:

```bash
cd /Users/molodcovdanila/Documents/webdev/supa-app
./switch-sdk.sh pack
bun install
```

After the user runs `npm publish` and the package is live, switch back:

```bash
cd /Users/molodcovdanila/Documents/webdev/supa-app
./switch-sdk.sh npm
bun install
```

Expected: `bun install` exits 0, `bun.lock` updated to reference `@supanovaapp/sdk@0.2.46`.

- [ ] **Step 4: Type-check app**

```bash
cd /Users/molodcovdanila/Documents/webdev/supa-app
npx tsc --noEmit
```

Expected: exits 0. (No app-side code touches the affected hooks' signatures — only `useInitializationTransactions` is consumed, and its public return shape is unchanged.)

- [ ] **Step 5: Commit app changes**

```bash
git -C /Users/molodcovdanila/Documents/webdev/supa-app add package.json bun.lock switch-sdk.sh
git -C /Users/molodcovdanila/Documents/webdev/supa-app commit -m "chore(deps): bump @supanovaapp/sdk to 0.2.46 (sign resolver fix)"
```

---

## Verification Checklist (post-implementation)

These are NOT new tasks — they're checks the user requested be skipped at the test level. Listed for awareness only:

- All 4 hooks compile against the new context shape ✓ (covered by per-task `npm run type-check`).
- App compiles against the new SDK ✓ (covered by Task 7 Step 4).
- No remaining `cantonWallet.address` direct usage at signing sites in `src/hooks/use*.ts`. To self-audit after the fact, run from `supa-sdk/`:
  ```bash
  grep -n "cantonWallet.address\|chainType: 'solana'\|chainType: 'stellar'\|config.withExport.*solana.*stellar\|withExport ? 'solana' : 'stellar'" src/hooks/*.ts
  ```
  Expected: zero matches inside any function body that calls `signRawHashWithModal` (the display-only `cantonWallet.address` references in `useCantonWallet`'s consumers are fine; this audit is scoped to `src/hooks/use{SendTransaction,SendMultipleTransactions,InitializationTransactions,SignMessage}.ts`).

---

## Notes / Gotchas for the Implementer

- **`useCantonContext` must be available where the hooks are called.** The hooks `use*` already require `SupaProvider` (which mounts `CantonProvider`), so this is satisfied transitively by every existing consumer. No changes to provider tree needed.
- **Why we don't touch `registerCanton`'s inline sign function.** The signing wallet there *is* the one whose `getPublicKeyBase64` was just sent to the backend, so the wallet+chainType are inherently consistent. Adding a resolver call there is harmless but adds a state-read race (resolver reads `cantonUser.publicKey`, which isn't set until *after* registration). Out of scope.
- **`cantonWallet` is still in deps.** We keep it referenced in the `useCallback` dependency arrays because the hooks' return value includes `cantonWallet` / `cantonWallets` for display purposes. Removing it from deps would skip re-renders when wallets change.
- **No DB / migration / external-service interactions.** This is pure client-side code rewiring.
