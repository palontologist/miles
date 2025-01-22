import { supabase } from "../utils/supabase";
import Groq from 'groq-sdk';


// Extend the Todo interface
export interface Todo {
  id: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  user_id?: string; // Make user_id optional
  sdg_impact: string[]; // New field for SDG impact
  ai_insights?: string; // New optional field for AI insights
}

// Initialize Groq with API key
const client = new Groq({
  apiKey: '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'
});

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

// Function to get AI insights using Groq API
export async function getAIInsights(todos: Todo[] = []): Promise<string> {
  try {
    if (!todos || todos.length === 0) {
      return "No todos available for insights.";
    }

    // Prepare the prompt for Groq
    const prompt = `you are an impact measurement tool map the following activities to the UN SDGs and provide insight on one's contribution to a better world in the shortest way possible:\n\n${todos
      .map(
        (todo) =>
          `Title: ${todo.title}\nDescription: ${todo.description}\nSDG Impact: ${todo.sdg_impact.join(
            ", "
          )}\n`
      )
      .join("\n")}`;

    // Use the Groq client to generate insights
    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192', // Use the appropriate model
    });

    // Extract and return the insights
    const insights = chatCompletion.choices[0].message.content?.trim();
    if (insights) {
      await updateTodosWithInsights(todos, insights);
      return `AI Insights: ${insights}`;
    }
    return "No insights generated.";
  } catch (error) {
    console.error("Error generating AI insights:", error);
    throw new Error("Failed to generate AI insights.");
  }
}

// Function to update todos with AI insights
async function updateTodosWithInsights(todos: Todo[], insights: string) {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  for (const todo of todos) {
    const { error } = await supabase
      .from('todos')
      .update({ ai_insights: insights })
      .eq('id', todo.id)
      .eq('user_id', userId);

    if (error) {
      console.error(`Error updating todo ${todo.id} with insights:`, error.message);
      throw error;
    }
  }
}

export async function fetchTodosWithInsights() {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching todos with insights:", error.message);
    throw error;
  }

  return data;
}

// Export calculation functions
export function calculateImpactScore(todos: Todo[]): number {
  // Example: Calculate a simple impact score based on the number of todos with insights
  return todos.filter(todo => todo.ai_insights).length;
}

export function categorizeTodosBySDG(todos: Todo[]): Record<string, number> {
  const categoryCounts: Record<string, number> = {};

  todos.forEach(todo => {
    todo.sdg_impact.forEach(sdg => {
      if (!categoryCounts[sdg]) {
        categoryCounts[sdg] = 0;
      }
      categoryCounts[sdg]++;
    });
  });

  return categoryCounts;
}