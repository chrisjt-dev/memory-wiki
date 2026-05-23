import fetch from 'node-fetch'

// GitHub-backed save endpoint for Memory Wiki admin editor.
// Requirements (set as environment variables in Vercel / server):
// - GITHUB_TOKEN: a personal access token with repo:contents scope OR a repo-scoped token
// - GITHUB_REPO_OWNER: repo owner (user or org)
// - GITHUB_REPO_NAME: repository name (memory-wiki)
// - GITHUB_BRANCH: branch to commit to (defaults to 'main')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { type, slug, content, message } = req.body || {}
  if (!type || !slug || typeof content !== 'string') {
    return res.status(400).json({ error: 'missing type, slug, or content' })
  }

  // Basic cookie-based auth guard preserved from the original implementation
  const cookie = req.headers.cookie || ''
  if (!cookie.includes('wiki_auth=')) return res.status(401).json({ error: 'not-authenticated' })

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN
  const OWNER = process.env.GITHUB_REPO_OWNER
  const REPO = process.env.GITHUB_REPO_NAME
  const BRANCH = process.env.GITHUB_BRANCH || 'main'

  if (!GITHUB_TOKEN || !OWNER || !REPO) {
    return res.status(500).json({
      error: 'server-misconfigured',
      message: 'Missing GITHUB_TOKEN, GITHUB_REPO_OWNER, or GITHUB_REPO_NAME in environment. Set these in Vercel project env vars.'
    })
  }

  const filepath = type === 'subject'
    ? `content/subjects/${slug}.mdx`
    : `content/daily/${slug}.mdx`

  const apiBase = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(filepath)}`
  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'User-Agent': 'dex-memory-wiki-agent',
    'Accept': 'application/vnd.github+json'
  }

  try {
    // Check if file exists to obtain the SHA (needed for update)
    const getRes = await fetch(`${apiBase}?ref=${encodeURIComponent(BRANCH)}`, { headers })
    let existingSha = null
    if (getRes.status === 200) {
      const j = await getRes.json()
      existingSha = j.sha
    } else if (getRes.status !== 404) {
      const txt = await getRes.text()
      return res.status(500).json({ error: 'github-read-failed', status: getRes.status, body: txt })
    }

    const encoded = Buffer.from(content, 'utf8').toString('base64')
    const commitMessage = message || `Update memory wiki: ${filepath}`

    const body = {
      message: commitMessage,
      content: encoded,
      branch: BRANCH,
      committer: {
        name: process.env.GITHUB_COMMITTER_NAME || 'Dex (on behalf of Chris)',
        email: process.env.GITHUB_COMMITTER_EMAIL || 'dex@local'
      }
    }

    if (existingSha) body.sha = existingSha

    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const putJson = await putRes.json()
    if (!putRes.ok) return res.status(500).json({ error: 'github-put-failed', status: putRes.status, body: putJson })

    return res.status(200).json({ ok: true, commit: putJson.commit && putJson.commit.sha })
  } catch (err) {
    console.error('save error', err)
    return res.status(500).json({ error: 'internal', message: String(err) })
  }
}
