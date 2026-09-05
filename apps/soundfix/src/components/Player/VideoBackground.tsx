import React, { useRef } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { screenHeight, screenWidth } from '../../utils/constants';
import { StyleProp } from 'react-native';

interface VideoBackgroundProps {
  videoUri: string;
  // Positioning is left to the caller (e.g. StyleSheet.absoluteFillObject),
  // same as the LinearGradient it replaces in FullScreenPlayer.
  style?: StyleProp<ViewStyle>;
}

/**
 * VideoBackground
 *
 * Fullscreen, looping, muted video used as the now-playing background when
 * the current track's mimeType is "video/*" (Spotify Canvas style). A dark
 * gradient is layered on top so the title/controls stay readable.
 */
export const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUri, style }) => {
  const videoRef = useRef<VideoRef>(null);

  return (
    <View style={style}>
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        ignoreSilentSwitch="ignore"
        playWhenInactive={false}
        playInBackground={false}
        controls={false}
        disableFocus
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
        style={styles.gradient}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    top: -80,
    bottom: 0,
    height: screenHeight,
    width: screenWidth,
    aspectRatio: 9 / 16,
    position: 'absolute',
    zIndex: -2,
  },
  gradient: {
    height: screenHeight,
    width: screenWidth,
    zIndex: -1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
  },
});