import { supabase } from "../utils/supabase";

// Create To-Do
export async function createTodo(
  title: string,
  description: string,
  dueDate: string
) {
  // Fetch the current user session
  const { data: session, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    console.error("Error fetching session:", sessionError.message);
    throw sessionError;
  }

  const userId = session?.session?.user?.id;

  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  const { data, error } = await supabase.from("todos").insert([
    {
      title,
      description,
      due_date: dueDate,
      completed: false,
      user_id: userId,
    },
  ]);

  if (error) {
    console.error("Error creating todo:", error.message);
    throw error;
  }

  return data;
}

// Fetch To-Do
export async function getTodos() {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching todos:", error.message);
    throw error;
  }

  return data;
}

// Update To-Do
export async function updateTodo(
  id: string,
  updates: Partial<{
    title: string;
    description: string;
    due_date: string;
    completed: boolean;
  }>
) {
  const { data, error } = await supabase
    .from("todos")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error updating todo:", error.message);
    throw error;
  }

  return data;
}

// Delete To-Do
export async function deleteTodo(id: string) {
  const { data, error } = await supabase.from("todos").delete().eq("id", id);

  if (error) {
    console.error("Error deleting todo:", error.message);
    throw error;
  }

  return data;
}