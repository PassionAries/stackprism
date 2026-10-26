import fs from 'node:fs'
import path from 'node:path'
import type { HeadConfig, PageData, TransformContext, TransformPageContext } from 'vitepress'

export const SITE_URL = 'https://stackprism.wenzi.games'
export const LOCALE_CODES = ['zh-CN', 'en', 'zh-TW', 'ja', 'fr', 'de', 'pt', 'it', 'cs', 'pl'] as const

type LocaleCode = (typeof LOCALE_CODES)[number]

export const LOCALE_META: Record<LocaleCode, { lang: string; title: string; description: string }> = {
  'zh-CN': {
    lang: 'zh-CN',
    title: '网页技术栈识别器',
    description: 'StackPrism 是一个浏览器扩展，用于识别网站使用的前端框架、运行时、分析服务和安全线索。'
  },
  en: {
    lang: 'en',
    title: 'Web Technology Stack Identifier',
    description:
      'StackPrism is a browser extension for identifying frontend frameworks, runtimes, analytics, and security signals used by websites.'
  },
  'zh-TW': {
    lang: 'zh-TW',
    title: '網頁技術堆疊識別器',
    description: 'StackPrism 是一個瀏覽器擴充功能，用來識別網站使用的前端框架、執行環境、分析服務與安全線索。'
  },
  ja: {
    lang: 'ja',
    title: 'ウェブ技術スタック識別ツール',
    description:
      'StackPrism はウェブサイトのフロントエンド、ランタイム、分析サービス、セキュリティの手がかりを識別するブラウザー拡張機能です。'
  },
  fr: {
    lang: 'fr',
    title: 'Identificateur de stack web',
    description:
      'StackPrism identifie les frameworks frontend, runtimes, services analytics et signaux de sécurité utilisés par les sites web.'
  },
  de: {
    lang: 'de',
    title: 'Identifikator für Web-Technologie-Stacks',
    description: 'StackPrism erkennt Frontend-Frameworks, Runtimes, Analytics-Dienste und Sicherheitssignale von Websites.'
  },
  pt: {
    lang: 'pt',
    title: 'Identificador de stack de tecnologia web',
    description: 'StackPrism identifica frameworks frontend, runtimes, serviços de analytics e sinais de segurança usados por sites.'
  },
  it: {
    lang: 'it',
    title: 'Identificatore dello stack web',
    description: 'StackPrism identifica framework frontend, runtime, servizi di analytics e segnali di sicurezza usati dai siti web.'
  },
  cs: {
    lang: 'cs',
    title: 'Identifikátor webového technologického stacku',
    description: 'StackPrism rozpoznává frontendové frameworky, runtime, analytické služby a bezpečnostní signály webů.'
  },
  pl: {
    lang: 'pl',
    title: 'Identyfikator technologii webowych',
    description: 'StackPrism rozpoznaje frameworki frontendu, runtime, usługi analityczne i sygnały bezpieczeństwa witryn.'
  }
}

// 不进搜索索引、也不进 sitemap 的页面（相对各语言根目录，不带 .md）：反馈页只有一个表单，404 页在 /404.html 也能以 200 访问
const NOINDEX_PAGES = new Set(['feedback', '404'])

// 描述长度按显示宽度算：中日韩全角字符记 2，其余记 1；160 约等于 Google 摘要的截断宽度
const DESCRIPTION_MAX_WIDTH = 160
const DESCRIPTION_MIN_WIDTH = 50
// 句末截断后至少要有这么宽，太短就宁可按词截断多保留一些信息
const DESCRIPTION_SENTENCE_CUT_WIDTH = 96

// 全角字符：中日韩部首到彝文、谚文、兼容表意文字、竖排/全角标点
const WIDE_CHAR = /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/
// 中日文软换行合并时去掉两侧都是汉字 / 假名 / 全角标点的空白（谚文用空格分词，不处理）
const CJK_GAP = /([\u2e80-\u9fff\uf900-\ufaff\ufe30-\ufe4f\uff00-\uffef])\s+(?=[\u2e80-\u9fff\uf900-\ufaff\ufe30-\ufe4f\uff00-\uffef])/g
const SENTENCE_END = /[。！？]|[.!?](?=\s|$)/g
const NON_PARAGRAPH_LINE = /^(?:#{1,6}\s|```|~~~|:::|\||>|<|[-*+]\s|\d+[.)]\s|!\[|\$\$|-{3,}\s*$|\*{3,}\s*$)/
const FRONTMATTER = /^\ufeff?---\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/

function normalizePage(page: string): string {
  return page
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\.md$/, '')
}

function pageRoute(page: string): { locale: LocaleCode; relative: string } {
  const normalized = normalizePage(page)
  const first = normalized.split('/')[0]
  if (LOCALE_CODES.includes(first as LocaleCode) && first !== 'zh-CN') {
    return { locale: first as LocaleCode, relative: normalized.slice(first.length).replace(/^\/+/, '') }
  }
  return { locale: 'zh-CN', relative: normalized }
}

function publicPath(locale: LocaleCode, relative: string): string {
  const prefix = locale === 'zh-CN' ? '' : `/${locale}`
  if (!relative || relative === 'index') return `${prefix}/`
  if (relative.endsWith('/index')) return `${prefix}/${relative.slice(0, -6)}/`
  return `${prefix}/${relative}.html`
}

function sourcePage(locale: LocaleCode, relative: string): string {
  const prefix = locale === 'zh-CN' ? '' : `${locale}/`
  return `${prefix}${relative || 'index'}.md`
}

function isNoindex(relative: string): boolean {
  return NOINDEX_PAGES.has(relative)
}

function charWidth(char: string): number {
  return WIDE_CHAR.test(char) ? 2 : 1
}

function displayWidth(text: string): number {
  let width = 0
  for (const char of text) width += charWidth(char)
  return width
}

// 行内 Markdown 转纯文本；代码片段先摘出来，避免 `__hints` 之类的下划线被当成强调
function markdownInlineToText(markdown: string): string {
  const codeSpans: string[] = []
  const withoutCode = markdown.replace(/`+([^`]+?)`+/g, (_, code: string) => {
    codeSpans.push(code.trim())
    return `\u0000${codeSpans.length - 1}\u0000`
  })
  return withoutCode
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
    .replace(/<(https?:\/\/[^>\s]+)>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/(^|[^\w*])\*([^*\s][^*]*?)\*(?!\w)/g, '$1$2')
    .replace(/\s*\{#[^}]+\}\s*$/, '')
    .replace(/\\([\\`*_{}[\]()#+\-.!|])/g, '$1')
    .replace(/\u0000(\d+)\u0000/g, (_, index: string) => codeSpans[Number(index)])
    .replace(CJK_GAP, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

// 超长时优先在句末截断（截完不能太短）；否则按词 / 分句边界截断，避开没闭合的括号，再加省略号
function truncateDescription(text: string): string {
  if (displayWidth(text) <= DESCRIPTION_MAX_WIDTH) return text
  let lastSentenceEnd = -1
  for (const match of text.matchAll(SENTENCE_END)) {
    const end = (match.index ?? 0) + match[0].length
    if (displayWidth(text.slice(0, end)) > DESCRIPTION_MAX_WIDTH) break
    lastSentenceEnd = end
  }
  if (lastSentenceEnd > 0 && displayWidth(text.slice(0, lastSentenceEnd)) >= DESCRIPTION_SENTENCE_CUT_WIDTH) {
    return text.slice(0, lastSentenceEnd).trim()
  }
  let cut = ''
  let width = 0
  for (const char of text) {
    width += charWidth(char)
    if (width > DESCRIPTION_MAX_WIDTH - 1) break
    cut += char
  }
  const boundary = Math.max(cut.lastIndexOf(' '), cut.search(/[，、；,;][^，、；,;]*$/))
  let trimmed = boundary > cut.length / 2 ? cut.slice(0, boundary) : cut
  const unclosed = /[「『（(【[“][^「『（(【[“」』）)】\]”]*$/.exec(trimmed)
  if (unclosed && unclosed.index > trimmed.length / 2) trimmed = trimmed.slice(0, unclosed.index)
  return `${trimmed.replace(/[\s，、；,;:：]+$/, '')}…`
}

interface MarkdownOutline {
  title: string
  intro: string[]
  sections: string[]
}

// 拆出 H1、H1 与第一个 H2 之间的段落、以及全部 H2 标题；代码块和容器块整体跳过
function outlineMarkdown(markdown: string): MarkdownOutline {
  const lines = markdown.replace(FRONTMATTER, '').split(/\r?\n/)
  const outline: MarkdownOutline = { title: '', intro: [], sections: [] }
  let fence = ''
  let paragraph: string[] = []
  let beforeFirstSection = true
  const flush = () => {
    if (paragraph.length && beforeFirstSection && outline.title) outline.intro.push(markdownInlineToText(paragraph.join('\n')))
    paragraph = []
  }
  for (const rawLine of lines) {
    const line = rawLine.trim()
    const fenceMatch = /^(```|~~~|:::)/.exec(line)
    if (fence) {
      if (fenceMatch && fenceMatch[1] === fence && line.slice(fence.length).trim() === '') fence = ''
      continue
    }
    if (fenceMatch) {
      flush()
      fence = fenceMatch[1]
      continue
    }
    if (!line) {
      flush()
      continue
    }
    const heading = /^(#{1,6})\s+(.+?)\s*#*$/.exec(line)
    if (heading) {
      flush()
      const text = markdownInlineToText(heading[2])
      if (heading[1] === '#' && !outline.title) outline.title = text
      else if (heading[1] === '##') {
        beforeFirstSection = false
        if (text) outline.sections.push(text)
      }
      continue
    }
    if (NON_PARAGRAPH_LINE.test(line)) {
      flush()
      continue
    }
    paragraph.push(line)
  }
  flush()
  outline.intro = outline.intro.filter(Boolean)
  return outline
}

// 页面描述：优先用 H1 下的导语；导语过短或以冒号收尾时拼上后续导语段；都不够就用"标题：小节、小节"
export function extractDescription(markdown: string, lang: string): string {
  const { title, intro, sections } = outlineMarkdown(markdown)
  const wide = /^(zh|ja)/.test(lang)
  const isUsable = (value: string) => displayWidth(value) >= DESCRIPTION_MIN_WIDTH && !/[:：]$/.test(value)
  let text = ''
  for (const paragraph of intro) {
    text = text ? `${text}${wide ? '' : ' '}${paragraph}` : paragraph
    if (isUsable(text)) break
  }
  if (!isUsable(text) && title && sections.length) {
    text = wide ? `${title}：${sections.join('、')}` : `${title}: ${sections.join(', ')}`
  }
  return text ? truncateDescription(text) : ''
}

export function seoPageData(pageData: PageData, { siteConfig }: TransformPageContext): Partial<PageData> {
  const { locale, relative } = pageRoute(pageData.relativePath)
  const extra: Partial<PageData> = {}
  // 标题自带品牌名（各语言首页）时不再套 "| StackPrism" 模板
  const frontmatterTitle = String(pageData.frontmatter.title || '')
  if (pageData.frontmatter.titleTemplate === undefined && frontmatterTitle.includes(siteConfig.site.title)) {
    extra.titleTemplate = false
  }
  if (!pageData.frontmatter.description) {
    let description = ''
    if (!isNoindex(relative)) {
      const file = path.join(siteConfig.srcDir, pageData.filePath)
      description = extractDescription(fs.readFileSync(file, 'utf8'), LOCALE_META[locale].lang)
    }
    extra.description = description || LOCALE_META[locale].description
  }
  return extra
}

export function buildSeoHead(context: TransformContext): HeadConfig[] {
  const { locale, relative } = pageRoute(context.page)
  const meta = LOCALE_META[locale]
  const canonical = `${SITE_URL}${publicPath(locale, relative)}`
  const title = context.pageData.frontmatter.title || context.title || `StackPrism · ${meta.title}`
  const description = context.pageData.description || meta.description
  const isHome = !relative || relative === 'index'
  const noindex = isNoindex(relative)
  // description 由这里输出：VitePress 自带的那份不转义属性值，文本含英文引号时会破坏标签
  const head: HeadConfig[] = [
    ['meta', { name: 'description', content: description }],
    ['link', { rel: 'canonical', href: canonical }],
    ['meta', { name: 'robots', content: noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large' }],
    ['meta', { property: 'og:type', content: isHome ? 'website' : 'article' }],
    ['meta', { property: 'og:site_name', content: 'StackPrism' }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: canonical }],
    ['meta', { property: 'og:locale', content: meta.lang.replace('-', '_') }],
    ['meta', { property: 'og:image', content: `${SITE_URL}/og-image.png` }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: `${SITE_URL}/og-image.png` }]
  ]

  // hreflang 只指向实际存在的语言版本；简体中文同时作为 x-default
  if (!noindex) {
    const pages = new Set(context.siteConfig.pages)
    const available = LOCALE_CODES.filter(code => pages.has(sourcePage(code, relative)))
    if (available.length > 1) {
      for (const code of available) {
        head.push(['link', { rel: 'alternate', hreflang: LOCALE_META[code].lang, href: `${SITE_URL}${publicPath(code, relative)}` }])
      }
      const fallback = available.includes('zh-CN') ? 'zh-CN' : available[0]
      head.push(['link', { rel: 'alternate', hreflang: 'x-default', href: `${SITE_URL}${publicPath(fallback, relative)}` }])
    }
  }

  if (isHome) {
    head.push([
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${SITE_URL}/#organization`,
            name: 'StackPrism',
            url: SITE_URL,
            logo: `${SITE_URL}/icon.svg`,
            sameAs: ['https://github.com/setube/stackprism']
          },
          {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            url: SITE_URL,
            name: 'StackPrism',
            description,
            publisher: { '@id': `${SITE_URL}/#organization` }
          },
          {
            '@type': 'SoftwareApplication',
            name: 'StackPrism',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Chrome, Edge, Firefox',
            url: SITE_URL,
            description,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
          }
        ]
      })
    ])
  }

  return head
}

interface SitemapEntry {
  url: string
  links?: { lang: string; url: string }[]
}

// sitemap：去掉 noindex 页面，多语言分组补上 x-default（与页面 head 保持一致）
export function transformSitemapItems<T extends SitemapEntry>(items: T[]): T[] {
  return items
    .filter(item => !isNoindex(pageRoute(item.url.replace(/\.html$/, '').replace(/(^|\/)$/, '$1index')).relative))
    .map(item => {
      if (!item.links?.length) return item
      const fallback = item.links.find(link => link.lang === LOCALE_META['zh-CN'].lang) ?? item.links[0]
      return { ...item, links: [...item.links, { lang: 'x-default', url: fallback.url }] }
    })
}
