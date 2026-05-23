import {useState} from 'react'

export default function Admin(){
  const [type, setType] = useState('subject')
  const [slug, setSlug] = useState('example-subject')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')
  const [commitMessage, setCommitMessage] = useState('')
  const [preview, setPreview] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  async function doPreview(e){
    e && e.preventDefault()
    if(!slug) return setMessage('Enter a slug/date to preview')
    setLoadingPreview(true)
    setMessage('')
    try{
      const res = await fetch('/api/preview', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({type, slug})})
      const j = await res.json()
      setPreview(j)
      if(!res.ok) setMessage(j.error||'preview failed')
    }catch(err){
      setMessage('preview error')
    }finally{ setLoadingPreview(false) }
  }

  async function confirmAndSave(e){
    e.preventDefault()
    if(!commitMessage) return setMessage('Please enter a commit message')
    const res = await fetch('/api/save', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({type, slug, content, message: commitMessage})})
    const j = await res.json()
    if(res.ok) setMessage('Saved — commit: ' + (j.commit||'unknown'))
    else setMessage(j.error||JSON.stringify(j))
  }

  return (
    <div style={{fontFamily:'system-ui',padding:40}}>
      <h1>Admin Editor</h1>
      <p>Use this to create or edit MDX content. This is a lightweight editor for the wiki.</p>
      <form onSubmit={confirmAndSave} style={{marginTop:20}}>
        <label>Type: <select value={type} onChange={e=>setType(e.target.value)}>
          <option value="subject">subject</option>
          <option value="daily">daily</option>
        </select></label>
        <div style={{marginTop:8}}>
          <label>Slug / Date: <input value={slug} onChange={e=>setSlug(e.target.value)} /></label>
        </div>
        <div style={{marginTop:8}}>
          <label>Commit message (required)</label>
          <div><input value={commitMessage} onChange={e=>setCommitMessage(e.target.value)} style={{width:'100%'}}/></div>
        </div>
        <div style={{marginTop:8}}>
          <label>MDX content</label>
          <div><textarea value={content} onChange={e=>setContent(e.target.value)} rows={18} style={{width:'100%'}}/></div>
        </div>
        <div style={{marginTop:8}}>
          <button type="button" onClick={doPreview} disabled={loadingPreview}>{loadingPreview? 'Previewing...':'Preview'}</button>
          <button type="submit" style={{marginLeft:8}}>Confirm & Save</button>
        </div>
      </form>

      {preview && (
        <div style={{marginTop:16,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div>
            <h3>Existing</h3>
            <pre style={{whiteSpace:'pre-wrap',background:'#f6f8fa',padding:8,borderRadius:6,maxHeight:360,overflow:'auto'}}>{preview.content||'(new file)'}</pre>
          </div>
          <div>
            <h3>Proposed</h3>
            <pre style={{whiteSpace:'pre-wrap',background:'#fff7ed',padding:8,borderRadius:6,maxHeight:360,overflow:'auto'}}>{content}</pre>
          </div>
        </div>
      )}

      <div style={{marginTop:12,color:'green'}}>{message}</div>
    </div>
  )
}
