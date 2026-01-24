import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { prompt } = req.body;

    // In a real application, you would call your AI model here.
    // For this example, we'll just echo the prompt back.
    const aiResponse = `You said: ${prompt}`;

    res.status(200).json({ response: aiResponse });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
