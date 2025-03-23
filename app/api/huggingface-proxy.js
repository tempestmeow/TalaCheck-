// pages/api/huggingface-proxy.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { model, data } = req.body;

  try {
    console.log(`Proxying request to ${model}`, data);

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hugging Face API error (${response.status}):`, errorText);
      return res.status(response.status).json({
        error: `Hugging Face API returned error: ${response.status}`,
        details: errorText,
      });
    }

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Hugging Face API error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch from Hugging Face API" });
  }
}
