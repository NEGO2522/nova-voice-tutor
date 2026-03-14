import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({
  region: "us-east-1",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = body.question;

    if (!question) {
      return Response.json({ error: "No question received" }, { status: 400 });
    }

    console.log("User question:", question);

    const input = {
      modelId: "amazon.nova-lite-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        // Adding the system prompt here defines the "Friendly Friend" personality
        system: [
          {
            text: "You are Nova, a friendly and supportive AI tutor who talks like a close friend. Use a warm, casual, and encouraging tone. If the user asks how you are, tell them you're doing great and ask about them. Keep your answers conversational and helpful."
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
          max_new_tokens: 300, // Slightly increased for more natural conversation
          temperature: 0.7,    // Added a bit of 'creativity' for a more human feel
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