import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { usePlayerStore } from '../../store/usePlayerStore';
import { MiniPlayer } from './MiniPlayer';
import { usePlayerAnimation } from './usePlayerAnimation';

interface GlobalPlayerProps {
  children: React.ReactNode;
}

export const GlobalPlayer: React.FC<GlobalPlayerProps> = ({ children }) => {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  
  const {
    animatedContainerStyle,
    collapseOpacityStyle,
    expandedOpacityStyle,
    MIN_PLAYER_HEIGHT,
  } = usePlayerAnimation();

  return (
    <View style={styles.container}>
      {children}

      {currentTrack && (
        <Animated.View style={[styles.playerContainer, animatedContainerStyle]}>
          
          {/* Widok Pełnoekranowy (Rozwinięty) */}
          <Animated.View style={[StyleSheet.absoluteFill, expandedOpacityStyle, styles.fullScreenBg]}>
            <Animated.ScrollView
              bounces={false}
              scrollEventThrottle={16}
              contentContainerStyle={styles.scrollContent}
            >
              <View className="items-center justify-center p-8">
                <Text className="text-white font-bold text-xl">{currentTrack.title}</Text>
                <Text className="text-neutral-400 mt-2">{currentTrack.artist}</Text>
              </View>
            </Animated.ScrollView>
          </Animated.View>

          {/* Widok Mini-Playera (Zwinięty na dole) */}
          <Animated.View style={[collapseOpacityStyle, { height: MIN_PLAYER_HEIGHT }]}>
            <MiniPlayer />
          </Animated.View>

        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  playerContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    zIndex: 99,
    overflow: 'hidden',
    backgroundColor: '#171717',
  },
  fullScreenBg: { 
    backgroundColor: '#0a0a0a' 
  },
  scrollContent: { 
    paddingTop: 60, 
    paddingBottom: 40 
  },
});
