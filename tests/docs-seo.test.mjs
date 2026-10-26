import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { transform } from 'esbuild'

const source = await readFile(new URL('../docs/.vitepress/seo.ts', import.meta.url), 'utf8')
const { code } = await transform(source, { loader: 'ts', format: 'esm', target: 'es2022' })
const { SITE_URL, LOCALE_META, extractDescription, seoPageData, buildSeoHead, transformSitemapItems } = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
)

// 与 seo.ts 一致：中日文与全角字符记 2
const isWide = char => {
  const code = char.codePointAt(0)
  return (code >= 0x2e80 && code <= 0xa4cf) || (code >= 0xff00 && code <= 0xff60)
}
const width = text => [...text].reduce((sum, char) => sum + (isWide(char) ? 2 : 1), 0)

test('description comes from the intro paragraph as plain text', () => {
  const markdown = [
    '---',
    'title: 安装',
    '---',
    '',
    '# 安装扩展',
    '',
    'StackPrism 支持 Chrome、Edge 和 Firefox。可以从**应用商店**安装，',
    '也可以[手动加载](./manual.md) `dist` 目录。',
    '',
    '## 从商店安装'
  ].join('\n')

  assert.equal(
    extractDescription(markdown, 'zh-CN'),
    'StackPrism 支持 Chrome、Edge 和 Firefox。可以从应用商店安装，也可以手动加载 dist 目录。'
  )
})

test('code spans keep their underscores while emphasis markers are removed', () => {
  const markdown = [
    '# Rules',
    '',
    'The `__legacyHints` gate keeps the old __top-3__ threshold for rules that were tuned before 1.3.80.'
  ].join('\n')

  assert.equal(
    extractDescription(markdown, 'en'),
    'The __legacyHints gate keeps the old top-3 threshold for rules that were tuned before 1.3.80.'
  )
})

test('fences, containers, lists and tables are not treated as intro text', () => {
  const markdown = [
    '# Rules',
    '',
    '::: tip',
    'Tip text that should not appear.',
    ':::',
    '',
    '```js',
    'const ignored = true',
    '```',
    '',
    '- list item',
    '| a | b |',
    '',
    'Rules decide which technologies StackPrism reports, based on scripts, globals, headers and DOM markers.',
    '',
    '## Format'
  ].join('\n')

  assert.equal(
    extractDescription(markdown, 'en'),
    'Rules decide which technologies StackPrism reports, based on scripts, globals, headers and DOM markers.'
  )
})

test('an intro that ends with a colon is joined with the next paragraph', () => {
  const markdown = [
    '# Install',
    '',
    'Pick one:',
    '',
    'Install from the Chrome Web Store, or load the unpacked dist folder in developer mode.',
    '',
    '## Store'
  ].join('\n')

  assert.equal(
    extractDescription(markdown, 'en'),
    'Pick one: Install from the Chrome Web Store, or load the unpacked dist folder in developer mode.'
  )
})

test('pages without an intro fall back to the title and section headings', () => {
  assert.equal(extractDescription('# 常见问题\n\n## 为什么识别不到\n\n## 如何反馈\n', 'zh-CN'), '常见问题：为什么识别不到、如何反馈')
  assert.equal(
    extractDescription('# FAQ\n\n## Why nothing is detected\n\n## How to report\n', 'en'),
    'FAQ: Why nothing is detected, How to report'
  )
  assert.equal(extractDescription('<IssueFeedback />\n', 'en'), '')
})

test('long descriptions stop at the last sentence that fits', () => {
  const first =
    'StackPrism inspects the scripts, stylesheets, response headers and runtime globals that the current tab exposes to the browser.'
  const second = 'It then matches them against more than three thousand rules to name frameworks, CDNs, analytics and security products.'

  assert.equal(extractDescription(`# About\n\n${first} ${second}\n`, 'en'), first)
})

test('long descriptions without a usable sentence end are cut at a separator', () => {
  const clause = '识别前端框架与运行时'
  const description = extractDescription(`# 概览\n\n${`${clause}，`.repeat(10)}\n`, 'zh-CN')

  assert.equal(description, `${`${clause}，`.repeat(6)}${clause}…`)
  assert.ok(width(description) <= 160)
})

test('cuts never leave an unclosed bracket behind', () => {
  const text =
    'StackPrism reads scripts, stylesheets, response headers and runtime globals of the current tab and compares them with its rule set ' +
    '(frameworks, CDNs, analytics services, security products and many other categories) without sending page data anywhere'

  assert.equal(
    extractDescription(`# About\n\n${text}\n`, 'en'),
    'StackPrism reads scripts, stylesheets, response headers and runtime globals of the current tab and compares them with its rule set…'
  )
})

test('page data gets a localized description read from the source file', async () => {
  const srcDir = await mkdtemp(path.join(tmpdir(), 'stackprism-docs-'))
  try {
    await mkdir(path.join(srcDir, 'cs/guide'), { recursive: true })
    await writeFile(
      path.join(srcDir, 'cs/guide/install.md'),
      '# Instalace\n\nStackPrism lze nainstalovat z obchodu Chrome Web Store, Microsoft Edge Add-ons nebo Firefox Add-ons.\n'
    )
    const siteConfig = { srcDir, site: { title: 'StackPrism' } }
    const page = relativePath => ({ relativePath, filePath: relativePath, frontmatter: {} })

    assert.deepEqual(seoPageData(page('cs/guide/install.md'), { siteConfig }), {
      description: 'StackPrism lze nainstalovat z obchodu Chrome Web Store, Microsoft Edge Add-ons nebo Firefox Add-ons.'
    })
    // 反馈页不读源文件（这里也没有建），直接用语言默认描述
    assert.deepEqual(seoPageData(page('en/feedback.md'), { siteConfig }), { description: LOCALE_META.en.description })
    assert.deepEqual(
      seoPageData(
        { ...page('en/index.md'), frontmatter: { title: 'StackPrism — Web Technology Stack Identifier', description: 'Home' } },
        { siteConfig }
      ),
      { titleTemplate: false }
    )
  } finally {
    await rm(srcDir, { recursive: true, force: true })
  }
})

const headContext = (page, pages = []) => ({
  page,
  title: 'Page | StackPrism',
  pageData: { relativePath: page, frontmatter: {}, description: 'Page description' },
  siteConfig: { pages }
})

const findHead = (head, tag, attrs) =>
  head.filter(([name, props]) => name === tag && Object.entries(attrs).every(([key, value]) => props[key] === value))

test('hreflang links only cover translations that exist, plus x-default', () => {
  const pages = ['guide/install.md', 'en/guide/install.md', 'cs/guide/install.md', 'ja/guide/other.md']
  const head = buildSeoHead(headContext('cs/guide/install.md', pages))

  assert.deepEqual(
    findHead(head, 'link', { rel: 'alternate' }).map(([, props]) => [props.hreflang, props.href]),
    [
      ['zh-CN', `${SITE_URL}/guide/install.html`],
      ['en', `${SITE_URL}/en/guide/install.html`],
      ['cs', `${SITE_URL}/cs/guide/install.html`],
      ['x-default', `${SITE_URL}/guide/install.html`]
    ]
  )
  assert.equal(findHead(head, 'link', { rel: 'canonical' })[0][1].href, `${SITE_URL}/cs/guide/install.html`)
  assert.equal(findHead(head, 'meta', { name: 'robots' })[0][1].content, 'index,follow,max-image-preview:large')
  assert.equal(findHead(head, 'meta', { name: 'description' })[0][1].content, 'Page description')
})

test('feedback and 404 pages are noindex without hreflang links', () => {
  for (const page of ['feedback.md', 'en/feedback.md', '404.md']) {
    const head = buildSeoHead(headContext(page, ['feedback.md', 'en/feedback.md']))
    assert.equal(findHead(head, 'meta', { name: 'robots' })[0][1].content, 'noindex,follow', page)
    assert.equal(findHead(head, 'link', { rel: 'alternate' }).length, 0, page)
  }
})

test('sitemap drops noindex pages and adds x-default to translated groups', () => {
  const links = [
    { url: 'guide/install.html', lang: 'zh-CN' },
    { url: 'en/guide/install.html', lang: 'en' }
  ]
  const feedbackLinks = [
    { url: 'feedback.html', lang: 'zh-CN' },
    { url: 'en/feedback.html', lang: 'en' }
  ]
  const items = transformSitemapItems([
    { url: '', lastmod: 1 },
    { url: 'en/guide/install.html', links },
    { url: 'guide/install.html', links },
    { url: 'feedback.html', links: feedbackLinks },
    { url: 'en/feedback.html', links: feedbackLinks }
  ])

  assert.deepEqual(
    items.map(item => item.url),
    ['', 'en/guide/install.html', 'guide/install.html']
  )
  assert.deepEqual(items[0], { url: '', lastmod: 1 })
  assert.deepEqual(items[1].links.at(-1), { lang: 'x-default', url: 'guide/install.html' })
  assert.equal(links.length, 2)
})

// 导航和侧栏配置会原样内联进每个页面，Google 会把其中不带 .html 的路径当成另一个网址抓取
test('nav and sidebar links use the canonical .html URLs', async () => {
  const config = await readFile(new URL('../docs/.vitepress/config.ts', import.meta.url), 'utf8')
  const links = [...config.matchAll(/link: '(\/[^']*)'/g)].map(match => match[1])

  assert.ok(links.length > 0)
  assert.deepEqual(
    links.filter(link => !/(\.html|\/)$/.test(link)),
    []
  )
})
