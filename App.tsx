import React, { useState } from 'react';
import { StyleSheet, View, Alert, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  WelcomeScreen,
  NeighborhoodScreen,
  CreateAccountScreen,
  SignInOptionsScreen,
  EmailSignInScreen,
  ForgotPasswordScreen,
  ExploreScreen,
  StoreFlyerScreen,
  MapScreen,
  AiScreen,
} from './src/screens';
import { ScreenId } from './src/components/ui/ScreenSwitcher';
import { colors } from './src/theme';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('welcome');
  const [previousScreen, setPreviousScreen] = useState<ScreenId>('welcome');
  const [selectedFlyerId, setSelectedFlyerId] = useState<string>('flyer_drug_mart');

  const navigateTo = (screen: ScreenId) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const showFeedback = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onCreateAccount={() => navigateTo('create_account')}
            onSignIn={() => navigateTo('sign_in_options')}
            onContinueAsGuest={() => navigateTo('neighborhood')}
          />
        );

      case 'neighborhood':
        return (
          <NeighborhoodScreen
            onBack={() => navigateTo(previousScreen === 'neighborhood' ? 'welcome' : previousScreen)}
            onExplore={(city) => {
              showFeedback('Exploring', `Exploring offers in ${city}`);
              navigateTo('explore');
            }}
          />
        );

      case 'create_account':
        return (
          <CreateAccountScreen
            onBack={() => navigateTo('welcome')}
            onSubmit={(data) => {
              showFeedback('Account Created', `Welcome to flip, ${data.name || 'shopper'}!`);
              navigateTo('neighborhood');
            }}
            onNavigateToSignIn={() => navigateTo('email_sign_in')}
          />
        );

      case 'sign_in_options':
        return (
          <SignInOptionsScreen
            onBack={() => navigateTo('welcome')}
            onContinueWithFacebook={() => {
              showFeedback('Facebook Login', 'Connected! Redirecting to Explore...');
              navigateTo('explore');
            }}
            onContinueWithGoogle={() => {
              showFeedback('Google Login', 'Connected! Redirecting to Explore...');
              navigateTo('explore');
            }}
            onContinueWithApple={() => {
              showFeedback('Apple Login', 'Connected! Redirecting to Explore...');
              navigateTo('explore');
            }}
            onContinueWithEmail={() => navigateTo('email_sign_in')}
            onNotNow={() => navigateTo('neighborhood')}
            onCreateAccount={() => navigateTo('create_account')}
          />
        );

      case 'email_sign_in':
        return (
          <EmailSignInScreen
            onBack={() => navigateTo('sign_in_options')}
            onSignIn={(data) => {
              showFeedback('Sign In Successful', `Welcome back, ${data.email || 'shopper'}! Redirecting to Explore...`);
              navigateTo('explore');
            }}
            onForgotPassword={() => navigateTo('forgot_password')}
            onUseAnotherMethod={() => navigateTo('sign_in_options')}
            onCreateAccount={() => navigateTo('create_account')}
          />
        );

      case 'forgot_password':
        return (
          <ForgotPasswordScreen
            onBack={() => navigateTo('email_sign_in')}
            onSendResetLink={(email) => {
              showFeedback('Link Sent', `Password reset instructions sent to ${email || 'your email'}`);
              navigateTo('email_sign_in');
            }}
            onBackToSignIn={() => navigateTo('email_sign_in')}
          />
        );

      case 'explore':
        return (
          <ExploreScreen
            onLocationPress={() => navigateTo('neighborhood')}
            onNotificationsPress={() =>
              showFeedback('Notifications', 'No unread notifications')
            }
            onMapPress={() => navigateTo('map')}
            onAiPress={() => navigateTo('ai')}
            onFlyerPress={(flyerId) => {
              setSelectedFlyerId(flyerId);
              navigateTo('store_flyer');
            }}
            onDealPress={(dealTitle) =>
              showFeedback('Deal', `Viewing details for ${dealTitle}`)
            }
          />
        );

      case 'store_flyer':
        return (
          <StoreFlyerScreen
            flyerId={selectedFlyerId}
            onBack={() => navigateTo(previousScreen === 'store_flyer' ? 'explore' : previousScreen)}
            onNavigateHome={() => navigateTo('explore')}
          />
        );

      case 'map':
        return (
          <MapScreen
            onBack={() => navigateTo('explore')}
            onSelectFlyer={(store) => {
              showFeedback('Store Flyer', `Opening ${store.name} flyer`);
              navigateTo('store_flyer');
            }}
            onNavigateHome={() => navigateTo('explore')}
          />
        );

      case 'ai':
        return (
          <AiScreen
            onBack={() => navigateTo('explore')}
            onViewFlyer={(flyerId) => {
              showFeedback('Source Flyer', `Opening ${flyerId} weekly flyer`);
              navigateTo('store_flyer');
            }}
            onNavigateHome={() => navigateTo('explore')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.outerContainer}>
        <View style={styles.phoneContainer}>
          <View style={styles.contentArea}>
            {renderActiveScreen()}
          </View>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#ECEAE2' : colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  phoneContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 440 : undefined,
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 8,
    overflow: 'hidden',
  },
  contentArea: {
    flex: 1,
  },
});
