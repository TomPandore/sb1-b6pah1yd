import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/Colors';
import { BORDER_RADIUS, FONTS, SPACING } from '@/constants/Layout';

interface Program {
  id: string;
  title: string;
  description: string;
  duration: number;
  focus: string[] | string;
  imageUrl: string;
}

interface ProgramCardProps {
  program: Program;
  onPress: (programId: string) => void;
}

export default function ProgramCard({ program, onPress }: ProgramCardProps) {
  const parsedFocus = Array.isArray(program.focus) 
    ? program.focus 
    : typeof program.focus === 'string' 
      ? JSON.parse(program.focus || '[]')
      : [];

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={() => onPress(program.id)}
    >
      <ImageBackground
        source={{ uri: program.imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        >
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {program.title}
              </Text>
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{program.duration} jours</Text>
              </View>
            </View>

            <View style={styles.tagsContainer}>
              {parsedFocus.map((tag, index) => (
                <View key={index} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {program.description}
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.card,
  },
  imageBackground: {
    flex: 1,
  },
  imageStyle: {
    borderRadius: BORDER_RADIUS.lg,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    padding: SPACING.md,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  title: {
    ...FONTS.heading,
    color: COLORS.text,
    fontSize: 24,
    flex: 1,
    marginRight: SPACING.sm,
  },
  durationBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  durationText: {
    ...FONTS.button,
    color: COLORS.text,
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tagText: {
    ...FONTS.caption,
    color: COLORS.text,
    fontSize: 12,
    opacity: 0.9,
  },
  description: {
    ...FONTS.body,
    color: COLORS.text,
    opacity: 0.9,
  },
});