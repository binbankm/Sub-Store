import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../store';
import { fetchSubscriptions, deleteSubscription, fetchFlowInfo } from '../store/subscriptionSlice';
import { useTheme } from '../styles/theme';
import {
  SubscriptionCard,
  EmptyState,
  FloatingActionButton,
  SearchBar,
  Modal,
  Input,
  Button,
  Toast,
  LoadingOverlay,
} from '../components';
import apiService from '../services/api';
import { Subscription } from '../types';

export default function SubscriptionsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  
  const { items: subscriptions, loading, flowInfo } = useSelector(
    (state: RootState) => state.subscriptions
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSub, setNewSub] = useState({
    name: '',
    url: '',
    source: 'remote' as 'remote' | 'local',
    content: '',
  });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as const });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await dispatch(fetchSubscriptions());
    subscriptions.forEach(sub => {
      if (sub.source === 'remote') {
        dispatch(fetchFlowInfo(sub.name));
      }
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleDelete = async (name: string) => {
    const result = await dispatch(deleteSubscription(name));
    if (deleteSubscription.fulfilled.match(result)) {
      showToast('订阅已删除', 'success');
    } else {
      showToast('删除失败', 'error');
    }
  };

  const handleRefreshFlow = (name: string) => {
    dispatch(fetchFlowInfo(name));
  };

  const handleAdd = async () => {
    if (!newSub.name) {
      showToast('请输入订阅名称', 'error');
      return;
    }

    if (newSub.source === 'remote' && !newSub.url) {
      showToast('请输入订阅URL', 'error');
      return;
    }

    try {
      await apiService.createSubscription({
        name: newSub.name,
        source: newSub.source,
        url: newSub.url || undefined,
        content: newSub.content || undefined,
      });
      
      setShowAddModal(false);
      setNewSub({ name: '', url: '', source: 'remote', content: '' });
      showToast('订阅已添加', 'success');
      dispatch(fetchSubscriptions());
    } catch (error) {
      showToast('添加失败', 'error');
    }
  };

  const showToast = (message: string, type: string) => {
    setToast({ visible: true, message, type: type as any });
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sub.displayName && sub.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LoadingOverlay visible={loading && subscriptions.length === 0} />
      
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="搜索订阅..."
        onClear={() => setSearchQuery('')}
      />

      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <SubscriptionCard
            subscription={item}
            flowInfo={flowInfo[item.name]}
            onPress={() => (navigation as any).navigate('SubscriptionDetail', { name: item.name })}
            onDelete={() => handleDelete(item.name)}
            onRefresh={() => handleRefreshFlow(item.name)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="暂无订阅"
            message="点击右下角按钮添加新的订阅"
            actionTitle="添加订阅"
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
        title="添加订阅"
      >
        <View style={styles.sourceSelector}>
          <Button
            title="远程订阅"
            onPress={() => setNewSub({ ...newSub, source: 'remote' })}
            variant={newSub.source === 'remote' ? 'primary' : 'outline'}
            style={styles.sourceButton}
          />
          <Button
            title="本地订阅"
            onPress={() => setNewSub({ ...newSub, source: 'local' })}
            variant={newSub.source === 'local' ? 'primary' : 'outline'}
            style={styles.sourceButton}
          />
        </View>

        <Input
          label="订阅名称"
          value={newSub.name}
          onChangeText={(text) => setNewSub({ ...newSub, name: text })}
          placeholder="输入订阅名称"
          leftIcon="text"
        />

        {newSub.source === 'remote' ? (
          <Input
            label="订阅URL"
            value={newSub.url}
            onChangeText={(text) => setNewSub({ ...newSub, url: text })}
            placeholder="https://example.com/sub"
            keyboardType="url"
            leftIcon="link"
          />
        ) : (
          <Input
            label="订阅内容"
            value={newSub.content}
            onChangeText={(text) => setNewSub({ ...newSub, content: text })}
            placeholder="粘贴订阅内容..."
            multiline
            numberOfLines={6}
            leftIcon="code"
          />
        )}

        <Button
          title="添加"
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
  sourceSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sourceButton: {
    flex: 1,
  },
  addButton: {
    marginTop: 16,
  },
});
