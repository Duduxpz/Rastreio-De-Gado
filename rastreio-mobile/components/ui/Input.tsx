import { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { colors, typography, spacing } from '../../constants';

interface InputProps extends TextInputProps {
  readonly label: string;
  readonly error?: string;
  readonly hint?: string;
}

export function Input({ label, error, hint, ...props }: readonly InputProps) {
  const [focused, setFocused] = useState(false);
  const borderColorIfError = colors.danger;
  const borderColorIfFocused = colors.primary;
  const borderColorDefault = colors.gray300;
  const borderColorIfNotError = focused ? borderColorIfFocused : borderColorDefault;
  const computedBorderColor = error ? borderColorIfError : borderColorIfNotError;
  const hasMessage = !!(error || hint);
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text
        style={{
          fontSize: typography.sm,
          fontWeight: typography.medium,
          color: colors.gray700,
          marginBottom: spacing.xs,
        }}
      >
        {label}
      </Text>
      <TextInput
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: computedBorderColor,
          borderRadius: 10,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          fontSize: typography.base,
          color: colors.gray900,
        }}
        placeholderTextColor={colors.gray500}
      />
      {hasMessage && (
        <Text
          style={{
            fontSize: typography.xs,
            marginTop: spacing.xs,
            color: error ? colors.danger : colors.gray500,
          }}
        >
          {error ?? hint}
        </Text>
      )}
    </View>
  );
}
