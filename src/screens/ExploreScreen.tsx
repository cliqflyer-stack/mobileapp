import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme';
import {
  ScreenWrapper,
  FlyerCard,
  DealTicket,
  FloatingTabBar,
  TabKey,
  BrandLogo,
} from '../components/ui';
import { getFlyers, getDeals, DynamicDeal } from '../services/api';
import { StoreFlyer, DEFAULT_STORE_FLYER } from '../data/flyerData';

interface ExploreScreenProps {
  onLocationPress?: () => void;
  onNotificationsPress?: () => void;
  onSearchPress?: () => void;
  onMapPress?: () => void;
  onAiPress?: () => void;
  onFlyerPress?: (storeName: string) => void;
  onDealPress?: (dealTitle: string) => void;
}

const CATEGORIES = [
  'For you',
  'Groceries',
  'Latest',
  'Fashion',
  'Home',
  'Beauty',
];

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  onLocationPress,
  onNotificationsPress,
  onSearchPress,
  onMapPress,
  onAiPress,
  onFlyerPress,
  onDealPress,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('For you');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('explore');
  const [dynamicFlyers, setDynamicFlyers] = useState<StoreFlyer[]>([]);
  const [dynamicDeals, setDynamicDeals] = useState<DynamicDeal[]>([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getFlyers(), getDeals()]).then(([flyers, deals]) => {
      if (isMounted) {
        setDynamicFlyers(flyers);
        setDynamicDeals(deals);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScreenWrapper
        scrollable
        contentContainerStyle={styles.scrollContent}
        style={styles.screenWrapper}
      >
        {/* Top Page Header */}
        <View style={styles.headerContainer}>
          {/* Brand Row */}
          <View style={styles.brandRow}>
            <BrandLogo height={28} />

            {/* Location Selector */}
            <TouchableOpacity
              onPress={onLocationPress || (() => showToast('Location', 'Markham, ON selected'))}
              activeOpacity={0.7}
              style={styles.locationPill}
              accessibilityLabel="Change location"
            >
              <Text style={styles.locationText}>MARKHAM, ON</Text>
              <Feather name="chevron-down" size={14} color={colors.textMutedDark} />
            </TouchableOpacity>

            {/* Notifications Bell */}
            <TouchableOpacity
              onPress={onNotificationsPress || (() => showToast('Notifications', 'No new notifications'))}
              activeOpacity={0.7}
              style={styles.bellButton}
              accessibilityLabel="Notifications"
            >
              <Feather name="bell" size={20} color={colors.primaryDark} />
            </TouchableOpacity>
          </View>

          {/* Heading */}
          <View style={styles.titleSection}>
            <Text style={styles.displayHeading}>Good finds,</Text>
            <Text style={styles.displayHeading}>right around you.</Text>
          </View>
        </View>

        {/* Discovery Tools (Search + Quick Actions) */}
        <View style={styles.discoveryRow}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={18} color={colors.textMutedDark} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search deals & stores"
              placeholderTextColor={colors.textMutedDark}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={onSearchPress}
            />
          </View>

          {/* Quick Action: Map */}
          <TouchableOpacity
            style={styles.mapQuickAction}
            onPress={onMapPress || (() => showToast('Map', 'Opening neighbourhood map'))}
            activeOpacity={0.7}
            accessibilityLabel="View map"
          >
            <Feather name="map" size={18} color={colors.primaryDark} />
            <Text style={styles.quickActionLabel}>Map</Text>
          </TouchableOpacity>

          {/* Quick Action: AI */}
          <TouchableOpacity
            style={styles.aiQuickAction}
            onPress={onAiPress || (() => showToast('AI Assistant', 'Ask flip AI for shopping recommendations'))}
            activeOpacity={0.7}
            accessibilityLabel="Flip AI"
          >
            <Ionicons name="sparkles" size={18} color={colors.primaryDark} />
            <Text style={styles.quickActionLabel}>AI</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Horizontal Scroll */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = cat === selectedCategory;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                  style={[
                    styles.categoryBadge,
                    isSelected ? styles.categoryBadgeActive : styles.categoryBadgeInactive,
                  ]}
                  accessibilityLabel={`Filter by ${cat}`}
                >
                  <Text
                    style={[
                      styles.categoryBadgeText,
                      isSelected
                        ? styles.categoryBadgeTextActive
                        : styles.categoryBadgeTextInactive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Savings Banner */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => showToast('Special Offer', '35% off weekly highlights')}
          style={styles.savingsBanner}
        >
          <Text style={styles.bannerPercentText}>35%</Text>
          <View style={styles.bannerCopy}>
            <Text style={styles.bannerHeadline}>Little prices. Big plans.</Text>
            <Text style={styles.bannerSubhead}>
              Up to 35% off demo picks this week →
            </Text>
          </View>
        </TouchableOpacity>

        {/* Section: This week's flyers */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>This week's flyers</Text>
          <TouchableOpacity
            onPress={() => showToast('Flyers', `Browsing all ${dynamicFlyers.length} flyers`)}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionLink}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Flyer Cards from Neon DB */}
        {dynamicFlyers.map((flyer) => (
          <FlyerCard
            key={flyer.id}
            storeName={flyer.storeName}
            storeInitial={flyer.storeLogoInitial}
            storeLogoBg={flyer.storeLogoBg}
            storeLogoColor={flyer.storeLogoColor}
            badgeText={flyer.badgeText}
            badgeVariant={flyer.badgeVariant === 'dark' ? 'dark' : 'lime'}
            flyerSubtitle={flyer.flyerDate}
            imageSource={flyer.flyerImage}
            imageHeight={260}
            onPress={() => onFlyerPress?.(flyer.id)}
          />
        ))}

        {/* Section: Deals near you */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Deals near you</Text>
          <TouchableOpacity
            onPress={() => showToast('Map', 'Viewing deals on map')}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionLink}>View map</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Deals from Neon DB */}
        {dynamicDeals.map((deal) => (
          <DealTicket
            key={deal.id}
            productImage={
              deal.imageUrl ? { uri: deal.imageUrl } : require('../../assets/images/explore/pepsi.png')
            }
            storeDistance={deal.storeDistance}
            title={deal.title}
            details={deal.details}
            price={deal.priceText}
            onPress={() => onDealPress?.(deal.title)}
            onAdd={() => showToast('Added', `${deal.title} added to shopping list`)}
          />
        ))}

        {/* Demo Disclosure */}
        <View style={styles.demoDisclosure}>
          <Feather name="info" size={13} color={colors.textMutedDark} />
          <Text style={styles.demoDisclosureText}>
            Demo offers · CAD · Not live prices
          </Text>
        </View>

        {/* Bottom space padding so scroll content clears the floating tab bar */}
        <View style={styles.bottomDockSpacer} />
      </ScreenWrapper>

      {/* Floating Bottom Tab Bar */}
      <FloatingTabBar
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          if (tab !== 'explore') {
            showToast(tab.charAt(0).toUpperCase() + tab.slice(1), `${tab} section`);
          }
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
  headerContainer: {
    marginBottom: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  brandLogo: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMutedDark,
    letterSpacing: 0.5,
  },
  bellButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginTop: 12,
    marginBottom: 6,
  },
  displayHeading: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
    color: colors.primaryDark,
    letterSpacing: -0.3,
  },
  discoveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE3DA',
    height: 48,
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.primaryDark,
    height: '100%',
    padding: 0,
  },
  mapQuickAction: {
    width: 52,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(232, 239, 230, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  aiQuickAction: {
    width: 52,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(216, 243, 106, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  quickActionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  categoriesSection: {
    marginBottom: 16,
    marginHorizontal: -spacing.lg,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  categoryBadgeActive: {
    backgroundColor: colors.primary,
  },
  categoryBadgeInactive: {
    backgroundColor: colors.accentLime,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryBadgeTextActive: {
    color: colors.surfaceWhite,
  },
  categoryBadgeTextInactive: {
    color: colors.primaryDark,
  },
  savingsBanner: {
    backgroundColor: colors.accentLime,
    borderRadius: 20,
    padding: 16,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  bannerPercentText: {
    fontSize: 52,
    fontWeight: '900',
    color: colors.primaryDark,
    letterSpacing: -1,
  },
  bannerCopy: {
    flex: 1,
    gap: 4,
  },
  bannerHeadline: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  bannerSubhead: {
    fontSize: 11,
    color: colors.primaryDark,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  demoDisclosure: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  demoDisclosureText: {
    fontSize: 10,
    color: colors.textMutedDark,
  },
  bottomDockSpacer: {
    height: 80,
  },
});
