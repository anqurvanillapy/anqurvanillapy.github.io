import qs from 'querystring'
import marked from 'marked'
import hljs from 'highlight.js/lib/highlight'

import './style.css'
import 'highlight.js/styles/default.css'

;(async () => {
  // Scroll to top.

  document.getElementById('scroll-to-top').onclick = () => {
    window.scrollTo(0, 0)
    return false
  }

  // Code highlighting.

  ;[
    'javascript', 'python', 'bash', 'cpp', 'java', 'go', 'clojure', 'scala'
  ].forEach(lang => {
    const module = require(`highlight.js/lib/languages/${lang}`)
    hljs.registerLanguage(lang, module)
  })

  marked.setOptions({
    highlight: code => {
      return hljs.highlightAuto(code).value
    }
  })

  // Routes.

  const title = qs.parse(window.location.search.slice(1)).p || 'contents'
  const res = await window.fetch(`/content/${title}.md`)

  if (!res.ok) {
    render('Error', '```bash\n$ echo $?\n404 # :(\n```', 'Page Not Found')
    return
  }

  const lastModified = res.headers.get('last-modified')
  const body = await res.text()
  render(title, body, lastModified)

  function render (title, body, mod) {
    document.title = title
    document.querySelector('main').insertAdjacentHTML('beforeend', marked(body))
    document.getElementById('last-modified').textContent = mod
    document.getElementById('footer-title').textContent = title
  }
})()
