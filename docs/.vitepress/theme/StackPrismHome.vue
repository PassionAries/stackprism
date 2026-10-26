<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight, Layers3, Puzzle, ScanSearch, ShieldCheck } from 'lucide-vue-next'
import { useData } from 'vitepress'
import HeroSection from './components/HeroSection.vue'
import FeatureCard from './components/FeatureCard.vue'
import LanguageBanner from './components/LanguageBanner.vue'

type Copy = {
  eyebrow: string
  title: string
  highlight: string
  tagline: string
  primaryCta: string
  secondaryCta: string
  browserLabel: string
  visualCaption: string
  featureLabel: string
  featuresKicker: string
  sectionNote: string
  languageLabel: string
  docsKicker: string
  docsTitle: string
  docsBody: string
  docsCta: string
  footerTagline: string
  features: [string, string, string][]
  languages: string[]
}

const { lang } = useData()

const copies: Record<string, Copy> = {
  'zh-CN': {
    eyebrow: '网页技术栈识别器', title: '看见每个网站的', highlight: '技术栈。', tagline: 'StackPrism 是一个 Manifest V3 浏览器扩展，自动识别前端框架、CSS 系统、构建工具、运行时、分析服务与安全线索。', primaryCta: '安装扩展', secondaryCta: '查看 GitHub', browserLabel: '适用于', visualCaption: '实时查看每个页面背后的技术栈', featureLabel: '为开发者准备的清晰线索', featuresKicker: 'STACKPRISM / 功能', sectionNote: '为快速、可追溯的检测流程而设计', languageLabel: '10 种语言', docsKicker: '从这里开始', docsTitle: '从页面线索，到可验证的技术判断。', docsBody: '打开扩展即可查看检测结果、证据和来源。文档站提供安装、配置、规则开发和贡献指南。', docsCta: '阅读文档', footerTagline: '开源的网站技术情报工具。', languages: ['简体中文', 'English', '繁體中文', '日本語', 'Français', 'Deutsch', 'Português', 'Italiano', 'Čeština', 'Polski'], features: [['Manifest V3', '现代且安全的浏览器 API', '安全、轻量，并且不需要账号。'], ['16+ Technology Types', '一个弹窗查看完整技术栈', '从前端框架到安全响应头，按类别整理。'], ['Smart Detection', '以证据为先的结果', '每条技术线索都能回到证据和来源。'], ['Cross-browser', 'Chrome · Edge · Firefox', '一套体验覆盖主流浏览器。']]
  },
  en: {
    eyebrow: 'WEB TECHNOLOGY STACK IDENTIFIER', title: 'See the stack behind', highlight: 'every site.', tagline: 'StackPrism is a Manifest V3 browser extension that identifies frontend frameworks, CSS systems, build tools, runtimes, analytics, and security signals.', primaryCta: 'Install extension', secondaryCta: 'View on GitHub', browserLabel: 'Works with', visualCaption: 'Inspect the stack behind every page', featureLabel: 'Clear signals for developers', featuresKicker: 'STACKPRISM / FEATURES', sectionNote: 'Built for a fast, evidence-led workflow', languageLabel: '10 languages', docsKicker: 'Start here', docsTitle: 'From page clues to verifiable technology decisions.', docsBody: 'Open the extension to inspect detections, evidence, and sources. The docs cover installation, configuration, detection rules, and contribution.', docsCta: 'Read the docs', footerTagline: 'Open source web technology intelligence.', languages: ['简体中文', 'English', '繁體中文', '日本語', 'Français', 'Deutsch', 'Português', 'Italiano', 'Čeština', 'Polski'], features: [['Manifest V3', 'Modern & secure browser APIs', 'Lightweight, local-first, and no account required.'], ['16+ Technology Types', 'One popup, the whole stack', 'Frameworks, runtimes, services, and headers in one view.'], ['Smart Detection', 'Evidence-first results', 'Every signal can be traced back to its evidence and source.'], ['Cross-browser', 'Chrome · Edge · Firefox', 'One focused experience across the major browsers.']]
  }
}

const fallback: Copy = copies.en
const localized: Record<string, Partial<Copy>> = {
  'zh-TW': { title: '看見每個網站的', highlight: '技術堆疊。', tagline: 'StackPrism 是一個 Manifest V3 瀏覽器擴充功能，自動辨識前端框架、CSS 系統、建置工具、執行環境、分析服務與安全線索。', primaryCta: '安裝擴充功能', secondaryCta: '查看 GitHub', browserLabel: '支援', featureLabel: '為開發者整理的清晰線索', docsKicker: '從這裡開始', docsTitle: '從頁面線索，到可驗證的技術判斷。', docsBody: '開啟擴充功能即可查看偵測結果、證據和來源。文件站提供安裝、設定、規則開發與貢獻指南。', docsCta: '閱讀文件' },
  ja: { title: 'すべてのサイトの', highlight: '技術スタックを可視化。', tagline: 'StackPrism は Manifest V3 ブラウザー拡張機能です。フロントエンド、CSS、ビルドツール、ランタイム、分析、セキュリティの手がかりを自動検出します。', primaryCta: '拡張機能をインストール', secondaryCta: 'GitHubを見る', browserLabel: '対応ブラウザー', featureLabel: '開発者のための明確なシグナル', docsKicker: 'ここから始める', docsTitle: 'ページの手がかりを、検証可能な判断へ。', docsBody: '拡張機能を開いて検出結果、証拠、ソースを確認できます。ドキュメントではインストール、設定、ルール開発を説明します。', docsCta: 'ドキュメントを読む' },
  fr: { title: 'Découvrez la stack de', highlight: 'chaque site.', tagline: 'StackPrism est une extension Manifest V3 qui identifie les frameworks frontend, systèmes CSS, outils de build, runtimes, analytics et signaux de sécurité.', primaryCta: "Installer l’extension", secondaryCta: 'Voir sur GitHub', browserLabel: 'Compatible avec', featureLabel: 'Des signaux clairs pour les développeurs', docsKicker: 'Commencer ici', docsTitle: 'Des indices de page aux décisions techniques vérifiables.', docsBody: 'Ouvrez l’extension pour inspecter les détections, preuves et sources. La documentation couvre l’installation, la configuration et les règles.', docsCta: 'Lire la documentation' },
  de: { title: 'Den Stack hinter', highlight: 'jeder Website sehen.', tagline: 'StackPrism ist eine Manifest-V3-Browser-Erweiterung, die Frontend-Frameworks, CSS-Systeme, Build-Tools, Runtimes, Analytics und Sicherheitssignale erkennt.', primaryCta: 'Erweiterung installieren', secondaryCta: 'Auf GitHub ansehen', browserLabel: 'Unterstützt', featureLabel: 'Klare Signale für Entwickler', docsKicker: 'Hier starten', docsTitle: 'Von Seitenhinweisen zu überprüfbaren Technologieentscheidungen.', docsBody: 'Öffnen Sie die Erweiterung, um Erkennungen, Belege und Quellen zu prüfen. Die Dokumentation erklärt Installation, Konfiguration und Regeln.', docsCta: 'Dokumentation lesen' },
  pt: { title: 'Veja a stack por trás de', highlight: 'cada site.', tagline: 'StackPrism é uma extensão Manifest V3 que identifica frameworks frontend, sistemas CSS, ferramentas de build, runtimes, analytics e sinais de segurança.', primaryCta: 'Instalar extensão', secondaryCta: 'Ver no GitHub', browserLabel: 'Funciona com', featureLabel: 'Sinais claros para desenvolvedores', docsKicker: 'Comece aqui', docsTitle: 'Dos sinais da página a decisões técnicas verificáveis.', docsBody: 'Abra a extensão para conferir detecções, evidências e fontes. A documentação cobre instalação, configuração e regras.', docsCta: 'Ler documentação' },
  it: { title: 'Scopri lo stack dietro', highlight: 'ogni sito.', tagline: 'StackPrism è un’estensione Manifest V3 che identifica framework frontend, sistemi CSS, strumenti di build, runtime, analytics e segnali di sicurezza.', primaryCta: 'Installa estensione', secondaryCta: 'Vedi su GitHub', browserLabel: 'Compatibile con', featureLabel: 'Segnali chiari per gli sviluppatori', docsKicker: 'Inizia qui', docsTitle: 'Dagli indizi della pagina a decisioni tecniche verificabili.', docsBody: 'Apri l’estensione per controllare rilevamenti, prove e fonti. La documentazione copre installazione, configurazione e regole.', docsCta: 'Leggi la documentazione' },
  cs: { title: 'Poznejte stack za', highlight: 'každým webem.', tagline: 'StackPrism je rozšíření Manifest V3, které rozpozná frontendové frameworky, CSS systémy, build nástroje, runtime, analytiku a bezpečnostní signály.', primaryCta: 'Nainstalovat rozšíření', secondaryCta: 'Zobrazit na GitHubu', browserLabel: 'Funguje s', featureLabel: 'Jasné signály pro vývojáře', docsKicker: 'Začněte zde', docsTitle: 'Od stop na stránce k ověřitelným technickým rozhodnutím.', docsBody: 'Otevřete rozšíření a prohlédněte si detekce, důkazy a zdroje. Dokumentace pokrývá instalaci, konfiguraci a pravidla.', docsCta: 'Číst dokumentaci' },
  pl: { title: 'Zobacz stack za', highlight: 'każdą witryną.', tagline: 'StackPrism to rozszerzenie Manifest V3, które rozpoznaje frameworki frontendu, systemy CSS, narzędzia build, runtime, analitykę i sygnały bezpieczeństwa.', primaryCta: 'Zainstaluj rozszerzenie', secondaryCta: 'Zobacz na GitHubie', browserLabel: 'Działa z', featureLabel: 'Czytelne sygnały dla deweloperów', docsKicker: 'Zacznij tutaj', docsTitle: 'Od śladów strony do weryfikowalnych decyzji technicznych.', docsBody: 'Otwórz rozszerzenie, aby sprawdzić wykrycia, dowody i źródła. Dokumentacja obejmuje instalację, konfigurację i reguły.', docsCta: 'Czytaj dokumentację' }
}
const localizedLabels: Record<string, Partial<Copy>> = {
  'zh-TW': { eyebrow: '網頁技術堆疊識別器', visualCaption: '即時查看每個頁面背後的技術堆疊', featuresKicker: 'STACKPRISM / 功能', sectionNote: '為快速且可追溯的偵測流程而設計', footerTagline: '開源網站技術情報工具。', features: [['Manifest V3', '現代且安全的瀏覽器 API', '安全、輕量，不需要帳號。'], ['16+ Technology Types', '一個彈窗查看完整堆疊', '從前端框架到安全標頭都按類別整理。'], ['Smart Detection', '以證據為先的結果', '每條線索都能回到證據和來源。'], ['Cross-browser', 'Chrome · Edge · Firefox', '一套體驗支援主流瀏覽器。']] },
  ja: { eyebrow: 'ウェブ技術スタック識別ツール', visualCaption: 'すべてのページの技術スタックを確認', featuresKicker: 'STACKPRISM / 機能', sectionNote: '高速で根拠のある検出ワークフロー', footerTagline: 'オープンソースのウェブ技術インテリジェンス。', features: [['Manifest V3', '最新で安全なブラウザー API', '軽量で、アカウントは不要です。'], ['16+ Technology Types', 'ポップアップでスタック全体を確認', 'フレームワークからヘッダーまで分類表示。'], ['Smart Detection', '証拠を優先した結果', 'すべてのシグナルを根拠とソースへ追跡。'], ['Cross-browser', 'Chrome · Edge · Firefox', '主要ブラウザーで同じ体験を提供。']] },
  fr: { eyebrow: 'IDENTIFICATEUR DE STACK WEB', visualCaption: 'Inspectez la stack derrière chaque page', featuresKicker: 'STACKPRISM / FONCTIONNALITÉS', sectionNote: 'Pensé pour un flux de détection rapide et vérifiable', footerTagline: 'Intelligence open source sur les technologies web.', features: [['Manifest V3', 'API navigateur modernes et sûres', 'Léger, local et sans compte.'], ['16+ Technology Types', 'Toute la stack dans une popup', 'Frameworks, runtimes et en-têtes classés.'], ['Smart Detection', 'Résultats fondés sur les preuves', 'Chaque signal renvoie à sa preuve et sa source.'], ['Cross-browser', 'Chrome · Edge · Firefox', 'Une expérience cohérente sur les navigateurs majeurs.']] },
  de: { eyebrow: 'IDENTIFIKATOR FÜR WEB-TECHNOLOGIE-STACKS', visualCaption: 'Den Stack hinter jeder Seite prüfen', featuresKicker: 'STACKPRISM / FUNKTIONEN', sectionNote: 'Für schnelle, nachvollziehbare Erkennung entwickelt', footerTagline: 'Open-Source-Intelligence für Webtechnologien.', features: [['Manifest V3', 'Moderne und sichere Browser-APIs', 'Leichtgewichtig und ohne Konto.'], ['16+ Technology Types', 'Der gesamte Stack in einem Popup', 'Frameworks, Runtimes und Header kategorisiert.'], ['Smart Detection', 'Ergebnisse mit Belegen', 'Jedes Signal führt zu Beleg und Quelle zurück.'], ['Cross-browser', 'Chrome · Edge · Firefox', 'Eine fokussierte Erfahrung in allen großen Browsern.']] },
  pt: { eyebrow: 'IDENTIFICADOR DE STACK DE TECNOLOGIA WEB', visualCaption: 'Veja a stack por trás de cada página', featuresKicker: 'STACKPRISM / RECURSOS', sectionNote: 'Criado para uma detecção rápida e verificável', footerTagline: 'Inteligência open source sobre tecnologias web.', features: [['Manifest V3', 'APIs modernas e seguras', 'Leve, local e sem conta.'], ['16+ Technology Types', 'A stack inteira em um popup', 'Frameworks, runtimes e cabeçalhos organizados.'], ['Smart Detection', 'Resultados baseados em evidências', 'Cada sinal aponta para sua evidência e fonte.'], ['Cross-browser', 'Chrome · Edge · Firefox', 'Uma experiência consistente nos principais navegadores.']] },
  it: { eyebrow: 'IDENTIFICATORE DELLO STACK WEB', visualCaption: 'Esplora lo stack dietro ogni pagina', featuresKicker: 'STACKPRISM / FUNZIONI', sectionNote: 'Pensato per un flusso di rilevamento rapido e verificabile', footerTagline: 'Intelligence open source sulle tecnologie web.', features: [['Manifest V3', 'API browser moderne e sicure', 'Leggero, locale e senza account.'], ['16+ Technology Types', 'Tutto lo stack in un popup', 'Framework, runtime e header organizzati.'], ['Smart Detection', 'Risultati basati sulle prove', 'Ogni segnale rimanda a prova e fonte.'], ['Cross-browser', 'Chrome · Edge · Firefox', 'La stessa esperienza sui browser principali.']] },
  cs: { eyebrow: 'IDENTIFIKÁTOR WEBOVÉHO TECHNOLOGICKÉHO STACKU', visualCaption: 'Prohlédněte si stack za každou stránkou', featuresKicker: 'STACKPRISM / FUNKCE', sectionNote: 'Navrženo pro rychlou a ověřitelnou detekci', footerTagline: 'Open source inteligence webových technologií.', features: [['Manifest V3', 'Moderní a bezpečná API prohlížeče', 'Lehké a bez účtu.'], ['16+ Technology Types', 'Celý stack v jednom popupu', 'Frameworky, runtime i hlavičky podle kategorií.'], ['Smart Detection', 'Výsledky s důkazy', 'Každý signál vede zpět k důkazu a zdroji.'], ['Cross-browser', 'Chrome · Edge · Firefox', 'Stejný přehled v hlavních prohlížečích.']] },
  pl: { eyebrow: 'IDENTYFIKATOR TECHNOLOGII WEBOWYCH', visualCaption: 'Sprawdź stack za każdą stroną', featuresKicker: 'STACKPRISM / FUNKCJE', sectionNote: 'Stworzone do szybkiego i weryfikowalnego wykrywania', footerTagline: 'Open source intelligence o technologiach webowych.', features: [['Manifest V3', 'Nowoczesne i bezpieczne API przeglądarki', 'Lekkie i bez konta.'], ['16+ Technology Types', 'Cały stack w jednym popupie', 'Frameworki, runtime i nagłówki w kategoriach.'], ['Smart Detection', 'Wyniki oparte na dowodach', 'Każdy sygnał prowadzi do dowodu i źródła.'], ['Cross-browser', 'Chrome · Edge · Firefox', 'Jedno doświadczenie w głównych przeglądarkach.']] }
}
const copy = computed(() => ({ ...fallback, ...(copies[lang.value] || {}), ...(localized[lang.value] || {}), ...(localizedLabels[lang.value] || {}) }) as Copy)
const localePrefix = computed(() => (lang.value === 'zh-CN' ? '' : `/${lang.value}`))
const docsLink = computed(() => `${localePrefix.value}/guide/`)
const installLink = computed(() => `${localePrefix.value}/guide/install.html`)
const installMenuTitle = computed(() => ({
  'zh-CN': '选择浏览器商店',
  en: 'Choose a browser store',
  'zh-TW': '選擇瀏覽器商店',
  ja: 'ブラウザーのストアを選択',
  fr: 'Choisir un store de navigateur',
  de: 'Browser-Store auswählen',
  pt: 'Escolha uma loja de navegador',
  it: 'Scegli lo store del browser',
  cs: 'Vyberte obchod prohlížeče',
  pl: 'Wybierz sklep przeglądarki'
}[lang.value] || 'Choose a browser store'))

const featureIcons = [ShieldCheck, Layers3, ScanSearch, Puzzle]
</script>

<template>
  <main class="sp-home">
    <div class="sp-ambient sp-ambient-left"></div>
    <div class="sp-ambient sp-ambient-right"></div>
    <div class="sp-home-shell">
      <HeroSection
        :eyebrow="copy.eyebrow"
        :title="copy.title"
        :highlight="copy.highlight"
        :tagline="copy.tagline"
        :primary-cta="copy.primaryCta"
        :secondary-cta="copy.secondaryCta"
        :primary-link="installLink"
        secondary-link="https://github.com/setube/stackprism"
        :browser-label="copy.browserLabel"
        :install-menu-title="installMenuTitle"
      />

      <section class="sp-feature-section" aria-labelledby="feature-heading">
        <div class="sp-section-heading">
          <div><span class="sp-section-kicker">{{ copy.featuresKicker }}</span><h2 id="feature-heading">{{ copy.featureLabel }}</h2></div>
          <span class="sp-section-note">{{ copy.sectionNote }}</span>
        </div>
        <div class="sp-feature-grid">
          <FeatureCard v-for="(feature, index) in copy.features" :key="feature[0]" :icon="featureIcons[index]" :eyebrow="feature[0]" :title="feature[1]" :detail="feature[2]" />
        </div>
      </section>

      <LanguageBanner :label="copy.languageLabel" :languages="copy.languages" />

      <section class="sp-docs-cta">
        <div class="sp-docs-visual"><div class="sp-docs-window"><div class="sp-window-bar"><span></span><span></span><span></span><small>docs/guide/</small></div><div class="sp-window-content"><span class="sp-code-line is-purple">export interface</span><span class="sp-code-line">Technology { '{' }</span><span class="sp-code-line is-teal">  name: string</span><span class="sp-code-line is-blue">  confidence: number</span><span class="sp-code-line">{ '}' }</span></div></div></div>
        <div class="sp-docs-copy"><span class="sp-section-kicker">{{ copy.docsKicker }}</span><h2>{{ copy.docsTitle }}</h2><p>{{ copy.docsBody }}</p><a class="sp-text-link" :href="docsLink">{{ copy.docsCta }} <ArrowUpRight :size="16" /></a></div>
      </section>

      <footer class="sp-home-footer"><div class="sp-footer-brand"><img src="/icon.svg" alt="" /><span>StackPrism</span></div><span>{{ copy.footerTagline }}</span><a href="https://github.com/setube/stackprism">GitHub <ArrowUpRight :size="14" /></a></footer>
    </div>
  </main>
</template>

