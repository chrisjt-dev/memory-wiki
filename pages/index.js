import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Link from 'next/link'
import {useState} from 'react'

const CONTENT_DIR = path.join(process.cwd(), 'content')

export async function getServerSideProps({req}){
  const cookies = req.cookies || {}
  const authorized = cookies.wiki_auth === process.env.WIKI_PASSWORD

  // load index data only if authorized
  if(!authorized){
    return {props: {authorized: false}}
  }

  const subjectsDir = path.join(CONTENT_DIR, 'subjects')
  const dailyDir = path.join(CONTENT_DIR, 'daily')
  const subjects = fs.existsSync(subjectsDir) ? fs.readdirSync(subjectsDir).map(f => {
    const src = fs.readFileSync(path.join(subjectsDir, f), 'utf8')
    const {data} = matter(src)
    const slug = f.replace(/\.mdx?$/,'')
    return {slug, title: data.title||slug, tags: data.tags||[], summary: data.summary||''}
  }) : []

  const daily = fs.existsSync(dailyDir) ? fs.readdirSync(dailyDir).map(f => {
    const src = fs.readFileSync(path.join(dailyDir, f), 'utf8')
    const {data} = matter(src)
    const date = f.replace(/\.mdx?$/,'')
    return {date, title: data.title||date, summary: data.summary||''}
  }).sort((a,b)=>b.date.localeCompare(a.date)) : []

  return {props: {authorized: true, subjects, daily}}
}

export default function Home({authorized, subjects=[], daily=[]}){
  const [password, setPassword] = useState('')
  if(!authorized){
    return (
      <div style={{fontFamily:'system-ui',padding:40}}>
        <h1>Memory Wiki — sign in</h1>
        <p>This site is public but password-protected. Enter the password to continue.</p>
        <form method="POST" action="/api/login">
          <input name="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" />
          <button type="submit">Unlock</button>
        </form>
        <p>Set the password in Vercel as <code>WIKI_PASSWORD</code>.</p>
      </div>
    )
  }

  return (
    <div style={{fontFamily:'system-ui',padding:40}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1>Memory Wiki</h1>
        <Link href="/admin"><a>Admin</a></Link>
      </header>

      <section style={{marginTop:20}}>
        <h2>Subjects</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12}}>
          {subjects.map(s=> (
            <article key={s.slug} style={{border:'1px solid #eee',padding:12,borderRadius:8}}>
              <h3><Link href={`/subjects/${s.slug}`}><a>{s.title}</a></Link></h3>
              <p style={{color:'#666'}}>{s.summary}</p>
              <div style={{marginTop:8}}>{(s.tags||[]).map(t=> <span key={t} style={{marginRight:6,fontSize:12,padding:'2px 6px',background:'#f3f3f3',borderRadius:6}}>{t}</span>)}</div>
            </article>
          ))}
        </div>
      </section>

      <section style={{marginTop:40}}>
        <h2>Recent Daily Logs</h2>
        <ul>
          {daily.slice(0,10).map(d=> (
            <li key={d.date}><Link href={`/daily/${d.date}`}><a>{d.title} — {d.date}</a></Link> <span style={{color:'#666'}}> {d.summary}</span></li>
          ))}
        </ul>
      </section>
    </div>
  )
}
