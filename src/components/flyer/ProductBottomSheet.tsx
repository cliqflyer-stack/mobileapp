import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  Platform,
  Easing,
  ScrollView,
  Linking,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Product, LegalLinks } from '../../data/flyerData';
import { colors, radii } from '../../theme';
import { Button } from '../ui/Button';

interface ProductBottomSheetProps {
  product: Product | null;
  legal?: LegalLinks;
  onClose: () => void;
  onAddToList?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
}

/**
 * Snap points (fractions of the screen height):
 *  - COLLAPSED: 35% of the screen visible on open (summary: image, price, add to list)
 *  - EXPANDED:  75% visible once the user scrolls/drags up (full details + policy links)
 * The sheet itself is 75% tall; translateY moves it between snap points.
 */
const COLLAPSED_VISIBLE_FRACTION = 0.35;
const EXPANDED_VISIBLE_FRACTION = 0.75;

export const ProductBottomSheet: React.FC<ProductBottomSheetProps> = ({
  product,
  legal,
  onClose,
  onAddToList,
  onToggleFavorite,
}) => {
  const { height: screenHeight } = useWindowDimensions();
  const sheetHeight = Math.round(screenHeight * EXPANDED_VISIBLE_FRACTION);
  const EXPANDED_Y = 0;
  const COLLAPSED_Y = sheetHeight - Math.round(screenHeight * COLLAPSED_VISIBLE_FRACTION);
  const HIDDEN_Y = sheetHeight;

  const [activeProduct, setActiveProduct] = useState<Product | null>(product);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const translateY = useRef(new Animated.Value(HIDDEN_Y)).current;
  const currentY = useRef(HIDDEN_Y);
  const dragStartY = useRef(HIDDEN_Y);
  const expandedRef = useRef(false);
  const scrollOffset = useRef(0);

  useEffect(() => {
    const id = translateY.addListener(({ value }) => {
      currentY.current = value;
    });
    return () => translateY.removeListener(id);
  }, [translateY]);

  const snapTo = (target: number) => {
    const expanded = target === EXPANDED_Y;
    expandedRef.current = expanded;
    setIsExpanded(expanded);
    Animated.spring(translateY, {
      toValue: target,
      friction: 8,
      tension: 65,
      useNativeDriver: true,
    }).start();
  };

  // Open collapsed (35%) on product select; hide when cleared
  useEffect(() => {
    if (product) {
      setActiveProduct(product);
      setIsAdded(false);
      setIsFavorite(false);
      scrollOffset.current = 0;
      snapTo(COLLAPSED_Y);
    } else {
      expandedRef.current = false;
      setIsExpanded(false);
      Animated.timing(translateY, {
        toValue: HIDDEN_Y,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setActiveProduct(null);
      });
    }
  }, [product, sheetHeight]);

  const SNAP_POINTS = [EXPANDED_Y, COLLAPSED_Y, HIDDEN_Y];

  // Drag handling: swipe up expands (collapsed) / swipe down collapses or dismisses.
  // When expanded, the inner ScrollView keeps scrolling; the sheet only takes over
  // a downward pull once the details are scrolled back to the top.
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, g) => {
        if (Math.abs(g.dy) < 6 || Math.abs(g.dy) < Math.abs(g.dx)) return false;
        if (!expandedRef.current) return true;
        return g.dy > 0 && scrollOffset.current <= 0;
      },
      onPanResponderGrant: () => {
        dragStartY.current = currentY.current;
      },
      onPanResponderMove: (_, g) => {
        const y = Math.max(EXPANDED_Y, Math.min(HIDDEN_Y, dragStartY.current + g.dy));
        translateY.setValue(y);
      },
      onPanResponderRelease: (_, g) => {
        const y = Math.max(EXPANDED_Y, Math.min(HIDDEN_Y, dragStartY.current + g.dy));
        const projected = y + g.vy * 120;
        const target = SNAP_POINTS.reduce((best, p) =>
          Math.abs(p - projected) < Math.abs(best - projected) ? p : best
        );
        if (target === HIDDEN_Y) {
          onClose();
        } else {
          snapTo(target);
        }
      },
      onPanResponderTerminate: () => snapTo(expandedRef.current ? EXPANDED_Y : COLLAPSED_Y),
    })
  ).current;

  if (!activeProduct && !product) return null;

  const displayProduct = product || activeProduct;
  if (!displayProduct) return null;

  const discountPercent =
    displayProduct.regularPrice > 0
      ? Math.max(
          0,
          Math.round((1 - displayProduct.offerPrice / displayProduct.regularPrice) * 100)
        )
      : 0;

  const options = displayProduct.options ?? [];

  const handleFavoritePress = () => {
    setIsFavorite((prev) => !prev);
    onToggleFavorite?.(displayProduct);
  };

  const handleAddPress = () => {
    setIsAdded(true);
    onAddToList?.(displayProduct);
  };

  const openLink = (url?: string | null) => {
    if (url) Linking.openURL(url).catch(() => {});
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.current = e.nativeEvent.contentOffset.y;
  };

  return (
    <Animated.View
      style={[
        styles.sheetWrapper,
        { height: sheetHeight, transform: [{ translateY }] },
      ]}
      pointerEvents={product ? 'auto' : 'none'}
    >
      <View style={styles.sheetContainer} {...panResponder.panHandlers}>
        {/* Drag handle: tap to toggle between 35% and 75% */}
        <TouchableOpacity
          style={styles.handleHitArea}
          activeOpacity={0.7}
          onPress={() => snapTo(expandedRef.current ? COLLAPSED_Y : EXPANDED_Y)}
          accessibilityLabel={isExpanded ? 'Collapse product details' : 'Expand product details'}
        >
          <View style={styles.handleBar} />
        </TouchableOpacity>

        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.titleMeta}>
            <Text style={styles.categoryBrandText}>
              {displayProduct.brand.toUpperCase()} · {displayProduct.category.toUpperCase()}
            </Text>
            <Text style={styles.productTitleText} numberOfLines={2}>
              {displayProduct.name}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            style={styles.closeButton}
            accessibilityLabel="Close product details"
          >
            <Feather name="x" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Summary row (always visible at 35%) */}
        <View style={styles.bodyRow}>
          <View style={styles.imageCard}>
            <Image source={displayProduct.image} style={styles.productImage} resizeMode="contain" />
          </View>

          <View style={styles.detailsColumn}>
            <Text style={styles.descriptionText} numberOfLines={isExpanded ? undefined : 2}>
              {displayProduct.description}
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.offerPriceText}>${displayProduct.offerPrice.toFixed(2)}</Text>
              <Text style={styles.regularPriceText}>${displayProduct.regularPrice.toFixed(2)}</Text>
              {discountPercent > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Actions (always visible at 35%) */}
        <View style={styles.actionsFooter}>
          <View style={styles.addToListWrapper}>
            <Button
              label={isAdded ? 'Added to list ✓' : 'Add to shopping list'}
              variant="primary"
              onPress={handleAddPress}
              style={isAdded ? styles.addedButton : undefined}
            />
          </View>

          <TouchableOpacity
            onPress={handleFavoritePress}
            activeOpacity={0.7}
            style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
            accessibilityLabel="Add to favourites"
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? colors.brandRed : colors.primaryDark}
            />
          </TouchableOpacity>
        </View>

        {/* Details: revealed when the sheet expands to 75% */}
        <ScrollView
          style={styles.detailsScroll}
          contentContainerStyle={styles.detailsContent}
          scrollEnabled={isExpanded}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.sectionTitle}>Product details</Text>
          <View style={styles.infoGrid}>
            <InfoRow label="Brand" value={displayProduct.brand} />
            <InfoRow label="Category" value={displayProduct.category} />
            <InfoRow label="Unit" value={displayProduct.unit} />
            <InfoRow label="SKU" value={displayProduct.sku} />
            <InfoRow label="UPC" value={displayProduct.upc} />
          </View>

          {options.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Options</Text>
              <View style={styles.infoGrid}>
                {options.map((o, i) => (
                  <InfoRow key={`${o.label}-${i}`} label={o.label} value={o.value} />
                ))}
              </View>
            </>
          )}

          {!!displayProduct.description && (
            <>
              <Text style={styles.sectionTitle}>About this item</Text>
              <Text style={styles.fullDescription}>{displayProduct.description}</Text>
            </>
          )}

          <View style={styles.legalRow}>
            <TouchableOpacity
              onPress={() => openLink(legal?.privacyPolicyUrl)}
              disabled={!legal?.privacyPolicyUrl}
              activeOpacity={0.7}
              accessibilityLabel="Open privacy policy"
            >
              <Text style={[styles.legalLink, !legal?.privacyPolicyUrl && styles.legalLinkDisabled]}>
                Privacy Policy
              </Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>·</Text>
            <TouchableOpacity
              onPress={() => openLink(legal?.termsUrl)}
              disabled={!legal?.termsUrl}
              activeOpacity={0.7}
              accessibilityLabel="Open terms and conditions"
            >
              <Text style={[styles.legalLink, !legal?.termsUrl && styles.legalLinkDisabled]}>
                Terms &amp; Conditions
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Animated.View>
  );
};

const InfoRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value && value.length > 0 ? value : '—'}</Text>
  </View>
);

const styles = StyleSheet.create({
  sheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: colors.surfaceWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(215, 222, 215, 0.9)',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 16,
  },
  handleHitArea: {
    width: '100%',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D8CF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleMeta: {
    flex: 1,
    marginRight: 12,
  },
  categoryBrandText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  productTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
    lineHeight: 23,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  imageCard: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  detailsColumn: {
    flex: 1,
    gap: 8,
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  offerPriceText: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
  },
  regularPriceText: {
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: colors.dealChipBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.brandRed,
  },
  actionsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addToListWrapper: {
    flex: 1,
  },
  addedButton: {
    backgroundColor: colors.primaryDark,
  },
  favoriteButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceWhite,
  },
  favoriteButtonActive: {
    borderColor: colors.dealChipBg,
    backgroundColor: colors.dealChipBg,
  },
  detailsScroll: {
    flex: 1,
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  detailsContent: {
    paddingTop: 14,
    paddingBottom: 24,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: 6,
  },
  infoGrid: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  fullDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  legalLink: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  legalLinkDisabled: {
    color: colors.textMuted,
    textDecorationLine: 'none',
  },
  legalDot: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
