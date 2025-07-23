import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { blink } from '@/lib/blink';
import { Colors } from '@/constants/Colors';
import { Guild } from '@/types/game';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'gold' | 'gems';
  type: 'character' | 'upgrade' | 'resource';
  icon: string;
}

const shopItems: ShopItem[] = [
  {
    id: 'recruit_common',
    name: 'Common Recruit',
    description: 'Recruit a common character to your guild',
    price: 500,
    currency: 'gold',
    type: 'character',
    icon: '👤'
  },
  {
    id: 'recruit_rare',
    name: 'Rare Recruit',
    description: 'Recruit a rare character with better stats',
    price: 25,
    currency: 'gems',
    type: 'character',
    icon: '⭐'
  },
  {
    id: 'gold_pack_small',
    name: 'Small Gold Pack',
    description: 'Get 1,000 gold instantly',
    price: 10,
    currency: 'gems',
    type: 'resource',
    icon: '🪙'
  },
  {
    id: 'gold_pack_large',
    name: 'Large Gold Pack',
    description: 'Get 5,000 gold instantly',
    price: 40,
    currency: 'gems',
    type: 'resource',
    icon: '💰'
  },
  {
    id: 'experience_boost',
    name: 'Experience Boost',
    description: 'Double experience gain for 1 hour',
    price: 15,
    currency: 'gems',
    type: 'upgrade',
    icon: '⚡'
  },
  {
    id: 'guild_upgrade',
    name: 'Guild Level Up',
    description: 'Instantly level up your guild',
    price: 2000,
    currency: 'gold',
    type: 'upgrade',
    icon: '🏰'
  }
];

export default function Shop() {
  const [user, setUser] = useState<any>(null);
  const [guild, setGuild] = useState<Guild | null>(null);
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
      const guilds = await blink.db.guilds.list({
        where: { user_id: userId },
        limit: 1
      });

      if (guilds.length > 0) {
        setGuild(guilds[0]);
      }
    } catch (error) {
      console.error('Error loading shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseItem = async (item: ShopItem) => {
    if (!guild || !user) return;

    const canAfford = item.currency === 'gold' 
      ? guild.gold >= item.price 
      : guild.gems >= item.price;

    if (!canAfford) {
      Alert.alert(
        'Insufficient Funds',
        `You need ${item.price} ${item.currency} to purchase this item.`
      );
      return;
    }

    try {
      switch (item.id) {
        case 'recruit_common':
          await recruitCharacter('common');
          break;
        case 'recruit_rare':
          await recruitCharacter('rare');
          break;
        case 'gold_pack_small':
          await addGold(1000);
          break;
        case 'gold_pack_large':
          await addGold(5000);
          break;
        case 'experience_boost':
          Alert.alert('Experience Boost', 'Experience boost activated! (Feature coming soon)');
          break;
        case 'guild_upgrade':
          await upgradeGuild();
          break;
      }

      // Deduct cost
      const updates: Partial<Guild> = {};
      if (item.currency === 'gold') {
        updates.gold = guild.gold - item.price;
      } else {
        updates.gems = guild.gems - item.price;
      }

      await blink.db.guilds.update(guild.id, updates);
      
      // Refresh data
      loadData(user.id);

      Alert.alert('Purchase Successful', `You have purchased ${item.name}!`);
    } catch (error) {
      console.error('Error purchasing item:', error);
      Alert.alert('Error', 'Failed to purchase item. Please try again.');
    }
  };

  const recruitCharacter = async (rarity: 'common' | 'rare') => {
    if (!guild || !user) return;

    const characterClasses = ['warrior', 'mage', 'archer', 'assassin', 'healer', 'tank'];
    const names = [
      'Theron', 'Luna', 'Kael', 'Vera', 'Darius', 'Nyx', 'Orion', 'Zara',
      'Magnus', 'Lyra', 'Vex', 'Aria', 'Raven', 'Phoenix', 'Storm', 'Sage'
    ];

    const randomClass = characterClasses[Math.floor(Math.random() * characterClasses.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];

    const rarityMultiplier = rarity === 'common' ? 1 : 1.5;

    const newCharacter = {
      id: `char_${Date.now()}`,
      user_id: user.id,
      guild_id: guild.id,
      name: randomName,
      class: randomClass,
      level: 1,
      experience: 0,
      health: Math.floor(100 * rarityMultiplier),
      attack: Math.floor(20 * rarityMultiplier),
      defense: Math.floor(15 * rarityMultiplier),
      speed: Math.floor(10 * rarityMultiplier),
      rarity: rarity,
      is_equipped: 0
    };

    await blink.db.characters.create(newCharacter);
  };

  const addGold = async (amount: number) => {
    if (!guild) return;
    
    await blink.db.guilds.update(guild.id, {
      gold: guild.gold + amount
    });
  };

  const upgradeGuild = async () => {
    if (!guild) return;

    await blink.db.guilds.update(guild.id, {
      level: guild.level + 1,
      experience: 0
    });
  };

  const canAfford = (item: ShopItem) => {
    if (!guild) return false;
    return item.currency === 'gold' 
      ? guild.gold >= item.price 
      : guild.gems >= item.price;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading shop...</Text>
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
        <Text style={styles.title}>Guild Shop</Text>
        <View style={styles.placeholder} />
      </View>

      <Card style={styles.currencyCard}>
        <View style={styles.currencyRow}>
          <View style={styles.currency}>
            <Text style={styles.currencyIcon}>🪙</Text>
            <Text style={styles.currencyValue}>{guild?.gold.toLocaleString() || 0}</Text>
            <Text style={styles.currencyLabel}>Gold</Text>
          </View>
          <View style={styles.currency}>
            <Text style={styles.currencyIcon}>💎</Text>
            <Text style={styles.currencyValue}>{guild?.gems || 0}</Text>
            <Text style={styles.currencyLabel}>Gems</Text>
          </View>
        </View>
      </Card>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Shop Items</Text>
        
        {shopItems.map((item) => (
          <Card key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
              <View style={styles.itemPrice}>
                <Text style={styles.priceValue}>
                  {item.price} {item.currency === 'gold' ? '🪙' : '💎'}
                </Text>
              </View>
            </View>
            
            <Button
              title="Purchase"
              onPress={() => purchaseItem(item)}
              variant={canAfford(item) ? "primary" : "outline"}
              disabled={!canAfford(item)}
              size="small"
              style={styles.purchaseButton}
            />
          </Card>
        ))}

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Shop Tips</Text>
          <Text style={styles.infoText}>
            • Earn gold by winning battles and conquering territories
          </Text>
          <Text style={styles.infoText}>
            • Gems are premium currency - use them wisely!
          </Text>
          <Text style={styles.infoText}>
            • Rare characters have significantly better stats
          </Text>
          <Text style={styles.infoText}>
            • Guild upgrades unlock new features and territories
          </Text>
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
  currencyCard: {
    margin: 16,
    marginTop: 8,
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  currency: {
    alignItems: 'center',
  },
  currencyIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  currencyValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  currencyLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
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
  itemCard: {
    margin: 16,
    marginTop: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  itemPrice: {
    alignItems: 'flex-end',
  },
  priceValue: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  purchaseButton: {
    alignSelf: 'flex-end',
    minWidth: 100,
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: Colors.surfaceLight,
  },
  infoTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
});