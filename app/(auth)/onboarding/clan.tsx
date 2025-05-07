import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { BORDER_RADIUS, FONTS, SPACING } from '@/constants/Layout';
import Button from '@/components/Button';
import ClanCard from '@/components/ClanCard';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/context/AuthContext';
import Animated, { 
  useSharedValue,
  useAnimatedScrollHandler,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.lg * 2;

// Initialize Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

interface Clan {
  id: string;
  nom_clan: string;
  tagline: string;
  description: text;
  rituel_entree: string;
  image_url: string;
  couleur_theme: string;
}

interface PaginationDotProps {
  index: number;
  scrollX: Animated.SharedValue<number>;
  selectedClanId: string | null;
  clan: Clan;
}

const PaginationDot: React.FC<PaginationDotProps> = ({ index, scrollX, selectedClanId, clan }) => {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];
    
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1.2, 0.8],
      'clamp'
    );
    
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      'clamp'
    );
    
    return {
      transform: [{ scale }],
      opacity,
      backgroundColor: selectedClanId === clan.id ? clan.couleur_theme : COLORS.textSecondary,
    };
  });

  return <Animated.View style={[styles.paginationDot, dotStyle]} />;
};

export default function ClanSelectionScreen() {
  const { user } = useAuth();
  const [clans, setClans] = useState<Clan[]>([]);
  const [selectedClanId, setSelectedClanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollX = useSharedValue(0);

  useEffect(() => {
    fetchClans();
  }, []);

  const fetchClans = async () => {
    try {
      const { data, error } = await supabase
        .from('clans')
        .select('*');

      if (error) throw error;
      setClans(data || []);
    } catch (err) {
      console.error('Error fetching clans:', err);
      setError('Erreur lors du chargement des clans');
    }
  };
  
  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleSelectClan = (clanId: string) => {
    setSelectedClanId(clanId);
  };

  const handleNext = async () => {
    if (!selectedClanId || !user) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ clan_id: selectedClanId })
        .eq('id', user.id);

      if (error) throw error;
      
      router.push('/(app)/(tabs)/totem');
    } catch (err) {
      console.error('Error updating clan:', err);
      setError('Erreur lors de la sélection du clan');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPaginationDots = () => {
    return clans.map((clan, i) => (
      <PaginationDot
        key={`dot-${i}`}
        index={i}
        scrollX={scrollX}
        selectedClanId={selectedClanId}
        clan={clan}
      />
    ));
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Réessayer" onPress={fetchClans} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MOHERO</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.stepContainer}>
          <Text style={styles.stepText}>DERNIÈRE ÉTAPE</Text>
          <Text style={styles.questionText}>
            Choisissez votre clan
          </Text>
        </View>

        <Animated.FlatList
          data={clans}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + SPACING.md}
          decelerationRate="fast"
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.carouselContainer}
          onScroll={handleScroll}
          renderItem={({ item, index }) => (
            <View style={{ width: CARD_WIDTH, marginRight: SPACING.md }}>
              <ClanCard
                clan={item}
                isSelected={selectedClanId === item.id}
                onSelect={() => handleSelectClan(item.id)}
                position={index}
                scrollPosition={scrollX}
                cardWidth={CARD_WIDTH + SPACING.md}
              />
            </View>
          )}
        />

        <View style={styles.paginationContainer}>
          {renderPaginationDots()}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Continuer"
            onPress={handleNext}
            disabled={!selectedClanId || isLoading}
            isLoading={isLoading}
            fullWidth
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  title: {
    ...FONTS.heading,
    fontSize: 28,
    fontFamily: 'Rajdhani-Bold',
    color: COLORS.text,
    letterSpacing: 5,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  stepContainer: {
    marginBottom: SPACING.lg,
  },
  stepText: {
    ...FONTS.caption,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    letterSpacing: 1,
  },
  questionText: {
    ...FONTS.heading,
    color: COLORS.text,
  },
  carouselContainer: {
    paddingVertical: SPACING.lg,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    marginVertical: SPACING.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    ...FONTS.body,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});