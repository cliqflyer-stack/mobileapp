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
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Product } from '../../data/flyerData';
import { colors, radii, spacing } from '../../theme';
import { Button } from '../ui/Button';

interface ProductBottomSheetProps {
  product: Product | null;
  onClose: () => void;
  onAddToList?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
}

export const ProductBottomSheet: React.FC<ProductBottomSheetProps> = ({
  product,
  onClose,
  onAddToList,
  onToggleFavorite,
}) => {
  const [activeProduct, setActiveProduct] = useState<Product | null>(product);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const translateY = useRef(new Animated.Value(380)).current;

  // Slide up when product is selected, slide down when product is cleared
  useEffect(() => {
    if (product) {
      setActiveProduct(product);
      setIsAdded(false);
      setIsFavorite(false);

      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 380,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setActiveProduct(null);
        }
      });
    }
  }, [product]);

  // PanResponder on drag handle to allow swipe-down to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 70 || gesture.vy > 0.6) {
          // Dismiss sheet
          onClose();
        } else {
          // Snap back to open
          Animated.spring(translateY, {
            toValue: 0,
            friction: 7,
            tension: 70,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!activeProduct && !product) return null;

  const displayProduct = product || activeProduct;
  if (!displayProduct) return null;

  const discountPercent =
    displayProduct.regularPrice > 0
      ? Math.max(
          0,
          Math.round(
            (1 - displayProduct.offerPrice / displayProduct.regularPrice) * 100
          )
        )
      : 0;

  const handleFavoritePress = () => {
    setIsFavorite((prev) => !prev);
    onToggleFavorite?.(displayProduct);
  };

  const handleAddPress = () => {
    setIsAdded(true);
    onAddToList?.(displayProduct);
  };

  return (
    <Animated.View
      style={[
        styles.sheetWrapper,
        {
          transform: [{ translateY }],
        },
      ]}
      pointerEvents={product ? 'auto' : 'none'}
    >
      <View style={styles.sheetContainer}>
        {/* Top Drag Handle (Swipe down to dismiss) */}
        <View style={styles.handleHitArea} {...panResponder.panHandlers}>
          <View style={styles.handleBar} />
        </View>

        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.titleMeta}>
            <Text style={styles.categoryBrandText}>
              {displayProduct.brand.toUpperCase()} ·{' '}
              {displayProduct.category.toUpperCase()}
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

        {/* Product Info Row */}
        <View style={styles.bodyRow}>
          {/* Product Image Card */}
          <View style={styles.imageCard}>
            <Image
              source={displayProduct.image}
              style={styles.productImage}
              resizeMode="contain"
            />
          </View>

          {/* Description & Price Column */}
          <View style={styles.detailsColumn}>
            <Text style={styles.descriptionText} numberOfLines={3}>
              {displayProduct.description}
            </Text>

            {/* Price Row */}
            <View style={styles.priceRow}>
              <Text style={styles.offerPriceText}>
                ${displayProduct.offerPrice.toFixed(2)}
              </Text>
              <Text style={styles.regularPriceText}>
                ${displayProduct.regularPrice.toFixed(2)}
              </Text>
              {discountPercent > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>
                    {discountPercent}% OFF
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Actions Footer */}
        <View style={styles.actionsFooter}>
          <View style={styles.addToListWrapper}>
            <Button
              label={isAdded ? 'Added to list ✓' : 'Add to shopping list'}
              variant="primary"
              onPress={handleAddPress}
              style={isAdded ? styles.addedButton : undefined}
            />
          </View>

          {/* Favorite Heart CTA */}
          <TouchableOpacity
            onPress={handleFavoritePress}
            activeOpacity={0.7}
            style={[
              styles.favoriteButton,
              isFavorite && styles.favoriteButtonActive,
            ]}
            accessibilityLabel="Add to favourites"
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? colors.brandRed : colors.primaryDark}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  sheetContainer: {
    backgroundColor: colors.surfaceWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(215, 222, 215, 0.9)',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
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
});
