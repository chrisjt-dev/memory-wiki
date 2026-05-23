import fetch from 'node-fetch'

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).end()
  const { type, slug } = req.body || {}
  if(!type || !slug) return res.status(400).json({error:'missing type or slug'})

  const OWNER = process.env.GITHUB_REPO_OWNER
  const REPO = process.env.GITHUB_REPO_NAME
  const BRANCH = process.env.GITHUB_BRANCH || 'main'
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN

  if(!OWNER || !REPO) return res.status(500).json({error:'server-misconfigured', message:'Missing GITHUB_REPO_OWNER or GITHUB_REPO_NAME'})

  const filepath = type === 'subject'
    ? `content/subjects/${slug}.mdx`
    : `content/daily/${slug}.mdx`

  const apiBase = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(filepath)}`
  const headers = {
    'Accept':'application/vnd.github+json',
    'User-Agent': 'dex-memory-wiki-agent'
  }
  if(GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`

  try{
    const getRes = await fetch(`${apiBase}?ref=${encodeURIComponent(BRANCH)}`, { headers })
    if(getRes.status === 200){
      const j = await getRes.json()
      const content = Buffer.from(j.content || '', j.encoding || 'base64').toString('utf8')
      return res.status(200).json({ exists: true, content })
    } else if(getRes.status === 404){
      return res.status(200).json({ exists: false, content: null })
    } else {
      const txt = await getRes.text()
      return res.status(500).json({ error: 'github-read-failed', status: getRes.status, body: txt })
    }
  }catch(err){
    console.error('preview error', err)
    return res.status(500).json({error:'internal', message:String(err)})
  }
}
