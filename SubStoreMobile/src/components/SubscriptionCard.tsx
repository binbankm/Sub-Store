import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import { Subscription, FlowInfo } from '../types';
import { formatDate, formatBytes, getProxyTypeColor, getRegionFlag } from '../utils/helpers';

interface SubscriptionCardProps {
  subscription: Subscription;
  flowInfo?: FlowInfo;
  onPress: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  flowInfo,
  onPress,
  onDelete,
  onRefresh,
}) => {
  const { colors } = useTheme();

  const handleDelete = () => {
    Alert.alert(
      '删除订阅',
      `确定要删除订阅 "${subscription.displayName || subscription.name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '删除', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const used = flowInfo ? flowInfo.upload + flowInfo.download : 0;
  const total = flowInfo?.total || 0;
  const progress = total > 0 ? used / total : 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons
            name={subscription.source === 'remote' ? 'cloud' : 'document'}
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {subscription.displayName || subscription.name}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onRefresh} style={styles.actionButton}>
            <Ionicons name="refresh" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {subscription.source === 'remote' && subscription.url && (
        <Text style={[styles.url, { color: colors.textTertiary }]} numberOfLines={1}>
          {subscription.url}
        </Text>
      )}

      {flowInfo && (
        <View style={styles.flowContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress * 100, 100)}%`,
                  backgroundColor: progress > 0.8 ? colors.warning : colors.primary,
                },
              ]}
            />
          </View>
          <View style={styles.flowInfo}>
            <Text style={[styles.flowText, { color: colors.textSecondary }]}>
              {formatBytes(used)} / {formatBytes(total)}
            </Text>
            {flowInfo.expire > 0 && (
              <Text style={[styles.flowText, { color: colors.textSecondary }]}>
                到期: {formatDate(flowInfo.expire)}
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.sourceTag}>
          <Text style={[styles.sourceText, { color: colors.primary }]}>
            {subscription.source === 'remote' ? '远程' : '本地'}
          </Text>
        </View>
        <Text style={[styles.dateText, { color: colors.textTertiary }]}>
          更新: {formatDate(subscription.updatedAt)}
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
    marginBottom: 8,
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
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  url: {
    fontSize: 12,
    marginBottom: 8,
  },
  flowContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  flowInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flowText: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
  },
});
