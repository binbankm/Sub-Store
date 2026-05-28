import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { RootState, AppDispatch } from '../store';
import { updateArtifact, deleteArtifact, syncArtifact } from '../store/artifactSlice';
import { useTheme } from '../styles/theme';
import { Card, Button, Input, Modal, Toast, LoadingOverlay } from '../components';
import apiService from '../services/api';
import { formatDate, TARGET_PLATFORMS } from '../utils/helpers';
import { Artifact, TargetPlatform } from '../types';
import { logger } from '../utils/logger';

export default function ArtifactDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();

  const { name } = route.params as { name: string };
  const artifact = useSelector((state: RootState) =>
    state.artifacts.items.find(item => item.name === name)
  );

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });
  const [editData, setEditData] = useState({
    displayName: '',
    source: '',
    platform: 'ClashMeta' as TargetPlatform,
    type: 'subscription' as Artifact['type'],
    sync: false,
    autoUpdate: false,
  });

  useEffect(() => {
    if (artifact) {
      setEditData({
        displayName: artifact.displayName || '',
        source: artifact.source,
        platform: artifact.platform,
        type: artifact.type,
        sync: !!artifact.sync,
        autoUpdate: !!artifact.autoUpdate,
      });
    }
  }, [artifact]);

  const showToast = (message: string, type: any) => {
    setToast({ visible: true, message, type });
  };

  const handleSave = async () => {
    if (!artifact) return;
    setLoading(true);
    const result = await dispatch(updateArtifact({
      name: artifact.name,
      updates: {
        displayName: editData.displayName || undefined,
        source: editData.source,
        platform: editData.platform,
        type: editData.type,
        sync: editData.sync,
        autoUpdate: editData.autoUpdate,
      },
    }));
    setLoading(false);

    if (updateArtifact.fulfilled.match(result)) {
      logger.info(`Artifact updated: ${artifact.name}`);
      showToast('保存成功', 'success');
      setShowEditModal(false);
    } else {
      showToast('保存失败', 'error');
    }
  };

  const handleDelete = () => {
    if (!artifact) return;
    Alert.alert(
      '删除制品',
      `确定要删除制品 "${artifact.displayName || artifact.name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const result = await dispatch(deleteArtifact(artifact.name));
            if (deleteArtifact.fulfilled.match(result)) {
              logger.info(`Artifact deleted: ${artifact.name}`);
              navigation.goBack();
            } else {
              showToast('删除失败', 'error');
            }
          },
        },
      ]
    );
  };

  const handleSync = async () => {
    if (!artifact) return;
    const result = await dispatch(syncArtifact(artifact.name));
    if (syncArtifact.fulfilled.match(result)) {
      logger.info(`Artifact synced: ${artifact.name}`);
      showToast('同步成功', 'success');
    } else {
      showToast('同步失败', 'error');
    }
  };

  const handlePreview = async () => {
    if (!artifact) return;
    setLoading(true);
    const response = await apiService.preview(
      artifact.source,
      artifact.type === 'subscription' ? 'sub' : 'collection',
      artifact.platform
    );
    setLoading(false);

    if (response.status === 'success' && response.data) {
      setPreviewContent(response.data);
      setShowPreviewModal(true);
    } else {
      showToast('预览失败', 'error');
    }
  };

  const handleCopyUrl = async () => {
    if (!artifact) return;
    const type = artifact.type === 'subscription' ? 'sub' : 'collection';
    const url = `${apiService.getServerUrl()}/api/download/${type}/${encodeURIComponent(artifact.source)}?target=${artifact.platform}`;
    await Clipboard.setStringAsync(url);
    showToast('链接已复制', 'success');
  };

  if (!artifact) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>制品不存在</Text>
      </View>
    );
  }

  const platformLabel = TARGET_PLATFORMS.find(item => item.value === artifact.platform)?.label || artifact.platform;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <LoadingOverlay visible={loading} />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <Card>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="code-working" size={24} color={colors.info} />
            <Text style={[styles.title, { color: colors.text }]}>
              {artifact.displayName || artifact.name}
            </Text>
          </View>
          <View style={styles.actions}>
            <Button title="编辑" onPress={() => setShowEditModal(true)} variant="outline" icon="create-outline" size="small" />
            <Button title="删除" onPress={handleDelete} variant="danger" icon="trash-outline" size="small" />
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>名称</Text>
          <Text style={[styles.value, { color: colors.text }]}>{artifact.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>类型</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {artifact.type === 'subscription' ? '订阅' : '集合'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>来源</Text>
          <Text style={[styles.value, { color: colors.text }]}>{artifact.source}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>平台</Text>
          <Text style={[styles.value, { color: colors.text }]}>{platformLabel}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>更新时间</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {formatDate(artifact.updatedAt)}
          </Text>
        </View>
        {artifact.updateTime && (
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>同步时间</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {formatDate(artifact.updateTime)}
            </Text>
          </View>
        )}
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>制品操作</Text>
        <View style={styles.exportActions}>
          <Button title="预览" onPress={handlePreview} variant="outline" icon="eye-outline" style={styles.exportButton} />
          <Button title="复制链接" onPress={handleCopyUrl} variant="primary" icon="copy-outline" style={styles.exportButton} />
        </View>
        <Button title="同步制品" onPress={handleSync} variant="secondary" icon="sync-outline" style={styles.syncButton} />
      </Card>

      <Modal visible={showEditModal} onClose={() => setShowEditModal(false)} title="编辑制品">
        <Input
          label="显示名称"
          value={editData.displayName}
          onChangeText={(text) => setEditData({ ...editData, displayName: text })}
          placeholder="输入显示名称"
          leftIcon="text"
        />
        <Input
          label="来源名称"
          value={editData.source}
          onChangeText={(text) => setEditData({ ...editData, source: text })}
          placeholder="订阅或集合名称"
          leftIcon="link"
        />

        <View style={styles.selectorRow}>
          <Button
            title="订阅"
            onPress={() => setEditData({ ...editData, type: 'subscription' })}
            variant={editData.type === 'subscription' ? 'primary' : 'outline'}
            style={styles.selectorButton}
          />
          <Button
            title="集合"
            onPress={() => setEditData({ ...editData, type: 'collection' })}
            variant={editData.type === 'collection' ? 'primary' : 'outline'}
            style={styles.selectorButton}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>目标平台</Text>
        <View style={styles.platformSelector}>
          {TARGET_PLATFORMS.map(platform => (
            <Button
              key={platform.value}
              title={platform.label}
              onPress={() => setEditData({ ...editData, platform: platform.value })}
              variant={editData.platform === platform.value ? 'primary' : 'outline'}
              size="small"
              style={styles.platformButton}
            />
          ))}
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: colors.text }]}>启用同步</Text>
          <Switch
            value={editData.sync}
            onValueChange={(value) => setEditData({ ...editData, sync: value })}
            trackColor={colors.switchTrack}
            thumbColor={colors.switchThumb}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: colors.text }]}>自动更新</Text>
          <Switch
            value={editData.autoUpdate}
            onValueChange={(value) => setEditData({ ...editData, autoUpdate: value })}
            trackColor={colors.switchTrack}
            thumbColor={colors.switchThumb}
          />
        </View>

        <Button title="保存" onPress={handleSave} variant="primary" icon="checkmark-circle" />
      </Modal>

      <Modal visible={showPreviewModal} onClose={() => setShowPreviewModal(false)} title="预览内容">
        <View style={[styles.previewContainer, { backgroundColor: colors.inputBg }]}>
          <Text style={[styles.previewText, { color: colors.text }]}>
            {previewContent || '无内容'}
          </Text>
        </View>
        <Button
          title="复制内容"
          onPress={async () => {
            await Clipboard.setStringAsync(previewContent);
            showToast('已复制', 'success');
          }}
          variant="primary"
          icon="copy-outline"
          style={styles.copyButton}
        />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  exportActions: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
  },
  syncButton: {
    marginTop: 12,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  selectorButton: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  platformSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  platformButton: {
    minWidth: '30%',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
  },
  previewContainer: {
    padding: 16,
    borderRadius: 8,
    maxHeight: 400,
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  copyButton: {
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});
