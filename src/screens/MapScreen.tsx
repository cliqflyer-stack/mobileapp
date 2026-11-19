import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { MAP_STORES, MapStore } from '../data/mapStoresData';
import { InteractiveRealMap, InteractiveRealMapRef } from '../components/map/InteractiveRealMap';
import { StoreDetailPreviewSheet } from '../components/map/StoreDetailPreviewSheet';
import { FloatingTabBar } from '../components/ui/FloatingTabBar';
import { BrandLogo } from '../components/ui/BrandLogo';
import { colors } from '../theme';

interface MapScreenProps {
  onBack: () => void;
  onSelectFlyer: (store: MapStore) => void;
  onNavigateHome?: () => void;
}

const FILTER_TAGS = ['All stores', 'Groceries', 'Open now', '5 km ⌄'];

export const MapScreen: React.FC<MapScreenProps> = ({
  onBack,
  onSelectFlyer,
  onNavigateHome,
}) => {
  const [selectedFilter, setSelectedFilter] = useState('All stores');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<MapStore | null>(null);
  const mapRef = useRef<InteractiveRealMapRef>(null);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleResetLocation = () => {
    mapRef.current?.recenter();
    setSelectedStore(null);
  };

  const handleDirections = (store: MapStore) => {
    const msg = `Opening directions to ${store.name} at ${store.address}`;
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert('Get Directions', msg);
    }
  };

  // Filter stores based on search query or category
  const filteredStores = MAP_STORES.filter((store) => {
    if (searchQuery.trim()) {
      const matchName = store.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = store.category.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchName && !matchCat) return false;
    }
    if (selectedFilter === 'Groceries' && store.category !== 'Groceries') {
      return false;
    }
    return true;
  });

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView edges={['top']} style={styles.topHeaderSafe}>
        {/* Top Header Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            style={styles.backIconButton}
            accessibilityLabel="Back to Explore"
          >
            <Feather name="arrow-left" size={20} color={colors.primaryDark} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Good finds nearby</Text>
            <View style={styles.headerSubPill}>
              <Text style={styles.locationPillText}>MARKHAM, ON</Text>
              <Feather name="chevron-down" size={12} color={colors.textMutedDark} />
            </View>
          </View>

          <BrandLogo height={24} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Feather name="search" size={18} color={colors.textMutedDark} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search deals & stores"
              placeholderTextColor={colors.textMutedDark}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={16} color={colors.textMutedDark} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.slidersButton} activeOpacity={0.7}>
            <Feather name="sliders" size={18} color={colors.primaryDark} />
          </TouchableOpacity>
        </View>

        {/* Filters Scroll */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
          >
            {FILTER_TAGS.map((tag) => {
              const isActive = tag === selectedFilter;
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => setSelectedFilter(tag)}
                  activeOpacity={0.8}
                  style={[
                    styles.filterChip,
                    isActive ? styles.filterChipActive : styles.filterChipInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive ? styles.filterChipTextActive : styles.filterChipTextInactive,
                    ]}
                  >
                    {tag === 'All stores' ? `All stores (${filteredStores.length})` : tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* Real Interactive Map Canvas */}
      <View style={styles.mapCanvasWrapper}>
        <InteractiveRealMap
          ref={mapRef}
          stores={filteredStores}
          selectedStore={selectedStore}
          onSelectStore={(store) => setSelectedStore(store)}
          onDeselect={() => setSelectedStore(null)}
        />

        {/* Floating Map Zoom / Recenter Controls */}
        <View style={styles.mapControlsContainer}>
          <TouchableOpacity
            style={styles.mapCtrlBtn}
            onPress={handleZoomIn}
            activeOpacity={0.8}
            accessibilityLabel="Zoom in"
          >
            <Feather name="plus" size={18} color={colors.primaryDark} />
          </TouchableOpacity>
          <View style={styles.ctrlDivider} />
          <TouchableOpacity
            style={styles.mapCtrlBtn}
            onPress={handleZoomOut}
            activeOpacity={0.8}
            accessibilityLabel="Zoom out"
          >
            <Feather name="minus" size={18} color={colors.primaryDark} />
          </TouchableOpacity>
          <View style={styles.ctrlDivider} />
          <TouchableOpacity
            style={styles.mapCtrlBtn}
            onPress={handleResetLocation}
            activeOpacity={0.8}
            accessibilityLabel="Recenter location"
          >
            <Ionicons name="locate" size={18} color="#075E50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet or Summary Card */}
      {selectedStore ? (
        <StoreDetailPreviewSheet
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
          onViewFlyer={(store) => onSelectFlyer(store)}
          onDirections={handleDirections}
        />
      ) : (
        <View style={styles.unselectedSummaryCard}>
          <View style={styles.summaryTextGroup}>
            <View style={styles.summaryTitleRow}>
              <View style={styles.greenPulseDot} />
              <Text style={styles.summaryTitle}>
                {filteredStores.length} stores around you
              </Text>
            </View>
            <Text style={styles.summarySubtitle}>
              Drag map freely or tap any pin to view flyer & deals
            </Text>
          </View>

          <TouchableOpacity
            style={styles.listViewPill}
            onPress={() => {
              if (filteredStores.length > 0) {
                const target = filteredStores[0];
                setSelectedStore(target);
                mapRef.current?.selectStore(target);
              }
            }}
            activeOpacity={0.8}
          >
            <Feather name="list" size={14} color="#075E50" />
            <Text style={styles.listViewText}>First flyer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Bottom Navigation Tab Bar */}
      <FloatingTabBar
        activeTab="explore"
        onTabPress={(tab) => {
          if (tab === 'explore' && onNavigateHome) {
            onNavigateHome();
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  topHeaderSafe: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEEA',
    zIndex: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F5F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: -0.2,
  },
  headerSubPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMutedDark,
    letterSpacing: 0.4,
  },
  brandLogo: {
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: '800',
    color: '#075E50',
    letterSpacing: -0.5,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textDark,
    paddingVertical: 0,
  },
  slidersButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F3F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersWrapper: {
    paddingBottom: 10,
  },
  filtersScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  filterChipActive: {
    backgroundColor: '#075E50',
  },
  filterChipInactive: {
    backgroundColor: '#F3F4F1',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#D8F36A',
  },
  filterChipTextInactive: {
    color: colors.primaryDark,
  },
  mapCanvasWrapper: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E6EBE6',
  },
  mapControlsContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 15,
  },
  mapCtrlBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlDivider: {
    height: 1,
    backgroundColor: '#ECEEEA',
  },
  unselectedSummaryCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    paddingBottom: Platform.OS === 'ios' ? 76 : 64,
  },
  summaryTextGroup: {
    flex: 1,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#075E50',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  summarySubtitle: {
    fontSize: 11.5,
    color: colors.textMutedDark,
    marginTop: 2,
  },
  listViewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 6,
  },
  listViewText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#075E50',
  },
});
