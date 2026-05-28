import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import { Card, Button, Modal, Toast, EmptyState, LoadingOverlay, SearchBar } from '../components';
import apiService from '../services/api';
import { ArchiveEntry } from '../types';
import { formatDate } from '../utils/helpers';
import { logger } from '../utils/logger';

const FILTERS: { value: ArchiveEntry['itemType'] | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'sub', label: '订阅' },
  { value: 'col', label: '集合' },
  { value: 'file', label: '文件' },
  { value: 'artifact', label: '制品' },
  { value: 'share', label: '分享' },
];

export default function ArchivesScreen() {
  const { colors } = useTheme();

  const [archives, setArchives] = useState<ArchiveEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });
  const [filter, setFilter] = useState<typeof FILTERS[number]['value']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    setLoading(true);
    const response = await apiService.getArchives();
    if (response.status === 'success' && response.data) {
      setArchives(response.data as ArchiveEntry[]);
    } else {
      showToast(response.message || '获取归档失败', 'error');
    }
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadArchives();
    setRefreshing(false);
  }, []);

  const handleRestore = (entry: ArchiveEntry) => {
    Alert.alert(
      '恢复归档',
      `确定要恢复 ${entry.displayName || entry.name} 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '恢复',
          onPress: async () => {
            const response = await apiService.restoreArchive(entry.id);
            if (response.status === 'success') {
              logger.info(`Archive restored: ${entry.id}`);
              showToast('已恢复', 'success');
              loadArchives();
            } else {
              showToast(response.message || '恢复失败', 'error');
            }
          },
        },
      ]
    );
  };

  const handleDelete = (entry: ArchiveEntry) => {
    Alert.alert(
      '删除归档',
      `确定要删除归档 ${entry.displayName || entry.name} 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const response = await apiService.deleteArchive(entry.id);
            if (response.status === 'success') {
              logger.info(`Archive deleted: ${entry.id}`);
              showToast('已删除', 'success');
              loadArchives();
            } else {
              showToast(response.message || '删除失败', 'error');
            }
          },
        },
      ]
    );
  };

  const handlePreview = (entry: ArchiveEntry) => {
    setPreviewContent(JSON.stringify(entry.snapshot, null, 2));
    setShowPreviewModal(true);
  };

  const showToast = (message: string, type: any) => {
    setToast({ visible: true, message, type });
  };

  const filteredArchives = archives.filter(entry => {
    const matchesFilter = filter === 'all' || entry.itemType === filter;
    const keyword = searchQuery.trim().toLowerCase();
    const matchesSearch = !keyword || entry.name.toLowerCase().includes(keyword) || (entry.displayName || '').toLowerCase().includes(keyword);
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LoadingOverlay visible={loading} />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="搜索归档..."
        onClear={() => setSearchQuery('')}
      />

      <View style={styles.filterRow}>
        {FILTERS.map(item => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.filterButton,
              {
                backgroundColor: filter === item.value ? colors.primary : colors.inputBg,
              },
            ]}
            onPress={() => setFilter(item.value)}
          >
            <Text style={[styles.filterText, { color: filter === item.value ? '#FFFFFF' : colors.textSecondary }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredArchives}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.archiveHeader}>
              <View style={styles.archiveTitle}>
                <Ionicons name="archive-outline" size={18} color={colors.secondary} />
                <Text style={[styles.archiveName, { color: colors.text }]}>
                  {item.displayName || item.name}
                </Text>
              </View>
              <View style={styles.archiveActions}>
                <Button title="查看" onPress={() => handlePreview(item)} variant="outline" size="small" icon="eye-outline" />
                <Button title="恢复" onPress={() => handleRestore(item)} variant="primary" size="small" icon="refresh-outline" />
                <Button title="删除" onPress={() => handleDelete(item)} variant="danger" size="small" icon="trash-outline" />
              </View>
            </View>
            <View style={styles.archiveMeta}>
              <Text style={[styles.archiveText, { color: colors.textSecondary }]}>
                类型: {FILTERS.find(f => f.value === item.itemType)?.label || item.itemType}
              </Text>
              <Text style={[styles.archiveText, { color: colors.textSecondary }]}>
                归档时间: {formatDate(item.archivedAt)}
              </Text>
            </View>
          </Card>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="archive-outline"
            title="暂无归档"
            message="删除时选择归档的条目会显示在这里"
          />
        }
      />

      <Modal visible={showPreviewModal} onClose={() => setShowPreviewModal(false)} title="归档详情">
        <View style={[styles.previewContainer, { backgroundColor: colors.inputBg }]}>
          <Text style={[styles.previewText, { color: colors.text }]}>
            {previewContent || '无内容'}
          </Text>
        </View>
        <Button title="关闭" onPress={() => setShowPreviewModal(false)} variant="outline" />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  archiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  archiveTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  archiveName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  archiveActions: {
    flexDirection: 'row',
    gap: 8,
  },
  archiveMeta: {
    gap: 4,
  },
  archiveText: {
    fontSize: 13,
  },
  previewContainer: {
    padding: 16,
    borderRadius: 8,
    maxHeight: 400,
  },
  previewText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
