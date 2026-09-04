import TrackPlayer, { Event } from '@rntp/player';
import { usePlayerStore } from '../store/usePlayerStore';

export const playbackSession = () => {

 TrackPlayer.addEventListener(Event.IsPlayingChanged, async ({ playing }) => {
    if (!playing) return;

   try {
      const store = usePlayerStore.getState();
      const currentIndex = TrackPlayer.getActiveMediaItemIndex();
      
      if (currentIndex === null || currentIndex >= store.queue.length - 1) return;

      const nextIndex = currentIndex + 1;
      const nextTrack = store.queue[nextIndex];

      const signedUrl = await store.getSecuredUrl(nextTrack.id);

      const nativeQueue = TrackPlayer.getQueue();
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
   TrackPlayer.addEventListener(Event.PlaybackError, ({ code, message }) => {
    if (code === 'network' || message.toLowerCase().includes('source')) {

      setTimeout(() => {
        TrackPlayer.retry();
      }, 300);
      return;
    }
    
    console.error(`[Audio Error ${code}]: ${message}`);
  });
};

