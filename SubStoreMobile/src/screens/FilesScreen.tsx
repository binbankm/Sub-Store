import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import { Card, Button, Input, Modal, Toast, EmptyState, LoadingOverlay } from '../components';
import apiService from '../services/api';
import { FileEntry } from '../types';
import { formatDate } from '../utils/helpers';
import { logger } from '../utils/logger';

export default function FilesScreen() {
  const { colors } = useTheme();

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewContent, setViewContent] = useState('');
  const [editingFile, setEditingFile] = useState<FileEntry | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    content: '',
  });

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    const response = await apiService.getFiles();
    if (response.status === 'success' && response.data) {
      setFiles(response.data);
    } else {
      showToast(response.message || '获取文件失败', 'error');
    }
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFiles();
    setRefreshing(false);
  }, []);

  const openCreate = () => {
    setEditingFile(null);
    setFormData({ name: '', displayName: '', content: '' });
    setShowEditModal(true);
  };

  const openEdit = async (file: FileEntry) => {
    const response = await apiService.getWholeFile(file.name);
    if (response.status === 'success' && response.data) {
      setEditingFile(file);
      setFormData({
        name: response.data.name || file.name,
        displayName: response.data.displayName || '',
        content: response.data.content || '',
      });
      setShowEditModal(true);
    } else {
      showToast(response.message || '获取文件内容失败', 'error');
    }
  };

  const openView = async (file: FileEntry) => {
    const response = await apiService.getWholeFile(file.name);
    if (response.status === 'success' && response.data) {
      setViewContent(response.data.content || '');
      setShowViewModal(true);
    } else {
      showToast(response.message || '获取文件内容失败', 'error');
    }
  };

  const handleSave = async () => {
    if (!formData.content && !editingFile) {
      showToast('请输入文件内容', 'error');
      return;
    }

    const payload = {
      name: formData.name || undefined,
      displayName: formData.displayName || undefined,
      content: formData.content || undefined,
    };

    const response = editingFile
      ? await apiService.updateFile(editingFile.name, payload)
      : await apiService.createFile(payload);

    if (response.status === 'success') {
      logger.info(`File ${editingFile ? 'updated' : 'created'}: ${payload.name || editingFile?.name || ''}`);
      showToast(editingFile ? '文件已更新' : '文件已创建', 'success');
      setShowEditModal(false);
      loadFiles();
    } else {
      showToast(response.message || '操作失败', 'error');
    }
  };

  const handleDelete = (file: FileEntry) => {
    Alert.alert(
      '删除文件',
      `确定要删除文件 "${file.displayName || file.name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const response = await apiService.deleteFile(file.name);
            if (response.status === 'success') {
              logger.info(`File deleted: ${file.name}`);
              showToast('文件已删除', 'success');
              loadFiles();
            } else {
              showToast(response.message || '删除失败', 'error');
            }
          },
        },
      ]
    );
  };

  const showToast = (message: string, type: any) => {
    setToast({ visible: true, message, type });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LoadingOverlay visible={loading} />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <FlatList
        data={files}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.fileHeader}>
              <View style={styles.fileTitle}>
                <Ionicons name="document-text-outline" size={18} color={colors.primary} />
                <Text style={[styles.fileName, { color: colors.text }]}>
                  {item.displayName || item.name}
                </Text>
              </View>
              <View style={styles.fileActions}>
                <Button
                  title="查看"
                  onPress={() => openView(item)}
                  variant="outline"
                  size="small"
                  icon="eye-outline"
                />
                <Button
                  title="编辑"
                  onPress={() => openEdit(item)}
                  variant="outline"
                  size="small"
                  icon="create-outline"
                />
                <Button
                  title="删除"
                  onPress={() => handleDelete(item)}
                  variant="danger"
                  size="small"
                  icon="trash-outline"
                />
              </View>
            </View>

            <View style={styles.fileInfo}>
              <Text style={[styles.fileMeta, { color: colors.textSecondary }]}>
                名称: {item.name}
              </Text>
              {item.updatedAt && (
                <Text style={[styles.fileMeta, { color: colors.textSecondary }]}>
                  更新: {formatDate(item.updatedAt)}
                </Text>
              )}
            </View>
          </Card>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="folder-open-outline"
            title="暂无文件"
            message="上传本地配置文件以便托管"
            actionTitle="上传文件"
            onAction={openCreate}
          />
        }
      />

      <View style={styles.fabContainer}>
        <Button title="上传文件" onPress={openCreate} icon="add" />
      </View>

      <Modal visible={showEditModal} onClose={() => setShowEditModal(false)} title={editingFile ? '编辑文件' : '上传文件'}>
        {!editingFile && (
          <Input
            label="文件名称"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="可留空自动生成"
            leftIcon="text"
          />
        )}
        <Input
          label="显示名称"
          value={formData.displayName}
          onChangeText={(text) => setFormData({ ...formData, displayName: text })}
          placeholder="可选"
          leftIcon="pricetag-outline"
        />
        <Input
          label="文件内容"
          value={formData.content}
          onChangeText={(text) => setFormData({ ...formData, content: text })}
          placeholder="粘贴文件内容..."
          multiline
          numberOfLines={8}
          leftIcon="code"
        />
        <Button
          title={editingFile ? '保存' : '上传'}
          onPress={handleSave}
          variant="primary"
          icon="checkmark-circle"
        />
      </Modal>

      <Modal visible={showViewModal} onClose={() => setShowViewModal(false)} title="查看文件">
        <View style={[styles.contentBox, { backgroundColor: colors.inputBg }]}>
          <Text style={[styles.contentText, { color: colors.text }]}>
            {viewContent || '无内容'}
          </Text>
        </View>
        <Button
          title="关闭"
          onPress={() => setShowViewModal(false)}
          variant="outline"
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  fileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  fileInfo: {
    gap: 4,
  },
  fileMeta: {
    fontSize: 13,
  },
  fabContainer: {
    padding: 16,
  },
  contentBox: {
    padding: 16,
    borderRadius: 8,
    maxHeight: 400,
  },
  contentText: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
});
