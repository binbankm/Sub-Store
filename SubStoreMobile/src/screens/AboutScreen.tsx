import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useTheme } from '../styles/theme';
import { Card, Button } from '../components';

export default function AboutScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Card>
        <View style={styles.header}>
          <Ionicons name="information-circle-outline" size={32} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Sub-Store Mobile</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Advanced Subscription Manager for mobile
        </Text>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>版本</Text>
          <Text style={[styles.value, { color: colors.text }]}>v1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>协议</Text>
          <Text style={[styles.value, { color: colors.text }]}>GPL-3.0</Text>
        </View>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>相关链接</Text>
        <Button
          title="项目主页"
          onPress={() => Linking.openURL('https://github.com/sub-store-org/Sub-Store')}
          variant="outline"
          icon="logo-github"
          style={styles.linkButton}
        />
        <Button
          title="官方文档"
          onPress={() => Linking.openURL('https://github.com/sub-store-org/Sub-Store/wiki')}
          variant="outline"
          icon="book-outline"
          style={styles.linkButton}
        />
        <Button
          title="反馈问题"
          onPress={() => Linking.openURL('https://github.com/sub-store-org/Sub-Store/issues')}
          variant="outline"
          icon="chatbubble-ellipses-outline"
          style={styles.linkButton}
        />
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>感谢</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          感谢所有 Sub-Store 社区贡献者，以及为移动端提供建议和测试的用户。
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  linkButton: {
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
  },
});
