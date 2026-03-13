export async function POST(req: Request) {
  const formData = await req.formData();
  const audio = formData.get("audio");

  console.log("Received audio:", audio);

  return Response.json({
    message: "Audio received successfully"
  });
}