import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  messages: Message[];
  languageCode: string;
  languageName: string;
  difficulty: string;
}

const getSystemPrompt = (languageName: string, difficulty: string) => {
  return `You are a friendly and encouraging language tutor teaching ${languageName}. Your role is to:

1. Respond naturally in ${languageName} appropriate for a ${difficulty} level learner
2. Keep your responses conversational and engaging
3. Provide helpful corrections when the user makes mistakes
4. Encourage the user to practice more
5. Use simple vocabulary for beginners, more complex for intermediate/advanced
6. Include cultural context when relevant

Format your responses as a JSON object with this structure:
{
  "response": "Your response in ${languageName}",
  "translation": "English translation of your response",
  "tip": "Optional helpful tip about grammar, vocabulary, or culture (in English, keep it brief)"
}

Keep responses concise (2-4 sentences) to encourage back-and-forth conversation.`;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { messages, languageCode, languageName, difficulty }: RequestBody = await req.json();

    const openAIKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIKey) {
      throw new Error("OpenAI API key not configured");
    }

    const systemPrompt = getSystemPrompt(languageName, difficulty);
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch {
      parsedResponse = {
        response: aiResponse,
        translation: "Translation not available",
        tip: null,
      };
    }

    return new Response(
      JSON.stringify(parsedResponse),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in ai-chat function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});