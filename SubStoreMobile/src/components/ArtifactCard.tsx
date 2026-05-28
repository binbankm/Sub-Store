import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import { Artifact } from '../types';
import { formatDate, TARGET_PLATFORMS } from '../utils/helpers';

interface ArtifactCardProps {
  artifact: Artifact;
  onPress: () => void;
  onDelete: () => void;
  onSync: () => void;
  onCopy: () => void;
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({
  artifact,
  onPress,
  onDelete,
  onSync,
  onCopy,
}) => {
  const { colors } = useTheme();

  const handleDelete = () => {
    Alert.alert(
      '删除制品',
      `确定要删除制品 "${artifact.displayName || artifact.name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '删除', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const platformInfo = TARGET_PLATFORMS.find(p => p.value === artifact.platform);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="code-working" size={20} color={colors.info} />
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {artifact.displayName || artifact.name}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onCopy} style={styles.actionButton}>
            <Ionicons name="copy-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSync} style={styles.actionButton}>
            <Ionicons name="sync" size={18} color={colors.success} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="phone-portrait" size={14} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {platformInfo?.label || artifact.platform}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name={artifact.type === 'subscription' ? 'document' : 'folder'} size={14} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {artifact.type === 'subscription' ? '订阅' : '集合'}
          </Text>
        </View>
      </View>

      <View style={styles.statusContainer}>
        {artifact.sync && (
          <View style={[styles.statusTag, { backgroundColor: `${colors.success}20` }]}>
            <Ionicons name="cloud-done" size={12} color={colors.success} />
            <Text style={[styles.statusText, { color: colors.success }]}>已同步</Text>
          </View>
        )}
        {artifact.autoUpdate && (
          <View style={[styles.statusTag, { backgroundColor: `${colors.info}20` }]}>
            <Ionicons name="time" size={12} color={colors.info} />
            <Text style={[styles.statusText, { color: colors.info }]}>自动更新</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.dateText, { color: colors.textTertiary }]}>
          更新: {formatDate(artifact.updatedAt)}
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
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
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
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  dateText: {
    fontSize: 12,
  },
});
