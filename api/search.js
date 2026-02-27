export default async function handler(req, res) {
  try {
    return res.status(200).json({
      method: req.method,
      body: req.body,
      hasKey: !!process.env.OPENAI_API_KEY
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
