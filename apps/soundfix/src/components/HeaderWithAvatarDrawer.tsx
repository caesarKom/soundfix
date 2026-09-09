import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Avatar } from './Avatar';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useAuthStore } from '../store/useAuthStore';
import { MEDIA_URL } from '../config/env';
import { notPerson } from '../utils/images';

const HeaderWithAvatarDrawer = () => {
  const { user } = useAuthStore.getState();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const avatarUrl = `${MEDIA_URL}/${user?.profile?.avatar}` || notPerson;
  const userName = user?.name || user?.email || 'User';

  return (
    <View style={s.container}>
      <View style={s.content}>
        <Avatar
          imageUrl={avatarUrl}
          name={userName}
          size={36}
          onPress={() => navigation.openDrawer()}
        />
        <Text style={s.text}>SoundFix</Text>
        <View style={{ width: 32 }} />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    maxHeight: 44,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HeaderWithAvatarDrawer;
