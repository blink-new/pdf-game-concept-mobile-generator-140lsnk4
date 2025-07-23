import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Character, CharacterClass, CharacterRarity } from '@/types/game';
import { Card } from '@/components/ui/Card';

interface CharacterCardProps {
  character: Character;
  onPress?: () => void;
  showStats?: boolean;
}

const classIcons: Record<CharacterClass, string> = {
  warrior: '⚔️',
  mage: '🔮',
  archer: '🏹',
  assassin: '🗡️',
  healer: '✨',
  tank: '🛡️',
};

const rarityColors: Record<CharacterRarity, string> = {
  common: Colors.common,
  rare: Colors.rare,
  epic: Colors.epic,
  legendary: Colors.legendary,
};

export function CharacterCard({ character, onPress, showStats = true }: CharacterCardProps) {
  const rarityColor = rarityColors[character.rarity];
  const classIcon = classIcons[character.class];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={[styles.card, { borderColor: rarityColor, borderWidth: 2 }]}>
        <View style={styles.header}>
          <Text style={styles.classIcon}>{classIcon}</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{character.name}</Text>
            <Text style={[styles.rarity, { color: rarityColor }]}>
              {character.rarity.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.level}>Lv.{character.level}</Text>
        </View>

        {showStats && (
          <View style={styles.stats}>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statIcon}>❤️</Text>
                <Text style={styles.statValue}>{character.health}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statIcon}>⚔️</Text>
                <Text style={styles.statValue}>{character.attack}</Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statIcon}>🛡️</Text>
                <Text style={styles.statValue}>{character.defense}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statIcon}>⚡</Text>
                <Text style={styles.statValue}>{character.speed}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.experienceBar}>
          <View style={styles.experienceBarBg}>
            <View 
              style={[
                styles.experienceBarFill, 
                { width: `${Math.min((character.experience % 100) / 1, 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.experienceText}>
            {character.experience % 100}/100 XP
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    minWidth: 160,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  classIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  rarity: {
    fontSize: 12,
    fontWeight: '500',
  },
  level: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  stats: {
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statValue: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  experienceBar: {
    marginTop: 8,
  },
  experienceBarBg: {
    height: 4,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  experienceBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  experienceText: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
});