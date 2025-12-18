import { useState } from 'react';
import { WalletinoProvider, useWalletino } from '@walletino/sdk';

function App() {
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID || 'cm9u92yyo01x2jv0nbmeqoptk';
  const privyClientId = import.meta.env.VITE_PRIVY_CLIENT_ID || 'WY5iwwJvDRXsGG6KkftbHs3zEzXKeXMJRyfhN87f58y31';

  return (
    <WalletinoProvider
      config={{
        privyAppId,
        privyClientId,
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://stage_api.walletino.fyi',
        appearance: {
          theme: 'light',
        },
        loginMethods: ['email', 'wallet'],
      }}
    >
      <Demo />
    </WalletinoProvider>
  );
}

function Demo() {
  const { auth, canton, api } = useWalletino();
  
  // State for debug values
  const [debugState, setDebugState] = useState<{
    publicKeyHex: string;
    publicKeyBase64: string;
    token: string;
    tokenPayload: any;
    hashBase64: string;
    hashHex: string;
    signatureBase64: string;
    prepareStatus: string;
    submitStatus: string;
    lastError: string;
  }>({
    publicKeyHex: '',
    publicKeyBase64: '',
    token: '',
    tokenPayload: null,
    hashBase64: '',
    hashHex: '',
    signatureBase64: '',
    prepareStatus: '',
    submitStatus: '',
    lastError: '',
  });

  // Decode JWT token to show payload
  const decodeJWT = (token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch {
      return null;
    }
  };

  // Debug: log stellar wallet info on each render
  console.log('=== Debug Stellar Wallet ===');
  console.log('stellarWallet:', canton.stellarWallet);
  console.log('stellarWallets:', canton.stellarWallets);
  if (canton.stellarWallet) {
    console.log('stellarWallet.publicKey:', canton.stellarWallet.publicKey);
    console.log('stellarWallet.address:', canton.stellarWallet.address);
    console.log('stellarWallet keys:', Object.keys(canton.stellarWallet));
  }

  const handleOnboard = async () => {
    try {
      if (!auth.authenticated) {
        auth.login();
        return;
      }

      await canton.registerCanton();
      alert('Canton wallet registered successfully!');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleTapDevnet = async (amount: string = '1000') => {
    try {
      console.log(`💰 Starting tap devnet (${amount} coins)...`);
      console.log('Stellar wallet:', canton.stellarWallet?.address);
      console.log('Is registered:', canton.isRegistered);
      
      const result = await canton.tapDevnet(amount);
      alert(`Devnet tap successful! Amount: ${amount}\nResult: ${JSON.stringify(result)}`);
    } catch (error: any) {
      console.error('Tap error:', error);
      alert(`Error: ${error.message || JSON.stringify(error)}`);
    }
  };

  // Полный тестовый флоу
  const handleFullTest = async () => {
    console.group('🧪 Full Canton Flow Test');
    
    try {
      // Step 1: Check authentication
      console.log('1️⃣ Check authentication...');
      if (!auth.authenticated) {
        console.error('❌ Not authenticated');
        alert('Please login first!');
        return;
      }
      console.log('✅ Authenticated:', auth.user?.id);

      // Step 2: Check Stellar wallet
      console.log('2️⃣ Check Stellar wallet...');
      if (!canton.stellarWallet) {
        console.log('Creating Stellar wallet...');
        await canton.createStellarWallet();
        // Wait for wallet creation
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      console.log('✅ Stellar wallet:', canton.stellarWallet?.address);

      // Step 3: Register Canton wallet
      console.log('3️⃣ Register Canton wallet...');
      try {
        await canton.registerCanton();
        console.log('✅ Canton registered');
      } catch (err: any) {
        if (err.message?.includes('already') || err.statusCode === 409 || err.statusCode === 400) {
          console.log('⚠️ Already registered, continuing...');
        } else {
          throw err;
        }
      }

      // Step 4: Tap devnet
      console.log('4️⃣ Tap devnet...');
      const result = await canton.tapDevnet('1000');
      console.log('✅ Tap result:', result);

      alert('✅ All steps successful! Check console for details.');

    } catch (error: any) {
      console.error('❌ Error at step:', error);
      alert(`Error: ${error.message || JSON.stringify(error)}`);
    } finally {
      console.groupEnd();
    }
  };

  // Тест только /prepare endpoint (без подписи и submit)
  const handleTestPrepareOnly = async () => {
    console.group('🔬 Test /canton/register/prepare ONLY');
    setDebugState(prev => ({ ...prev, prepareStatus: '⏳ Loading...', lastError: '', hashBase64: '' }));
    
    try {
      // Check auth
      if (!auth.authenticated) {
        setDebugState(prev => ({ ...prev, prepareStatus: '❌ Not authenticated', lastError: 'Please login first!' }));
        console.groupEnd();
        return;
      }
      console.log('✅ Authenticated');

      // Check Stellar wallet
      if (!canton.stellarWallet) {
        setDebugState(prev => ({ ...prev, prepareStatus: '❌ No wallet', lastError: 'Please create Stellar wallet first!' }));
        console.groupEnd();
        return;
      }
      
      const wallet = canton.stellarWallet;
      console.log('✅ Stellar wallet found');
      console.log('  address:', wallet.address);
      console.log('  publicKey:', wallet.publicKey);
      console.log('  all keys:', Object.keys(wallet));

      // Import converters directly for testing
      const { privyPublicKeyToCantonBase64 } = await import('@walletino/sdk');
      
      // Convert publicKey to base64
      console.log('\n📊 Converting publicKey to base64...');
      const publicKeyBase64 = privyPublicKeyToCantonBase64(wallet.publicKey);
      console.log('  Input (hex):', wallet.publicKey);
      console.log('  Output (base64):', publicKeyBase64);
      console.log('  Output length:', publicKeyBase64.length);

      // Get access token
      const token = await auth.getAccessToken();
      console.log('\n🔑 Got access token:', token ? `***${token.slice(-20)}` : 'null');
      
      // Update debug state
      const tokenPayload = token ? decodeJWT(token) : null;
      setDebugState(prev => ({
        ...prev,
        publicKeyHex: wallet.publicKey,
        publicKeyBase64: publicKeyBase64,
        token: token || '',
        tokenPayload: tokenPayload,
        prepareStatus: '📤 Calling /prepare...',
      }));

      // Call /prepare directly
      console.log('\n📤 Calling /canton/register/prepare...');
      const response = await fetch('https://stage_api.walletino.fyi/canton/register/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ publicKey: publicKeyBase64 }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setDebugState(prev => ({
          ...prev,
          hashBase64: data.hash,
          prepareStatus: `✅ Success (${response.status})`,
        }));
        console.log('✅ SUCCESS! Hash received:', data.hash);
      } else {
        setDebugState(prev => ({
          ...prev,
          prepareStatus: `❌ Failed (${response.status})`,
          lastError: JSON.stringify(data),
        }));
        console.error('❌ FAILED:', data);
      }

    } catch (error: any) {
      console.error('❌ Error:', error);
      setDebugState(prev => ({ ...prev, prepareStatus: '❌ Error', lastError: error.message }));
    } finally {
      console.groupEnd();
    }
  };

  // Полный тест: prepare → sign → submit (пункты 4-6)
  const handleTestPrepareSignSubmit = async () => {
    console.group('🚀 Full Test: prepare → sign → submit');
    setDebugState(prev => ({ 
      ...prev, 
      prepareStatus: '⏳ Step 4...', 
      submitStatus: '',
      lastError: '',
      hashBase64: '',
      hashHex: '',
      signatureBase64: '',
    }));
    
    try {
      // Check auth
      if (!auth.authenticated) {
        setDebugState(prev => ({ ...prev, prepareStatus: '❌ Not authenticated', lastError: 'Please login first!' }));
        console.groupEnd();
        return;
      }
      console.log('✅ Step 0: Authenticated');

      // Check Stellar wallet
      if (!canton.stellarWallet) {
        setDebugState(prev => ({ ...prev, prepareStatus: '❌ No wallet', lastError: 'Please create Stellar wallet first!' }));
        console.groupEnd();
        return;
      }
      
      const wallet = canton.stellarWallet;
      console.log('✅ Stellar wallet:', wallet.address);

      // Import converters
      const { privyPublicKeyToCantonBase64, base64ToHex } = await import('@walletino/sdk');
      
      // ===== STEP 4: Call /prepare =====
      console.log('\n' + '='.repeat(50));
      console.log('📋 STEP 4: Call /canton/register/prepare');
      console.log('='.repeat(50));
      
      const publicKeyBase64 = privyPublicKeyToCantonBase64(wallet.publicKey);
      console.log('Input publicKey (hex):', wallet.publicKey);
      console.log('Converted publicKey (base64):', publicKeyBase64);

      const token = await auth.getAccessToken();
      
      const tokenPayload = token ? decodeJWT(token) : null;
      setDebugState(prev => ({
        ...prev,
        publicKeyHex: wallet.publicKey,
        publicKeyBase64: publicKeyBase64,
        token: token || '',
        tokenPayload: tokenPayload,
        prepareStatus: '📤 Calling /prepare...',
      }));
      
      const prepareResponse = await fetch('https://stage_api.walletino.fyi/canton/register/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ publicKey: publicKeyBase64 }),
      });

      console.log('/prepare response status:', prepareResponse.status);
      const prepareData = await prepareResponse.json();
      console.log('/prepare response data:', prepareData);

      if (!prepareResponse.ok) {
        setDebugState(prev => ({
          ...prev,
          prepareStatus: `❌ Failed (${prepareResponse.status})`,
          lastError: JSON.stringify(prepareData),
        }));
        console.error('❌ /prepare FAILED');
        console.groupEnd();
        return;
      }

      const hashBase64 = prepareData.hash;
      console.log('✅ Got hash (base64):', hashBase64);

      // ===== STEP 5: Sign hash with Privy =====
      console.log('\n' + '='.repeat(50));
      console.log('✍️ STEP 5: Sign hash with Privy');
      console.log('='.repeat(50));
      
      // Convert base64 hash to hex for Privy
      const hashHex = base64ToHex(hashBase64);
      console.log('Hash (base64):', hashBase64);
      console.log('Hash (hex for Privy):', hashHex);
      
      setDebugState(prev => ({
        ...prev,
        hashBase64: hashBase64,
        hashHex: hashHex,
        prepareStatus: `✅ Success (${prepareResponse.status})`,
        submitStatus: '✍️ Signing...',
      }));
      
      console.log('Calling signRawHash with:');
      console.log('  address:', wallet.address);
      console.log('  chainType: stellar');
      console.log('  hash:', hashHex);

      // Sign using canton.signHash which handles conversion
      const signatureBase64 = await canton.signHash(hashBase64);
      console.log('✅ Got signature (base64):', signatureBase64);
      
      setDebugState(prev => ({
        ...prev,
        signatureBase64: signatureBase64,
        submitStatus: '📤 Calling /submit...',
      }));

      // ===== STEP 6: Call /submit =====
      console.log('\n' + '='.repeat(50));
      console.log('📤 STEP 6: Call /canton/register/submit');
      console.log('='.repeat(50));
      
      console.log('Sending to /submit:');
      console.log('  hash:', hashBase64);
      console.log('  signature:', signatureBase64);

      const submitResponse = await fetch('https://stage_api.walletino.fyi/canton/register/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          hash: hashBase64, 
          signature: signatureBase64 
        }),
      });

      console.log('/submit response status:', submitResponse.status);
      
      let submitData;
      try {
        submitData = await submitResponse.json();
      } catch {
        submitData = { message: 'No JSON body' };
      }
      console.log('/submit response data:', submitData);

      if (submitResponse.status === 201 || submitResponse.ok) {
        setDebugState(prev => ({
          ...prev,
          submitStatus: `✅ Success (${submitResponse.status})`,
        }));
        console.log('🎉 SUCCESS! Canton wallet registered!');
      } else {
        setDebugState(prev => ({
          ...prev,
          submitStatus: `❌ Failed (${submitResponse.status})`,
          lastError: JSON.stringify(submitData),
        }));
        console.error('❌ /submit FAILED');
      }

    } catch (error: any) {
      console.error('❌ Error:', error);
      setDebugState(prev => ({ ...prev, submitStatus: '❌ Error', lastError: error.message }));
    } finally {
      console.groupEnd();
    }
  };

  const handleGetBalance = async () => {
    try {
      const balance = await api.user.getBalance();
      alert(`Balance: ${balance.totalUsdBalance} USD\nTokens: ${balance.balances.length}`);
    } catch (error: any) {
      console.error('Balance error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleGetUser = async () => {
    try {
      const user = await api.user.getCurrent();
      alert(`User info: ${JSON.stringify(user, null, 2)}`);
    } catch (error: any) {
      console.error('User error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Walletino SDK Demo</h1>
        <p style={styles.subtitle}>Test Canton Network integration and API methods</p>

        {!auth.authenticated ? (
          <div style={styles.section}>
            <p style={styles.text}>Login to get started</p>
            <button onClick={auth.login} style={styles.button}>
              Login with Privy
            </button>
          </div>
        ) : (
          <>
            <div style={styles.section}>
              <div style={styles.infoBox}>
                <p style={styles.infoText}>
                  <strong>Status:</strong> Authenticated
                </p>
                {canton.stellarWallet && (
                  <p style={styles.infoText}>
                    <strong>Stellar Wallet:</strong> {canton.stellarWallet.address.slice(0, 8)}...
                    {canton.stellarWallet.address.slice(-6)}
                  </p>
                )}
                {canton.isRegistered && (
                  <p style={styles.successText}>
                    ✓ Canton wallet registered
                  </p>
                )}
              </div>
              <button onClick={auth.logout} style={styles.logoutButton}>
                Logout
              </button>
            </div>

            <div style={styles.divider} />

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Canton Operations</h2>
              
              {!canton.stellarWallet && (
                <button
                  onClick={canton.createStellarWallet}
                  disabled={canton.loading}
                  style={styles.button}
                >
                  {canton.loading ? 'Creating...' : 'Create Stellar Wallet'}
                </button>
              )}

              {canton.stellarWallet && !canton.isRegistered && (
                <button
                  onClick={handleOnboard}
                  disabled={canton.loading}
                  style={styles.button}
                >
                  {canton.loading ? 'Registering...' : 'Register Canton Wallet'}
                </button>
              )}

              {canton.isRegistered && (
                <>
                  <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    <button
                      onClick={() => handleTapDevnet('1')}
                      disabled={canton.loading}
                      style={styles.button}
                    >
                      {canton.loading ? 'Tapping...' : 'Tap 1 coin'}
                    </button>
                    <button
                      onClick={() => handleTapDevnet('10')}
                      disabled={canton.loading}
                      style={styles.button}
                    >
                      {canton.loading ? 'Tapping...' : 'Tap 10 coins'}
                    </button>
                    <button
                      onClick={() => handleTapDevnet('100')}
                      disabled={canton.loading}
                      style={styles.button}
                    >
                      {canton.loading ? 'Tapping...' : 'Tap 100 coins'}
                    </button>
                    <button
                      onClick={() => handleTapDevnet('1000')}
                      disabled={canton.loading}
                      style={styles.button}
                    >
                      {canton.loading ? 'Tapping...' : 'Tap 1000 coins'}
                    </button>
                  </div>
                </>
              )}

              {/* Debug Section */}
              <div style={styles.debugSection}>
                <h3 style={styles.debugTitle}>🔧 Debug Panel (Backend flow steps 4-6)</h3>
                
                {/* Fetch Token Button */}
                <div style={{marginBottom: '12px'}}>
                  <button
                    onClick={async () => {
                      try {
                        const token = await auth.getAccessToken();
                        const payload = token ? decodeJWT(token) : null;
                        setDebugState(prev => ({
                          ...prev,
                          token: token || '',
                          tokenPayload: payload,
                        }));
                        console.log('🔑 getAccessToken() result:', token);
                        console.log('📋 Decoded payload:', payload);
                      } catch (err: any) {
                        console.error('Error getting token:', err);
                        setDebugState(prev => ({ ...prev, lastError: err.message }));
                      }
                    }}
                    style={{...styles.button, backgroundColor: '#3b82f6', padding: '10px 16px', fontSize: '14px'}}
                  >
                    🔑 Fetch getAccessToken()
                  </button>
                </div>

                {/* Display current values */}
                <div style={styles.debugValues}>
                  <div style={styles.debugRow}>
                    <span style={styles.debugLabel}>publicKey (hex from Privy):</span>
                    <code style={styles.debugCode}>
                      {debugState.publicKeyHex || canton.stellarWallet?.publicKey || '—'}
                    </code>
                  </div>
                  <div style={styles.debugRow}>
                    <span style={styles.debugLabel}>publicKey (base64 for Canton):</span>
                    <code style={styles.debugCode}>{debugState.publicKeyBase64 || '—'}</code>
                  </div>
                  
                  <div style={{...styles.debugRow, marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #313244'}}>
                    <span style={styles.debugLabel}>🔑 Privy JWT Token (raw from getAccessToken):</span>
                    <code style={{...styles.debugCode, fontSize: '10px', maxHeight: '100px', overflow: 'auto'}}>
                      {debugState.token || '— нажми "Fetch getAccessToken()" выше —'}
                    </code>
                    {debugState.token && (
                      <span style={{fontSize: '10px', color: '#a6adc8', marginTop: '4px'}}>
                        Длина: {debugState.token.length} символов | 
                        Отправляется как: Authorization: Bearer {'<token>'}
                      </span>
                    )}
                  </div>
                  
                  {debugState.tokenPayload && (
                    <div style={styles.debugRow}>
                      <span style={styles.debugLabel}>📋 JWT Payload (decoded):</span>
                      <code style={{...styles.debugCode, whiteSpace: 'pre-wrap', fontSize: '11px', maxHeight: '150px', overflow: 'auto'}}>
                        {JSON.stringify(debugState.tokenPayload, null, 2)}
                      </code>
                      <span style={{fontSize: '10px', color: '#a6adc8', marginTop: '4px'}}>
                        ↑ Это содержимое токена. Backend проверяет: iss, aud, sub (user id), exp (срок действия)
                      </span>
                    </div>
                  )}
                  
                  <div style={{...styles.debugRow, marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #313244'}}>
                    <span style={styles.debugLabel}>hash (base64 from /prepare):</span>
                    <code style={styles.debugCode}>{debugState.hashBase64 || '—'}</code>
                  </div>
                  <div style={styles.debugRow}>
                    <span style={styles.debugLabel}>hash (hex for Privy signRawHash):</span>
                    <code style={styles.debugCode}>{debugState.hashHex || '—'}</code>
                  </div>
                  <div style={styles.debugRow}>
                    <span style={styles.debugLabel}>signature (base64 for /submit):</span>
                    <code style={styles.debugCode}>{debugState.signatureBase64 || '—'}</code>
                  </div>
                </div>

                {/* Status indicators */}
                <div style={styles.debugStatus}>
                  <div style={styles.statusRow}>
                    <span>Step 4 (/prepare):</span>
                    <span style={{fontWeight: 'bold'}}>{debugState.prepareStatus || '—'}</span>
                  </div>
                  <div style={styles.statusRow}>
                    <span>Steps 5-6 (sign + /submit):</span>
                    <span style={{fontWeight: 'bold'}}>{debugState.submitStatus || '—'}</span>
                  </div>
                  {debugState.lastError && (
                    <div style={styles.debugError}>
                      <strong>Error:</strong> {debugState.lastError}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div style={{display: 'flex', gap: '10px', flexDirection: 'column'}}>
                  <button
                    onClick={handleTestPrepareOnly}
                    disabled={canton.loading}
                    style={{...styles.button, backgroundColor: '#f59e0b'}}
                  >
                    🔬 Step 4: Test /prepare ONLY
                  </button>
                  <button
                    onClick={handleTestPrepareSignSubmit}
                    disabled={canton.loading}
                    style={{...styles.button, backgroundColor: '#8b5cf6'}}
                  >
                    🚀 Steps 4→5→6: prepare → sign → submit
                  </button>
                  <button
                    onClick={handleFullTest}
                    disabled={canton.loading}
                    style={{...styles.button, backgroundColor: '#10b981'}}
                  >
                    {canton.loading ? 'Testing...' : '🧪 Full Flow (Register + Tap)'}
                  </button>
                </div>
              </div>

              {canton.error && (
                <div style={styles.errorBox}>
                  <strong>Error:</strong> {canton.error.message}
                </div>
              )}
            </div>

            <div style={styles.divider} />

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>API Methods</h2>
              
              <div style={styles.buttonGrid}>
                <button onClick={handleGetUser} style={styles.secondaryButton}>
                  Get User Info
                </button>
                <button onClick={handleGetBalance} style={styles.secondaryButton}>
                  Get Balance
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Walletino SDK v0.1.0 | Canton Network + Privy.io
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  debugSection: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#1e1e2e',
    borderRadius: '12px',
    border: '1px solid #313244',
  },
  debugTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#cdd6f4',
    marginBottom: '12px',
  },
  debugValues: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '12px',
    padding: '12px',
    backgroundColor: '#181825',
    borderRadius: '8px',
  },
  debugRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  debugLabel: {
    fontSize: '11px',
    color: '#a6adc8',
    textTransform: 'uppercase',
  },
  debugCode: {
    fontSize: '12px',
    color: '#89dceb',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
    backgroundColor: '#11111b',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  debugStatus: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px',
    padding: '12px',
    backgroundColor: '#181825',
    borderRadius: '8px',
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#cdd6f4',
  },
  debugError: {
    fontSize: '12px',
    color: '#f38ba8',
    backgroundColor: '#45293e',
    padding: '8px',
    borderRadius: '4px',
    wordBreak: 'break-all',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '8px',
    textAlign: 'center',
    color: '#1a202c',
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096',
    textAlign: 'center',
    marginBottom: '32px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#2d3748',
  },
  text: {
    fontSize: '16px',
    color: '#4a5568',
    marginBottom: '16px',
    textAlign: 'center',
  },
  infoBox: {
    padding: '16px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  infoText: {
    fontSize: '14px',
    color: '#4a5568',
    marginBottom: '8px',
  },
  successText: {
    fontSize: '14px',
    color: '#38a169',
    fontWeight: '600',
  },
  button: {
    width: '100%',
    padding: '14px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#e2e8f0',
    color: '#4a5568',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '12px 20px',
    backgroundColor: '#edf2f7',
    color: '#2d3748',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  errorBox: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#fff5f5',
    border: '1px solid #fc8181',
    borderRadius: '8px',
    color: '#c53030',
    fontSize: '14px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '24px 0',
  },
  footer: {
    textAlign: 'center',
  },
  footerText: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
  },
};

export default App;

