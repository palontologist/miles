import { supabase } from "../utils/supabase";
import Groq from 'groq-sdk';


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
export async function getAIInsights(todos: Todo[]): Promise<string> {
  try {
    // Prepare the prompt for Groq
    const prompt = `you are an impact measurement tool map the following activities to the UN SDGs and provide insight on once contribution to a better world in the shortest way possible:\n\n${todos
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
    return insights ? `AI Insights: ${insights}` : "No insights generated.";
  } catch (error) {
    console.error("Error generating AI insights:", error);
    throw new Error("Failed to generate AI insights.");
  }
}