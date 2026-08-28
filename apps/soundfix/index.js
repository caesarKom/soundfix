import { AppRegistry } from 'react-native';
import TrackPlayer, { Event } from '@rntp/player';
import App from './App';
import { name as appName } from './app.json';

TrackPlayer.registerPlaybackSession(() => {
  TrackPlayer.addEventListener(Event.PlaybackError, ({ code }) => {
    if (code === 'network') TrackPlayer.retry();
  });
});

AppRegistry.registerComponent(appName, () => App);