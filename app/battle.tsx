import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { blink } from '@/lib/blink';
import { Colors } from '@/constants/Colors';
import { Character, Guild, Battle } from '@/types/game';
import { CharacterCard } from '@/components/game/CharacterCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function BattleScreen() {
  const [user, setUser] = useState<any>(null);
  const [guild, setGuild] = useState<Guild | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [battleInProgress, setBattleInProgress] = useState(false);
  const [battleResult, setBattleResult] = useState<string | null>(null);
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

        // Load characters
        const allCharacters = await blink.db.characters.list({
          where: { guild_id: userGuild.id },
          orderBy: { level: 'desc' }
        });
        setCharacters(allCharacters);
      }
    } catch (error) {
      console.error('Error loading battle data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCharacterSelection = (character: Character) => {
    if (selectedCharacters.find(c => c.id === character.id)) {
      setSelectedCharacters(selectedCharacters.filter(c => c.id !== character.id));
    } else if (selectedCharacters.length < 3) {
      setSelectedCharacters([...selectedCharacters, character]);
    } else {
      Alert.alert('Maximum Reached', 'You can only select up to 3 characters for battle.');
    }
  };

  const startBattle = async () => {
    if (selectedCharacters.length === 0) {
      Alert.alert('No Characters Selected', 'Please select at least one character for battle.');
      return;
    }

    if (!guild || !user) return;

    setBattleInProgress(true);
    setBattleResult(null);

    try {
      // Calculate team power
      const teamPower = selectedCharacters.reduce((total, char) => {
        return total + char.attack + char.defense + char.speed + char.health;
      }, 0);

      // Generate enemy power (slightly random)
      const enemyPower = teamPower * (0.8 + Math.random() * 0.4);

      // Determine battle result
      const victory = teamPower > enemyPower;
      const goldReward = victory ? Math.floor(100 + Math.random() * 200) : Math.floor(50 + Math.random() * 100);
      const expReward = victory ? Math.floor(50 + Math.random() * 100) : Math.floor(25 + Math.random() * 50);

      // Create battle record
      const battle: Omit<Battle, 'created_at'> = {
        id: `battle_${Date.now()}`,
        user_id: user.id,
        guild_id: guild.id,
        battle_type: 'pve',
        status: 'completed',
        result: victory ? 'victory' : 'defeat',
        rewards_gold: goldReward,
        rewards_experience: expReward
      };

      await blink.db.battles.create(battle);

      // Update guild resources
      await blink.db.guilds.update(guild.id, {
        gold: guild.gold + goldReward,
        experience: guild.experience + expReward
      });

      // Update character experience
      for (const character of selectedCharacters) {
        const charExpGain = Math.floor(expReward / selectedCharacters.length);
        await blink.db.characters.update(character.id, {
          experience: character.experience + charExpGain
        });
      }

      // Simulate battle duration
      setTimeout(() => {
        setBattleInProgress(false);
        setBattleResult(victory ? 'victory' : 'defeat');
        
        Alert.alert(
          victory ? 'Victory!' : 'Defeat',
          victory 
            ? `Your guild emerged victorious! Earned ${goldReward} gold and ${expReward} experience.`
            : `Your guild was defeated, but gained valuable experience. Earned ${goldReward} gold and ${expReward} experience.`
        );

        // Refresh data
        loadData(user.id);
      }, 3000);

    } catch (error) {
      console.error('Error starting battle:', error);
      setBattleInProgress(false);
      Alert.alert('Error', 'Failed to start battle. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading battle arena...</Text>
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
        <Text style={styles.title}>Battle Arena</Text>
        <View style={styles.placeholder} />
      </View>

      {battleInProgress && (
        <Card style={styles.battleCard}>
          <Text style={styles.battleTitle}>⚔️ Battle in Progress</Text>
          <Text style={styles.battleText}>Your champions are fighting valiantly...</Text>
          <View style={styles.battleAnimation}>
            <Text style={styles.battleEmoji}>⚔️</Text>
          </View>
        </Card>
      )}

      {battleResult && (
        <Card style={[styles.battleCard, battleResult === 'victory' ? styles.victoryCard : styles.defeatCard]}>
          <Text style={styles.battleTitle}>
            {battleResult === 'victory' ? '🏆 Victory!' : '💀 Defeat'}
          </Text>
          <Text style={styles.battleText}>
            {battleResult === 'victory' 
              ? 'Your guild emerged triumphant!'
              : 'Your guild fought bravely but was defeated.'
            }
          </Text>
          <Button
            title="Continue"
            onPress={() => setBattleResult(null)}
            variant="primary"
            size="small"
          />
        </Card>
      )}

      <Card style={styles.formationCard}>
        <Text style={styles.sectionTitle}>Battle Formation</Text>
        <Text style={styles.sectionSubtitle}>
          Select up to 3 characters for battle ({selectedCharacters.length}/3)
        </Text>
        
        <View style={styles.selectedCharacters}>
          {selectedCharacters.map((character, index) => (
            <View key={character.id} style={styles.selectedSlot}>
              <CharacterCard
                character={character}
                onPress={() => toggleCharacterSelection(character)}
                showStats={false}
              />
            </View>
          ))}
          {Array.from({ length: 3 - selectedCharacters.length }).map((_, index) => (
            <View key={`empty_${index}`} style={styles.emptySlot}>
              <Text style={styles.emptySlotText}>Empty</Text>
            </View>
          ))}
        </View>

        <Button
          title="Start Battle"
          onPress={startBattle}
          variant="primary"
          disabled={selectedCharacters.length === 0 || battleInProgress}
          style={styles.battleButton}
        />
      </Card>

      <Card style={styles.charactersCard}>
        <Text style={styles.sectionTitle}>Available Characters</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {characters.map((character) => (
            <View key={character.id} style={styles.characterOption}>
              <CharacterCard
                character={character}
                onPress={() => toggleCharacterSelection(character)}
              />
              {selectedCharacters.find(c => c.id === character.id) && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedIndicatorText}>✓</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {characters.length === 0 && (
          <Text style={styles.emptyText}>
            No characters available. Recruit some characters first!
          </Text>
        )}
      </Card>
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
  battleCard: {
    margin: 16,
    alignItems: 'center',
    padding: 24,
  },
  victoryCard: {
    borderColor: Colors.success,
    borderWidth: 2,
  },
  defeatCard: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  battleTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  battleText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  battleAnimation: {
    padding: 20,
  },
  battleEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  formationCard: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  selectedCharacters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  selectedSlot: {
    width: 100,
  },
  emptySlot: {
    width: 100,
    height: 120,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySlotText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  battleButton: {
    marginTop: 8,
  },
  charactersCard: {
    margin: 16,
    marginTop: 8,
  },
  characterOption: {
    position: 'relative',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.success,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    padding: 32,
  },
});