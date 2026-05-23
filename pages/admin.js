import {useState} from 'react'

export default function Admin(){
  const [type, setType] = useState('subject')
  const [slug, setSlug] = useState('example-subject')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')

  async function save(e){
    e.preventDefault()
    const res = await fetch('/api/save', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({type, slug, content})})
    const j = await res.json()
    if(res.ok) setMessage('Saved')
    else setMessage(j.error||'error')
  }

  return (
    <div style={{fontFamily:'system-ui',padding:40}}>
      <h1>Admin Editor</h1>
      <p>Use this to create or edit MDX content. This is a lightweight editor for the wiki.</p>
      <form onSubmit={save} style={{marginTop:20}}>
        <label>Type: <select value={type} onChange={e=>setType(e.target.value)}>
          <option value="subject">subject</option>
          <option value="daily">daily</option>
        </select></label>
        <div style={{marginTop:8}}>
          <label>Slug / Date: <input value={slug} onChange={e=>setSlug(e.target.value)} /></label>
        </div>
        <div style={{marginTop:8}}>
          <label>MDX content</label>
          <div><textarea value={content} onChange={e=>setContent(e.target.value)} rows={18} style={{width:'100%'}}/></div>
        </div>
        <div style={{marginTop:8}}>
          <button type="submit">Save</button>
        </div>
      </form>
      <div style={{marginTop:12,color:'green'}}>{message}</div>
    </div>
  )
}
