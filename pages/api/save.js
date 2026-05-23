import fs from 'fs'
import path from 'path'

export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end()
  const {type, slug, content} = req.body
  if(!type || !slug) return res.status(400).json({error:'missing'})
  // rudimentary check: cookie must be present
  const cookie = req.headers.cookie || ''
  if(!cookie.includes('wiki_auth=')) return res.status(401).json({error:'not-authenticated'})
  const base = path.join(process.cwd(),'content', type === 'subject' ? 'subjects' : 'daily')
  if(!fs.existsSync(base)) fs.mkdirSync(base, {recursive:true})
  const filename = path.join(base, slug + '.mdx')
  fs.writeFileSync(filename, content)
  return res.status(200).json({ok:true, path: filename})
}
