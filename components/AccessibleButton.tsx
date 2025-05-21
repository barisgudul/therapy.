import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AccessibilityInfo, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface AccessibleButtonProps {
  onPress: () => void;
  label: string;
  hint?: string;
  role?: 'button' | 'link' | 'tab';
  disabled?: boolean;
  style?: any;
  textStyle?: any;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  onPress,
  label,
  hint,
  role = 'button',
  disabled = false,
  style,
  textStyle,
}) => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = React.useState(false);

  React.useEffect(() => {
    const checkScreenReader = async () => {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsScreenReaderEnabled(enabled);
    };

    checkScreenReader();

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ErrorBoundary>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[styles.button, disabled && styles.disabled, style]}
        accessible={true}
        accessibilityLabel={label}
        accessibilityHint={hint}
        accessibilityRole={role}
        accessibilityState={{ disabled }}
        accessibilityActions={[
          { name: 'activate', label: 'Etkinleştir' },
        ]}
        onAccessibilityAction={({ nativeEvent: { actionName } }) => {
          if (actionName === 'activate') {
            onPress();
          }
        }}
      >
        <Text style={[styles.text, disabled && styles.disabledText, textStyle]}>
          {label}
        </Text>
      </TouchableOpacity>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44, // Dokunma hedefi için minimum yükseklik
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: '#CCCCCC',
  },
}); 