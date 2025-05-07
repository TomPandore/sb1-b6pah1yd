import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { FONTS, SPACING } from '@/constants/Layout';
import Button from '@/components/Button';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>MOHERO</Text>
        <Text style={styles.slogan}>Que le ciel soit ta seule limite</Text>
      </View>

      <View style={styles.actions}>
        <Link href="/(auth)/onboarding" asChild>
          <Button 
            title="Rejoindre la tribu" 
            fullWidth
          />
        </Link>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Déjà membre ?</Text>
          <Link href="/(auth)/login" asChild>
            <Text style={styles.loginLink}>Se connecter</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    ...FONTS.heading,
    fontSize: 48,
    color: COLORS.text,
    letterSpacing: 5,
    marginBottom: SPACING.md,
  },
  slogan: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    fontSize: 18,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  loginText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  loginLink: {
    ...FONTS.body,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
});