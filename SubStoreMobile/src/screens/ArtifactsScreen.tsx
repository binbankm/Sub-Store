import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchArtifacts, deleteArtifact, syncArtifact, syncAllArtifacts } from '../store/artifactSlice';
import { fetchSubscriptions } from '../store/subscriptionSlice';
import { fetchCollections } from '../store/collectionSlice';
import { useTheme } from '../styles/theme';
import {
  ArtifactCard,
  EmptyState,
  FloatingActionButton,
  SearchBar,
  Modal,
  Input,
  Button,
  Toast,
} from '../components';
import apiService from '../services/api';
import { TARGET_PLATFORMS } from '../utils/helpers';
import { TargetPlatform } from '../types';
import * as Clipboard from 'expo-clipboard';

export default function ArtifactsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  
  const { items: artifacts, loading } = useSelector(
    (state: RootState) => state.artifacts
  );
  const { items: subscriptions } = useSelector(
    (state: RootState) => state.subscriptions
  );
  const { items: collections } = useSelector(
    (state: RootState) => state.collections
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArtifact, setNewArtifact] = useState({
    name: '',
    type: 'subscription' as 'subscription' | 'collection',
    source: '',
    platform: 'ClashMeta' as TargetPlatform,
    sync: false,
    autoUpdate: false,
  });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await dispatch(fetchArtifacts());
    await dispatch(fetchSubscriptions());
    await dispatch(fetchCollections());
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleDelete = async (name: string) => {
    const result = await dispatch(deleteArtifact(name));
    if (deleteArtifact.fulfilled.match(result)) {
      showToast('制品已删除', 'success');
    } else {
      showToast('删除失败', 'error');
    }
  };

  const handleSync = async (name: string) => {
    const result = await dispatch(syncArtifact(name));
    if (syncArtifact.fulfilled.match(result)) {
      showToast('同步成功', 'success');
    } else {
      showToast('同步失败', 'error');
    }
  };

  const handleSyncAll = async () => {
    const result = await dispatch(syncAllArtifacts());
    if (syncAllArtifacts.fulfilled.match(result)) {
      showToast('全部同步成功', 'success');
    } else {
      showToast('同步失败', 'error');
    }
  };

  const handleCopy = async (name: string) => {
    try {
      const url = `${apiService.getServerUrl()}/api/download/${newArtifact.type}/${encodeURIComponent(name)}`;
      await Clipboard.setStringAsync(url);
      showToast('链接已复制', 'success');
    } catch (error) {
      showToast('复制失败', 'error');
    }
  };

  const handleAdd = async () => {
    if (!newArtifact.name) {
      showToast('请输入制品名称', 'error');
      return;
    }

    if (!newArtifact.source) {
      showToast('请选择来源', 'error');
      return;
    }

    try {
      await apiService.createArtifact({
        name: newArtifact.name,
        type: newArtifact.type,
        source: newArtifact.source,
        platform: newArtifact.platform,
        sync: newArtifact.sync,
        autoUpdate: newArtifact.autoUpdate,
      });
      
      setShowAddModal(false);
      setNewArtifact({
        name: '',
        type: 'subscription',
        source: '',
        platform: 'ClashMeta',
        sync: false,
        autoUpdate: false,
      });
      showToast('制品已添加', 'success');
      dispatch(fetchArtifacts());
    } catch (error) {
      showToast('添加失败', 'error');
    }
  };

  const showToast = (message: string, type: any) => {
    setToast({ visible: true, message, type });
  };

  const filteredArtifacts = artifacts.filter(artifact =>
    artifact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (artifact.displayName && artifact.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sources = newArtifact.type === 'subscription' ? subscriptions : collections;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="搜索制品..."
        onClear={() => setSearchQuery('')}
      />

      <FlatList
        data={filteredArtifacts}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <ArtifactCard
            artifact={item}
            onPress={() => {}}
            onDelete={() => handleDelete(item.name)}
            onSync={() => handleSync(item.name)}
            onCopy={() => handleCopy(item.name)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="code-working-outline"
            title="暂无制品"
            message="制品可以将订阅导出为不同平台的格式"
            actionTitle="创建制品"
            onAction={() => setShowAddModal(true)}
          />
        }
      />

      <FloatingActionButton
        icon="add"
        onPress={() => setShowAddModal(true)}
      />

      <Modal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="创建制品"
      >
        <Input
          label="制品名称"
          value={newArtifact.name}
          onChangeText={(text) => setNewArtifact({ ...newArtifact, name: text })}
          placeholder="输入制品名称"
          leftIcon="text"
        />

        <View style={styles.typeSelector}>
          <Button
            title="订阅"
            onPress={() => setNewArtifact({ ...newArtifact, type: 'subscription', source: '' })}
            variant={newArtifact.type === 'subscription' ? 'primary' : 'outline'}
            style={styles.typeButton}
          />
          <Button
            title="集合"
            onPress={() => setNewArtifact({ ...newArtifact, type: 'collection', source: '' })}
            variant={newArtifact.type === 'collection' ? 'primary' : 'outline'}
            style={styles.typeButton}
          />
        </View>

        <View style={styles.sourceList}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
            <Button
              title="选择来源"
              onPress={() => {}}
              variant="ghost"
              icon="list"
            />
          </View>
          {sources.map(source => (
            <Button
              key={source.name}
              title={source.displayName || source.name}
              onPress={() => setNewArtifact({ ...newArtifact, source: source.name })}
              variant={newArtifact.source === source.name ? 'primary' : 'outline'}
              style={styles.sourceButton}
              icon={newArtifact.source === source.name ? 'checkmark-circle' : 'ellipse-outline'}
            />
          ))}
        </View>

        <View style={styles.platformList}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
            <Button
              title="选择平台"
              onPress={() => {}}
              variant="ghost"
              icon="phone-portrait"
            />
          </View>
          {TARGET_PLATFORMS.map(platform => (
            <Button
              key={platform.value}
              title={platform.label}
              onPress={() => setNewArtifact({ ...newArtifact, platform: platform.value })}
              variant={newArtifact.platform === platform.value ? 'primary' : 'outline'}
              style={styles.platformButton}
              icon={newArtifact.platform === platform.value ? 'checkmark-circle' : 'ellipse-outline'}
            />
          ))}
        </View>

        <Button
          title="创建"
          onPress={handleAdd}
          variant="primary"
          icon="add-circle"
          style={styles.addButton}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
  },
  sourceList: {
    marginBottom: 16,
  },
  platformList: {
    marginBottom: 16,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 8,
  },
  sourceButton: {
    marginBottom: 8,
  },
  platformButton: {
    marginBottom: 8,
  },
  addButton: {
    marginTop: 16,
  },
});
