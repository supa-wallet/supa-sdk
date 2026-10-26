import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { confirmThenSign } from '../hooks/signing/confirmBeforeSign.ts';
import { preparedTransactionDisplay } from '../utils/preparedTransactionDisplay.ts';

const SRC = join(import.meta.dirname, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

test('confirmThenSign signs only after an explicit approval', async () => {
  let signed = 0;
  const sign = async () => {
    signed += 1;
    return 'sig';
  };

  assert.equal(await confirmThenSign(async () => ({ confirmed: false }), sign), null);
  assert.equal(signed, 0);

  // A malformed or missing result is a rejection, never an approval.
  assert.equal(await confirmThenSign(async () => ({}) as { confirmed: boolean }, sign), null);
  assert.equal(await confirmThenSign(async () => undefined as unknown as { confirmed: boolean }, sign), null);
  assert.equal(signed, 0);

  assert.equal(await confirmThenSign(async () => ({ confirmed: true }), sign), 'sig');
  assert.equal(signed, 1);
});

test('confirmThenSign does not sign when the prompt throws', async () => {
  let signed = 0;
  await assert.rejects(
    confirmThenSign(
      async () => {
        throw new Error('modal failed');
      },
      async () => {
        signed += 1;
      }
    )
  );
  assert.equal(signed, 0);
});

test('the raw no-UI signer is not part of the public API', () => {
  const index = readFileSync(join(SRC, 'index.ts'), 'utf8');
  assert.doesNotMatch(index, /useRawHashSigner|signRawHashAfterConfirmation|signing\/useRawHashSigner/);
  assert.doesNotMatch(index, /export \* from '\.\/hooks/);
});

test('only modules that show a confirmation first use the raw signer', () => {
  const allowed = new Set([
    'hooks/signing/useRawHashSigner.ts',
    'hooks/useSignRawHashWithModal.ts',
    'hooks/useSendMultipleTransactions.ts',
    'hooks/useInitializationTransactions.ts',
    'providers/CantonProvider.tsx',
  ]);
  for (const file of sourceFiles(SRC)) {
    const rel = relative(SRC, file);
    const text = readFileSync(file, 'utf8');
    if (text.includes('useRawHashSigner')) {
      assert.ok(allowed.has(rel), `${rel} uses the raw signer without review`);
    }
    // Every raw-signer call site must sit next to a confirmation prompt.
    if (text.includes('signRawHashAfterConfirmation(') && rel !== 'hooks/signing/useRawHashSigner.ts') {
      assert.match(text, /signTransactionConfirm\(/, `${rel} signs without a confirmation prompt`);
    }
  }
});

test('no code path passes skipModal: true or reads skipModal', () => {
  for (const file of sourceFiles(SRC)) {
    const text = readFileSync(file, 'utf8')
      // Strip the deprecated field declarations; only usage counts.
      .replace(/skipModal\?: boolean;/g, '');
    assert.doesNotMatch(text, /skipModal/, `${relative(SRC, file)} still uses skipModal`);
  }
});

test('prepared transaction display always shows the commands, fee and hash', () => {
  const commands = [{ ExerciseCommand: { templateId: 'T', choice: 'Transfer', choiceArgument: { amount: '5' } } }];
  const text = preparedTransactionDisplay(
    { hash: 'aGFzaA==', networkFee: { amount: '0.1', receiver: 'fee::party' } as never },
    'Totally harmless sign-in',
    false,
    commands
  );
  assert.match(text, /Totally harmless sign-in/);
  assert.match(text, /"choice": "Transfer"/);
  assert.match(text, /fee: 0.1 CC/);
  assert.match(text, /Paid to: fee::party/);
  assert.match(text, /Transaction Hash: aGFzaA==/);
});

test('backend effectiveCommands win over the caller-submitted commands', () => {
  const text = preparedTransactionDisplay(
    { hash: 'h', effectiveCommands: [{ decorated: true }] },
    undefined,
    false,
    [{ submitted: true }]
  );
  assert.match(text, /"decorated": true/);
  assert.doesNotMatch(text, /"submitted"/);
});

test('display says so when no commands are available', () => {
  const text = preparedTransactionDisplay({ hash: 'h' });
  assert.match(text, /Commands to sign: not provided/);
  assert.match(text, /Transaction Hash: h/);
});
