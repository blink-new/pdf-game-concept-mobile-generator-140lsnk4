import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Guild } from '@/types/game';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface GuildOverviewProps {
  guild: Guild;
  onManageGuild: () => void;
  onViewCharacters: () => void;
  onBattle: () => void;
  onViewTerritories: () => void;
}

export function GuildOverview({ 
  guild, 
  onManageGuild, 
  onViewCharacters, 
  onBattle, 
  onViewTerritories 
}: GuildOverviewProps) {
  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.guildIcon}>🏰</Text>
        <View style={styles.guildInfo}>
          <Text style={styles.guildName}>{guild.name}</Text>
          <Text style={styles.guildLevel}>Level {guild.level}</Text>
          {guild.description && (
            <Text style={styles.guildDescription}>{guild.description}</Text>
          )}
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>👥</Text>
          <Text style={styles.statLabel}>Members</Text>
          <Text style={styles.statValue}>{guild.member_count}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🗺️</Text>
          <Text style={styles.statLabel}>Territories</Text>
          <Text style={styles.statValue}>{guild.territory_count}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Manage Guild"
          onPress={onManageGuild}
          variant="secondary"
          size="small"
          style={styles.actionButton}
        />
        <Button
          title="Characters"
          onPress={onViewCharacters}
          variant="secondary"
          size="small"
          style={styles.actionButton}
        />
      </View>

      <View style={styles.actions}>
        <Button
          title="Battle Arena"
          onPress={onBattle}
          variant="primary"
          size="medium"
          style={styles.primaryButton}
        />
        <Button
          title="Territories"
          onPress={onViewTerritories}
          variant="outline"
          size="medium"
          style={styles.primaryButton}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  guildIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  guildInfo: {
    flex: 1,
  },
  guildName: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  guildLevel: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  guildDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  primaryButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});