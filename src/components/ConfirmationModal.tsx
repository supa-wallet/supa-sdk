import { Fragment, type ReactNode, type CSSProperties } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { useSupaContext } from '../providers/SupaProvider';

const styles = {
  backdrop: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
  } as CSSProperties,

  panelWrapper: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 9999,
    overflowY: 'auto' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  } as CSSProperties,

  panel: {
    backgroundColor: 'var(--privy-color-background-2)',
    border: '1px solid var(--privy-color-border-default)',
    borderRadius: 'var(--privy-border-radius-mdlg)',
    maxWidth: '560px',
    width: '100%',
    maxHeight: '85vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  } as CSSProperties,

  header: {
    padding: '20px 24px',
    borderBottom: '1px solid var(--privy-color-border-default)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as CSSProperties,

  title: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--privy-color-foreground)',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  } as CSSProperties,

  closeButton: {
    background: 'transparent',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    color: 'var(--privy-color-icon-muted)',
    borderRadius: 'var(--privy-border-radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 150ms',
  } as CSSProperties,

  body: {
    padding: '24px',
    overflowY: 'auto' as const,
    flex: 1,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  } as CSSProperties,

  messageContainer: {
    backgroundColor: 'var(--privy-color-background)',
    border: '1px solid var(--privy-color-border-default)',
    borderRadius: 'var(--privy-border-radius-md)',
    padding: '16px',
    maxHeight: '400px',
    overflowY: 'auto' as const,
    marginBottom: '16px',
  } as CSSProperties,

  messageContent: {
    fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
    fontSize: '14px',
    lineHeight: 1.6,
    color: 'var(--privy-color-foreground)',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    margin: 0,
  } as CSSProperties,

  footer: {
    padding: '16px 24px',
    borderTop: '1px solid var(--privy-color-border-default)',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    backgroundColor: 'var(--privy-color-background)',
  } as CSSProperties,

  button: {
    padding: '12px 20px',
    borderRadius: 'var(--privy-border-radius-md)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 150ms',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    border: 'none',
  } as CSSProperties,

  rejectButton: {
    backgroundColor: 'transparent',
    border: '1px solid var(--privy-color-border-default)',
    color: 'var(--privy-color-foreground-2)',
  } as CSSProperties,

  confirmButton: {
    backgroundColor: 'var(--privy-color-accent)',
    color: 'var(--privy-color-background)',
  } as CSSProperties,

  description: {
    fontSize: '14px',
    color: 'var(--privy-color-foreground-2)',
    marginBottom: '16px',
    lineHeight: 1.5,
  } as CSSProperties,

  infoBox: {
    backgroundColor: 'var(--privy-color-info-bg)',
    border: '1px solid var(--privy-color-border-info)',
    borderRadius: 'var(--privy-border-radius-md)',
    padding: '12px 16px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    marginTop: '16px',
  } as CSSProperties,

  infoText: {
    fontSize: '13px',
    color: 'var(--privy-color-foreground-2)',
    lineHeight: 1.5,
    margin: 0,
  } as CSSProperties,
};

// Icons as SVG components
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PenIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--privy-color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </svg>
);

const SendIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--privy-color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--privy-color-icon-interactive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onReject: () => void;
  title?: ReactNode;
  message: string | string[];
  confirmText?: string;
  rejectText?: string;
  description?: string;
  infoText?: string;
  icon?: ReactNode;
  loading?: boolean;
}

export function ConfirmationModal({
  open = false,
  onClose,
  onConfirm,
  onReject,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  rejectText = 'Cancel',
  description,
  infoText,
  icon,
  loading = false,
}: ConfirmationModalProps) {
  const { theme } = useSupaContext();
  
  const handleReject = () => {
    onReject();
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const themeClass = theme === 'dark' ? 'privy-dark' : 'privy-light';

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} style={{ position: 'relative', zIndex: 9999 }}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div style={styles.backdrop} />
        </TransitionChild>

        <div style={styles.panelWrapper}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className={themeClass} style={styles.panel}>
              <div style={styles.header}>
                <DialogTitle style={styles.title}>
                  {icon || <PenIcon />}
                  {title}
                </DialogTitle>
                <button
                  onClick={handleReject}
                  style={styles.closeButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--privy-color-background-hover)';
                    e.currentTarget.style.color = 'var(--privy-color-icon-default-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--privy-color-icon-muted)';
                  }}
                >
                  <CloseIcon />
                </button>
              </div>

              <div style={styles.body}>
                {description && <p style={styles.description}>{description}</p>}
                
                {Array.isArray(message) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {message.map((m, idx) => (
                      <div key={idx} style={{ ...styles.messageContainer, marginBottom: 0 }}>
                        <pre style={styles.messageContent}>{m}</pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.messageContainer}>
                    <pre style={styles.messageContent}>{message}</pre>
                  </div>
                )}

                {infoText && (
                  <div style={styles.infoBox}>
                    <InfoIcon />
                    <p style={styles.infoText}>{infoText}</p>
                  </div>
                )}
              </div>

              <div style={styles.footer}>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  style={{
                    ...styles.button,
                    ...styles.rejectButton,
                    opacity: loading ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = 'var(--privy-color-background-hover)';
                      e.currentTarget.style.color = 'var(--privy-color-foreground-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--privy-color-foreground-2)';
                  }}
                >
                  {rejectText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  style={{
                    ...styles.button,
                    ...styles.confirmButton,
                    opacity: loading ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = 'var(--privy-color-accent-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--privy-color-accent)';
                  }}
                >
                  {loading ? 'Processing...' : confirmText}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

export interface SignMessageModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onReject: () => void;
  message: string;
  loading?: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  rejectText?: string;
}

export function SignMessageModal({
  open,
  onClose,
  onConfirm,
  onReject,
  message,
  loading = false,
  title = 'Sign Message',
  description = 'You are about to sign the following message:',
  confirmText = 'Sign',
  rejectText = 'Reject',
}: SignMessageModalProps) {
  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      onReject={onReject}
      title={title}
      message={message}
      confirmText={confirmText}
      rejectText={rejectText}
      description={description}
      infoText="Signing a message proves ownership of your wallet without exposing private keys or making any blockchain transactions."
      loading={loading}
    />
  );
}

export interface SignTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onReject: () => void;
  transaction: string | string[];
  loading?: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  rejectText?: string;
  infoText?: string;
}

export function SignTransactionModal({
  open,
  onClose,
  onConfirm,
  onReject,
  transaction,
  loading = false,
  title = 'Sign Transaction',
  description,
  confirmText = 'Sign & Send',
  rejectText = 'Reject',
  infoText = 'You are submitting a transaction, please be careful',
}: SignTransactionModalProps) {
  const txCount = Array.isArray(transaction) ? transaction.length : 1;
  const computedTitle = txCount > 1 ? `${String(title)} (${txCount})` : title;
  const computedDescription =
    description ??
    (txCount > 1
      ? `Review and sign the following transactions (${txCount}).`
      : 'Review and sign the following transaction:');

  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      onReject={onReject}
      title={computedTitle}
      message={transaction}
      confirmText={confirmText}
      rejectText={rejectText}
      description={computedDescription}
      infoText={infoText}
      icon={<SendIcon />}
      loading={loading}
    />
  );
}
