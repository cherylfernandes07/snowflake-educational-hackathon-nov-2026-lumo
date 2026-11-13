import { Keenable } from 'keenable';
const client = new Keenable({ timeoutMs: 10000 });
try {
  const result = await client.search('NASA Great Wall visible from Moon unaided eye', { maxResults: 3 });
  console.log(JSON.stringify({ mode: 'live', sources: result.results.map(({title,url}) => ({title,url})) }, null, 2));
  const page = await client.fetch('https://www.nasa.gov/image-article/great-wall/');
  console.log(JSON.stringify({ retrieval: 'live', title: page.title, characters: page.content.length }));
} catch(error) {
  console.error('Keenable unavailable:', error.message);
  process.exitCode = 1;
}
