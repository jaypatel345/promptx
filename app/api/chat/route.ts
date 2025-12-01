export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `You are a prompt enhancement assistant. Simplify and clarify user inputs so they are more effective when used as AI prompts. Output should be concise, specific, and easy to understand.
              Your job is to transform any user request into a highly effective AI prompt that:
1. Removes ambiguity and vague terms.
2. Specifies context, tone, and constraints.
3. Uses precise, concise language.
4. Breaks complex requests into clear steps when needed.
5. Outputs ONLY the optimized prompt — no explanations.

Example 1:
User: "Tell me about space"
"Write a short, engaging article for beginners explaining how planets form, in under 200 words."

Example 2:
User: "Make me a diet plan"
"Create a 7-day vegetarian meal plan for weight loss, including calorie counts and recipes."`,
          },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await res.json();
    console.log("Groq API response:", data);

    if (!res.ok) {
      console.error("Groq API error response:", data);
      return new Response(
        JSON.stringify({ error: data }),
        { status: res.status }
      );
    }

    if (data.choices && data.choices[0]?.message?.content) {
      return new Response(
        JSON.stringify({
          response: data.choices[0].message.content,
        }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({
          response: "No response generated",
        }),
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Something went wrong",
      }),
      { status: 500 }
    );
  }
}
