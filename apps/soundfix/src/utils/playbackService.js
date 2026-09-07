import TrackPlayer, { Event } from '@rntp/player';
import { usePlayerStore } from '../store/usePlayerStore';

export const playbackSession = () => {

 TrackPlayer.addEventListener(Event.IsPlayingChanged, async ({ playing }) => {
    if (!playing) return;

   try {
      const store = usePlayerStore.getState();
      const currentIndex = TrackPlayer.getActiveMediaItemIndex();
      
      if (currentIndex === null || currentIndex >= store.allTracks.length - 1) return;

      const nextIndex = currentIndex + 1;
      const nextTrack = store.allTracks[nextIndex];

      const signedUrl = await store.getSecuredUrl(nextTrack.id);

      const nativeQueue = store.allTracks
      if (nativeQueue[nextIndex]) {
        nativeQueue[nextIndex].url = signedUrl;
        TrackPlayer.replaceMediaItem(nextIndex, nativeQueue[nextIndex]);
      }

    } catch (error) {
      console.error('Session error during song transition:', error);
    }
  });

  TrackPlayer.addEventListener(Event.MediaItemTransition, ({ item }) => {
    if (!item) return;
    usePlayerStore.getState().syncCurrentTrackWithNative();
  });

  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, ({ position, duration }) => {
    usePlayerStore.getState().updatePosition(position, duration);
  });

  // Handling network errors (e.g. temporary lack of coverage in the car)
  TrackPlayer.addEventListener(Event.PlaybackError, async ({ code, message }) => {
  const queue = await TrackPlayer.getQueue();
  const currentIndex = await TrackPlayer.getActiveMediaItemIndex();
  const currentItem = currentIndex !== null ? queue[currentIndex] : null;

  if (!currentItem || !currentItem.url || currentItem.url.includes('file:///dev/null') || !currentItem.url.includes('token=')) {
    console.log('[V5 Session] Blocked retry loop for unloaded or unsigned track.');
    return;
  }

  if (code === 'network' || message.toLowerCase().includes('source')) {
    console.log('[V5 Session] Genuine network error on signed track. Reconnecting...');
    setTimeout(() => {
      TrackPlayer.retry();
    }, 2000);
  }
});
  
};

