import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme';
import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import { FloatingTabBar, TabKey } from '../components/ui/FloatingTabBar';
import { InteractiveFlyerCanvas } from '../components/flyer/InteractiveFlyerCanvas';
import { ProductBottomSheet } from '../components/flyer/ProductBottomSheet';
import {
  DEFAULT_STORE_FLYER,
  DUMMY_PRODUCTS,
  Product,
  StoreFlyer,
} from '../data/flyerData';
import { getFlyerById } from '../services/api';

interface StoreFlyerScreenProps {
  onBack: () => void;
  onNavigateHome?: () => void;
  flyerId?: string;
}

export const StoreFlyerScreen: React.FC<StoreFlyerScreenProps> = ({
  onBack,
  onNavigateHome,
  flyerId,
}) => {
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [isStoreFavorite, setIsStoreFavorite] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('explore');
  const [flyer, setFlyer] = useState<StoreFlyer>(DEFAULT_STORE_FLYER);
  const [productsMap, setProductsMap] = useState<Record<string, Product>>(DUMMY_PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    getFlyerById(flyerId || 'flyer_drug_mart').then(({ flyer: f, products: p }) => {
      if (isMounted) {
        setFlyer(f);
        setProductsMap(p);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [flyerId]);

  const showToast = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSelectHotspot = (hotspotId: string | null) => {
    setSelectedHotspotId(hotspotId);
  };

  const selectedHotspot = flyer.hotspots.find((h) => h.id === selectedHotspotId);
  const selectedProduct: Product | null = selectedHotspot
    ? productsMap[selectedHotspot.productId] || DUMMY_PRODUCTS[selectedHotspot.productId] || null
    : null;

  return (
    <View style={styles.outerContainer}>
      <ScreenWrapper
        scrollable
        contentContainerStyle={styles.scrollContent}
        style={styles.screenWrapper}
      >
        {/* Top Navigation Bar: Back to Home + Action Icons */}
        <View style={styles.topNavRow}>
          {/* Back to Home Button */}
          <TouchableOpacity
            onPress={onNavigateHome || onBack}
            activeOpacity={0.7}
            style={styles.backButton}
            accessibilityLabel="Back to Home"
          >
            <Feather name="arrow-left" size={20} color={colors.primary} />
            <Text style={styles.backLabel}>Home</Text>
          </TouchableOpacity>

          {/* Right Action Icons (Heart, Search, Notes counter with badge, List) */}
          <View style={styles.topActionsRow}>
            {/* Heart Favorite Store */}
            <TouchableOpacity
              onPress={() => setIsStoreFavorite((prev) => !prev)}
              activeOpacity={0.7}
              style={styles.iconButton}
              accessibilityLabel="Favorite store"
            >
              <Ionicons
                name={isStoreFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={colors.brandRed}
              />
            </TouchableOpacity>

            {/* Search */}
            <TouchableOpacity
              onPress={() => showToast('Search', 'Search flyer items')}
              activeOpacity={0.7}
              style={styles.iconButton}
              accessibilityLabel="Search flyer"
            >
              <Feather name="search" size={20} color={colors.primaryDark} />
            </TouchableOpacity>

            {/* Notes with badge count */}
            <TouchableOpacity
              onPress={() => showToast('Clippings', '1 active clipped deal')}
              activeOpacity={0.7}
              style={styles.iconButton}
              accessibilityLabel="Flyer notes"
            >
              <View style={styles.notesIconWrapper}>
                <Feather name="file-text" size={19} color={colors.primaryDark} />
                <View style={styles.notesBadge}>
                  <Text style={styles.notesBadgeText}>1</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* List */}
            <TouchableOpacity
              onPress={() => showToast('List', 'View flyer index list')}
              activeOpacity={0.7}
              style={styles.iconButton}
              accessibilityLabel="Flyer list"
            >
              <Feather name="list" size={20} color={colors.primaryDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Store Sub-Header */}
        <View style={styles.storeHeaderRow}>
          {/* Store Logo Circle */}
          <View style={[styles.storeLogoCircle, { backgroundColor: flyer.storeLogoBg }]}>
            <Text style={[styles.storeLogoText, { color: flyer.storeLogoColor || '#FFFFFF' }]}>
              {flyer.storeLogoInitial}
            </Text>
          </View>

          {/* Store Meta */}
          <View style={styles.storeMetaColumn}>
            <View style={styles.storeNameRow}>
              <Text style={styles.storeNameText}>{flyer.storeName}</Text>
              <View style={styles.memberBadge}>
                <Text style={styles.memberBadgeText}>{flyer.badgeText}</Text>
              </View>
            </View>
            <Text style={styles.flyerDateText}>{flyer.flyerDate}</Text>
          </View>
        </View>

        {/* Interactive Flyer Canvas */}
        <View style={styles.canvasSection}>
          <InteractiveFlyerCanvas
            flyerImage={flyer.flyerImage}
            aspectRatio={flyer.flyerAspectRatio}
            hotspots={flyer.hotspots}
            selectedHotspotId={selectedHotspotId}
            onSelectHotspot={handleSelectHotspot}
          />
        </View>

        {/* Offer Information Card */}
        <View style={styles.offerInfoCard}>
          <Text style={styles.offerInfoTitle}>You're viewing reference offers</Text>
          <Text style={styles.offerInfoBody}>
            Oct 15–21 preview · All prices in CAD. These sample offers are transcribed from the supplied flyer, not live verified prices. Check with Longo's for current prices and availability.
          </Text>
        </View>

        {/* Back to this week's flyers button */}
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={styles.backToFlyersRow}
          accessibilityLabel="Back to this week's flyers"
        >
          <Feather name="arrow-left" size={16} color={colors.primary} />
          <Text style={styles.backToFlyersText}>Back to this week's flyers</Text>
        </TouchableOpacity>

        {/* Bottom Dock Spacer */}
        <View style={styles.bottomSpacer} />
      </ScreenWrapper>

      {/* Floating Bottom Tab Bar (hidden when product bottom sheet is active) */}
      {!selectedProduct && (
        <FloatingTabBar
          activeTab={activeTab}
          onTabPress={(tab) => {
            setActiveTab(tab);
            if (tab === 'explore') {
              onBack();
            } else {
              showToast(tab.charAt(0).toUpperCase() + tab.slice(1), `${tab} section`);
            }
          }}
        />
      )}

      {/* Product Detail Bottom Sheet */}
      <ProductBottomSheet
        product={selectedProduct}
        legal={{ privacyPolicyUrl: flyer.privacyPolicyUrl, termsUrl: flyer.termsUrl }}
        onClose={() => setSelectedHotspotId(null)}
        onAddToList={(prod) => {
          showToast('Added to list', `${prod.name} saved to shopping list`);
        }}
        onToggleFavorite={(prod) => {
          showToast('Favourites', `${prod.name} updated in favourites`);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: 40,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingRight: 8,
  },
  backLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesIconWrapper: {
    position: 'relative',
  },
  notesBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.brandRed,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  storeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  storeLogoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeLogoText: {
    fontSize: 16,
    fontWeight: '800',
  },
  storeMetaColumn: {
    flex: 1,
    gap: 2,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storeNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  memberBadge: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  memberBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.accentLime,
  },
  flyerDateText: {
    fontSize: 11,
    color: colors.textMutedDark,
  },
  canvasSection: {
    marginBottom: 18,
  },
  offerInfoCard: {
    backgroundColor: colors.sageContainer,
    borderRadius: 20,
    padding: 16,
    gap: 6,
    marginBottom: 20,
  },
  offerInfoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  offerInfoBody: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMutedDark,
  },
  backToFlyersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 24,
  },
  backToFlyersText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  bottomSpacer: {
    height: 80,
  },
});
