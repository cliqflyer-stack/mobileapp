import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { colors } from '../../theme';

export type TransitionDirection = 'forward' | 'back' | 'tab' | 'none';

interface SmoothScreenTransitionProps {
  screenKey: string;
  direction?: TransitionDirection;
  children: React.ReactNode;
}

export const SmoothScreenTransition: React.FC<SmoothScreenTransitionProps> = ({
  screenKey,
  direction = 'forward',
  children,
}) => {
  const [currentKey, setCurrentKey] = useState(screenKey);
  const [currentNode, setCurrentNode] = useState<React.ReactNode>(children);
  const [outgoingNode, setOutgoingNode] = useState<{
    key: string;
    node: React.ReactNode;
    direction: TransitionDirection;
  } | null>(null);

  const animValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (screenKey !== currentKey) {
      // Transitioning to a new screen
      animValue.stopAnimation();

      setOutgoingNode({
        key: currentKey,
        node: currentNode,
        direction,
      });
      setCurrentKey(screenKey);
      setCurrentNode(children);

      animValue.setValue(0);
      const isTab = direction === 'tab';
      const duration = isTab ? 200 : 260;

      Animated.timing(animValue, {
        toValue: 1,
        duration,
        easing: Easing.bezier(0.2, 0.9, 0.3, 1),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setOutgoingNode(null);
        }
      });
    } else {
      // Same screen, just child updates
      setCurrentNode(children);
    }
  }, [screenKey, children, direction]);

  // Interpolations based on transition direction
  const activeDirection = outgoingNode?.direction || direction;

  // Incoming Screen Animations
  const incomingOpacity = animValue.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.7, 1],
  });

  const incomingTranslateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange:
      activeDirection === 'forward'
        ? [54, 0]
        : activeDirection === 'back'
        ? [-44, 0]
        : [0, 0],
  });

  const incomingScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: activeDirection === 'tab' ? [0.97, 1] : [1, 1],
  });

  // Outgoing Screen Animations
  const outgoingOpacity = animValue.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0.3, 0],
  });

  const outgoingTranslateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange:
      activeDirection === 'forward'
        ? [0, -44]
        : activeDirection === 'back'
        ? [0, 54]
        : [0, 0],
  });

  const outgoingScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: activeDirection === 'tab' ? [1, 0.97] : [1, 1],
  });

  const isTransitioning = Boolean(outgoingNode);

  return (
    <View style={styles.container}>
      {/* Outgoing Screen Layer */}
      {outgoingNode && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.screenLayer,
            {
              opacity: outgoingOpacity,
              transform: [
                { translateX: outgoingTranslateX },
                { scale: outgoingScale },
              ],
            },
          ]}
        >
          {outgoingNode.node}
        </Animated.View>
      )}

      {/* Incoming / Current Screen Layer */}
      <Animated.View
        style={[
          styles.screenLayer,
          isTransitioning && {
            opacity: incomingOpacity,
            transform: [
              { translateX: incomingTranslateX },
              { scale: incomingScale },
            ],
          },
        ]}
      >
        {currentNode}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  screenLayer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
  },
});
