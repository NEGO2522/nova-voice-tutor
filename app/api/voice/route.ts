import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({
  region: "us-east-1",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = body.question;
    const lang: string = body.lang || "english"; // "hindi", "english", or "hinglish"

    if (!question) {
      return Response.json({ error: "No question received" }, { status: 400 });
    }

    console.log("User question:", question, "| Detected lang:", lang);

    // Build a hard language instruction so the model cannot default to Hindi
    const langInstruction =
      lang === "hindi"
        ? "IMPORTANT: The user spoke in Hindi. You MUST reply entirely in Hindi (Devanagari script). Do not use English at all."
        : lang === "hinglish"
        ? "IMPORTANT: The user spoke in Hinglish (mixed Hindi-English). Reply in the same Hinglish mix."
        : "IMPORTANT: The user spoke in English. You MUST reply entirely in English. Do not use Hindi at all.";

    const input = {
      modelId: "amazon.nova-lite-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        system: [
          {
            text: `You are Nova, a warm and friendly AI tutor.\n\n${langInstruction}\n\nFORMATTING RULES (always follow):\n- Never use markdown symbols like **, *, #, or bullet points.\n- Write in plain natural sentences only, like how a friend speaks.\n- Keep answers short and conversational, 2 to 4 sentences max unless more detail is asked.\n- Use a warm encouraging tone, like a helpful elder sibling.`
          }
        ],
        messages: [
          {
            role: "user",
            content: [
              {
                text: question,
              },
            ],
          },
        ],
        inferenceConfig: {
          max_new_tokens: 400,
          temperature: 0.75,
        },
      }),
    };

    const command = new InvokeModelCommand(input);
    const response = await bedrockClient.send(command);
    const responseBody = new TextDecoder().decode(response.body);
    const data = JSON.parse(responseBody);

    const aiAnswer = data.output.message.content[0].text;

    console.log("AI Answer:", aiAnswer);

    return Response.json({
      answer: aiAnswer,
    });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}