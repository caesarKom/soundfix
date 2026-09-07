import { useEffect, useState } from "react";
import ImageColors from "react-native-image-colors";

/**
 * useArtworkColor
 *
 * Extracts a dominant color from the current track's artwork so the
 * background gradient can mimic Spotify's "color washed" now-playing screen.
 * Skipped entirely for video tracks, which use VideoBackground instead.
 */
const DEFAULT_BACKGROUND_COLOR = '#3d3d3d';

export const usePlayerColors = (coverUrl?: string) => {
  const [color, setColor] = useState(DEFAULT_BACKGROUND_COLOR);

  useEffect(() => {
    let isMounted = true;

    if (!coverUrl) {
      setColor(DEFAULT_BACKGROUND_COLOR);
      return;
    }

    ImageColors.getColors(coverUrl, {
      fallback: DEFAULT_BACKGROUND_COLOR,
      cache: true,
      key: coverUrl,
    })
      .then((result:any) => {
        if (!isMounted) return;

        // Result shape differs per platform
        if (result.platform === 'android') {
          setColor(result.dominant ?? DEFAULT_BACKGROUND_COLOR);
        } else if (result.platform === 'ios') {
          setColor(result.background ?? DEFAULT_BACKGROUND_COLOR);
        } else {
          setColor(DEFAULT_BACKGROUND_COLOR);
        }
      })
      .catch(() => {
        if (isMounted) setColor(DEFAULT_BACKGROUND_COLOR);
      });

    return () => {
      isMounted = false;
    };
  }, [coverUrl]);

  return color;
};