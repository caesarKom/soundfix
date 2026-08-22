import { Play, Pause } from 'lucide-react';
import { usePlayerStore } from '../../../store/usePlayerStore'
import type { Track } from '../types/music';

function TrackRow({ track, queue }: { track: Track; queue?: Track[] }) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore()
  const isCurrent = currentTrack()?.id === track.id

  const handleClick = () => {
    if (isCurrent) {
      togglePlay()
    } else {
      playTrack(track, queue)
    }
  }

  return (
    <button onClick={handleClick} className="...">
      {isCurrent && isPlaying ? <Pause size={14} stroke='red' /> : <Play size={14} stroke='green' />}
    </button>
  )
}
export default TrackRow
