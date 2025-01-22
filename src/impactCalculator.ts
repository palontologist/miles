import { Todo } from './todos';
import Groq from 'groq-sdk';

// Initialize Groq with API key
const client = new Groq({
  apiKey: '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'
});

// Function to calculate the total impact score based on SDG impacts
export function calculateTotalImpactScore(todos: Todo[]): number {
  return todos.reduce((total, todo) => {
    return total + todo.sdg_impact.length; // Each SDG impact contributes to the total
  }, 0);
}

// Function to calculate category scores (Social, Environmental, Economic)
export function calculateCategoryScores(todos: Todo[]): Record<string, number> {
  const categoryScores: Record<string, number> = {
    Social: 0,
    Environmental: 0,
    Economic: 0,
  };

  todos.forEach((todo) => {
    todo.sdg_impact.forEach((sdg) => {
      // Map SDGs to categories (example mapping)
      if (['1', '2', '3', '4', '5', '10'].includes(sdg)) {
        categoryScores.Social += 1; // Social SDGs
      } else if (['6', '7', '13', '14', '15'].includes(sdg)) {
        categoryScores.Environmental += 1; // Environmental SDGs
      } else if (['8', '9', '11', '12', '16', '17'].includes(sdg)) {
        categoryScores.Economic += 1; // Economic SDGs
      }
    });
  });

  return categoryScores;
}

// Function to calculate SDG-based scores
export function calculateSDGScores(todos: Todo[]): Record<string, number> {
  const sdgScores: Record<string, number> = {};

  todos.forEach((todo) => {
    todo.sdg_impact.forEach((sdg) => {
      if (!sdgScores[sdg]) {
        sdgScores[sdg] = 0;
      }
      sdgScores[sdg] += 1; // Increment score for each SDG
    });
  });

  return sdgScores;
}

// Function to generate a comprehensive impact report
export async function generateImpactReport(todos: Todo[]) {
  const totalImpactScore = calculateTotalImpactScore(todos);
  const categoryScores = calculateCategoryScores(todos);
  const sdgScores = calculateSDGScores(todos);

  return {
    totalImpactScore,
    categoryScores,
    sdgScores,
  };
}

// Function to calculate the total impact score using Groq
export async function calculateImpactScoreWithGroq(todos: Todo[]): Promise<number> {
  try {
    if (!todos || todos.length === 0) {
      return 0;
    }

    // Prepare the prompt for Groq
    const prompt = `You are an impact measurement tool. Analyze the following activities and calculate a single numerical impact score (0-100) based on their combined contribution to the UN SDGs. Return only the overall score as a number. Do not include any additional text or explanation.

Activities:
${todos
  .map(
    (todo) =>
      `Title: ${todo.title}\nDescription: ${todo.description}\nSDG Impact: ${todo.sdg_impact.join(", ")}\n`
  )
  .join("\n")}`;

    console.log('Groq Prompt:', prompt); // Debugging: Log the prompt

    // Use the Groq client to generate the impact score
    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192', // Use the appropriate model
    });

    // Extract the numerical impact score from the response
    const response = chatCompletion.choices[0].message.content?.trim();
    console.log('Groq Response:', response); // Debugging: Log the response

    // Ensure the response is a valid number
    const impactScore = response ? parseFloat(response.replace(/[^0-9.]/g, '')) : 0;
    console.log('Parsed Impact Score:', impactScore); // Debugging: Log the parsed score

    return impactScore;
  } catch (error) {
    console.error("Error calculating impact score with Groq:", error);
    throw new Error("Failed to calculate impact score.");
  }
}

// Function to map activities to SDGs using Groq
export async function mapActivitiesToSDGs(activities: { name: string; description: string }[]): Promise<string[]> {
  try {
    if (!activities || activities.length === 0) {
      return [];
    }

    // Prepare the prompt for Groq
    const prompt = `You are an SDG mapping tool. Analyze the following activities and map them to the most relevant UN SDGs. Return the SDGs as a comma-separated list.

Activities:
${activities
  .map(
    (activity) =>
      `Name: ${activity.name}\nDescription: ${activity.description}\n`
  )
  .join("\n")}`;

    // Use the Groq client to generate the SDG mapping
    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192', // Use the appropriate model
    });

    // Extract the SDGs from the response
    const response = chatCompletion.choices[0].message.content?.trim();
    const sdgs = response ? response.split(',').map(sdg => sdg.trim()) : [];

    return sdgs;
  } catch (error) {
    console.error("Error mapping activities to SDGs:", error);
    throw new Error("Failed to map activities to SDGs.");
  }
}

export async function calculateCategoryImpactsWithGroq(todos: Todo[]): Promise<Record<string, number>> {
  try {
    if (!todos || todos.length === 0) {
      return {
        Economic: 0,
        Social: 0,
        Environmental: 0,
      };
    }

    // Prepare the prompt for Groq
    const prompt = `You are an impact measurement tool. Analyze the following activities and calculate their impact scores (0-100) for three categories: Economic, Social, and Environmental. Return the scores as a JSON object with keys "Economic", "Social", and "Environmental". Do not include any additional text or explanation.

Activities:
${todos
  .map(
    (todo) =>
      `Title: ${todo.title}\nDescription: ${todo.description}\nSDG Impact: ${todo.sdg_impact.join(", ")}\n`
  )
  .join("\n")}`;

    console.log('Groq Category Prompt:', prompt); // Debugging: Log the prompt

    // Use the Groq client to generate the category scores
    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192', // Use the appropriate model
    });

    // Extract the JSON response
    const response = chatCompletion.choices[0].message.content?.trim();
    if (!response) {
      return { Economic: 0, Social: 0, Environmental: 0 };
    }

    // Clean the response to ensure it's valid JSON
    const cleanedResponse = response
      .replace(/^[^{]*/, '') // Remove any text before the first {
      .replace(/[^}]*$/, ''); // Remove any text after the last }

    // Parse the JSON response
    const categoryScores = cleanedResponse ? JSON.parse(cleanedResponse) : { Economic: 0, Social: 0, Environmental: 0 };
    return categoryScores;
  } catch (error) {
    console.error("Error calculating category impacts with Groq:", error);
    throw new Error("Failed to calculate category impacts.");
  }
}
