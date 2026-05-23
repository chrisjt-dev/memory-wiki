import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import {serialize} from 'next-mdx-remote/serialize'
import {MDXRemote} from 'next-mdx-remote'

const CONTENT_DIR = path.join(process.cwd(), 'content')

export async function getStaticPaths(){
  const subjectsDir = path.join(CONTENT_DIR, 'subjects')
  if(!fs.existsSync(subjectsDir)) return {paths: [], fallback: false}
  const files = fs.readdirSync(subjectsDir).map(f=>f.replace(/\.mdx?$/,''))
  return {paths: files.map(slug=>({params:{slug}})), fallback: false}
}

export async function getStaticProps({params}){
  const p = path.join(CONTENT_DIR,'subjects', params.slug + '.mdx')
  const src = fs.readFileSync(p,'utf8')
  const {content,data} = matter(src)
  const mdx = await serialize(content)
  return {props: {mdx, data}}
}

export default function SubjectPage({mdx,data}){
  return (
    <div style={{fontFamily:'system-ui',padding:40}}>
      <h1>{data.title}</h1>
      <p style={{color:'#666'}}>{data.summary}</p>
      <article style={{marginTop:20}}>
        <MDXRemote {...mdx} />
      </article>
    </div>
  )
}
