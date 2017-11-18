import qs from 'querystring'
import marked from 'marked'
import hljs from 'highlight.js/lib/highlight'

import { fetch } from './lib'
import langset from './langset'

import './style.css'
import 'highlight.js/styles/default.css'

const [
  $lastModified,
  $footerTitle,
  $scrollToTop,
  $spinner,
  $loader
] = [
  'last-modified',
  'footer-title',
  'scroll-to-top',
  'spinner',
  'loader'
].map(id => document.getElementById(id))

class Spinner {
  constructor () {
    this.arr = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷']
    this.idx = 0
    this.timer = setInterval(this._update, 75)
    $loader.insertAdjacentHTML('beforeend', 'Fetching...')
  }

  _spin = () => {
    $spinner.textContent = this.arr[this.idx]
  }

  destroy = () => {
    clearInterval(this.timer)
    $loader.remove()
  }

  _update = () => {
    let idx = this.idx
    idx = idx === this.arr.length - 1 ? 0 : idx + 1
    this.idx = idx
    this._spin()
  }
}

const render = (title, body, mod) => {
  document.title = `cd ~/${title === 'contents' ? '' : title}`
  document.querySelector('main').insertAdjacentHTML('beforeend', marked(body))
  $lastModified.textContent = mod
  $footerTitle.textContent = title
}

;(async () => {
  const spinner = new Spinner()
  $scrollToTop.onclick = () => {
    window.scrollTo(0, 0)
    return false
  }

  langset.forEach(lang => hljs.registerLanguage(lang,
    require(`highlight.js/lib/languages/${lang}`)))
  marked.setOptions({ highlight: code => hljs.highlightAuto(code).value })

  const title = qs.parse(window.location.search.slice(1)).p || 'contents'
  const res = await fetch(`/content/${title}.md`)
  spinner.destroy()
  if (res.ok) {
    const lastModified = res.headers.get('last-modified')
    const body = await res.text()
    render(title, body, lastModified)
  } else {
    render('Error', '```bash\n$ echo $?\n404 # :(\n```', 'Page Not Found')
  }
})()
