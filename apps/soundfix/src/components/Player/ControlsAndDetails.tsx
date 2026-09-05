import { View, Platform, StyleSheet, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import Slider from '@react-native-community/slider';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { MovingText } from '../MovingText';
import CustomText from '../CustomText';
import { Colors, fontR, FONTS, screenWidth } from '../../utils/constants';
import ScalePress from '../ScalePress';
import { PlayButton } from './PlayButton';
import TrackPlayer, { useProgress } from '@rntp/player';
import { usePlayerStore } from '../../store/usePlayerStore';

// Funkcja pomocnicza do formatowania sekund (np. 145s -> "2:25")
const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const ControlsAndDetails = () => {
  const [icon, setIcon] = useState<any>();
  const {currentTrack, skipToNext, skipToPrevious} = usePlayerStore()
  const { position, duration } = useProgress();

  useEffect(() => {
    MaterialIcon.getImageSource('circle', 15, 'white').then(setIcon);
  }, []);

  const handleSeek = async (value: number) => {
    if (duration > 0) {
      const targetSeconds = value * duration;
      TrackPlayer.seekTo(targetSeconds);
    }
  };

  const handleLooping = async () => {
    // TODO: Tutaj podepnij swoją logikę zapętlania/losowania
    Toast.show({ type: 'info', text1: 'Looping', text2: 'Feature coming soon' });
  };

  const handleLike = async () => {
    // TODO: Zintegruj ze swoim hookiem/sklepem polubień (likeMusic/unlikeMusic)
    Toast.show({ type: 'success', text1: 'Liked', text2: 'Added to your Library' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.flexRowBetween}>
        <View style={{ width: '85%' }}>
          {currentTrack ? (
            <MovingText
              style={{ fontFamily: FONTS.Bold, fontSize: fontR(14), color: '#fff' }}
              text={currentTrack.title}
            />
          ) : (
            <Text style={{ color: '#fff', fontSize: fontR(14) }}>No Track</Text>
          )}
          <CustomText
            fontSize={fontR(9)}
            fontFamily={FONTS.Medium}
            style={styles.artist}
          >
            {currentTrack?.artist || 'Unknown Artist'}
          </CustomText>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -20 }}>
          <ScalePress onPress={handleLike}>
            <MaterialIcon
              name="add-circle-outline"
              color="#fff"
              size={fontR(29)}
            />
          </ScalePress>
        </View>
      </View>

      {/* ✅ POPRAWKA: Bezpieczna kalkulacja wartości postępu piosenki (od 0.0 do 1.0) */}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={duration > 0 ? position / duration : 0}
        tapToSeek
        onSlidingComplete={handleSeek}
        thumbImage={icon}
        minimumTrackTintColor="#fff"
        maximumTrackTintColor="rgba(255,255,255,0.3)"
      />

      <View style={styles.timeZone}>
        <CustomText fontSize={fontR(7)} style={{ color: '#fff' }}>
          {formatTime(position)}
        </CustomText>
        {/* Odliczanie czasu wstecz (do końca utworu) */}
        <CustomText fontSize={fontR(7)} style={{ color: '#fff' }}>
          {formatTime(Math.max(0, duration - position))}
        </CustomText>
      </View>

      <View style={styles.flexRowBetween}>
        <ScalePress onPress={handleLooping}>
          <IonIcon
            name="shuffle"
            color={Colors.primary}
            size={fontR(22)}
          />
        </ScalePress>
        
        {/* ✅ POPRAWKA: Podpięcie Twojej akcji skipToPrevious ze stora */}
        <ScalePress onPress={() => void skipToPrevious()}>
          <IonIcon
            name="play-skip-back-sharp"
            color="#fff"
            size={fontR(26)}
          />
        </ScalePress>
        
        {/* Twój przycisk odtwarzania */}
        <PlayButton size={54} />

        {/* ✅ POPRAWKA: Podpięcie Twojej akcji skipToNext ze stora */}
        <ScalePress onPress={() => void skipToNext()}>
          <IonIcon
            name="play-skip-forward-sharp"
            color="#fff"
            size={fontR(26)}
          />
        </ScalePress>
        
        <ScalePress>
          <MaterialCommunityIcon
            name="alarm"
            color="#fff"
            size={fontR(22)}
          />
        </ScalePress>
      </View>

      <View style={{ width: screenWidth, flexDirection: "row", marginVertical: 20, justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", gap: 10, padding: 20 }}>
          <ScalePress>
            <MaterialIcon
              name="broadcast-on-home"
              color="#fff"
              size={fontR(22)}
            />
          </ScalePress>
        </View>
        <View style={{ flexDirection: "row", gap: 14, padding: 20, marginRight: 25 }}>
          <ScalePress>
            <IonIcon
              name="share-social-outline"
              color="#fff"
              size={fontR(22)}
            />
          </ScalePress>
          <ScalePress>
            <IonIcon
              name="library-outline"
              color="#fff"
              size={fontR(22)}
            />
          </ScalePress>
        </View>
      </View>

      <View style={{ marginTop: 40 }}>
        <Text style={{ color: "#fff", fontFamily: FONTS.Bold }}>Artist info</Text>
        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4 }}>
          {currentTrack?.artist ? `Learn more about ${currentTrack.artist}` : 'No information available'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    zIndex: 88,
  },
  slider: {
    width: Platform.OS === 'android' ? screenWidth - 20 : screenWidth - 30,
    height: 40,
    alignSelf: 'center',
    marginTop: 10,
  },
  timeZone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  flexRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  artist: {
    opacity: 0.8,
    marginTop: 5,
    color: '#fff',
  },
});

export default ControlsAndDetails;
