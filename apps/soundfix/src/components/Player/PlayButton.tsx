import React from 'react';
import { Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ScalePress from '../ScalePress';
import { usePlayerStore } from '../../store/usePlayerStore';

type Props = { size?: number };

export const PlayButton = ({ size = 32 }: Props) => {
  const {pause,play,currentTrack, isPlaying} = usePlayerStore()

  const togglePlayback = async () => {
      if (isPlaying) {
         pause();
      } else {
         play();
      }
    };

  return (
  <Pressable onPress={togglePlayback} style={styles.btn}>
    <Icon name={isPlaying ? 'pause' : 'play-arrow'} size={size} color="#fff" />
  </Pressable>
);
}
const styles = StyleSheet.create({ btn: { padding: 8 } });