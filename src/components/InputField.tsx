import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import { Colors, ThemeColors } from '../constants/colors';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  suffix?: string;
  hint?: string;
  error?: string;
  warning?: string;
  keyboardType?: 'numeric' | 'decimal-pad';
  editable?: boolean;
  autoCalculated?: boolean;
}

export function InputField({
  label,
  value,
  onChangeText,
  suffix,
  hint,
  error,
  warning,
  keyboardType = 'numeric',
  editable = true,
  autoCalculated = false,
}: InputFieldProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const [focused, setFocused] = useState(false);
  const styles = makeStyles(c, focused, !!error, !!warning, autoCalculated);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          editable={editable && !autoCalculated}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={c.textMuted}
          selectTextOnFocus
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
      {hint && !error && !warning ? <Text style={styles.hint}>{hint}</Text> : null}
      {warning && !error ? <Text style={styles.warning}>{warning}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function makeStyles(
  c: ThemeColors,
  focused: boolean,
  hasError: boolean,
  hasWarning: boolean,
  autoCalculated: boolean
) {
  const borderColor = hasError
    ? c.error
    : hasWarning
    ? c.warning
    : focused
    ? c.borderFocus
    : c.border;
  return StyleSheet.create({
    container: {
      marginBottom: 12,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      marginBottom: 4,
      letterSpacing: 0.2,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: autoCalculated ? c.surfaceSecondary : c.surface,
      borderWidth: 1.5,
      borderColor,
      borderRadius: 10,
      paddingHorizontal: 12,
      ...Platform.select({
        web: { outlineStyle: 'none' } as object,
      }),
    },
    input: {
      flex: 1,
      height: 44,
      fontSize: 16,
      color: autoCalculated ? c.textSecondary : c.text,
      fontWeight: autoCalculated ? '400' : '500',
      ...Platform.select({
        web: { outlineStyle: 'none' } as object,
      }),
    },
    suffix: {
      fontSize: 14,
      color: c.textMuted,
      marginLeft: 4,
    },
    hint: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 3,
      marginLeft: 2,
    },
    warning: {
      fontSize: 12,
      color: c.warning,
      marginTop: 3,
      marginLeft: 2,
    },
    error: {
      fontSize: 12,
      color: c.error,
      marginTop: 3,
      marginLeft: 2,
    },
  });
}
