import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

interface Todo {
  id: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  sdg_impact: string[];
}

interface Props {
  todos: Todo[];
  insights: string;
}

const LoggedActivitiesScreen: React.FC<Props> = ({ todos, insights }) => {
  const renderTodoItem = ({ item }: { item: Todo }) => (
    <View style={styles.todoItem}>
      <Text style={styles.todoTitle}>{item.title}</Text>
      <Text style={styles.todoDescription}>{item.description}</Text>
      <Text style={styles.todoDate}>Due: {item.due_date}</Text>
      <Text style={styles.todoImpact}>SDG Impact: {item.sdg_impact.join(', ')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Logged Activities</Text>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={renderTodoItem}
      />
      <Text style={styles.insightsHeading}>AI Insights</Text>
      <Text style={styles.insightsText}>{insights}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff00',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'PressStart2P', // Use a pixelated font
  },
  todoItem: {
    backgroundColor: '#333',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderColor: '#00ff00',
    borderWidth: 1,
  },
  todoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff00ff',
  },
  todoDescription: {
    fontSize: 14,
    color: '#ffffff',
  },
  todoDate: {
    fontSize: 12,
    color: '#00ffff',
  },
  todoImpact: {
    fontSize: 12,
    color: '#ffcc00',
  },
  insightsHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ff00',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'PressStart2P',
  },
  insightsText: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default LoggedActivitiesScreen; 