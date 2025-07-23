import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { blink } from '@/lib/blink';
import { Colors } from '@/constants/Colors';
import { Guild, Territory } from '@/types/game';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function TerritoryScreen() {
  const [user, setUser] = useState<any>(null);
  const [guild, setGuild] = useState<Guild | null>(null);
  const [territories, setTerritories] = useState<Territory[]>([]);
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
        setGuild(guilds[0]);
      }

      // Load territories
      const allTerritories = await blink.db.territories.list({
        orderBy: { difficulty: 'asc' }
      });

      // If no territories exist, create initial ones
      if (allTerritories.length === 0) {
        await createInitialTerritories();
        return;
      }

      setTerritories(allTerritories);
    } catch (error) {
      console.error('Error loading territory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInitialTerritories = async () => {
    const initialTerritories = [
      {
        id: 'territory_1',
        name: 'Whispering Woods',
        difficulty: 1,
        gold_reward: 150,
        experience_reward: 75,
        is_conquered: 0
      },
      {
        id: 'territory_2',
        name: 'Crystal Caverns',
        difficulty: 2,
        gold_reward: 250,
        experience_reward: 125,
        is_conquered: 0
      },
      {
        id: 'territory_3',
        name: 'Shadow Peaks',
        difficulty: 3,
        gold_reward: 400,
        experience_reward: 200,
        is_conquered: 0
      },
      {
        id: 'territory_4',
        name: 'Frozen Wastes',
        difficulty: 4,
        gold_reward: 600,
        experience_reward: 300,
        is_conquered: 0
      },
      {
        id: 'territory_5',
        name: 'Dragon\'s Lair',
        difficulty: 5,
        gold_reward: 1000,
        experience_reward: 500,
        is_conquered: 0
      }
    ];

    await blink.db.territories.createMany(initialTerritories);
    setTerritories(initialTerritories);
  };

  const conquerTerritory = async (territory: Territory) => {
    if (!guild || !user) return;

    // Check if already conquered
    if (Number(territory.is_conquered) > 0 && territory.owner_user_id === user.id) {
      Alert.alert('Already Conquered', 'You already control this territory!');
      return;
    }

    // Check guild level requirement
    if (guild.level < territory.difficulty) {
      Alert.alert(
        'Guild Level Too Low',
        `Your guild must be level ${territory.difficulty} or higher to conquer this territory.`
      );
      return;
    }

    try {
      // Simulate conquest battle
      const success = Math.random() > 0.3; // 70% success rate

      if (success) {
        // Update territory ownership
        await blink.db.territories.update(territory.id, {
          owner_guild_id: guild.id,
          owner_user_id: user.id,
          is_conquered: 1
        });

        // Reward guild
        await blink.db.guilds.update(guild.id, {
          gold: guild.gold + territory.gold_reward,
          experience: guild.experience + territory.experience_reward,
          territory_count: guild.territory_count + 1
        });

        Alert.alert(
          'Territory Conquered!',
          `You have successfully conquered ${territory.name}! Earned ${territory.gold_reward} gold and ${territory.experience_reward} experience.`
        );

        // Refresh data
        loadData(user.id);
      } else {
        Alert.alert(
          'Conquest Failed',
          `Your guild was unable to conquer ${territory.name}. Train your characters and try again!`
        );
      }
    } catch (error) {
      console.error('Error conquering territory:', error);
      Alert.alert('Error', 'Failed to conquer territory. Please try again.');
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return Colors.success;
      case 2: return Colors.info;
      case 3: return Colors.warning;
      case 4: return Colors.error;
      case 5: return Colors.legendary;
      default: return Colors.textSecondary;
    }
  };

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Easy';
      case 2: return 'Medium';
      case 3: return 'Hard';
      case 4: return 'Very Hard';
      case 5: return 'Legendary';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading territories...</Text>
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
        <Text style={styles.title}>Territory Map</Text>
        <View style={styles.placeholder} />
      </View>

      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Your Empire</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{guild?.territory_count || 0}</Text>
            <Text style={styles.statLabel}>Territories Controlled</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Lv.{guild?.level || 1}</Text>
            <Text style={styles.statLabel}>Guild Level</Text>
          </View>
        </View>
      </Card>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Available Territories</Text>
        
        {territories.map((territory) => {
          const isOwned = Number(territory.is_conquered) > 0 && territory.owner_user_id === user?.id;
          const isConquered = Number(territory.is_conquered) > 0;
          const canConquer = guild && guild.level >= territory.difficulty;

          return (
            <Card key={territory.id} style={[
              styles.territoryCard,
              isOwned && styles.ownedTerritory,
              isConquered && !isOwned && styles.enemyTerritory
            ]}>
              <View style={styles.territoryHeader}>
                <View style={styles.territoryInfo}>
                  <Text style={styles.territoryName}>{territory.name}</Text>
                  <View style={styles.difficultyBadge}>
                    <Text style={[
                      styles.difficultyText,
                      { color: getDifficultyColor(territory.difficulty) }
                    ]}>
                      {getDifficultyText(territory.difficulty)} (Lv.{territory.difficulty})
                    </Text>
                  </View>
                </View>
                
                <View style={styles.territoryStatus}>
                  {isOwned && (
                    <Text style={styles.ownedText}>🏰 Controlled</Text>
                  )}
                  {isConquered && !isOwned && (
                    <Text style={styles.enemyText}>⚔️ Enemy</Text>
                  )}
                  {!isConquered && (
                    <Text style={styles.neutralText}>🏴 Neutral</Text>
                  )}
                </View>
              </View>

              <View style={styles.rewards}>
                <Text style={styles.rewardsTitle}>Conquest Rewards:</Text>
                <View style={styles.rewardsRow}>
                  <Text style={styles.rewardItem}>🪙 {territory.gold_reward}</Text>
                  <Text style={styles.rewardItem}>⭐ {territory.experience_reward} XP</Text>
                </View>
              </View>

              {!isOwned && (
                <Button
                  title={isConquered ? "Challenge" : "Conquer"}
                  onPress={() => conquerTerritory(territory)}
                  variant={canConquer ? "primary" : "outline"}
                  disabled={!canConquer}
                  style={styles.conquestButton}
                />
              )}

              {!canConquer && !isOwned && (
                <Text style={styles.requirementText}>
                  Requires Guild Level {territory.difficulty}
                </Text>
              )}
            </Card>
          );
        })}
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
  statsCard: {
    margin: 16,
    marginTop: 8,
  },
  statsTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    margin: 16,
    marginBottom: 8,
  },
  territoryCard: {
    margin: 16,
    marginTop: 8,
  },
  ownedTerritory: {
    borderColor: Colors.success,
    borderWidth: 2,
  },
  enemyTerritory: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  territoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  territoryInfo: {
    flex: 1,
  },
  territoryName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  territoryStatus: {
    alignItems: 'flex-end',
  },
  ownedText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
  enemyText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  neutralText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  rewards: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  rewardsTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rewardItem: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  conquestButton: {
    marginTop: 8,
  },
  requirementText: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});