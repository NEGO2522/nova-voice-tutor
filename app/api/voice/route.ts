import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: "us-east-1",
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const audioFile = formData.get("audio") as File;

  if (!audioFile) {
    return Response.json({ error: "No audio received" }, { status: 400 });
  }

  // STEP 10 — Convert audio file to buffer
  const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

  console.log("Audio received size:", audioBuffer.length);

  const input = {
    modelId: "amazon.nova-lite-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: [
            {
              text: "Explain recursion in simple terms"
            }
          ]
        }
      ],
      inferenceConfig: {
        max_new_tokens: 200
      }
    })
  };

  const command = new InvokeModelCommand(input);
  const response = await client.send(command);

  const responseBody = new TextDecoder().decode(response.body);

  console.log("Nova response:", responseBody);

  return Response.json({
    message: "AI response received",
  });
}