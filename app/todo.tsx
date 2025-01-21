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
} from "react-native";
import { signOut } from "../src/auth";
import { createTodo, deleteTodo, getTodos, updateTodo } from "../src/todos";

interface Todo {
  id: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  user_id: string;
}

export default function TodoScreen() {
  const router = useRouter();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  // States for edit mode
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  // Fetch the Todo list
  const fetchTodos = async () => {
    try {
      const data = await getTodos();
      setTodos(data || []);
    } catch (error) {
      console.error(error);
      alert(`Failed to fetch todos: ${error}`);
    }
  };

  useEffect(() => {}, []);

  // Create a Todo
  const handleCreateTodo = async () => {
    try {
      await createTodo(title, description, dueDate);
      setTitle("");
      setDescription("");
      setDueDate("");
      fetchTodos(); // Refresh the list after creation
    } catch (error) {
      console.error(error);
      alert(`Failed to create todo: ${error}`);
    }
  };

  // Delete a Todo (actual call)
  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id);
      fetchTodos();
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
      fetchTodos();
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
    <View style={{ padding: 8, borderBottomWidth: 1, marginBottom: 4 }}>
      <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
      <Text>{item.description}</Text>
      <Text>Due: {item.due_date}</Text>
      <Text>Completed: {item.completed ? "Yes" : "No"}</Text>

      <View style={{ flexDirection: "row", marginTop: 4 }}>
        {/* Edit Button */}
        <TouchableOpacity
          style={{ marginRight: 16 }}
          onPress={() => handleEditPress(item)}
        >
          <Text style={{ color: "blue" }}>Edit</Text>
        </TouchableOpacity>

        {/* Delete button: Calls double-confirm function */}
        <TouchableOpacity onPress={() => handleDeleteConfirm(item.id)}>
          <Text style={{ color: "red" }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
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

      <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: 16 }}>
        My Todos
      </Text>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={renderTodoItem}
      />

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
        <Button title="Add Todo" onPress={handleCreateTodo} />
      </View>

      {/* Edit Form */}
      {renderEditForm()}
    </View>
  );
}