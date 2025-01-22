import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fetchTodosWithInsights, getAIInsights } from '../src/todos'; // Import AI insights function
import { generateImpactReport, calculateImpactScoreWithGroq, calculateCategoryImpactsWithGroq } from '../src/impactCalculator';
import { supabase } from '../utils/supabase'; // Import Supabase client

interface Todo {
  id: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  sdg_impact: string[];
  ai_insight?: string;
}

interface Props {
  todos: Todo[];
  insights: string;
}

interface Activity {
  name: string;
  timestamp: string;
  impact: number;
}

interface Category {
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  metric: number;
  amount: string;
}

const LoggedActivitiesScreen: React.FC<Props> = ({ todos, insights }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newActivity, setNewActivity] = useState('');
  const [newImpact, setNewImpact] = useState('');
  const [impactScore, setImpactScore] = useState<number>(0);
  const [sdgCounts, setSdgCounts] = useState<Record<string, number>>({});
  const [userName, setUserName] = useState('');
  
  // Initialize category scores
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({
    Economic: 0,
    Social: 0,
    Environmental: 0,
  });

  const categories: Category[] = [
    { name: 'Economic', icon: 'cash', metric: categoryScores.Economic, amount: categoryScores.Economic.toString() },
    { name: 'Social', icon: 'account-group', metric: categoryScores.Social, amount: categoryScores.Social.toString() },
    { name: 'Environmental', icon: 'leaf', metric: categoryScores.Environmental, amount: categoryScores.Environmental.toString() },
  ];

  // Fetch user's name from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

          if (data && !error) {
            setUserName(data.full_name || 'User');
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  // Fetch impact score and category scores
  useEffect(() => {
    const fetchImpactData = async () => {
      try {
        const todos = await fetchTodosWithInsights();
        console.log('Todos:', todos); // Log todos to verify data

        // Calculate total impact score
        const score = await calculateImpactScoreWithGroq(todos);
        setImpactScore(score);

        // Calculate category scores using Groq
        const scores = await calculateCategoryImpactsWithGroq(todos);
        setCategoryScores(scores);
      } catch (error) {
        console.error('Error fetching impact data:', error);
      }
    };

    fetchImpactData();
  }, [todos]);

  const calculateImpact = async () => {
    const aiInsights = await getAIInsights(todos);
    const impact = activities.reduce((total, activity) => total + activity.impact, 0);
    setImpactScore(impact);

    const sdgImpactCounts: Record<string, number> = {};
    todos.forEach(todo => {
      todo.sdg_impact.forEach(sdg => {
        sdgImpactCounts[sdg] = (sdgImpactCounts[sdg] || 0) + 1;
      });
    });
    setSdgCounts(sdgImpactCounts);

    // Update category scores based on activities
    const newCategoryScores = { Economic: 0, Social: 0, Environmental: 0 };
    activities.forEach(activity => {
      // Assuming the impact is distributed among categories
      // You can adjust the logic based on your requirements
      newCategoryScores.Economic += activity.impact * 0.4; // Example distribution
      newCategoryScores.Social += activity.impact * 0.4; // Example distribution
      newCategoryScores.Environmental += activity.impact * 0.2; // Example distribution
    });
    setCategoryScores(newCategoryScores);
  };

  const logActivity = () => {
    if (newActivity && newImpact) {
      const activity = {
        name: newActivity,
        timestamp: format(new Date(), 'pp'),
        impact: parseFloat(newImpact)
      };
      setActivities([...activities, activity]);
      setModalVisible(false);
      setNewActivity('');
      setNewImpact('');
    }
  };

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
      <Text style={styles.header}>
        {format(new Date(), 'dd MMM, yyyy')}{'\n'}
        Hello, {userName}
      </Text>

      {/* Impact Circle */}
      <View style={styles.impactCircle}>
        <Text style={styles.impactLabel}>Impact</Text>
        <Text style={styles.impactAmount}>{impactScore || 0}</Text>
        <Text style={styles.impactSubtitle}>Total Impact Score</Text>
      </View>

      {/* SDG Impact Counts */}
      <View style={styles.sdgContainer}>
        {Object.entries(sdgCounts).map(([sdg, count]) => (
          <Text key={sdg} style={styles.sdgText}>
            {sdg}: {count} times
          </Text>
        ))}
      </View>

      {/* Category Scores */}
      <View style={styles.categoriesContainer}>
        {categories.map((category, index) => (
          <View key={index} style={styles.categoryCard}>
            <View style={styles.categoryIcon}>
              <MaterialCommunityIcons name={category.icon} size={24} color="#22C55E" />
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryMetric}>{categoryScores[category.name] || 0}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progress, { width: `${categoryScores[category.name]}%` }]} />
            </View>
          </View>
        ))}
      </View>

     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 16,
  },
  header: {
    fontSize: 24,
    color: 'white',
    marginTop: 40,
    marginBottom: 20,
  },
  impactCircle: {
    height: 200,
    width: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#22C55E',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  impactLabel: {
    color: '#22C55E',
    fontSize: 20,
  },
  impactAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  impactSubtitle: {
    color: '#22C55E',
    fontSize: 14,
  },
  sdgContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  sdgText: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    width: '100%',
    marginTop: 4,
  },
  progress: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 2,
  },
  categoryMetric: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordButton: {
    backgroundColor: '#22C55E',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  recordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalView: {
    margin: 20,
    marginTop: 'auto',
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#444',
  },
  saveButton: {
    backgroundColor: '#22C55E',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
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