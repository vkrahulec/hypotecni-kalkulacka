import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { Colors, ThemeColors } from '../constants/colors';
import { useScheme } from '../context/ThemeContext';
import { parseCzechNumber, formatCZK } from '../utils/formatting';

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
  const c = Colors[useScheme()];
  const [focused, setFocused] = useState(false);
  // editValue is non-null only while the field is focused (holds the raw editing string)
  const [editValue, setEditValue] = useState<string | null>(null);
  const styles = makeStyles(c, focused, !!error, !!warning, autoCalculated);

  // Amount fields (Kč) use numeric keyboard; percent/decimal fields use decimal-pad.
  // Only format amount fields — don't reformat things like "5,49 %".
  const isAmountField = keyboardType !== 'decimal-pad' && !autoCalculated && editable;

  const displayValue = editValue !== null ? editValue : value;

  function handleFocus() {
    setFocused(true);
    if (isAmountField) {
      // Strip thousand-separator spaces so the user edits a plain number
      setEditValue(value.replace(/[\s\u00a0]/g, ''));
    }
  }

  function handleChangeText(text: string) {
    if (isAmountField) setEditValue(text);
    onChangeText(text);
  }

  function handleBlur() {
    setFocused(false);
    if (isAmountField && editValue !== null) {
      const n = parseCzechNumber(editValue);
      const formatted = editValue.trim() === '' ? '' : n > 0 ? formatCZK(n) : editValue;
      setEditValue(null);
      onChangeText(formatted);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={displayValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          editable={editable && !autoCalculated}
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
  const borderWidth = focused || hasError || hasWarning ? 2 : 1;
  const labelColor = hasError ? c.error : focused ? c.primary : c.textSecondary;

  return StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 12,
      fontWeight: '500',
      color: labelColor,
      marginBottom: 6,
      letterSpacing: 0.1,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: autoCalculated ? c.surfaceVariant : c.surfaceContainer,
      borderWidth,
      borderColor,
      borderRadius: 10,
      paddingHorizontal: 14,
      minHeight: 52,
      ...Platform.select({
        web: { outlineStyle: 'none' } as object,
      }),
    },
    input: {
      flex: 1,
      height: 52,
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
      marginLeft: 6,
      fontWeight: '400',
    },
    hint: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 4,
      marginLeft: 2,
    },
    warning: {
      fontSize: 12,
      color: c.warning,
      marginTop: 4,
      marginLeft: 2,
    },
    error: {
      fontSize: 12,
      color: c.error,
      marginTop: 4,
      marginLeft: 2,
    },
  });
}
