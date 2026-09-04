import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import ImageColors from 'react-native-image-colors';
import TrackPlayer, { Event } from '@rntp/player';
import { MEDIA_URL } from '../../config/env';

type Colors = { primary: string; secondary: string };

const FALLBACK: Colors = { primary: '#1DB954', secondary: '#121212' };

export const usePlayerColors = (): Colors => {
  const [colors, setColors] = useState<Colors>(FALLBACK);

  const fetchColors = async () => {
    try {
      const activeItem = TrackPlayer.getActiveMediaItem();
      if (!activeItem?.artworkUrl) {
        setColors(FALLBACK);
        return;
      }

      const url = `${MEDIA_URL}/${activeItem.artworkUrl}`;

      const result = (await ImageColors.getColors(url, {
        fallback: '#121212',
        cache: true,
        key: url,
      })) as any;

      let primary = FALLBACK.primary;
      let secondary = FALLBACK.secondary;

      if (Platform.OS === 'android') {
  
        primary = result.dominant || result.vibrant || result.average || FALLBACK.primary;
        secondary = result.average || result.dominant || FALLBACK.secondary;
      } else {
   
        primary = result.background || result.primary || FALLBACK.primary;
        secondary = result.secondary || result.detail || FALLBACK.secondary;
      }

      setColors({ primary, secondary });
    } catch (error) {
      setColors(FALLBACK);
    }
  };

  useEffect(() => {
    void fetchColors();

    const sub = TrackPlayer.addEventListener(Event.MediaItemTransition, () => {
      void fetchColors();
    });

    return () => sub.remove();
  }, []);

  return colors;
};
