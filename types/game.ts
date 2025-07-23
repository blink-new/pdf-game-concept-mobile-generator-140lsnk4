export interface Guild {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  level: number;
  experience: number;
  gold: number;
  gems: number;
  territory_count: number;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  user_id: string;
  guild_id: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  health: number;
  attack: number;
  defense: number;
  speed: number;
  rarity: CharacterRarity;
  is_equipped: number;
  created_at: string;
}

export type CharacterClass = 'warrior' | 'mage' | 'archer' | 'assassin' | 'healer' | 'tank';
export type CharacterRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Battle {
  id: string;
  user_id: string;
  guild_id: string;
  opponent_guild_id?: string;
  battle_type: 'pve' | 'pvp' | 'territory';
  status: 'pending' | 'active' | 'completed';
  result?: 'victory' | 'defeat' | 'draw';
  rewards_gold: number;
  rewards_experience: number;
  created_at: string;
}

export interface Territory {
  id: string;
  name: string;
  owner_guild_id?: string;
  owner_user_id?: string;
  difficulty: number;
  gold_reward: number;
  experience_reward: number;
  is_conquered: number;
  created_at: string;
}