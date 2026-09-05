import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  GestureDetector,
  useNativeGesture,
  usePanGesture,
  useSimultaneousGestures,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import ImageColors from 'react-native-image-colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from '../../store/usePlayerStore';
import { ControllsAndDetails } from './ControlsAndDetails';
import { VideoBackground } from './VideoBackground';
import { MEDIA_URL } from '../../config/env';
import { noSongImg } from '../../utils/images';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARTWORK_SIZE = SCREEN_WIDTH - 64;
const DEFAULT_BACKGROUND_COLOR = '#3d3d3d';
const SWIPE_DISMISS_THRESHOLD = 120;
const SWIPE_DISMISS_VELOCITY = 800;

/**
 * useArtworkColor
 *
 * Extracts a dominant color from the current track's artwork so the
 * background gradient can mimic Spotify's "color washed" now-playing screen.
 * Skipped entirely for video tracks, which use VideoBackground instead.
 */
const useArtworkColor = (coverUrl?: string) => {
  const [color, setColor] = useState(DEFAULT_BACKGROUND_COLOR);

  useEffect(() => {
    let isMounted = true;

    if (!coverUrl) {
      setColor(DEFAULT_BACKGROUND_COLOR);
      return;
    }

    ImageColors.getColors(coverUrl, {
      fallback: DEFAULT_BACKGROUND_COLOR,
      cache: true,
      key: coverUrl,
    })
      .then((result:any) => {
        if (!isMounted) return;

        // Result shape differs per platform
        if (result.platform === 'android') {
          setColor(result.dominant ?? DEFAULT_BACKGROUND_COLOR);
        } else if (result.platform === 'ios') {
          setColor(result.background ?? DEFAULT_BACKGROUND_COLOR);
        } else {
          setColor(DEFAULT_BACKGROUND_COLOR);
        }
      })
      .catch(() => {
        if (isMounted) setColor(DEFAULT_BACKGROUND_COLOR);
      });

    return () => {
      isMounted = false;
    };
  }, [coverUrl]);

  return color;
};

export const FullScreenPlayer = () => {
  const insets = useSafeAreaInsets();

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const setIsExpanded = usePlayerStore((s) => s.setIsExpanded);
  const getCurrentTrackUrl = usePlayerStore((s) => s.getCurrentTrackUrl);

  const imageUrl = `${MEDIA_URL}/${currentTrack?.coverUrl}` || noSongImg
  const backgroundColor = useArtworkColor(imageUrl);

  // "Canvas"-style looping video background, shown instead of the static
  // artwork when the current track's mimeType is video/*.
  const isVideoTrack = currentTrack?.mimeType?.startsWith('video/') ?? false;
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!isVideoTrack) {
      setVideoUrl(null);
      return;
    }

    getCurrentTrackUrl().then((url) => {
      if (isMounted) setVideoUrl(url || null);
    });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVideoTrack, currentTrack?.id]);

  const closePlayer = useCallback(() => {
    setIsExpanded(false);
  }, [setIsExpanded]);

  // --- Swipe-down-to-dismiss, working from anywhere on the screen ---------
  // scrollY tracks how far the ScrollView content has scrolled, so the drag
  // gesture only takes over (and starts moving the whole screen down) when
  // the user is at the very top of the content and pulling further down.
  // Otherwise the touch is left entirely to the ScrollView so it keeps
  // scrolling normally, exactly like the now-playing screen in Spotify.
  const scrollY = useSharedValue(0);
  const translateY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Lets the ScrollView's own gesture keep working while our pan gesture
  // is also being recognized on top of it.
  const nativeGesture = useNativeGesture({});

  const panGesture = usePanGesture({
    simultaneousWith: nativeGesture,
    onUpdate: (event) => {
      const isAtTop = scrollY.value <= 0;
      const isPullingDown = event.translationY > 0;
      if (isAtTop && isPullingDown) {
        translateY.value = event.translationY;
      }
    },
    onDeactivate: (event) => {
      const wasDragging = translateY.value > 0;
      const shouldClose =
        wasDragging &&
        (translateY.value > SWIPE_DISMISS_THRESHOLD || event.velocityY > SWIPE_DISMISS_VELOCITY);

      if (shouldClose) {
        scheduleOnRN(closePlayer);
      }
      translateY.value = withTiming(0, { duration: 200 });
    },
  });

  const composedGesture = useSimultaneousGestures(panGesture, nativeGesture);

  const dragAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!currentTrack) return null;

  return (
    <Animated.View style={[styles.flex, dragAnimatedStyle]}>
      {/* Background: looping video "canvas" for video tracks, color-washed
          gradient extracted from the artwork otherwise. */}
      {isVideoTrack && videoUrl ? (
        <VideoBackground videoUri={videoUrl} style={StyleSheet.absoluteFill} />
      ) : (
        <LinearGradient
          colors={[backgroundColor, '#121212']}
          style={StyleSheet.absoluteFill}
        />
      )}

      <GestureDetector gesture={composedGesture}>
        <Animated.ScrollView
          style={styles.flex}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces
        >
          {/* Header now scrolls away with the rest of the content, and is
              just one more thing you can swipe down on to close the player. */}
          <View style={styles.header}>
            <TouchableOpacity hitSlop={12} onPress={closePlayer}>
              <Icon name="chevron-down" size={28} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerTextWrapper}>
              <Text style={styles.headerSubtitle}>PLAYING FROM PLAYLIST</Text>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {currentTrack.album ?? 'Unknown album'}
              </Text>
            </View>

            <TouchableOpacity hitSlop={12}>
              <Icon name="ellipsis-horizontal" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {!isVideoTrack && (
            <View style={styles.artworkWrapper}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.artwork}
                resizeMode="cover"
              />
            </View>
          )}

          <ControllsAndDetails
            track={currentTrack}
            isPlaying={isPlaying}
            position={position}
            duration={duration}
          />

          <View style={styles.bottomIconsRow}>
            <TouchableOpacity hitSlop={12}>
              <Icon name="phone-portrait-outline" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <TouchableOpacity hitSlop={12}>
              <Icon name="list-outline" size={22} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Artist info section, revealed by scrolling down */}
          <View style={styles.artistSection}>
            <Text style={styles.sectionLabel}>About the artist</Text>

            <View style={styles.artistCard}>
              <Image source={{ uri: currentTrack.coverUrl }} style={styles.artistImage} />
              <View style={styles.artistInfoOverlay}>
                <Text style={styles.artistName}>{currentTrack.artist}</Text>
              </View>
            </View>

            <Text style={styles.artistDescription}>
              {/* TODO: replace with real artist bio / monthly listeners from your API */}
              No bio available yet for this artist.
            </Text>

            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  headerTextWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  artworkWrapper: {
    alignItems: 'center',
    marginTop: 16,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 8,
    backgroundColor: '#3e3e3e',
  },
  bottomIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    paddingHorizontal: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 32,
    marginBottom: 24,
  },
  artistSection: {
    paddingBottom: 40,
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  artistCard: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
  },
  artistImage: {
    width: '100%',
    height: '100%',
  },
  artistInfoOverlay: {
    position: 'absolute',
    left: 12,
    bottom: 12,
  },
  artistName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  artistDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
  },
  followButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  absoluteFillObject: {}
});





// import {
//   Image,
//   Platform,
//   StatusBar,
//   StatusBarProps,
//   StyleSheet,
//   Text,
//   View,
// } from 'react-native';
// import Animated, {
//   Extrapolation,
//   interpolate,
//   runOnJS,
//   SharedValue,
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
// } from 'react-native-reanimated';
// import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';

// import LinearGradient from 'react-native-linear-gradient';
// import { useEffect, useState } from 'react';
// import { usePlayerStore } from '../../store/usePlayerStore';
// import { screenHeight, screenWidth } from '../../utils/constants';
// import { MEDIA_URL } from '../../config/env';
// import { usePlayerColors } from './usePlayerColors';
// import VideoPlayer from './VideoPlayer';
// import ControlsAndDetails from './ControlsAndDetails';
// import { noSongImg } from '../../utils/images';

// type Props = {
//   onClose: () => void;
//   expandProgress: SharedValue<number>;
//   colors: any
// };

// const FullScreenPlayer = ({ onClose, colors }: Props) => {
//   const translateY = useSharedValue(0);
//   const { currentTrack, getCurrentTrackUrl } = usePlayerStore();
//   const [videoSourceUrl, setVideoSourceUrl] = useState<string>('');

//   const pan = usePanGesture({
//     activeOffsetY: 10,
//     failOffsetY: -10,

//     onUpdate: event => {
//       // Only down
//       if (event.translationY > 0) {
//         translateY.value = event.translationY;
//       }
//     },

//     onDeactivate: event => {
//       if (event.translationY > 150) {
//         translateY.value = withSpring(0);
//         runOnJS(onClose)();
//       } else {
//         translateY.value = withSpring(0);
//       }
//     },
//   });

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: translateY.value }],
//     opacity: interpolate(
//       translateY.value,
//       [0, 200],
//       [1, 0.5],
//       Extrapolation.CLAMP,
//     ),
//   }));

//   useEffect(() => {
//     if (currentTrack?.mimeType?.includes('video/')) {
//       getCurrentTrackUrl().then(url => {
//         setVideoSourceUrl(url);
//       });
//     } else {
//       setVideoSourceUrl('');
//     }
//   }, [currentTrack, getCurrentTrackUrl]);

//   return (
//     <GestureDetector gesture={pan}>
//     <Animated.View style={[styles.container, animatedStyle]}>
//       <StatusBar
//         barStyle="light-content"
//         {...({ backgroundColor: 'transparent' } as StatusBarProps)}
//       />

//       <LinearGradient
//         style={styles.gradient}
//         colors={[colors.primary, colors.secondary, 'rgba(0,0,0,0.9)']}
//       />

      
//         <View style={styles.dragHandle}>
//           <View style={styles.dragIndicator} />
//         </View>
      

//       {currentTrack?.mimeType?.includes('audio/') ? (
//         <View style={styles.imageContainer}>
//           <Image
//             source={{
//               uri: currentTrack?.coverUrl
//                 ? `${MEDIA_URL}/${currentTrack.coverUrl}`
//                 : noSongImg,
//             }}
//             style={styles.img}
//           />
//         </View>
//       ) : (
//         <View>
//           {videoSourceUrl !== '' ? (
//             <VideoPlayer video_uri={videoSourceUrl} />
//           ) : (
//             <View style={styles.videoPlaceholder}>
//               <Text style={{ color: '#fff' }}>Loading video stream...</Text>
//             </View>
//           )}
//         </View>
//       )}

//       <View style={styles.albumContainer} />

//       <ControlsAndDetails />
//     </Animated.View>
//     </GestureDetector>
//   );
// };

// export default FullScreenPlayer;

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   dragHandle: {
//     alignItems: 'center',
//     paddingVertical: 32,
//   },
//   dragIndicator: {
//     width: 60,
//     height: 4,
//     backgroundColor: 'rgba(255,255,255,0.3)',
//     borderRadius: 2,
//     marginTop: 70,
//   },
//   top: { alignItems: 'center', marginBottom: 24 },
//   coverBig: {
//     width: screenWidth * 0.7,
//     height: screenWidth * 0.7,
//     borderRadius: 8,
//   },

//   gradient: {
//     position: 'absolute',
//     height: screenHeight + 200,
//     width: screenWidth,
//     zIndex: -3,
//     top: 0,
//     left: 0,
//     bottom: 0,
//     right: 0,
//   },
//   flexRowBetween: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 10,
//     marginTop: Platform.OS === 'ios' ? 50 : 30,
//   },
//   albumContainer: {
//     width: '95%',
//     height: screenHeight * 0.52,
//   },
//   imageContainer: {
//     position: 'absolute',
//     width: screenWidth * 0.9,
//     height: screenHeight * 0.42,
//     overflow: 'hidden',
//     borderRadius: 10,
//     alignSelf: 'center',
//     top: screenHeight * 0.14,
//   },
//   img: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   videoPlaceholder: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });
