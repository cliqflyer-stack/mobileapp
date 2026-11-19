import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import {
  DEFAULT_AI_SEARCH_RESULT,
  AiSearchResultResponse,
  AiProductComparison,
} from '../data/aiAssistantData';
import { AiProductComparisonCard } from '../components/ai/AiProductComparisonCard';
import { AiBasketCard } from '../components/ai/AiBasketCard';
import { FloatingTabBar } from '../components/ui/FloatingTabBar';
import { BrandLogo } from '../components/ui/BrandLogo';
import { colors } from '../theme';

interface AiScreenProps {
  onBack: () => void;
  onViewFlyer: (flyerId: string) => void;
  onNavigateHome?: () => void;
}

export const AiScreen: React.FC<AiScreenProps> = ({
  onBack,
  onViewFlyer,
  onNavigateHome,
}) => {
  // 'composer' matches Figma 67:1435; 'results' matches Figma 67:955
  const [viewMode, setViewMode] = useState<'composer' | 'results'>('composer');
  const [searchQuery, setSearchQuery] = useState('Ask for Pepsi, Coke, milk, bread and eggs...');
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [aiData, setAiData] = useState<AiSearchResultResponse>(DEFAULT_AI_SEARCH_RESULT);

  const showToast = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSubmitSearch = (customQuery?: string) => {
    const queryToUse = customQuery || searchQuery;
    // Update data query
    setAiData((prev) => ({
      ...prev,
      query: queryToUse.replace('Ask for ', '').replace('...', ''),
    }));
    setViewMode('results');
  };

  const handleAddAllToList = () => {
    showToast(
      'Added to List',
      `All ${aiData.basket.itemCount} items ($${aiData.basket.totalPrice.toFixed(2)} CAD) added to your shopping list!`
    );
  };

  const handleSaveToHistory = () => {
    showToast(
      'Saved to History',
      'Search picks saved to your history for fast re-ordering.'
    );
  };

  const handleAddToCart = (product: AiProductComparison) => {
    showToast('Item Added', `${product.name} added to your shopping list.`);
  };

  const handleFollowUpSend = () => {
    if (!followUpQuery.trim()) return;
    showToast(
      'AI Shopping Assistant',
      `Analyzing "${followUpQuery}" with active flyers...`
    );
    setFollowUpQuery('');
  };

  // ==========================================
  // RENDER: COMPOSER VIEW (Figma 67:1435)
  // ==========================================
  if (viewMode === 'composer') {
    return (
      <View style={styles.composerDarkContainer}>
        <SafeAreaView edges={['top']} style={styles.composerSafeHeader}>
          {/* Header Row */}
          <View style={styles.composerHeaderRow}>
            {/* Back to Shopping */}
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.7}
              style={styles.backShoppingBtn}
              accessibilityLabel="Back to shopping"
            >
              <Feather name="arrow-left" size={18} color="#D8F36A" />
              <Text style={styles.backShoppingText}>Shopping</Text>
            </TouchableOpacity>

            {/* Logo + AI Badge */}
            <View style={styles.aiLogoGroup}>
              <BrandLogo height={20} variant="white" />
              <View style={styles.aiBadgePill}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            </View>

            {/* Location */}
            <TouchableOpacity
              style={styles.composerLocationPill}
              activeOpacity={0.7}
              onPress={() => showToast('Location', 'Markham, ON selected')}
            >
              <Text style={styles.composerLocationText}>Markham</Text>
              <Feather name="chevron-down" size={13} color="#A7C7BF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <ScrollView
          style={styles.composerScroll}
          contentContainerStyle={styles.composerScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.composerHero}>
            {/* Centerpiece Star Graphic */}
            <Image
              source={require('../../assets/images/ai/ai_centerpiece.png')}
              style={styles.centerpieceImage}
              resizeMode="contain"
            />

            <Text style={styles.composerDisplayWhite}>Your list.</Text>
            <Text style={styles.composerDisplayChartreuse}>A little brighter.</Text>
            <Text style={styles.composerHeroSubtext}>
              Tell flip what you need this week. We’ll search local flyers and piece together the best run.
            </Text>
          </View>

          {/* Composer Input Card */}
          <View style={styles.composerCard}>
            <View style={styles.composerCardHeader}>
              <Ionicons name="sparkles" size={13} color="#D8F36A" />
              <Text style={styles.composerCardTag}>WHAT'S ON YOUR LIST?</Text>
            </View>

            <TextInput
              style={styles.composerInput}
              multiline
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Ask for Pepsi, Coke, milk, bread and eggs..."
              placeholderTextColor="rgba(255, 255, 255, 0.45)"
            />

            {/* Controls Bar inside card */}
            <View style={styles.composerCardBottomBar}>
              <View style={styles.speakRow}>
                <TouchableOpacity
                  style={styles.micCircleBtn}
                  activeOpacity={0.7}
                  onPress={() => showToast('Voice Search', 'Voice recognition listening...')}
                >
                  <Feather name="mic" size={16} color="#D8F36A" />
                </TouchableOpacity>
                <Text style={styles.speakHintText}>Type or speak</Text>
              </View>

              <TouchableOpacity
                style={styles.submitCtaBtn}
                activeOpacity={0.85}
                onPress={() => handleSubmitSearch()}
                accessibilityLabel="Submit shopping request"
              >
                <Text style={styles.submitCtaText}>Submit ↗</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Suggested Demo Prompts */}
          <View style={styles.suggestedPromptsSection}>
            <Text style={styles.suggestedHeading}>TRY ASKING</Text>
            <TouchableOpacity
              style={styles.suggestedPromptPill}
              activeOpacity={0.7}
              onPress={() => handleSubmitSearch('Pepsi, Coke, milk, bread and eggs')}
            >
              <Ionicons name="flash-outline" size={14} color="#D8F36A" />
              <Text style={styles.suggestedPromptText}>
                Pepsi, Coke, milk, bread and eggs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.suggestedPromptPill}
              activeOpacity={0.7}
              onPress={() => handleSubmitSearch('Pantry staples under $20')}
            >
              <Ionicons name="flash-outline" size={14} color="#D8F36A" />
              <Text style={styles.suggestedPromptText}>
                Pantry essentials & breakfast under $20
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Note */}
          <Text style={styles.composerDisclaimer}>
            Sample flyer · Demo offers, not live prices
          </Text>
        </ScrollView>
      </View>
    );
  }

  // ==========================================
  // RENDER: RESULTS VIEW (Figma 67:955)
  // ==========================================
  return (
    <View style={styles.resultsContainer}>
      <SafeAreaView edges={['top']} style={styles.resultsSafeHeader}>
        {/* Top Header Row */}
        <View style={styles.resultsHeaderRow}>
          <TouchableOpacity
            onPress={() => setViewMode('composer')}
            activeOpacity={0.7}
            style={styles.resultsBackBtn}
            accessibilityLabel="Edit query or back"
          >
            <Feather name="arrow-left" size={19} color={colors.primaryDark} />
          </TouchableOpacity>

          <View style={styles.resultsHeaderBadge}>
            <Ionicons name="sparkles" size={12} color="#075E50" />
            <Text style={styles.resultsBadgeText}>FLIP AI · DEMO</Text>
          </View>

          <TouchableOpacity
            style={styles.historyBtn}
            activeOpacity={0.7}
            onPress={() => showToast('Search History', 'Past AI search runs saved in history')}
          >
            <Feather name="clock" size={18} color={colors.primaryDark} />
          </TouchableOpacity>
        </View>

        {/* Title & Location Row */}
        <View style={styles.resultsTitleRow}>
          <View style={styles.resultsTitleGroup}>
            <Text style={styles.resultsHeading}>Your list.</Text>
            <Text style={styles.resultsSubHeading}>One clever search.</Text>
          </View>

          <View style={styles.resultsLocationPill}>
            <Text style={styles.resultsLocationText}>Markham, ON</Text>
            <Feather name="chevron-down" size={12} color={colors.textMutedDark} />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.resultsScroll}
        contentContainerStyle={styles.resultsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Shopping Request Query Card */}
        <View style={styles.queryCard}>
          <View style={styles.queryHeaderRow}>
            <View style={styles.queryTagRow}>
              <Ionicons name="search" size={12} color="#075E50" />
              <Text style={styles.queryCardTag}>YOUR SHOPPING REQUEST</Text>
            </View>

            <TouchableOpacity
              onPress={() => setViewMode('composer')}
              activeOpacity={0.7}
              style={styles.editSearchBtn}
            >
              <Feather name="edit-2" size={12} color="#075E50" />
              <Text style={styles.editSearchText}>Edit search</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.queryBodyText}>"{aiData.query}"</Text>

          <View style={styles.queryStatusRow}>
            <View style={styles.detectedGreenDot} />
            <Text style={styles.queryStatusText}>
              Sent · {aiData.detectedTags.length} products detected
            </Text>
          </View>

          {/* Parsed Keyword Badges */}
          <View style={styles.tagsWrapper}>
            {aiData.detectedTags.map((tag, idx) => (
              <View key={idx} style={styles.tagPill}>
                <Text style={styles.tagPillText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Assistant Reply Box */}
        <View style={styles.assistantReplyCard}>
          <View style={styles.assistantTitleRow}>
            <View style={styles.sparkleIconCircle}>
              <Ionicons name="sparkles" size={14} color="#075E50" />
            </View>
            <Text style={styles.assistantTitle}>{aiData.assistantTitle}</Text>
          </View>

          <Text style={styles.assistantBody}>{aiData.assistantSummary}</Text>

          <Text style={styles.assistantDisclaimer}>{aiData.disclaimer}</Text>
        </View>

        {/* Section Header: 5 Products Found */}
        <View style={styles.productsSectionHeader}>
          <Text style={styles.productsCountHeading}>
            {aiData.products.length} Product Matches
          </Text>
          <Text style={styles.productsSubCount}>
            Ranked by lowest price in Markham
          </Text>
        </View>

        {/* Product Comparison Cards (5 items) */}
        {aiData.products.map((product) => (
          <AiProductComparisonCard
            key={product.id}
            product={product}
            onViewFlyer={(flyerId) => onViewFlyer(flyerId)}
            onAddToCart={handleAddToCart}
          />
        ))}

        {/* Consolidated Basket Card */}
        <AiBasketCard
          basket={aiData.basket}
          onAddAllToList={handleAddAllToList}
          onSaveToHistory={handleSaveToHistory}
        />

        {/* Follow-up Conversation Composer */}
        <View style={styles.followUpCard}>
          <Text style={styles.followUpTitle}>Anything else on your list?</Text>

          {/* Suggested quick follow-up */}
          <TouchableOpacity
            style={styles.suggestedFollowUpPill}
            activeOpacity={0.7}
            onPress={() => setFollowUpQuery(aiData.suggestedQuestions[0])}
          >
            <Ionicons name="help-circle-outline" size={14} color="#075E50" />
            <Text style={styles.suggestedFollowUpText}>
              {aiData.suggestedQuestions[0]}
            </Text>
          </TouchableOpacity>

          <View style={styles.followUpInputRow}>
            <TextInput
              style={styles.followUpInput}
              placeholder="Ask a follow-up or add more items..."
              placeholderTextColor={colors.textMutedDark}
              value={followUpQuery}
              onChangeText={setFollowUpQuery}
              onSubmitEditing={handleFollowUpSend}
            />
            <TouchableOpacity
              style={styles.sendFollowUpBtn}
              onPress={handleFollowUpSend}
              activeOpacity={0.8}
            >
              <Feather name="arrow-up" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
  // ==========================
  // COMPOSER STYLES (67:1435)
  // ==========================
  composerDarkContainer: {
    flex: 1,
    backgroundColor: '#073D37',
  },
  composerSafeHeader: {
    backgroundColor: '#073D37',
  },
  composerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backShoppingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backShoppingText: {
    color: '#D8F36A',
    fontSize: 13,
    fontWeight: '700',
  },
  aiLogoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiLogoText: {
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  aiBadgePill: {
    backgroundColor: '#D8F36A',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#073D37',
  },
  composerLocationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  composerLocationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  composerScroll: {
    flex: 1,
  },
  composerScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  composerHero: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  centerpieceImage: {
    width: 280,
    height: 120,
    marginBottom: 16,
  },
  composerDisplayWhite: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    textAlign: 'center',
    lineHeight: 38,
  },
  composerDisplayChartreuse: {
    fontSize: 34,
    fontWeight: '800',
    color: '#D8F36A',
    letterSpacing: -0.8,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 10,
  },
  composerHeroSubtext: {
    fontSize: 14,
    color: '#A5C4BD',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  composerCard: {
    backgroundColor: '#0A4A43',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#0F6258',
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  composerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  composerCardTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D8F36A',
    letterSpacing: 0.8,
  },
  composerInput: {
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  composerCardBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
    marginTop: 6,
  },
  speakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  micCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakHintText: {
    fontSize: 12,
    color: '#A5C4BD',
  },
  submitCtaBtn: {
    backgroundColor: '#D8F36A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#D8F36A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  submitCtaText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#073D37',
  },
  suggestedPromptsSection: {
    marginBottom: 24,
  },
  suggestedHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7AA39B',
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingLeft: 4,
  },
  suggestedPromptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 8,
  },
  suggestedPromptText: {
    fontSize: 13,
    color: '#E0EDE8',
    fontWeight: '500',
  },
  composerDisclaimer: {
    fontSize: 11,
    color: '#658D84',
    textAlign: 'center',
    marginTop: 10,
  },

  // ==========================
  // RESULTS STYLES (67:955)
  // ==========================
  resultsContainer: {
    flex: 1,
    backgroundColor: '#F7F5EE',
  },
  resultsSafeHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEAE2',
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultsBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  resultsBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#075E50',
    letterSpacing: 0.5,
  },
  historyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  resultsTitleGroup: {},
  resultsHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: -0.4,
  },
  resultsSubHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMutedDark,
  },
  resultsLocationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  resultsLocationText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  resultsScroll: {
    flex: 1,
  },
  resultsScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  queryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEAE2',
  },
  queryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  queryTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  queryCardTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#075E50',
    letterSpacing: 0.6,
  },
  editSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editSearchText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#075E50',
  },
  queryBodyText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  queryStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  detectedGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#075E50',
  },
  queryStatusText: {
    fontSize: 11.5,
    color: colors.textMutedDark,
    fontWeight: '500',
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    backgroundColor: '#D8F36A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#075E50',
  },
  assistantReplyCard: {
    backgroundColor: '#E8EFE6',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D7E3D4',
  },
  assistantTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sparkleIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#075E50',
  },
  assistantBody: {
    fontSize: 12.5,
    color: '#2A4D45',
    lineHeight: 18,
    marginBottom: 8,
  },
  assistantDisclaimer: {
    fontSize: 10.5,
    color: '#5C7C74',
    fontStyle: 'italic',
  },
  productsSectionHeader: {
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  productsCountHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: -0.2,
  },
  productsSubCount: {
    fontSize: 11.5,
    color: colors.textMutedDark,
    marginTop: 1,
  },
  followUpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECEAE2',
  },
  followUpTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 10,
  },
  suggestedFollowUpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F5F1',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    marginBottom: 10,
    gap: 6,
  },
  suggestedFollowUpText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#075E50',
  },
  followUpInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9F7',
    borderRadius: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E6E8E4',
  },
  followUpInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textDark,
    paddingVertical: 10,
  },
  sendFollowUpBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#075E50',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});
