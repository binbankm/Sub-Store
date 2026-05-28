import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import { Collection } from '../types';
import { formatDate } from '../utils/helpers';

interface CollectionCardProps {
  collection: Collection;
  subscriptionCount: number;
  onPress: () => void;
  onDelete: () => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  subscriptionCount,
  onPress,
  onDelete,
}) => {
  const { colors } = useTheme();

  const handleDelete = () => {
    Alert.alert(
      '删除集合',
      `确定要删除集合 "${collection.displayName || collection.name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '删除', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="folder" size={20} color={colors.secondary} />
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {collection.displayName || collection.name}
          </Text>
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="list" size={14} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {subscriptionCount} 个订阅
          </Text>
        </View>
        {collection.process && collection.process.length > 0 && (
          <View style={styles.infoItem}>
            <Ionicons name="options" size={14} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {collection.process.length} 个操作
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.dateText, { color: colors.textTertiary }]}>
          更新: {formatDate(collection.updatedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  dateText: {
    fontSize: 12,
  },
});
