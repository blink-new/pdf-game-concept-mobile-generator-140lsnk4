import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { blink } from '@/lib/blink';
import { Colors } from '@/constants/Colors';
import { Guild, Battle } from '@/types/game';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function GuildScreen() {
  const [user, setUser] = useState<any>(null);
  const [guild, setGuild] = useState<Guild | null>(null);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

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
        setNewName(userGuild.name);
        setNewDescription(userGuild.description || '');

        // Load recent battles
        const recentBattles = await blink.db.battles.list({
          where: { guild_id: userGuild.id },
          orderBy: { created_at: 'desc' },
          limit: 10
        });
        setBattles(recentBattles);
      }
    } catch (error) {
      console.error('Error loading guild data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGuildName = async () => {
    if (!guild || !newName.trim()) return;

    try {
      await blink.db.guilds.update(guild.id, {
        name: newName.trim()
      });

      setGuild({ ...guild, name: newName.trim() });
      setEditingName(false);
      Alert.alert('Success', 'Guild name updated successfully!');
    } catch (error) {
      console.error('Error updating guild name:', error);
      Alert.alert('Error', 'Failed to update guild name.');
    }
  };

  const updateGuildDescription = async () => {
    if (!guild) return;

    try {
      await blink.db.guilds.update(guild.id, {
        description: newDescription.trim()
      });

      setGuild({ ...guild, description: newDescription.trim() });
      setEditingDescription(false);
      Alert.alert('Success', 'Guild description updated successfully!');
    } catch (error) {
      console.error('Error updating guild description:', error);
      Alert.alert('Error', 'Failed to update guild description.');
    }
  };

  const getBattleResultIcon = (result?: string) => {
    switch (result) {
      case 'victory': return '🏆';
      case 'defeat': return '💀';
      case 'draw': return '🤝';
      default: return '⚔️';
    }
  };

  const getBattleResultColor = (result?: string) => {
    switch (result) {
      case 'victory': return Colors.success;
      case 'defeat': return Colors.error;
      case 'draw': return Colors.warning;
      default: return Colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading guild...</Text>
      </View>
    );
  }

  if (!guild) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Guild not found</Text>
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
        <Text style={styles.title}>Guild Management</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.guildInfoCard}>
          <View style={styles.guildHeader}>
            <Text style={styles.guildIcon}>🏰</Text>
            <View style={styles.guildDetails}>
              {editingName ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Guild Name"
                    placeholderTextColor={Colors.textMuted}
                  />
                  <View style={styles.editButtons}>
                    <Button
                      title="Save"
                      onPress={updateGuildName}
                      variant="primary"
                      size="small"
                      style={styles.editButton}
                    />
                    <Button
                      title="Cancel"
                      onPress={() => {
                        setEditingName(false);
                        setNewName(guild.name);
                      }}
                      variant="outline"
                      size="small"
                      style={styles.editButton}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.nameContainer}>
                  <Text style={styles.guildName}>{guild.name}</Text>
                  <Button
                    title="Edit"
                    onPress={() => setEditingName(true)}
                    variant="outline"
                    size="small"
                    style={styles.editNameButton}
                  />
                </View>
              )}
              
              <Text style={styles.guildLevel}>Level {guild.level}</Text>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            {editingDescription ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newDescription}
                  onChangeText={setNewDescription}
                  placeholder="Guild Description"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.editButtons}>
                  <Button
                    title="Save"
                    onPress={updateGuildDescription}
                    variant="primary"
                    size="small"
                    style={styles.editButton}
                  />
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setEditingDescription(false);
                      setNewDescription(guild.description || '');
                    }}
                    variant="outline"
                    size="small"
                    style={styles.editButton}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.descriptionContainer}>
                <Text style={styles.guildDescription}>
                  {guild.description || 'No description set'}
                </Text>
                <Button
                  title="Edit"
                  onPress={() => setEditingDescription(true)}
                  variant="outline"
                  size="small"
                  style={styles.editDescButton}
                />
              </View>
            )}
          </View>
        </Card>

        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Guild Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statValue}>{guild.member_count}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🗺️</Text>
              <Text style={styles.statValue}>{guild.territory_count}</Text>
              <Text style={styles.statLabel}>Territories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🪙</Text>
              <Text style={styles.statValue}>{guild.gold.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Gold</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💎</Text>
              <Text style={styles.statValue}>{guild.gems}</Text>
              <Text style={styles.statLabel}>Gems</Text>
            </View>
          </View>

          <View style={styles.experienceSection}>
            <Text style={styles.experienceLabel}>
              Experience: {guild.experience}/1000
            </Text>
            <View style={styles.experienceBar}>
              <View 
                style={[
                  styles.experienceBarFill, 
                  { width: `${Math.min((guild.experience % 1000) / 10, 100)}%` }
                ]} 
              />
            </View>
          </View>
        </Card>

        <Card style={styles.battleHistoryCard}>
          <Text style={styles.sectionTitle}>Recent Battles</Text>
          {battles.length > 0 ? (
            battles.map((battle) => (
              <View key={battle.id} style={styles.battleItem}>
                <View style={styles.battleInfo}>
                  <Text style={styles.battleIcon}>
                    {getBattleResultIcon(battle.result)}
                  </Text>
                  <View style={styles.battleDetails}>
                    <Text style={styles.battleType}>
                      {battle.battle_type.toUpperCase()} Battle
                    </Text>
                    <Text style={styles.battleDate}>
                      {formatDate(battle.created_at)}
                    </Text>
                  </View>
                  <View style={styles.battleRewards}>
                    <Text style={styles.rewardText}>
                      🪙 {battle.rewards_gold}
                    </Text>
                    <Text style={styles.rewardText}>
                      ⭐ {battle.rewards_experience}
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.battleResult,
                  { backgroundColor: getBattleResultColor(battle.result) }
                ]}>
                  <Text style={styles.battleResultText}>
                    {battle.result?.toUpperCase() || 'PENDING'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              No battles fought yet. Head to the Battle Arena to start fighting!
            </Text>
          )}
        </Card>

        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <Button
              title="View Characters"
              onPress={() => router.push('/characters')}
              variant="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Battle Arena"
              onPress={() => router.push('/battle')}
              variant="primary"
              style={styles.actionButton}
            />
          </View>
          <View style={styles.actionButtons}>
            <Button
              title="Territories"
              onPress={() => router.push('/territory')}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title="Shop"
              onPress={() => router.push('/shop')}
              variant="outline"
              style={styles.actionButton}
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
  scrollView: {
    flex: 1,
  },
  guildInfoCard: {
    margin: 16,
    marginTop: 8,
  },
  guildHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  guildIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  guildDetails: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guildName: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  editNameButton: {
    marginLeft: 8,
  },
  guildLevel: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  descriptionSection: {
    marginTop: 8,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  guildDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  editDescButton: {
    marginLeft: 8,
  },
  editContainer: {
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.surfaceLight,
    color: Colors.text,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    marginLeft: 8,
    minWidth: 60,
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  experienceSection: {
    marginTop: 8,
  },
  experienceLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  experienceBar: {
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  experienceBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  battleHistoryCard: {
    margin: 16,
    marginTop: 8,
  },
  battleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  battleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  battleIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  battleDetails: {
    flex: 1,
  },
  battleType: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  battleDate: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  battleRewards: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  rewardText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  battleResult: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  battleResultText: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
    fontStyle: 'italic',
  },
  actionsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});