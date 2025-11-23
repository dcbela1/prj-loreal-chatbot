export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Simple GET test
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "ok",
          message: "L'Oréal chatbot Worker is running."
        }),
        { headers: corsHeaders }
      );
    }

    try {
      const apiKey = env.OPENAI_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: "Missing OPENAI_API_KEY secret." }),
          { status: 500, headers: corsHeaders }
        );
      }

      const body = await request.json();

      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: body.messages,
          max_completion_tokens: 300
        })
      });

      const data = await openaiRes.json();

      // NEW: if OpenAI returned an error, pass it back clearly
      if (!openaiRes.ok || data.error) {
        return new Response(
          JSON.stringify({
            error: data.error?.message || "OpenAI API error",
            raw: data
          }),
          { status: 200, headers: corsHeaders }
        );
      }

      // Normal successful response
      return new Response(JSON.stringify(data), {
        headers: corsHeaders
      });

    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Worker exception",
          details: String(err)
        }),
        { status: 500, headers: corsHeaders }
      );
    }
  }
};
