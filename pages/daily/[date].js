import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import {serialize} from 'next-mdx-remote/serialize'
import {MDXRemote} from 'next-mdx-remote'

const CONTENT_DIR = path.join(process.cwd(), 'content')

export async function getStaticPaths(){
  const dailyDir = path.join(CONTENT_DIR, 'daily')
  if(!fs.existsSync(dailyDir)) return {paths: [], fallback: false}
  const files = fs.readdirSync(dailyDir).map(f=>f.replace(/\.mdx?$/,''))
  return {paths: files.map(date=>({params:{date}})), fallback: false}
}

export async function getStaticProps({params}){
  const p = path.join(CONTENT_DIR,'daily', params.date + '.mdx')
  const src = fs.readFileSync(p,'utf8')
  const {content,data} = matter(src)
  const mdx = await serialize(content)
  if (data && data.date && data.date instanceof Date) {
    data.date = data.date.toISOString().split('T')[0]
  } else if (data && data.date) {
    data.date = String(data.date)
  }
  return {props: {mdx, data}}
}

export default function DailyPage({mdx,data}){
  return (
    <div style={{fontFamily:'system-ui',padding:40}}>
      <h1>{data.title}</h1>
      <p style={{color:'#666'}}>{data.date}</p>
      <article style={{marginTop:20}}>
        <MDXRemote {...mdx} />
      </article>
    </div>
  )
}
