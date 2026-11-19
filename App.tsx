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
import { SmoothScreenTransition, TransitionDirection } from './src/components/ui';
import { colors } from './src/theme';

const MAIN_TABS: ScreenId[] = ['explore', 'map', 'ai'];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('welcome');
  const [previousScreen, setPreviousScreen] = useState<ScreenId>('welcome');
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>('forward');
  const [screenHistory, setScreenHistory] = useState<ScreenId[]>(['welcome']);
  const [selectedFlyerId, setSelectedFlyerId] = useState<string>('flyer_drug_mart');

  const navigateTo = (screen: ScreenId, explicitDirection?: TransitionDirection) => {
    if (screen === currentScreen) return;

    let dir: TransitionDirection = explicitDirection || 'forward';

    if (!explicitDirection) {
      if (MAIN_TABS.includes(currentScreen) && MAIN_TABS.includes(screen)) {
        dir = 'tab';
      } else if (
        screenHistory.length > 1 &&
        screenHistory[screenHistory.length - 2] === screen
      ) {
        dir = 'back';
      } else if (
        screen === 'welcome' ||
        (screen === 'neighborhood' && currentScreen === 'explore') ||
        (currentScreen === 'store_flyer' && MAIN_TABS.includes(screen))
      ) {
        dir = 'back';
      }
    }

    setTransitionDirection(dir);
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);

    if (dir === 'back') {
      setScreenHistory((prev) => {
        const idx = prev.lastIndexOf(screen);
        if (idx !== -1) {
          return prev.slice(0, idx + 1);
        }
        return [...prev.slice(0, -1), screen];
      });
    } else if (dir === 'tab') {
      setScreenHistory((prev) => [...prev.slice(0, -1), screen]);
    } else {
      setScreenHistory((prev) => [...prev, screen]);
    }
  };

  const showFeedback = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const renderActiveScreen = (screenToRender: ScreenId) => {
    switch (screenToRender) {
      case 'welcome':
        return (
          <WelcomeScreen
            onCreateAccount={() => navigateTo('create_account', 'forward')}
            onSignIn={() => navigateTo('sign_in_options', 'forward')}
            onContinueAsGuest={() => navigateTo('neighborhood', 'forward')}
          />
        );

      case 'neighborhood':
        return (
          <NeighborhoodScreen
            onBack={() =>
              navigateTo(
                previousScreen === 'neighborhood' ? 'welcome' : previousScreen,
                'back'
              )
            }
            onExplore={(city) => {
              showFeedback('Exploring', `Exploring offers in ${city}`);
              navigateTo('explore', 'forward');
            }}
          />
        );

      case 'create_account':
        return (
          <CreateAccountScreen
            onBack={() => navigateTo('welcome', 'back')}
            onSubmit={(data) => {
              showFeedback('Account Created', `Welcome to flip, ${data.name || 'shopper'}!`);
              navigateTo('neighborhood', 'forward');
            }}
            onNavigateToSignIn={() => navigateTo('email_sign_in', 'forward')}
          />
        );

      case 'sign_in_options':
        return (
          <SignInOptionsScreen
            onBack={() => navigateTo('welcome', 'back')}
            onContinueWithFacebook={() => {
              showFeedback('Facebook Login', 'Connected! Redirecting to Explore...');
              navigateTo('explore', 'forward');
            }}
            onContinueWithGoogle={() => {
              showFeedback('Google Login', 'Connected! Redirecting to Explore...');
              navigateTo('explore', 'forward');
            }}
            onContinueWithApple={() => {
              showFeedback('Apple Login', 'Connected! Redirecting to Explore...');
              navigateTo('explore', 'forward');
            }}
            onContinueWithEmail={() => navigateTo('email_sign_in', 'forward')}
            onNotNow={() => navigateTo('neighborhood', 'forward')}
            onCreateAccount={() => navigateTo('create_account', 'forward')}
          />
        );

      case 'email_sign_in':
        return (
          <EmailSignInScreen
            onBack={() => navigateTo('sign_in_options', 'back')}
            onSignIn={(data) => {
              showFeedback('Sign In Successful', `Welcome back, ${data.email || 'shopper'}! Redirecting to Explore...`);
              navigateTo('explore', 'forward');
            }}
            onForgotPassword={() => navigateTo('forgot_password', 'forward')}
            onUseAnotherMethod={() => navigateTo('sign_in_options', 'back')}
            onCreateAccount={() => navigateTo('create_account', 'forward')}
          />
        );

      case 'forgot_password':
        return (
          <ForgotPasswordScreen
            onBack={() => navigateTo('email_sign_in', 'back')}
            onSendResetLink={(email) => {
              showFeedback('Link Sent', `Password reset instructions sent to ${email || 'your email'}`);
              navigateTo('email_sign_in', 'back');
            }}
            onBackToSignIn={() => navigateTo('email_sign_in', 'back')}
          />
        );

      case 'explore':
        return (
          <ExploreScreen
            onLocationPress={() => navigateTo('neighborhood', 'forward')}
            onNotificationsPress={() =>
              showFeedback('Notifications', 'No unread notifications')
            }
            onMapPress={() => navigateTo('map', 'tab')}
            onAiPress={() => navigateTo('ai', 'tab')}
            onFlyerPress={(flyerId) => {
              setSelectedFlyerId(flyerId);
              navigateTo('store_flyer', 'forward');
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
            onBack={() =>
              navigateTo(
                previousScreen === 'store_flyer' ? 'explore' : previousScreen,
                'back'
              )
            }
            onNavigateHome={() => navigateTo('explore', 'back')}
          />
        );

      case 'map':
        return (
          <MapScreen
            onBack={() => navigateTo('explore', 'tab')}
            onSelectFlyer={(store) => {
              showFeedback('Store Flyer', `Opening ${store.name} flyer`);
              navigateTo('store_flyer', 'forward');
            }}
            onNavigateHome={() => navigateTo('explore', 'tab')}
          />
        );

      case 'ai':
        return (
          <AiScreen
            onBack={() => navigateTo('explore', 'tab')}
            onViewFlyer={(flyerId) => {
              showFeedback('Source Flyer', `Opening ${flyerId} weekly flyer`);
              navigateTo('store_flyer', 'forward');
            }}
            onNavigateHome={() => navigateTo('explore', 'tab')}
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
            <SmoothScreenTransition
              screenKey={currentScreen}
              direction={transitionDirection}
            >
              {renderActiveScreen(currentScreen)}
            </SmoothScreenTransition>
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
