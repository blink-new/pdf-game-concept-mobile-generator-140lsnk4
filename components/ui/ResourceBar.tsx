import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ResourceBarProps {
  gold: number;
  gems: number;
  experience: number;
  level: number;
}

export function ResourceBar({ gold, gems, experience, level }: ResourceBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.resource}>
        <Text style={styles.resourceIcon}>🪙</Text>
        <Text style={styles.resourceValue}>{gold.toLocaleString()}</Text>
      </View>
      
      <View style={styles.resource}>
        <Text style={styles.resourceIcon}>💎</Text>
        <Text style={styles.resourceValue}>{gems}</Text>
      </View>
      
      <View style={styles.resource}>
        <Text style={styles.resourceIcon}>⭐</Text>
        <Text style={styles.resourceValue}>Lv.{level}</Text>
      </View>
      
      <View style={styles.experienceBar}>
        <View style={styles.experienceBarBg}>
          <View 
            style={[
              styles.experienceBarFill, 
              { width: `${Math.min((experience % 1000) / 10, 100)}%` }
            ]} 
          />
        </View>
        <Text style={styles.experienceText}>
          {experience % 1000}/1000 XP
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  resource: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  resourceIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  resourceValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  experienceBar: {
    flex: 1,
    marginLeft: 8,
  },
  experienceBarBg: {
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  experienceBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  experienceText: {
    color: Colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
});