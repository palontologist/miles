import { supabase } from "../utils/supabase";

// Extend the Todo interface
interface Todo {
  id: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  user_id: string;
  sdg_impact: string[]; // New field for SDG impact
}

// Create To-Do
export async function createTodo(
  title: string,
  description: string,
  dueDate: string,
  sdgImpact: string[] // New parameter for SDG impact
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
      sdg_impact: sdgImpact, // Store SDG impact
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

// Function to get AI insights
export async function getAIInsights(todos: Todo[]): Promise<string> {
  // Mock implementation: Replace with actual AI service call
  const sdgCounts = todos.reduce((acc, todo) => {
    todo.sdg_impact.forEach((sdg) => {
      acc[sdg] = (acc[sdg] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const insights = Object.entries(sdgCounts)
    .map(([sdg, count]) => `You have impacted ${sdg} ${count} times.`)
    .join(' ');

  return `AI Insights: ${insights}`;
}