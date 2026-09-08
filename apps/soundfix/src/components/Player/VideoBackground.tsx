import { View, StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { screenHeight, screenWidth } from '../../utils/constants';
import { useEffect } from 'react';

interface VideoBackgroundProps {
  videoUri: string;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoUri,
}) => {
  const player = useVideoPlayer(videoUri, playerInstance => {
    playerInstance.loop = true;
    playerInstance.muted = true;
    playerInstance.playInBackground = false;
    playerInstance.playWhenInactive = false;
    playerInstance.play();
  });

  useEffect(() => {
    if (videoUri) {
      player
        .replaceSourceAsync({ uri: videoUri })
        .then(() => {
          player.play();
        })
        .catch(err => console.error('Błąd zmiany źródła wideo:', err));
    }
  }, [videoUri, player]);

  if (!videoUri) return <View style={styles.videoContainer} />;

  return (
    <View style={styles.videoContainer}>
      <VideoView
        player={player}
        style={styles.videoContainer}
        controls={false}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.0)',
          'rgba(0,0,0,0.1)',
          'rgba(0,0,0,0.2)',
          'rgba(0,0,0,0.3)',
          'rgba(0,0,0,0.4)',
          'rgba(0,0,0,0.5)',
          'rgba(0,0,0,0.6)',
          'rgba(0,0,0,0.7)',
          'rgba(0,0,0,0.8)',
          'rgba(0,0,0,0.9)',
        ]}
        style={styles.gradient}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: screenHeight + 80,
    width: screenWidth,
    aspectRatio: 9 / 16,
    zIndex: -2,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
});
