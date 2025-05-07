import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { BORDER_RADIUS, FONTS, SPACING } from '@/constants/Layout';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import { useAuth } from '@/context/AuthContext';
import { useProgram } from '@/context/ProgramContext';
import { CLAN_IMAGES } from '@/assets/images/clans';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

export default function TotemScreen() {
  const { user } = useAuth();
  const { currentProgram, userPrograms } = useProgram();
  
  const glowValue = useSharedValue(0);
  
  useEffect(() => {
    glowValue.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.7 + glowValue.value * 0.3,
      transform: [{ scale: 1 + glowValue.value * 0.05 }],
    };
  });

  if (!user) return null;

  const getClanColor = () => {
    return COLORS.clan[user.clan];
  };
  
  const getClanImage = () => {
    return CLAN_IMAGES[user.clan];
  };
  
  const getClanName = () => {
    switch (user.clan) {
      case 'onotka': return 'ONOTKA';
      case 'ekloa': return 'EKLOA';
      case 'okwaho': return 'OKWÁHO';
      default: return '';
    }
  };
  
  const getCurrentProgramProgress = () => {
    if (!currentProgram) return 0;
    
    const userProgram = userPrograms.find(up => up.programId === currentProgram.id);
    if (!userProgram) return 0;
    
    return userProgram.currentDay / currentProgram.duration;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>VOTRE TOTEM</Text>
      </View>
      
      <View style={styles.totemContainer}>
        <ImageBackground
          source={{ uri: getClanImage() }}
          style={styles.clanBackground}
          imageStyle={styles.clanBackgroundImage}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          >
            <Animated.View style={[styles.glowCircle, { backgroundColor: getClanColor() }, animatedGlowStyle]} />
            
            <View style={styles.totemContent}>
              <Text style={styles.welcomeText}>Bienvenue, {user.name}</Text>
              
              <View style={[styles.clanBadge, { backgroundColor: getClanColor() }]}>
                <Text style={styles.clanName}>CLAN {getClanName()}</Text>
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{user.totalDaysCompleted}</Text>
                  <Text style={styles.statLabel}>JOURS ACCOMPLIS</Text>
                </View>
                
                {currentProgram ? (
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {userPrograms.find(up => up.programId === currentProgram.id)?.currentDay || 0}/{currentProgram.duration}
                    </Text>
                    <Text style={styles.statLabel}>PROGRESSION</Text>
                  </View>
                ) : null}
              </View>
              
              {currentProgram ? (
                <View style={styles.programContainer}>
                  <Text style={styles.programTitle}>{currentProgram.title}</Text>
                  <ProgressBar progress={getCurrentProgramProgress()} showPercentage />
                </View>
              ) : (
                <View style={styles.noProgramContainer}>
                  <Text style={styles.noProgramText}>
                    Aucun programme en cours
                  </Text>
                  <Button
                    title="Choisir un programme"
                    onPress={() => router.push('/(app)/(tabs)/voies')}
                    size="small"
                    style={styles.programButton}
                  />
                </View>
              )}
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
      
      <View style={styles.journeyContainer}>
        <Text style={styles.sectionTitle}>VOTRE VOYAGE</Text>
        
        <View style={styles.journeyCard}>
          <Text style={styles.journeyText}>
            "Le chemin du guerrier est parsemé d'épreuves, mais chaque défi surmonté te rapproche de ta véritable nature."
          </Text>
          
          <View style={styles.journeyStat}>
            <Text style={styles.journeyLabel}>Jours d'entraînement tribal :</Text>
            <Text style={styles.journeyValue}>{user.totalDaysCompleted}</Text>
          </View>
          
          {currentProgram ? (
            <TouchableOpacity 
              style={styles.ritualButton}
              onPress={() => router.push('/(app)/(tabs)/ritual')}
            >
              <Text style={styles.ritualButtonText}>Voir le rituel du jour</Text>
            </TouchableOpacity>
          ) : null}
        </View>
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
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    ...FONTS.heading,
    color: COLORS.text,
    fontSize: 24,
    letterSpacing: 2,
  },
  totemContainer: {
    height: 400,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  clanBackground: {
    flex: 1,
  },
  clanBackgroundImage: {
    borderRadius: BORDER_RADIUS.lg,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  glowCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.4,
  },
  totemContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  welcomeText: {
    ...FONTS.heading,
    color: COLORS.text,
    fontSize: 26,
    marginBottom: SPACING.md,
  },
  clanBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.lg,
  },
  clanName: {
    ...FONTS.button,
    color: COLORS.text,
    letterSpacing: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  statValue: {
    ...FONTS.heading,
    color: COLORS.text,
    fontSize: 28,
  },
  statLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  programContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  programTitle: {
    ...FONTS.subheading,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  noProgramContainer: {
    alignItems: 'center',
  },
  noProgramText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  programButton: {
    minWidth: 200,
  },
  journeyContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...FONTS.subheading,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },
  journeyCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  journeyText: {
    ...FONTS.body,
    color: COLORS.text,
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  journeyStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  journeyLabel: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  journeyValue: {
    ...FONTS.body,
    color: COLORS.text,
    fontFamily: 'Rajdhani-Bold',
  },
  ritualButton: {
    backgroundColor: COLORS.cardSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  ritualButtonText: {
    ...FONTS.button,
    color: COLORS.text,
  },
});