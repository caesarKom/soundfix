/**
 * @format
 */

import { AppRegistry } from 'react-native';
import TrackPlayer from '@rntp/player';
import App from './App';
import { name as appName } from './app.json';
import { playbackSession } from './src/utils/playbackService'


TrackPlayer.registerPlaybackSession(() => playbackSession());
TrackPlayer.setupPlayer({ contentType: 'music'})

AppRegistry.registerComponent(appName, () => App);
