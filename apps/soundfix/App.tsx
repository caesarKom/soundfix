import React, { useEffect, useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import TrackPlayer, { PlayerCommand, useIsPlaying, useProgress } from '@rntp/player';

export default function App() {
  return (
    <View style={{display: 'flex', justifyContent: 'center'}}>
      <Text style={{ fontSize: 24, marginBottom:20, color: '#333' }}>WELCOME YO SOUNDFIX APP</Text>
    </View>
  )
}
/* export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // Krok 1: Uruchomienie odtwarzacza
        await TrackPlayer.setupPlayer({
          contentType: 'music',
        });

        // Krok 3: Konfiguracja przycisków na ekranie blokady / powiadomieniu
        await TrackPlayer.setCommands({
          capabilities: [
            PlayerCommand.PlayPause,
            PlayerCommand.Next,
            PlayerCommand.Previous,
          ],
        });

        setIsReady(true);
      } catch (error) {
        console.error('Błąd setupPlayer:', error);
      }
    }

    init();
  }, []);

  // Krok 5: Wykorzystanie hooków z RNTP v5
  const playing = useIsPlaying();
  const { position, duration } = useProgress();

  // Krok 4: Dodanie utworu i odtworzenie
  const handlePlayPause = async () => {
    if (playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.setMediaItems([
        {
          mediaId: 'track-1',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          title: 'Soundfix Track',
          artist: 'Soundfix Artist',
        },
      ]);
      await TrackPlayer.play();
    }
  };

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red' }}>Ładowanie odtwarzacza RNTP...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Czas: {Math.round(position)}s / {Math.round(duration)}s
      </Text>
      
      <Button 
        title={playing ? "Pauza" : "Graj"} 
        onPress={handlePlayPause} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 15 },
  text: { fontSize: 16, fontWeight: '600', color:'black' }
}); */