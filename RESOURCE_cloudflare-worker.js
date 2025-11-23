export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    // 1) CORS preflight (browser OPTIONS request)
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 2) GET test (when opening Worker URL in browser)
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "ok",
          message: "L'Oréal chatbot Worker is running."
        }),
        { headers: corsHeaders }
      );
    }

    // 3) POST request from your website
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
