import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '../Icon';
import { Track } from '../../store/usePlayerStore';

const Header = ({ track }: { track: Track }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity hitSlop={12} onPress={() => {}}>
        <Icon
          iconFamily="Ionicons"
          name="chevron-down"
          size={28}
          color="#fff"
        />
      </TouchableOpacity>

      <View style={styles.headerTextWrapper}>
        <Text style={styles.headerSubtitle}>PLAYING FROM PLAYLIST</Text>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {track.album ?? 'Unknown album'}
        </Text>
      </View>

      <TouchableOpacity hitSlop={12}>
        <Icon
          iconFamily="Ionicons"
          name="ellipsis-vertical"
          size={24}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    top: 10,
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  headerTextWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
});

export default Header;
