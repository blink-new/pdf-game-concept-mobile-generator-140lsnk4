import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { blink } from '@/lib/blink';
import { Colors } from '@/constants/Colors';
import { Character, Guild } from '@/types/game';
import { CharacterCard } from '@/components/game/CharacterCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Characters() {
  const [user, setUser] = useState<any>(null);
  const [guild, setGuild] = useState<Guild | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user && !state.isLoading) {
        loadData(state.user.id);
      }
      setLoading(state.isLoading);
    });
    return unsubscribe;
  }, []);

  const loadData = async (userId: string) => {
    try {
      // Load guild
      const guilds = await blink.db.guilds.list({
        where: { user_id: userId },
        limit: 1
      });

      if (guilds.length > 0) {
        const userGuild = guilds[0];
        setGuild(userGuild);

        // Load all characters
        const allCharacters = await blink.db.characters.list({
          where: { guild_id: userGuild.id },
          orderBy: { level: 'desc' }
        });
        setCharacters(allCharacters);
      }
    } catch (error) {
      console.error('Error loading characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const recruitCharacter = async () => {
    if (!guild || !user) return;

    if (guild.gold < 500) {
      Alert.alert('Insufficient Gold', 'You need 500 gold to recruit a new character.');
      return;
    }

    try {
      const characterClasses = ['warrior', 'mage', 'archer', 'assassin', 'healer', 'tank'];
      const rarities = ['common', 'common', 'common', 'rare', 'rare', 'epic'];
      const names = [
        'Theron', 'Luna', 'Kael', 'Vera', 'Darius', 'Nyx', 'Orion', 'Zara',
        'Magnus', 'Lyra', 'Vex', 'Aria', 'Raven', 'Phoenix', 'Storm', 'Sage'
      ];

      const randomClass = characterClasses[Math.floor(Math.random() * characterClasses.length)];
      const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];
      const randomName = names[Math.floor(Math.random() * names.length)];

      // Base stats based on rarity
      const rarityMultiplier = {
        common: 1,
        rare: 1.2,
        epic: 1.5,
        legendary: 2
      };

      const multiplier = rarityMultiplier[randomRarity as keyof typeof rarityMultiplier];

      const newCharacter = {
        id: `char_${Date.now()}`,
        user_id: user.id,
        guild_id: guild.id,
        name: randomName,
        class: randomClass,
        level: 1,
        experience: 0,
        health: Math.floor(100 * multiplier),
        attack: Math.floor(20 * multiplier),
        defense: Math.floor(15 * multiplier),
        speed: Math.floor(10 * multiplier),
        rarity: randomRarity,
        is_equipped: 0
      };

      await blink.db.characters.create(newCharacter);

      // Deduct gold
      await blink.db.guilds.update(guild.id, {
        gold: guild.gold - 500
      });

      // Refresh data
      loadData(user.id);

      Alert.alert(
        'Character Recruited!',
        `${randomName} the ${randomRarity} ${randomClass} has joined your guild!`
      );
    } catch (error) {
      console.error('Error recruiting character:', error);
      Alert.alert('Error', 'Failed to recruit character. Please try again.');
    }
  };

  const upgradeCharacter = async (character: Character) => {
    if (!guild) return;

    const upgradeCost = character.level * 100;
    if (guild.gold < upgradeCost) {
      Alert.alert('Insufficient Gold', `You need ${upgradeCost} gold to upgrade this character.`);
      return;
    }

    try {
      await blink.db.characters.update(character.id, {
        level: character.level + 1,
        health: character.health + 10,
        attack: character.attack + 5,
        defense: character.defense + 3,
        speed: character.speed + 2,
        experience: 0
      });

      await blink.db.guilds.update(guild.id, {
        gold: guild.gold - upgradeCost
      });

      loadData(user!.id);

      Alert.alert('Character Upgraded!', `${character.name} is now level ${character.level + 1}!`);
    } catch (error) {
      console.error('Error upgrading character:', error);
      Alert.alert('Error', 'Failed to upgrade character. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading characters...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="← Back"
          onPress={() => router.back()}
          variant="outline"
          size="small"
          style={styles.backButton}
        />
        <Text style={styles.title}>Character Roster</Text>
        <View style={styles.placeholder} />
      </View>

      <Card style={styles.recruitCard}>
        <View style={styles.recruitHeader}>
          <Text style={styles.recruitTitle}>Recruit New Character</Text>
          <Text style={styles.recruitCost}>Cost: 500 🪙</Text>
        </View>
        <Text style={styles.recruitDescription}>
          Recruit a random character to join your guild. Higher rarity characters have better stats!
        </Text>
        <Button
          title="Recruit Character"
          onPress={recruitCharacter}
          variant="primary"
          disabled={!guild || guild.gold < 500}
        />
      </Card>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.charactersGrid}>
          {characters.map((character) => (
            <View key={character.id} style={styles.characterContainer}>
              <CharacterCard
                character={character}
                onPress={() => upgradeCharacter(character)}
              />
              <Button
                title={`Upgrade (${character.level * 100} 🪙)`}
                onPress={() => upgradeCharacter(character)}
                variant="secondary"
                size="small"
                style={styles.upgradeButton}
                disabled={!guild || guild.gold < character.level * 100}
              />
            </View>
          ))}
        </View>

        {characters.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No characters in your roster yet.</Text>
            <Text style={styles.emptySubtext}>Recruit your first character to get started!</Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.text,
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    minWidth: 80,
  },
  title: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    minWidth: 80,
  },
  recruitCard: {
    margin: 16,
    marginTop: 8,
  },
  recruitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recruitTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  recruitCost: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  recruitDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  charactersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 8,
  },
  characterContainer: {
    width: '45%',
    marginBottom: 16,
  },
  upgradeButton: {
    marginTop: 8,
    marginHorizontal: 8,
  },
  emptyCard: {
    margin: 16,
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});