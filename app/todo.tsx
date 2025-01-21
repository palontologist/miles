import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  StyleSheet,
} from "react-native";
import { signOut } from "../src/auth";
import { createTodo, deleteTodo, getTodos, updateTodo, getAIInsights } from "../src/todos";
import dayjs from 'dayjs'; // Import dayjs for date manipulation

interface Todo {
  id: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  user_id: string;
  sdg_impact: string[];
}

export default function TodoScreen() {
  const router = useRouter();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [insights, setInsights] = useState<string>("");
  const [sdgImpact, setSdgImpact] = useState<string[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // States for edit mode
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  // Fetch the Todo list
  const fetchTodosAndInsights = async () => {
    try {
      const data = await getTodos();
      setTodos(data || []);
      const aiInsights = await getAIInsights(data || []);
      setInsights(aiInsights);
    } catch (error) {
      console.error(error);
      alert(`Failed to fetch todos or insights: ${error}`);
    }
  };

  useEffect(() => {
    fetchTodosAndInsights();
  }, []);

  // Filter todos for today's activities
  const todayTodos = todos.filter(todo => dayjs(todo.due_date).isSame(dayjs(), 'day'));

  // Handle modal open
  const handleOpenModal = (todo: Todo) => {
    setSelectedTodo(todo);
    setModalVisible(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setSelectedTodo(null);
    setModalVisible(false);
  };

  // Create a Todo
  const handleCreateTodo = async () => {
    try {
      await createTodo(title, description, dueDate, sdgImpact);
      setTitle("");
      setDescription("");
      setDueDate("");
      setSdgImpact([]); // Reset SDG impact
      fetchTodosAndInsights(); // Refresh the list after creation
    } catch (error) {
      console.error(error);
      alert(`Failed to create todo: ${error}`);
    }
  };

  // Delete a Todo (actual call)
  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id);
      fetchTodosAndInsights();
    } catch (error) {
      console.error(error);
      alert(`Failed to delete todo: ${error}`);
    }
  };

  // === Function for "confirm" ===
  const handleDeleteConfirm = (id: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteTodo(id),
        },
      ]
    );
  };

  // === Edit Todo ===
  const handleEditPress = (todo: Todo) => {
    // When entering edit mode, save existing values to state
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditDescription(todo.description);
    setEditDueDate(todo.due_date);
  };

  const handleUpdateTodo = async () => {
    if (!editingTodo) return;

    try {
      await updateTodo(editingTodo.id, {
        title: editTitle,
        description: editDescription,
        due_date: editDueDate,
      });
      // After updating, exit edit mode and refresh the list
      setEditingTodo(null);
      fetchTodosAndInsights();
    } catch (error) {
      console.error(error);
      alert(`Failed to update todo: ${error}`);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingTodo(null);
    setEditTitle("");
    setEditDescription("");
    setEditDueDate("");
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      console.error(error);
      alert("Logout error: " + error);
    }
  };

  // Each Todo item to render
  const renderTodoItem = ({ item }: { item: Todo }) => (
    <TouchableOpacity onPress={() => handleOpenModal(item)}>
      <View style={styles.todoItem}>
        <Text style={styles.todoTitle}>{item.title}</Text>
        <Text style={styles.todoDate}>Due: {item.due_date}</Text>
        <Text style={styles.SDGImpact}>SDG Impact: {item.sdg_impact.join(', ')}</Text>
      </View>
    </TouchableOpacity>
  );

  // === Edit Form ===
  const renderEditForm = () => {
    if (!editingTodo) return null; // Do not display the form if there is no Todo being edited

    return (
      <View style={{ marginTop: 20, padding: 16, borderWidth: 1 }}>
        <Text style={{ fontSize: 18, marginBottom: 8 }}>Edit Todo</Text>

        <TextInput
          style={{ borderWidth: 1, marginBottom: 8, padding: 8 }}
          placeholder="Title"
          value={editTitle}
          onChangeText={setEditTitle}
        />
        <TextInput
          style={{ borderWidth: 1, marginBottom: 8, padding: 8 }}
          placeholder="Description"
          value={editDescription}
          onChangeText={setEditDescription}
        />
        <TextInput
          style={{ borderWidth: 1, marginBottom: 8, padding: 8 }}
          placeholder="Due Date (YYYY-MM-DD)"
          value={editDueDate}
          onChangeText={setEditDueDate}
        />

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Button title="Save" onPress={handleUpdateTodo} />
          <Button title="Cancel" onPress={handleCancelEdit} color="red" />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Button title="Logout" onPress={handleLogout} />
      <Button
        title="View Logged Activities"
        onPress={() => router.push('/loggedActivities')}
      />

      <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: 16 }}>
        Today's Todos
      </Text>
      <FlatList
        data={todayTodos}
        keyExtractor={(item) => item.id}
        renderItem={renderTodoItem}
      />

      <Text style={{ fontSize: 18, marginVertical: 16 }}>AI Insights</Text>
      <Text>{insights}</Text>

      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 18, marginBottom: 8 }}>Create New Todo</Text>
        <TextInput
          style={{ borderWidth: 1, marginBottom: 8, padding: 8 }}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={{ borderWidth: 1, marginBottom: 8, padding: 8 }}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={{ borderWidth: 1, marginBottom: 8, padding: 8 }}
          placeholder="Due Date (YYYY-MM-DD)"
          value={dueDate}
          onChangeText={setDueDate}
        />
        <TextInput
          style={{ borderWidth: 1, marginBottom: 8, padding: 8 }}
          placeholder="SDG Impact (comma-separated)"
          value={sdgImpact.join(', ')}
          onChangeText={(text) => setSdgImpact(text.split(',').map(s => s.trim()))}
        />
        <Button title="Add Todo" onPress={handleCreateTodo} />
      </View>

      {/* Edit Form */}
      {renderEditForm()}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedTodo && (
              <>
                <Text style={styles.modalTitle}>{selectedTodo.title}</Text>
                <Text>{selectedTodo.description}</Text>
                <Text>Due: {selectedTodo.due_date}</Text>
                <Text>SDG Impact: {selectedTodo.sdg_impact.join(', ')}</Text>
                <Button title="Close" onPress={handleCloseModal} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  todoItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 4,
  },
  todoTitle: {
    fontWeight: "bold",
  },
  todoDate: {
    color: '#888',
  },
  SDGImpact: {
    color: '#ffcc00',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});