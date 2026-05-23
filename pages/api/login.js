export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).end()
  const {password} = req.body
  if(process.env.WIKI_PASSWORD && password === process.env.WIKI_PASSWORD){
    // set cookie (expires in 7 days)
    res.setHeader('Set-Cookie', `wiki_auth=${password}; Path=/; HttpOnly; Max-Age=${7*24*60*60}`)
    return res.status(200).json({ok:true})
  }
  return res.status(401).json({error:'invalid'})
}
