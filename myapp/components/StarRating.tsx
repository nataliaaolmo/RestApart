// components/StarRating.tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  rating: number;
  onChange: (rating: number) => void;
  size?: number;
}

export default function StarRating({ rating, onChange, size = 28 }: Props) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)}>
          <Ionicons
            name={rating >= star ? 'star' : 'star-outline'}
            size={size}
            color="#FFD700"
            style={{ marginHorizontal: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
