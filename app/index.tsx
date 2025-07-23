import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { blink } from '@/lib/blink';
import { Colors } from '@/constants/Colors';
import { Guild, Character } from '@/types/game';
import { ResourceBar } from '@/components/ui/ResourceBar';
import { GuildOverview } from '@/components/game/GuildOverview';
import { CharacterCard } from '@/components/game/CharacterCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AuthDebug } from '@/components/debug/AuthDebug';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [guild, setGuild] = useState<Guild | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      console.log('Auth state changed:', state);
      setUser(state.user);
      if (state.user && !state.isLoading) {
        loadGameData(state.user.id);
      }
      setLoading(state.isLoading);
    });
    return unsubscribe;
  }, []);

  const loadGameData = async (userId: string) => {
    try {
      console.log('Loading game data for user:', userId);
      
      // Load guild
      const guilds = await blink.db.guilds.list({
        where: { userId: userId }, // Use camelCase for Blink SDK
        limit: 1
      });

      console.log('Found guilds:', guilds);

      if (guilds.length === 0) {
        console.log('No guild found, creating initial guild');
        // Create initial guild
        await createInitialGuild(userId);
        return;
      }

      const userGuild = guilds[0];
      setGuild(userGuild);
      console.log('Guild loaded:', userGuild);

      // Load characters
      const guildCharacters = await blink.db.characters.list({
        where: { guildId: userGuild.id }, // Use camelCase for Blink SDK
        orderBy: { level: 'desc' },
        limit: 6
      });
      
      console.log('Characters loaded:', guildCharacters);
      setCharacters(guildCharacters);
      setLoading(false); // Make sure to stop loading when done
    } catch (error) {
      console.error('Error loading game data:', error);
      setLoading(false); // Stop loading on error
      Alert.alert(
        'Loading Error',
        `Failed to load game data: ${error.message || 'Unknown error'}. Please try refreshing the app.`,
        [
          { text: 'Retry', onPress: () => loadGameData(userId) },
          { text: 'Cancel' }
        ]
      );
    }
  };

  const createInitialGuild = async (userId: string) => {
    try {
      console.log('Creating initial guild for user:', userId);
      const guildId = `guild_${Date.now()}`;
      
      console.log('Creating guild with ID:', guildId);
      // Create guild
      const newGuild = await blink.db.guilds.create({
        id: guildId,
        userId: userId, // Use camelCase for Blink SDK
        name: 'Shadow Guardians',
        description: 'A new guild ready for adventure',
        level: 1,
        experience: 0,
        gold: 1000,
        gems: 50,
        territoryCount: 0,
        memberCount: 1
      });

      console.log('Guild created successfully:', newGuild);

      // Create starter characters
      const starterCharacters = [
        {
          id: `char_${Date.now()}_1`,
          userId: userId, // Use camelCase for Blink SDK
          guildId: guildId,
          name: 'Aria',
          class: 'warrior' as const,
          level: 1,
          experience: 0,
          health: 120,
          attack: 25,
          defense: 20,
          speed: 12,
          rarity: 'common' as const,
          isEquipped: 1 // Use camelCase for Blink SDK
        },
        {
          id: `char_${Date.now()}_2`,
          userId: userId, // Use camelCase for Blink SDK
          guildId: guildId,
          name: 'Zephyr',
          class: 'mage' as const,
          level: 1,
          experience: 0,
          health: 80,
          attack: 30,
          defense: 10,
          speed: 15,
          rarity: 'rare' as const,
          isEquipped: 1 // Use camelCase for Blink SDK
        }
      ];

      console.log('Creating starter characters:', starterCharacters);
      await blink.db.characters.createMany(starterCharacters);
      console.log('Characters created successfully');

      setGuild(newGuild);
      setCharacters(starterCharacters);
      console.log('Initial guild setup completed');
    } catch (error) {
      console.error('Error creating initial guild:', error);
      setLoading(false); // Make sure to stop loading on error
      Alert.alert(
        'Setup Error', 
        `Failed to create your guild: ${error.message || 'Unknown error'}. Please try refreshing the app.`,
        [
          { text: 'Retry', onPress: () => createInitialGuild(userId) },
          { text: 'Cancel' }
        ]
      );
    }
  };

  const handleManageGuild = () => {
    router.push('/guild');
  };

  const handleViewCharacters = () => {
    router.push('/characters');
  };

  const handleBattle = () => {
    router.push('/battle');
  };

  const handleViewTerritories = () => {
    router.push('/territory');
  };

  const handleShop = () => {
    router.push('/shop');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Shadow Guilds...</Text>
      </View>
    );
  }

  const handleSignIn = async () => {
    try {
      await blink.auth.login();
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert(
        'Sign In Error',
        'There was a problem signing in. Please try again or contact support if the issue persists.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!user) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.title}>Shadow Guilds</Text>
        <Text style={styles.subtitle}>Build your guild, conquer territories</Text>
        <Text style={styles.authDescription}>
          Sign in to save your progress and compete with other guild masters
        </Text>
        <Button
          title="Sign In to Play"
          onPress={handleSignIn}
          variant="primary"
          size="large"
        />
        <Text style={styles.authNote}>
          Secure authentication powered by Blink
        </Text>
        <AuthDebug />
      </View>
    );
  }

  if (!guild) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Setting up your guild...</Text>
        <Text style={styles.debugText}>User ID: {user?.id}</Text>
        <Text style={styles.debugText}>Loading: {loading.toString()}</Text>
        <Button
          title="Force Retry Setup"
          onPress={() => user?.id && loadGameData(user.id)}
          variant="outline"
          style={{ marginTop: 20 }}
        />
        <AuthDebug />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Shadow Guilds</Text>
          <Text style={styles.welcomeText}>Welcome back, Guild Master!</Text>
        </View>

        <ResourceBar
          gold={guild.gold}
          gems={guild.gems}
          experience={guild.experience}
          level={guild.level}
        />

        <GuildOverview
          guild={guild}
          onManageGuild={handleManageGuild}
          onViewCharacters={handleViewCharacters}
          onBattle={handleBattle}
          onViewTerritories={handleViewTerritories}
        />

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Champions</Text>
            <Button
              title="View All"
              onPress={handleViewCharacters}
              variant="outline"
              size="small"
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onPress={() => router.push('/characters')}
              />
            ))}
          </ScrollView>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Button
              title="🛒 Shop"
              onPress={handleShop}
              variant="secondary"
              style={styles.quickActionButton}
            />
            <Button
              title="⚔️ Battle"
              onPress={handleBattle}
              variant="primary"
              style={styles.quickActionButton}
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: Colors.text,
    fontSize: 18,
    textAlign: 'center',
  },
  debugText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  authDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  authNote: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
  sectionCard: {
    margin: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});