import { useState } from 'react';
import styled from 'styled-components';

const InputWrapper = styled.div<{ $hasError?: boolean; $isFocused?: boolean }>`
  position: relative;
  width: 100%;
  transition: all ${({ theme }) => theme.transitions.fast};
`;

const StyledInput = styled.input<{ $hasError?: boolean; $isFocused?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.space[3]} ${({ theme }) => theme.space[4]};
  font-size: 0.9375rem;
  border: 1px solid
    ${({ $hasError, $isFocused, theme }) =>
      $hasError
        ? theme.colors.error.primary
        : $isFocused
        ? theme.colors.accent.primary
        : theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.bg.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;
  transition: all ${({ theme }) => theme.transitions.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:hover {
    border-color: ${({ $hasError, theme }) =>
      $hasError ? theme.colors.error.primary : theme.colors.border.secondary};
  }

  &:focus {
    border-color: ${({ $hasError, theme }) =>
      $hasError ? theme.colors.error.primary : theme.colors.accent.primary};
    box-shadow: 0 0 0 3px
      ${({ $hasError, theme }) =>
        $hasError
          ? `${theme.colors.error.primary}20`
          : `${theme.colors.accent.primary}20`};
  }
`;

const ErrorText = styled.div`
  margin-top: ${({ theme }) => theme.space[2]};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.error.primary};
`;

interface InviteCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onErrorClear?: () => void;
  placeholder?: string;
}

export function InviteCodeInput({
  value,
  onChange,
  error,
  onErrorClear,
  placeholder = 'Enter invite code',
}: InviteCodeInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (error && onErrorClear) {
      onErrorClear();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <InputWrapper $hasError={!!error} $isFocused={isFocused}>
      <StyledInput
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        $hasError={!!error}
        $isFocused={isFocused}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </InputWrapper>
  );
}
