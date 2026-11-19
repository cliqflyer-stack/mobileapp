import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import { BrandLogo } from './BrandLogo';

interface AppHeaderProps {
  onBack?: () => void;
  backLabel?: string;
  showLogo?: boolean;
  rightAction?: 'bell' | 'more' | 'none';
  onRightPress?: () => void;
  title?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onBack,
  backLabel,
  showLogo = true,
  rightAction = 'none',
  onRightPress,
  title,
}) => {
  // Standalone screen title bar (e.g. SET YOUR NEIGHBOURHOOD)
  if (!showLogo && title) {
    return (
      <View style={styles.container}>
        <View style={styles.titleNavRow}>
          {onBack ? (
            <TouchableOpacity
              style={styles.navIconButton}
              onPress={onBack}
              activeOpacity={0.7}
              accessibilityLabel="Back"
            >
              <Feather name="arrow-left" size={22} color={colors.primaryDark} />
            </TouchableOpacity>
          ) : (
            <View style={styles.navIconPlaceholder} />
          )}

          <Text style={styles.centeredTitle}>{title}</Text>

          {rightAction === 'more' ? (
            <TouchableOpacity
              style={styles.navIconButton}
              onPress={onRightPress}
              activeOpacity={0.7}
              accessibilityLabel="More options"
            >
              <Feather name="more-horizontal" size={22} color={colors.primaryDark} />
            </TouchableOpacity>
          ) : rightAction === 'bell' ? (
            <TouchableOpacity
              style={styles.navIconButton}
              onPress={onRightPress}
              activeOpacity={0.7}
              accessibilityLabel="Notifications"
            >
              <Feather name="bell" size={20} color={colors.primaryDark} />
            </TouchableOpacity>
          ) : (
            <View style={styles.navIconPlaceholder} />
          )}
        </View>
      </View>
    );
  }

  // Standard Branding Bar (flip + YOUR EVERYDAY ADVANTAGE)
  return (
    <View style={styles.container}>
      <View style={styles.brandingRow}>
        {showLogo ? <BrandLogo height={26} /> : <View style={styles.iconPlaceholder} />}

        {rightAction === 'bell' ? (
          <View style={styles.brandingRightWithIcon}>
            <Text style={styles.advantageTag}>YOUR EVERYDAY ADVANTAGE</Text>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onRightPress}
              activeOpacity={0.7}
              accessibilityLabel="Notifications"
            >
              <Feather name="bell" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        ) : rightAction === 'more' ? (
          <View style={styles.brandingRightWithIcon}>
            <Text style={styles.advantageTag}>YOUR EVERYDAY ADVANTAGE</Text>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onRightPress}
              activeOpacity={0.7}
              accessibilityLabel="More options"
            >
              <Feather name="more-horizontal" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.advantageTag}>YOUR EVERYDAY ADVANTAGE</Text>
        )}
      </View>

      {/* Optional Nav Row (Back arrow + back label) */}
      {onBack && (
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            {backLabel ? <Text style={styles.backText}>{backLabel}</Text> : null}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  // Centered Title Bar
  titleNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  navIconButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  navIconPlaceholder: {
    width: 36,
  },
  centeredTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#73857C',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    flex: 1,
  },

  // Standard Branding Bar
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 38,
  },
  brandingRightWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.6,
  },
  advantageTag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  iconPlaceholder: {
    width: 32,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
});
