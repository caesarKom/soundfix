import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

interface AvatarProps {
  imageUrl?: string | null;
  name?: string | null;
  size?: number;
  onPress?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  name = 'User',
  size = 40,
  onPress,
}) => {
  const [imageError, setImageError] = useState(false);

  const initial = name && name.length > 0 ? name.charAt(0).toUpperCase() : 'U';

  const content = (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="bg-sky-500 items-center justify-center overflow-hidden border border-slate-700"
    >
      {imageUrl && !imageError ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          onError={() => setImageError(true)}
          resizeMode="cover"
        />
      ) : (
        <Text
          style={{ fontSize: size * 0.45 }}
          className="font-bold text-slate-950"
        >
          {initial}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};