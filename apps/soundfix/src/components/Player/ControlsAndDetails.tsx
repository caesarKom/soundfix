import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import TrackPlayer from '@rntp/player';
import { usePlayerStore, Track } from '../../store/usePlayerStore';

interface ControllsAndDetailsProps {
  track: Track;
  isPlaying: boolean;
  position: number;
  duration: number;
}

/** Formats seconds as m:ss, e.g. 125 -> "2:05" */
const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * MarqueeText
 *
 * Scrolls its text horizontally in an infinite loop when the text is wider
 * than the available container (mimics the now-playing title behaviour in
 * Spotify). When the text already fits, it just renders statically.
 */
const MarqueeText: React.FC<{ text: string; style?: any }> = ({ text, style }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useSharedValue(0);

  const shouldScroll = textWidth > containerWidth && containerWidth > 0;

  useEffect(() => {
    if (!shouldScroll) {
      translateX.value = 0;
      return;
    }

    const distance = textWidth - containerWidth + 24; // small breathing room at the end
    const scrollDuration = distance * 40; // px -> ms factor, controls scroll speed

    translateX.value = withDelay(
      1200, // pause before the scroll starts
      withRepeat(
        withSequence(
          withTiming(-distance, { duration: scrollDuration, easing: Easing.linear }),
          withTiming(-distance, { duration: 900 }), // pause at the end
          withTiming(0, { duration: scrollDuration, easing: Easing.linear }),
          withTiming(0, { duration: 900 }), // pause at the start
        ),
        -1,
      ),
    );
  }, [shouldScroll, textWidth, containerWidth, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={styles.marqueeContainer}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.Text
        style={[style, animatedStyle, styles.marqueeText]}
        numberOfLines={1}
        onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
      >
        {text}
      </Animated.Text>
    </View>
  );
};

/**
 * ControllsAndDetails
 *
 * Track title/artist + seek bar + transport controls (shuffle, previous,
 * play/pause, next, repeat). Used inside FullScreenPlayer.
 */
export const ControllsAndDetails: React.FC<ControllsAndDetailsProps> = ({
  track,
  isPlaying,
  position,
  duration,
}) => {
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const skipToNext = usePlayerStore((s) => s.skipToNext);
  const skipToPrevious = usePlayerStore((s) => s.skipToPrevious);
  const updatePosition = usePlayerStore((s) => s.updatePosition);

  // Local slider value so dragging feels smooth and doesn't fight with
  // position updates coming from the native player while the user is seeking.
  const [sliderValue, setSliderValue] = useState(position);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    if (!isSeeking) {
      setSliderValue(position);
    }
  }, [position, isSeeking]);

  const togglePlayback = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSlidingStart = () => setIsSeeking(true);

  const handleSlidingComplete = async (value: number) => {
    setIsSeeking(false);
    try {
      // NOTE: confirm the exact seek method name exposed by @rntp/player,
      // it may be `seekTo`, `seekBy`, or something similar in your version.
      await TrackPlayer.seekTo(value);
      updatePosition(value, duration);
    } catch (error) {
      console.error('Seek failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleTextWrapper}>
          <MarqueeText text={track.title} style={styles.title} />
          <Text style={styles.artist} numberOfLines={1}>
            {track.artist}
          </Text>
        </View>

        <TouchableOpacity hitSlop={12} style={styles.likeButton}>
          <Icon name="heart-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.sliderWrapper}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={Math.max(duration, 1)}
          value={sliderValue}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="rgba(255,255,255,0.3)"
          thumbTintColor="#fff"
          onSlidingStart={handleSlidingStart}
          onValueChange={setSliderValue}
          onSlidingComplete={handleSlidingComplete}
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(sliderValue)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity hitSlop={12}>
          <Icon name="shuffle" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <TouchableOpacity hitSlop={16} onPress={skipToPrevious}>
          <Icon name="play-skip-back" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlayback} style={styles.playButton} hitSlop={8}>
          <Icon name={isPlaying ? 'pause' : 'play'} size={30} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity hitSlop={16} onPress={skipToNext}>
          <Icon name="play-skip-forward" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity hitSlop={12}>
          <Icon name="repeat" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleTextWrapper: {
    flex: 1,
    marginRight: 16,
  },
  marqueeContainer: {
    overflow: 'hidden',
    width: '100%',
  },
  marqueeText: {
    alignSelf: 'flex-start',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  artist: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    marginTop: 4,
  },
  likeButton: {
    padding: 4,
  },
  sliderWrapper: {
    marginTop: 24,
  },
  slider: {
    width: '100%',
    height: 32,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  timeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    paddingHorizontal: 4,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});






// import { View, Platform, StyleSheet, Text } from 'react-native';
// import React, { useEffect, useState } from 'react';
// import Slider from '@react-native-community/slider';
// import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
// import IonIcon from 'react-native-vector-icons/Ionicons';
// import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
// import Toast from 'react-native-toast-message';
// import { MovingText } from '../MovingText';
// import CustomText from '../CustomText';
// import { Colors, fontR, FONTS, screenWidth } from '../../utils/constants';
// import ScalePress from '../ScalePress';
// import { PlayButton } from './PlayButton';
// import TrackPlayer, { useProgress } from '@rntp/player';
// import { usePlayerStore } from '../../store/usePlayerStore';

// // Funkcja pomocnicza do formatowania sekund (np. 145s -> "2:25")
// const formatTime = (seconds: number) => {
//   if (isNaN(seconds) || seconds < 0) return '0:00';
//   const mins = Math.floor(seconds / 60);
//   const secs = Math.floor(seconds % 60);
//   return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
// };

// export const ControlsAndDetails = () => {
//   const [icon, setIcon] = useState<any>();
//   const {currentTrack, skipToNext, skipToPrevious} = usePlayerStore()
//   const { position, duration } = useProgress();

//   useEffect(() => {
//     MaterialIcon.getImageSource('circle', 15, 'white').then(setIcon);
//   }, []);

//   const handleSeek = async (value: number) => {
//     if (duration > 0) {
//       const targetSeconds = value * duration;
//       TrackPlayer.seekTo(targetSeconds);
//     }
//   };

//   const handleLooping = async () => {
//     // TODO: Tutaj podepnij swoją logikę zapętlania/losowania
//     Toast.show({ type: 'info', text1: 'Looping', text2: 'Feature coming soon' });
//   };

//   const handleLike = async () => {
//     // TODO: Zintegruj ze swoim hookiem/sklepem polubień (likeMusic/unlikeMusic)
//     Toast.show({ type: 'success', text1: 'Liked', text2: 'Added to your Library' });
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.flexRowBetween}>
//         <View style={{ width: '85%' }}>
//           {currentTrack ? (
//             <MovingText
//               style={{ fontFamily: FONTS.Bold, fontSize: fontR(14), color: '#fff' }}
//               text={currentTrack.title}
//             />
//           ) : (
//             <Text style={{ color: '#fff', fontSize: fontR(14) }}>No Track</Text>
//           )}
//           <CustomText
//             fontSize={fontR(9)}
//             fontFamily={FONTS.Medium}
//             style={styles.artist}
//           >
//             {currentTrack?.artist || 'Unknown Artist'}
//           </CustomText>
//         </View>

//         <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -20 }}>
//           <ScalePress onPress={handleLike}>
//             <MaterialIcon
//               name="add-circle-outline"
//               color="#fff"
//               size={fontR(29)}
//             />
//           </ScalePress>
//         </View>
//       </View>

//       {/* ✅ POPRAWKA: Bezpieczna kalkulacja wartości postępu piosenki (od 0.0 do 1.0) */}
//       <Slider
//         style={styles.slider}
//         minimumValue={0}
//         maximumValue={1}
//         value={duration > 0 ? position / duration : 0}
//         tapToSeek
//         onSlidingComplete={handleSeek}
//         thumbImage={icon}
//         minimumTrackTintColor="#fff"
//         maximumTrackTintColor="rgba(255,255,255,0.3)"
//       />

//       <View style={styles.timeZone}>
//         <CustomText fontSize={fontR(7)} style={{ color: '#fff' }}>
//           {formatTime(position)}
//         </CustomText>
//         {/* Odliczanie czasu wstecz (do końca utworu) */}
//         <CustomText fontSize={fontR(7)} style={{ color: '#fff' }}>
//           {formatTime(Math.max(0, duration - position))}
//         </CustomText>
//       </View>

//       <View style={styles.flexRowBetween}>
//         <ScalePress onPress={handleLooping}>
//           <IonIcon
//             name="shuffle"
//             color={Colors.primary}
//             size={fontR(22)}
//           />
//         </ScalePress>
        
//         {/* ✅ POPRAWKA: Podpięcie Twojej akcji skipToPrevious ze stora */}
//         <ScalePress onPress={() => void skipToPrevious()}>
//           <IonIcon
//             name="play-skip-back-sharp"
//             color="#fff"
//             size={fontR(26)}
//           />
//         </ScalePress>
        
//         {/* Twój przycisk odtwarzania */}
//         <PlayButton size={54} />

//         {/* ✅ POPRAWKA: Podpięcie Twojej akcji skipToNext ze stora */}
//         <ScalePress onPress={() => void skipToNext()}>
//           <IonIcon
//             name="play-skip-forward-sharp"
//             color="#fff"
//             size={fontR(26)}
//           />
//         </ScalePress>
        
//         <ScalePress>
//           <MaterialCommunityIcon
//             name="alarm"
//             color="#fff"
//             size={fontR(22)}
//           />
//         </ScalePress>
//       </View>

//       <View style={{ width: screenWidth, flexDirection: "row", marginVertical: 20, justifyContent: "space-between" }}>
//         <View style={{ flexDirection: "row", gap: 10, padding: 20 }}>
//           <ScalePress>
//             <MaterialIcon
//               name="broadcast-on-home"
//               color="#fff"
//               size={fontR(22)}
//             />
//           </ScalePress>
//         </View>
//         <View style={{ flexDirection: "row", gap: 14, padding: 20, marginRight: 25 }}>
//           <ScalePress>
//             <IonIcon
//               name="share-social-outline"
//               color="#fff"
//               size={fontR(22)}
//             />
//           </ScalePress>
//           <ScalePress>
//             <IonIcon
//               name="library-outline"
//               color="#fff"
//               size={fontR(22)}
//             />
//           </ScalePress>
//         </View>
//       </View>

//       <View style={{ marginTop: 40 }}>
//         <Text style={{ color: "#fff", fontFamily: FONTS.Bold }}>Artist info</Text>
//         <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4 }}>
//           {currentTrack?.artist ? `Learn more about ${currentTrack.artist}` : 'No information available'}
//         </Text>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     zIndex: 88,
//   },
//   slider: {
//     width: Platform.OS === 'android' ? screenWidth - 20 : screenWidth - 30,
//     height: 40,
//     alignSelf: 'center',
//     marginTop: 10,
//   },
//   timeZone: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 5,
//   },
//   flexRowBetween: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   artist: {
//     opacity: 0.8,
//     marginTop: 5,
//     color: '#fff',
//   },
// });

// export default ControlsAndDetails;
