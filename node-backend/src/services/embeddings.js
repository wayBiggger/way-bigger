const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');

const pinecone = process.env.PINECONE_API_KEY ? new Pinecone({ apiKey: process.env.PINECONE_API_KEY }) : null;
const indexName = process.env.PINECONE_INDEX || 'waybigger-projects';
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

async function ensureIndex() {
  if (!pinecone) return;
  try {
    await pinecone.index(indexName).describeIndexStats();
  } catch (_) {
    throw new Error(`Pinecone index ${indexName} not found. Create it first.`);
  }
}

async function embed(text) {
  if (!openai) return null;
  const input = text.slice(0, 8000);
  const resp = await openai.embeddings.create({ model: 'text-embedding-ada-002', input });
  return resp.data[0].embedding;
}

async function upsertProjectVector(id, level, fields) {
  if (!pinecone || !openai) return;
  const vector = await embed(`${fields.title} ${fields.description} ${fields.tech_stack}`);
  const index = pinecone.index(indexName);
  await index.upsert([
    { id: String(id), values: vector, metadata: { level, title: fields.title } },
  ]);
}

async function isTooSimilar(candidateText, level, threshold = 0.85) {
  if (!pinecone || !openai) return false;
  await ensureIndex();
  const vector = await embed(candidateText);
  const query = await pinecone.index(indexName).query({
    topK: 3,
    includeValues: false,
    includeMetadata: true,
    vector,
    filter: { level },
  });
  const best = (query.matches || [])[0];
  if (!best) return false;
  return (best.score || 0) >= threshold;
}

module.exports = { upsertProjectVector, isTooSimilar };


