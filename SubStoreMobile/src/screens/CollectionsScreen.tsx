import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchCollections, deleteCollection } from '../store/collectionSlice';
import { fetchSubscriptions } from '../store/subscriptionSlice';
import { useTheme } from '../styles/theme';
import {
  CollectionCard,
  EmptyState,
  FloatingActionButton,
  SearchBar,
  Modal,
  Input,
  Button,
  Toast,
} from '../components';
import apiService from '../services/api';

export default function CollectionsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  
  const { items: collections, loading } = useSelector(
    (state: RootState) => state.collections
  );
  const { items: subscriptions } = useSelector(
    (state: RootState) => state.subscriptions
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: '',
    subscriptions: [] as string[],
  });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await dispatch(fetchCollections());
    await dispatch(fetchSubscriptions());
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleDelete = async (name: string) => {
    const result = await dispatch(deleteCollection(name));
    if (deleteCollection.fulfilled.match(result)) {
      showToast('集合已删除', 'success');
    } else {
      showToast('删除失败', 'error');
    }
  };

  const handleAdd = async () => {
    if (!newCollection.name) {
      showToast('请输入集合名称', 'error');
      return;
    }

    try {
      await apiService.createCollection({
        name: newCollection.name,
        subscriptions: newCollection.subscriptions,
      });
      
      setShowAddModal(false);
      setNewCollection({ name: '', subscriptions: [] });
      showToast('集合已添加', 'success');
      dispatch(fetchCollections());
    } catch (error) {
      showToast('添加失败', 'error');
    }
  };

  const toggleSubscription = (name: string) => {
    setNewCollection(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.includes(name)
        ? prev.subscriptions.filter(s => s !== name)
        : [...prev.subscriptions, name],
    }));
  };

  const showToast = (message: string, type: any) => {
    setToast({ visible: true, message, type });
  };

  const filteredCollections = collections.filter(col =>
    col.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (col.displayName && col.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
        placeholder="搜索集合..."
        onClear={() => setSearchQuery('')}
      />

      <FlatList
        data={filteredCollections}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <CollectionCard
            collection={item}
            subscriptionCount={item.subscriptions.length}
            onPress={() => (navigation as any).navigate('CollectionDetail', { name: item.name })}
            onDelete={() => handleDelete(item.name)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="folder-open-outline"
            title="暂无集合"
            message="集合可以将多个订阅合并为一个输出"
            actionTitle="创建集合"
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
        title="创建集合"
      >
        <Input
          label="集合名称"
          value={newCollection.name}
          onChangeText={(text) => setNewCollection({ ...newCollection, name: text })}
          placeholder="输入集合名称"
          leftIcon="text"
        />

        <View style={styles.subscriptionList}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
            <Button
              title="选择订阅"
              onPress={() => {}}
              variant="ghost"
              icon="list"
            />
          </View>
          {subscriptions.map(sub => (
            <Button
              key={sub.name}
              title={sub.displayName || sub.name}
              onPress={() => toggleSubscription(sub.name)}
              variant={newCollection.subscriptions.includes(sub.name) ? 'primary' : 'outline'}
              style={styles.subButton}
              icon={newCollection.subscriptions.includes(sub.name) ? 'checkmark-circle' : 'ellipse-outline'}
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
  subscriptionList: {
    marginBottom: 16,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 8,
  },
  subButton: {
    marginBottom: 8,
  },
  addButton: {
    marginTop: 16,
  },
});
