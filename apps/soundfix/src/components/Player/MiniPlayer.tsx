import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Directions, GestureDetector, useFlingGesture } from 'react-native-gesture-handler';
import { usePlayerStore } from '../../store/usePlayerStore';
import { MEDIA_URL } from '../../config/env';
import { noSongImg } from '../../utils/images';
import { scheduleOnRN } from 'react-native-worklets';

const BAR_HEIGHT = 60;

/**
 * MiniPlayer
 *
 * The collapsed, always-visible player bar (Spotify-style) shown just above
 * the bottom tab bar. Can be opened either by tapping it or, like in Spotify,
 * by swiping it upwards.
 */
export const MiniPlayer = () => {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const skipToNext = usePlayerStore((s) => s.skipToNext);
  const setIsExpanded = usePlayerStore((s) => s.setIsExpanded);

  // Swiping up on the bar opens the full player, same as in Spotify.
  const swipeUpGesture = useFlingGesture({
    direction: Directions.UP,
    onActivate: () => {
      'worllet'
      setIsExpanded(true);
    },
  });

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? Math.min(position / duration, 1) * 100 : 0;

  const togglePlayback = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <GestureDetector gesture={swipeUpGesture}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.container}
        onPress={() => scheduleOnRN(() => setIsExpanded(true))}>

        {/* Thin progress line at the very top of the bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>

        <View style={styles.content}>
          <Image source={{ uri: `${MEDIA_URL}/${currentTrack.coverUrl}`||noSongImg }} style={styles.artwork} />

          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>

          <TouchableOpacity hitSlop={12} onPress={togglePlayback} style={styles.iconButton}>
            <Icon name={isPlaying ? 'pause' : 'play'} size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity hitSlop={12} onPress={skipToNext} style={styles.iconButton}>
            <Icon name="play-skip-forward" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    height: BAR_HEIGHT,
    backgroundColor: '#282828',
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressTrack: {
    height: 2,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  progressFill: {
    height: 2,
    backgroundColor: '#1DB954',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#3e3e3e',
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 12,
    marginTop: 2,
  },
  iconButton: {
    padding: 6,
    marginLeft: 4,
  },
});




// import React, { useCallback, useEffect, useState } from 'react';
// import { View, Text, Image, StyleSheet } from 'react-native';
// import { usePlayerStore } from '../../store/usePlayerStore';
// import { MEDIA_URL } from '../../config/env';
// import { useProgress } from '@rntp/player';
// import LinearGradient from 'react-native-linear-gradient';
// import {MovingText} from '../MovingText';
// import { PlayButton } from './PlayButton';
// import { GestureDetector, usePanGesture, useSimultaneousGestures, useTapGesture } from 'react-native-gesture-handler';
// import ImageColors from 'react-native-image-colors';
// import { darkColor } from '../../utils/constants';
// import { Platform } from 'react-native';
// import { noSongImg, notImage } from '../../utils/images';
// import { scheduleOnRN } from 'react-native-worklets';

// type Props = {
//   onTap: () => void;
// };

// export const MiniPlayer = ({ onTap }: Props) => {
//   const [colors, setColors] = useState(['#666', '#666']);
//   const { currentTrack } = usePlayerStore();
//   const { position, duration } = useProgress();

//   const handleTogglePlayer = useCallback(() => {
//     onTap();
//   }, [onTap]);

//   const pan = usePanGesture({
//     onDeactivate: (event) => {
//       if (event.translationY < -50) {
//         scheduleOnRN(handleTogglePlayer);
//       }
//     },
//   });

//   const tap = useTapGesture({
//     onDeactivate: () => {
//       scheduleOnRN(handleTogglePlayer);
//     },
//   });

//   const gesture = useSimultaneousGestures(pan, tap);

//   useEffect(() => {
//     if (!currentTrack || !currentTrack.coverUrl) {
//       setColors(['#666', '#666']);
//       return;
//     }

//     const url = `${MEDIA_URL}/${currentTrack.coverUrl}` || `${notImage}`
//     ImageColors
//       .getColors(url, {
//         fallback: '#666',
//         cache: true,
//         key: url,
//       })
//       .then((c: any) => {
//         const color = Platform.OS === 'ios' ? c.secondary : c.vibrant;
//         const darkenedSecondary = darkColor(color);
//         setColors([darkenedSecondary, darkenedSecondary]);
//       })
//       .catch((err) => {
//         console.warn('Nie udało się pobrać kolorów okładki:', err.message);
//         setColors(['#666', '#666']);
//       });
//   }, [currentTrack]);

//    if (!currentTrack) {
//     return null;
//   }

//    const calculateProgressWidth: any = () => {
//     if (duration > 0) {
//       const procentage = (position / duration) * 100;
//       return `${procentage}%`;
//     }
//     return '0%';
//   };

//   return (

//     <View style={{ flex: 1, flexDirection: 'row' }}>
//        <GestureDetector gesture={gesture}>
//       <View style={{ flexGrow: 1 }}>
//         <LinearGradient colors={colors} style={s.container} >
//           <View style={s.flexRowBetween}>
              
//             <View style={s.flexRow}>
//           <Image
//             source={{ uri: `${MEDIA_URL}/${currentTrack.coverUrl}` || noSongImg }}
//             style={s.img}
//            />
//            <View style={{ width: '68%' }}>
//             <MovingText text={currentTrack.title} style={{ fontWeight: 'bold', fontSize: 16}} />

//             <Text numberOfLines={1} style={{paddingHorizontal: 6, opacity: 5}}>{currentTrack.artist}</Text>
//            </View>
//             </View>
//           </View>

//           <View style={s.progressContainer}>
//             <View style={s.progressBackground}>
//               <View
//                 style={[s.progressBar, { width: calculateProgressWidth() }]}
//               />
//             </View>
//           </View>
//         </LinearGradient>
//       </View>
//     </GestureDetector>
//       <View style={s.playButton}>
//          <PlayButton />
//  </View>
//     </View>
 
     
       
//   );
// };

// const s = StyleSheet.create({
//   container: {
//     paddingTop: 4,
//     height: 60,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 5,
//     overflow: 'hidden',
//     width: '100%',
//   },
//   img: {
//     borderRadius: 5,
//     width: 45,
//     height: 45,
//     resizeMode: 'cover',
//   },
//   flexRowBetween: {
//     flexDirection: 'row',
//     justifyContent: 'flex-start',
//     alignItems: 'center',
//     width: '100%',
//   },
//   flexRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   progressContainer: {
//     height: 2,
//     width: '100%',
//     marginTop: 5,
//   },
//   progressBackground: {
//     height: 3,
//     backgroundColor: 'rgba(255,255,255,0.3)',
//   },
//   progressBar: {
//     height: 3,
//     backgroundColor: '#fff',
//   },
//   playButton: {
//     position: 'absolute',
//     right: 10,
//     top: 18,
//     transform: [{ translateY: -15 }],
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1000,
//   }
// });