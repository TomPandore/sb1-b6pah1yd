import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { FONTS, SPACING } from '@/constants/Layout';
import ProgramCard from '@/components/ProgramCard';
import { createClient } from '@supabase/supabase-js';

const CARD_WIDTH = 280;
const { width } = Dimensions.get('window');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

interface Program {
  id: string;
  nom: string;
  description: string;
  image_url: string;
  duree_jours: number;
  type: 'Découverte' | 'Premium';
  tags: string | string[];
  clan_id: string;
  niveau_difficulte: string;
  resultats: any;
  parcours_resume: any;
}

export default function PathsScreen() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase.from('programmes').select('*');
      if (error) throw error;
      setPrograms(data || []);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Une erreur est survenue lors du chargement des programmes');
    } finally {
      setIsLoading(false);
    }
  };

  const discoveryPrograms = programs.filter(p => p.type === 'Découverte');
  const premiumPrograms = programs.filter(p => p.type === 'Premium');

  const handleProgramPress = (programId: string) => {
    router.push({
      pathname: '/(app)/program/[id]',
      params: { id: programId }
    });
  };

  const renderProgramList = (programs: Program[]) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.programsContainer}
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + SPACING.md}
    >
      {programs.map(program => {
        let parsedTags: string[] = [];
        try {
          parsedTags = Array.isArray(program.tags)
            ? program.tags
            : JSON.parse(program.tags);
        } catch {
          parsedTags = [];
        }

        return (
          <View key={program.id} style={styles.cardContainer}>
            <ProgramCard
              program={{
                id: program.id,
                title: program.nom,
                description: program.description,
                duration: program.duree_jours,
                focus: parsedTags,
                imageUrl: program.image_url
              }}
              onPress={handleProgramPress}
            />
          </View>
        );
      })}
    </ScrollView>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (programs.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Aucun programme disponible pour le moment</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>LES VOIES</Text>
        <Text style={styles.subtitle}>Choisissez votre parcours de transformation</Text>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>DÉCOUVERTE</Text>
        <Text style={styles.sectionDescription}>
          Programmes courts pour explorer les fondamentaux du mouvement ancestral.
        </Text>
        {renderProgramList(discoveryPrograms)}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>LA VOIE MOHERO</Text>
        <Text style={styles.sectionDescription}>
          Programme complet de transformation physique et mentale.
        </Text>
        {renderProgramList(premiumPrograms)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingVertical: SPACING.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  title: {
    ...FONTS.heading,
    color: COLORS.text,
    fontSize: 24,
    letterSpacing: 2,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  sectionContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...FONTS.subheading,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: 1,
    paddingHorizontal: SPACING.lg,
  },
  sectionDescription: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  programsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: SPACING.md,
  },
  errorText: {
    ...FONTS.body,
    color: COLORS.error,
    textAlign: 'center',
  },
  emptyText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
