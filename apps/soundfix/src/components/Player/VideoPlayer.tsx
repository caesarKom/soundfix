import { View, StyleSheet } from 'react-native';
import React, { useRef } from 'react';
import Video, { VideoRef } from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { screenHeight, screenWidth } from '../../utils/constants';

const VideoPlayer = ({ video_uri }: { video_uri: any }) => {
  const videoRef = useRef<VideoRef>(null);

  return (
    <View>
      <Video
        source={{ uri: video_uri }}
        ignoreSilentSwitch="ignore"
        playWhenInactive={false}
        playInBackground={false}
        controls={false}
        disableFocus={true}
        muted
        style={styles.videoContainer}
        repeat
        hideShutterView
        resizeMode="cover"
        shutterColor="transparent"
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
        style={styles.gradients}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    top:-80,
    bottom: 0,
    height: screenHeight,
    width: screenWidth,
    aspectRatio: 9 / 16,
    position: 'absolute',
    zIndex: -2,
  },
  gradients: {
    height: screenHeight,
    width: screenWidth,
    zIndex: -1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
  },
});

export default VideoPlayer;
