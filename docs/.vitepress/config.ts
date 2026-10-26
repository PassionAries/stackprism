import { defineConfig } from 'vitepress'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE_URL, buildSeoHead, seoPageData, transformSitemapItems } from './seo'

const REPO_ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../..')

// 各语言 README 链接
const README_URLS: Record<string, string> = {
  root: 'https://github.com/setube/stackprism',
  en: 'https://github.com/setube/stackprism/blob/main/i18n/README.en.md',
  'zh-TW': 'https://github.com/setube/stackprism/blob/main/i18n/README.zh-Hant.md',
  ja: 'https://github.com/setube/stackprism/blob/main/i18n/README.ja.md',
  fr: 'https://github.com/setube/stackprism/blob/main/i18n/README.fr.md',
  de: 'https://github.com/setube/stackprism/blob/main/i18n/README.de.md',
  pt: 'https://github.com/setube/stackprism/blob/main/i18n/README.pt.md',
  it: 'https://github.com/setube/stackprism/blob/main/i18n/README.it.md',
  cs: 'https://github.com/setube/stackprism/blob/main/i18n/README.cs.md',
  pl: 'https://github.com/setube/stackprism/blob/main/i18n/README.pl.md'
}

export default defineConfig({
  vite: {
    define: {
      __VUE_PROD_DEVTOOLS__: false
    },
    resolve: {
      alias: {
        '@': path.resolve(REPO_ROOT, 'src')
      }
    }
  },
  lang: 'zh-CN',
  title: 'StackPrism',
  description: 'StackPrism 网页技术栈识别器与浏览器扩展文档。',
  srcExclude: ['baselines/**'],
  sitemap: { hostname: SITE_URL, transformItems: transformSitemapItems },
  transformPageData: seoPageData,
  transformHead: buildSeoHead,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' }],
    ['meta', { name: 'theme-color', content: '#0f766e' }]
  ],
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '使用指南', link: '/guide/' },
          { text: '配置指南', link: '/config/' },
          { text: '开发手册', link: '/dev/' },
          { text: '提交议题', link: '/feedback' },
          { text: 'GitHub', link: README_URLS.root }
        ],
        sidebar: {
          '/guide/': [
            {
              text: '使用指南',
              items: [
                { text: '概述', link: '/guide/' },
                { text: '安装与启用', link: '/guide/install' },
                { text: '基本使用', link: '/guide/basic-usage' },
                { text: '结果解读', link: '/guide/results' },
                { text: '辅助工具', link: '/guide/tools' }
              ]
            }
          ],
          '/config/': [
            {
              text: '配置指南',
              items: [
                { text: '概述', link: '/config/' },
                { text: '识别开关', link: '/config/categories' },
                { text: '禁用指定技术', link: '/config/disabled-technologies' },
                { text: '自定义弹窗样式', link: '/config/custom-css' },
                { text: '自定义规则', link: '/config/custom-rules' },
                { text: '规则 JSON 导入导出', link: '/config/json-export' }
              ]
            }
          ],
          '/dev/': [
            {
              text: '开发手册',
              items: [
                { text: '概述', link: '/dev/' },
                { text: '架构概览', link: '/dev/architecture' },
                { text: '规则文件格式', link: '/dev/rule-format' },
                { text: '检测流程', link: '/dev/detection-flow' },
                { text: '贡献规则', link: '/dev/contribute-rules' },
                { text: '构建与发布', link: '/dev/release' }
              ]
            }
          ]
        },
        docFooter: { prev: '上一页', next: '下一页' },
        outline: { label: '本页目录', level: [2, 3] },
        lastUpdatedText: '最后更新',
        darkModeSwitchLabel: '主题',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '回到顶部',
        footer: { message: '基于 MIT 协议发布', copyright: 'Copyright © 2026 StackPrism' }
      }
    },
    en: {
      label: 'English',
      lang: 'en',
      description: 'Web Technology Stack Detector · Documentation',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/' },
          { text: 'Config', link: '/en/config/' },
          { text: 'Dev', link: '/en/dev/' },
          { text: 'Issues', link: '/en/feedback' },
          { text: 'GitHub', link: README_URLS.en }
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'User Guide',
              items: [
                { text: 'Overview', link: '/en/guide/' },
                { text: 'Install & Enable', link: '/en/guide/install' },
                { text: 'Basic Usage', link: '/en/guide/basic-usage' },
                { text: 'Understanding Results', link: '/en/guide/results' },
                { text: 'Tools', link: '/en/guide/tools' }
              ]
            }
          ],
          '/en/config/': [
            {
              text: 'Configuration',
              items: [
                { text: 'Overview', link: '/en/config/' },
                { text: 'Category Toggles', link: '/en/config/categories' },
                { text: 'Disable Technologies', link: '/en/config/disabled-technologies' },
                { text: 'Custom CSS', link: '/en/config/custom-css' },
                { text: 'Custom Rules', link: '/en/config/custom-rules' },
                { text: 'JSON Export', link: '/en/config/json-export' }
              ]
            }
          ],
          '/en/dev/': [
            {
              text: 'Developer Guide',
              items: [
                { text: 'Overview', link: '/en/dev/' },
                { text: 'Architecture', link: '/en/dev/architecture' },
                { text: 'Rule Format', link: '/en/dev/rule-format' },
                { text: 'Detection Flow', link: '/en/dev/detection-flow' },
                { text: 'Contributing Rules', link: '/en/dev/contribute-rules' },
                { text: 'Build & Release', link: '/en/dev/release' }
              ]
            }
          ]
        },
        docFooter: { prev: 'Previous', next: 'Next' },
        outline: { label: 'On this page', level: [2, 3] },
        lastUpdatedText: 'Last updated',
        darkModeSwitchLabel: 'Theme',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Return to top',
        footer: { message: 'Released under MIT', copyright: 'Copyright © 2026 StackPrism' }
      }
    },
    'zh-TW': {
      label: '繁體中文',
      lang: 'zh-TW',
      themeConfig: {
        nav: [
          { text: '使用指南', link: '/zh-TW/guide/' },
          { text: '配置指南', link: '/zh-TW/config/' },
          { text: '開發手冊', link: '/zh-TW/dev/' },
          { text: '提交議題', link: '/zh-TW/feedback' },
          { text: 'GitHub', link: README_URLS['zh-TW'] }
        ],
        sidebar: {
          '/zh-TW/guide/': [
            {
              text: '使用指南',
              items: [
                { text: '概述', link: '/zh-TW/guide/' },
                { text: '安裝與啟用', link: '/zh-TW/guide/install' },
                { text: '基本使用', link: '/zh-TW/guide/basic-usage' },
                { text: '結果解讀', link: '/zh-TW/guide/results' },
                { text: '輔助工具', link: '/zh-TW/guide/tools' }
              ]
            }
          ],
          '/zh-TW/config/': [
            {
              text: '配置指南',
              items: [
                { text: '概述', link: '/zh-TW/config/' },
                { text: '識別開關', link: '/zh-TW/config/categories' },
                { text: '停用指定技術', link: '/zh-TW/config/disabled-technologies' },
                { text: '自定義彈窗樣式', link: '/zh-TW/config/custom-css' },
                { text: '自定義規則', link: '/zh-TW/config/custom-rules' },
                { text: '規則 JSON 匯入匯出', link: '/zh-TW/config/json-export' }
              ]
            }
          ],
          '/zh-TW/dev/': [
            {
              text: '開發手冊',
              items: [
                { text: '概述', link: '/zh-TW/dev/' },
                { text: '架構概覽', link: '/zh-TW/dev/architecture' },
                { text: '規則文件格式', link: '/zh-TW/dev/rule-format' },
                { text: '偵測流程', link: '/zh-TW/dev/detection-flow' },
                { text: '貢獻規則', link: '/zh-TW/dev/contribute-rules' },
                { text: '建置與發布', link: '/zh-TW/dev/release' }
              ]
            }
          ]
        },
        docFooter: { prev: '上一頁', next: '下一頁' },
        outline: { label: '本頁目錄', level: [2, 3] },
        lastUpdatedText: '最後更新',
        darkModeSwitchLabel: '主題',
        sidebarMenuLabel: '選單',
        returnToTopLabel: '回到頂部',
        footer: { message: '基於 MIT 協議發布', copyright: 'Copyright © 2026 StackPrism' }
      }
    },
    ja: {
      label: '日本語',
      lang: 'ja',
      themeConfig: {
        nav: [
          { text: '使用ガイド', link: '/ja/guide/' },
          { text: '設定ガイド', link: '/ja/config/' },
          { text: '開発ハンドブック', link: '/ja/dev/' },
          { text: 'Issue 送信', link: '/ja/feedback' },
          { text: 'GitHub', link: README_URLS.ja }
        ],
        sidebar: {
          '/ja/guide/': [
            {
              text: '使用ガイド',
              items: [
                { text: '概要', link: '/ja/guide/' },
                { text: 'インストールと有効化', link: '/ja/guide/install' },
                { text: '基本的な使い方', link: '/ja/guide/basic-usage' },
                { text: '結果の見方', link: '/ja/guide/results' },
                { text: 'ツール', link: '/ja/guide/tools' }
              ]
            }
          ],
          '/ja/config/': [
            {
              text: '設定ガイド',
              items: [
                { text: '概要', link: '/ja/config/' },
                { text: 'カテゴリ切替', link: '/ja/config/categories' },
                { text: '技術の無効化', link: '/ja/config/disabled-technologies' },
                { text: 'カスタム CSS', link: '/ja/config/custom-css' },
                { text: 'カスタムルール', link: '/ja/config/custom-rules' },
                { text: 'JSON エクスポート', link: '/ja/config/json-export' }
              ]
            }
          ],
          '/ja/dev/': [
            {
              text: '開発ハンドブック',
              items: [
                { text: '概要', link: '/ja/dev/' },
                { text: 'アーキテクチャ概要', link: '/ja/dev/architecture' },
                { text: 'ルールファイル形式', link: '/ja/dev/rule-format' },
                { text: '検出フロー', link: '/ja/dev/detection-flow' },
                { text: 'ルールへの貢献', link: '/ja/dev/contribute-rules' },
                { text: 'ビルドとリリース', link: '/ja/dev/release' }
              ]
            }
          ]
        },
        docFooter: { prev: '前のページ', next: '次のページ' },
        outline: { label: 'このページの内容', level: [2, 3] },
        lastUpdatedText: '最終更新',
        darkModeSwitchLabel: 'テーマ',
        sidebarMenuLabel: 'メニュー',
        returnToTopLabel: 'トップに戻る',
        footer: { message: 'MIT ライセンスの下で公開', copyright: 'Copyright © 2026 StackPrism' }
      }
    },
    fr: {
      label: 'Français',
      lang: 'fr',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/fr/guide/' },
          { text: 'Configuration', link: '/fr/config/' },
          { text: 'Développement', link: '/fr/dev/' },
          { text: 'Issues', link: '/fr/feedback' },
          { text: 'GitHub', link: README_URLS.fr }
        ],
        sidebar: {
          '/fr/guide/': [
            {
              text: "Guide d'utilisation",
              items: [
                { text: "Vue d'ensemble", link: '/fr/guide/' },
                { text: 'Installation', link: '/fr/guide/install' },
                { text: 'Utilisation de base', link: '/fr/guide/basic-usage' },
                { text: 'Comprendre les résultats', link: '/fr/guide/results' },
                { text: 'Outils', link: '/fr/guide/tools' }
              ]
            }
          ],
          '/fr/config/': [
            {
              text: 'Configuration',
              items: [
                { text: "Vue d'ensemble", link: '/fr/config/' },
                { text: 'Catégories', link: '/fr/config/categories' },
                { text: 'Désactiver des technologies', link: '/fr/config/disabled-technologies' },
                { text: 'CSS personnalisé', link: '/fr/config/custom-css' },
                { text: 'Règles personnalisées', link: '/fr/config/custom-rules' },
                { text: 'Export JSON', link: '/fr/config/json-export' }
              ]
            }
          ],
          '/fr/dev/': [
            {
              text: 'Guide développeur',
              items: [
                { text: "Vue d'ensemble", link: '/fr/dev/' },
                { text: 'Architecture', link: '/fr/dev/architecture' },
                { text: 'Format des règles', link: '/fr/dev/rule-format' },
                { text: 'Flux de détection', link: '/fr/dev/detection-flow' },
                { text: 'Contribuer des règles', link: '/fr/dev/contribute-rules' },
                { text: 'Build & Release', link: '/fr/dev/release' }
              ]
            }
          ]
        },
        docFooter: { prev: 'Précédent', next: 'Suivant' },
        outline: { label: 'Sur cette page', level: [2, 3] },
        lastUpdatedText: 'Dernière mise à jour',
        darkModeSwitchLabel: 'Thème',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Retour en haut',
        footer: { message: 'Publié sous licence MIT', copyright: 'Copyright © 2026 StackPrism' }
      }
    },
    de: {
      label: 'Deutsch',
      lang: 'de',
      themeConfig: {
        nav: [
          { text: 'Benutzerhandbuch', link: '/de/guide/' },
          { text: 'Konfiguration', link: '/de/config/' },
          { text: 'Entwicklung', link: '/de/dev/' },
          { text: 'Issue melden', link: '/de/feedback' },
          { text: 'GitHub', link: README_URLS.de }
        ],
        sidebar: {
          '/de/guide/': [
            {
              text: 'Benutzerhandbuch',
              items: [
                { text: 'Übersicht', link: '/de/guide/' },
                { text: 'Installation', link: '/de/guide/install' },
                { text: 'Grundlegende Nutzung', link: '/de/guide/basic-usage' },
                { text: 'Ergebnisse verstehen', link: '/de/guide/results' },
                { text: 'Werkzeuge', link: '/de/guide/tools' }
              ]
            }
          ],
          '/de/config/': [
            {
              text: 'Konfiguration',
              items: [
                { text: 'Übersicht', link: '/de/config/' },
                { text: 'Kategorieschalter', link: '/de/config/categories' },
                { text: 'Technologien deaktivieren', link: '/de/config/disabled-technologies' },
                { text: 'Eigenes CSS', link: '/de/config/custom-css' },
                { text: 'Eigene Regeln', link: '/de/config/custom-rules' },
                { text: 'JSON-Export', link: '/de/config/json-export' }
              ]
            }
          ],
          '/de/dev/': [
            {
              text: 'Entwicklerhandbuch',
              items: [
                { text: 'Übersicht', link: '/de/dev/' },
                { text: 'Architektur', link: '/de/dev/architecture' },
                { text: 'Regelformat', link: '/de/dev/rule-format' },
                { text: 'Erkennungsablauf', link: '/de/dev/detection-flow' },
                { text: 'Regeln beitragen', link: '/de/dev/contribute-rules' },
                { text: 'Build & Release', link: '/de/dev/release' }
              ]
            }
          ]
        },
        docFooter: { prev: 'Zurück', next: 'Weiter' },
        outline: { label: 'Auf dieser Seite', level: [2, 3] },
        lastUpdatedText: 'Zuletzt aktualisiert',
        darkModeSwitchLabel: 'Design',
        sidebarMenuLabel: 'Menü',
        returnToTopLabel: 'Nach oben',
        footer: { message: 'Veröffentlicht unter MIT', copyright: 'Copyright © 2026 StackPrism' }
      }
    },
    pt: {
      label: 'Português',
      lang: 'pt',
      themeConfig: {
        nav: [
          { text: 'Guia', link: '/pt/guide/' },
          { text: 'Configuração', link: '/pt/config/' },
          { text: 'Desenvolvimento', link: '/pt/dev/' },
          { text: 'Issues', link: '/pt/feedback' },
          { text: 'GitHub', link: README_URLS.pt }
        ],
        sidebar: {
          '/pt/guide/': [
            {
              text: 'Guia de uso',
              items: [
                { text: 'Visão geral', link: '/pt/guide/' },
                { text: 'Instalação', link: '/pt/guide/install' },
                { text: 'Uso básico', link: '/pt/guide/basic-usage' },
                { text: 'Entendendo os resultados', link: '/pt/guide/results' },
                { text: 'Ferramentas', link: '/pt/guide/tools' }
              ]
            }
          ],
          '/pt/config/': [
            {
              text: 'Configuração',
              items: [
                { text: 'Visão geral', link: '/pt/config/' },
                { text: 'Categorias', link: '/pt/config/categories' },
                { text: 'Desativar tecnologias', link: '/pt/config/disabled-technologies' },
                { text: 'CSS personalizado', link: '/pt/config/custom-css' },
                { text: 'Regras personalizadas', link: '/pt/config/custom-rules' },
                { text: 'Exportar JSON', link: '/pt/config/json-export' }
              ]
            }
          ],
          '/pt/dev/': [
            {
              text: 'Manual do desenvolvedor',
              items: [
                { text: 'Visão geral', link: '/pt/dev/' },
                { text: 'Arquitetura', link: '/pt/dev/architecture' },
                { text: 'Formato de regras', link: '/pt/dev/rule-format' },
                { text: 'Fluxo de detecção', link: '/pt/dev/detection-flow' },
                { text: 'Contribuir regras', link: '/pt/dev/contribute-rules' },
                { text: 'Build & Release', link: '/pt/dev/release' }
              ]
            }
          ]
        },
        docFooter: { prev: 'Anterior', next: 'Próximo' },
        outline: { label: 'Nesta página', level: [2, 3] },
        lastUpdatedText: 'Última atualização',
        darkModeSwitchLabel: 'Tema',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Voltar ao topo',
        footer: { message: 'Publicado sob MIT', copyright: 'Copyright © 2026 StackPrism' }
      }
    },
    it: {
      label: 'Italiano',
      lang: 'it',
      themeConfig: {
        nav: [
          { text: 'Guida', link: '/it/guide/' },
          { text: 'Configurazione', link: '/it/config/' },
          { text: 'Sviluppo', link: '/it/dev/' },
          { text: 'Segnalazioni', link: '/it/feedback' },
          { text: 'GitHub', link: README_URLS.it }
        ],
        sidebar: {
          '/it/guide/': [
            {
              text: "Guida all'uso",
              items: [
                { text: 'Panoramica', link: '/it/guide/' },
                { text: 'Installazione', link: '/it/guide/install' },
                { text: 'Uso di base', link: '/it/guide/basic-usage' },
                { text: 'Capire i risultati', link: '/it/guide/results' },
                { text: 'Strumenti', link: '/it/guide/tools' }
              ]
            }
          ],
          '/it/config/': [
            {
              text: 'Configurazione',
              items: [
                { text: 'Panoramica', link: '/it/config/' },
                { text: 'Categorie', link: '/it/config/categories' },
                { text: 'Disabilitare tecnologie', link: '/it/config/disabled-technologies' },
                { text: 'CSS personalizzato', link: '/it/config/custom-css' },
                { text: 'Regole personalizzate', link: '/it/config/custom-rules' },
                { text: 'Esporta JSON', link: '/it/config/json-export' }
              ]
            }
          ],
          '/it/dev/': [
            {
              text: 'Manuale di sviluppo',
              items: [
                { text: 'Panoramica', link: '/it/dev/' },
                { text: 'Architettura', link: '/it/dev/architecture' },
                { text: 'Formato delle regole', link: '/it/dev/rule-format' },
                { text: 'Flusso di rilevamento', link: '/it/dev/detection-flow' },
                { text: 'Contribuire regole', link: '/it/dev/contribute-rules' },
                { text: 'Build & Release', link: '/it/dev/release' }
              ]
            }
          ]
        },
        docFooter: { prev: 'Precedente', next: 'Successivo' },
        outline: { label: 'In questa pagina', level: [2, 3] },
        lastUpdatedText: 'Ultimo aggiornamento',
        darkModeSwitchLabel: 'Tema',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Torna su',
        footer: { message: 'Pubblicato sotto MIT', copyright: 'Copyright © 2026 StackPrism' }
      }
    },
    cs: {
      label: 'Čeština',
      lang: 'cs',
      themeConfig: {
        nav: [
          { text: 'Průvodce', link: '/cs/guide/' },
          { text: 'Konfigurace', link: '/cs/config/' },
          { text: 'Vývoj', link: '/cs/dev/' },
          { text: 'Hlášení', link: '/cs/feedback' },
          { text: 'GitHub', link: README_URLS.cs }
        ],
        sidebar: {
          '/cs/guide/': [
            {
              text: 'Uživatelský průvodce',
              items: [
                { text: 'Přehled', link: '/cs/guide/' },
                { text: 'Instalace', link: '/cs/guide/install' },
                { text: 'Základní použití', link: '/cs/guide/basic-usage' },
                { text: 'Výsledky', link: '/cs/guide/results' },
                { text: 'Nástroje', link: '/cs/guide/tools' }
              ]
            }
          ],
          '/cs/config/': [
            {
              text: 'Konfigurace',
              items: [
                { text: 'Přehled', link: '/cs/config/' },
                { text: 'Přepínače kategorií', link: '/cs/config/categories' },
                { text: 'Zakázat technologie', link: '/cs/config/disabled-technologies' },
                { text: 'Vlastní CSS', link: '/cs/config/custom-css' },
                { text: 'Vlastní pravidla', link: '/cs/config/custom-rules' },
                { text: 'Export JSON', link: '/cs/config/json-export' }
              ]
            }
          ],
          '/cs/dev/': [
            {
              text: 'Vývojářský manuál',
              items: [
                { text: 'Přehled', link: '/cs/dev/' },
                { text: 'Architektura', link: '/cs/dev/architecture' },
                { text: 'Formát pravidel', link: '/cs/dev/rule-format' },
                { text: 'Tok detekce', link: '/cs/dev/detection-flow' },
                { text: 'Přispívat pravidla', link: '/cs/dev/contribute-rules' },
                { text: 'Build & Release', link: '/cs/dev/release' }
              ]
            }
          ]
        },
        docFooter: { prev: 'Předchozí', next: 'Další' },
        outline: { label: 'Na této stránce', level: [2, 3] },
        lastUpdatedText: 'Naposledy aktualizováno',
        darkModeSwitchLabel: 'Motiv',
        sidebarMenuLabel: 'Nabídka',
        returnToTopLabel: 'Zpět nahoru',
        footer: { message: 'Vydáno pod MIT', copyright: 'Copyright © 2026 StackPrism' }
      }
    },
    pl: {
      label: 'Polski',
      lang: 'pl',
      themeConfig: {
        nav: [
          { text: 'Przewodnik', link: '/pl/guide/' },
          { text: 'Konfiguracja', link: '/pl/config/' },
          { text: 'Rozwój', link: '/pl/dev/' },
          { text: 'Zgłoszenia', link: '/pl/feedback' },
          { text: 'GitHub', link: README_URLS.pl }
        ],
        sidebar: {
          '/pl/guide/': [
            {
              text: 'Przewodnik użytkownika',
              items: [
                { text: 'Przegląd', link: '/pl/guide/' },
                { text: 'Instalacja', link: '/pl/guide/install' },
                { text: 'Podstawowe użycie', link: '/pl/guide/basic-usage' },
                { text: 'Rozumienie wyników', link: '/pl/guide/results' },
                { text: 'Narzędzia', link: '/pl/guide/tools' }
              ]
            }
          ],
          '/pl/config/': [
            {
              text: 'Konfiguracja',
              items: [
                { text: 'Przegląd', link: '/pl/config/' },
                { text: 'Przełączniki kategorii', link: '/pl/config/categories' },
                { text: 'Wyłącz technologie', link: '/pl/config/disabled-technologies' },
                { text: 'Własny CSS', link: '/pl/config/custom-css' },
                { text: 'Własne reguły', link: '/pl/config/custom-rules' },
                { text: 'Eksport JSON', link: '/pl/config/json-export' }
              ]
            }
          ],
          '/pl/dev/': [
            {
              text: 'Podręcznik deweloperski',
              items: [
                { text: 'Przegląd', link: '/pl/dev/' },
                { text: 'Architektura', link: '/pl/dev/architecture' },
                { text: 'Format reguł', link: '/pl/dev/rule-format' },
                { text: 'Przepływ detekcji', link: '/pl/dev/detection-flow' },
                { text: 'Udostępnianie reguł', link: '/pl/dev/contribute-rules' },
                { text: 'Build & Release', link: '/pl/dev/release' }
              ]
            }
          ]
        },
        docFooter: { prev: 'Poprzedni', next: 'Następny' },
        outline: { label: 'Na tej stronie', level: [2, 3] },
        lastUpdatedText: 'Ostatnia aktualizacja',
        darkModeSwitchLabel: 'Motyw',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Powrót na górę',
        footer: { message: 'Wydane na licencji MIT', copyright: 'Copyright © 2026 StackPrism' }
      }
    }
  },
  themeConfig: {
    logo: '/icon.svg',
    socialLinks: [{ icon: 'github', link: 'https://github.com/setube/stackprism' }],
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除',
            backButtonTitle: '关闭',
            noResultsText: '没有结果',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        },
        locales: {
          en: {
            translations: {
              button: { buttonText: 'Search docs', buttonAriaLabel: 'Search docs' },
              modal: {
                displayDetails: 'Display details',
                resetButtonTitle: 'Clear',
                backButtonTitle: 'Close',
                noResultsText: 'No results for',
                footer: { selectText: 'to select', navigateText: 'to navigate', closeText: 'to close' }
              }
            }
          },
          'zh-TW': {
            translations: {
              button: { buttonText: '搜尋文件', buttonAriaLabel: '搜尋文件' },
              modal: {
                displayDetails: '顯示詳情',
                resetButtonTitle: '清除',
                backButtonTitle: '關閉',
                noResultsText: '找不到結果',
                footer: { selectText: '選擇', navigateText: '切換', closeText: '關閉' }
              }
            }
          },
          ja: {
            translations: {
              button: { buttonText: 'ドキュメント検索', buttonAriaLabel: 'ドキュメント検索' },
              modal: {
                displayDetails: '詳細を表示',
                resetButtonTitle: 'クリア',
                backButtonTitle: '閉じる',
                noResultsText: '結果なし',
                footer: { selectText: '選択', navigateText: '移動', closeText: '閉じる' }
              }
            }
          },
          fr: {
            translations: {
              button: { buttonText: 'Rechercher', buttonAriaLabel: 'Rechercher dans la doc' },
              modal: {
                displayDetails: 'Afficher les détails',
                resetButtonTitle: 'Effacer',
                backButtonTitle: 'Fermer',
                noResultsText: 'Aucun résultat pour',
                footer: { selectText: 'sélectionner', navigateText: 'naviguer', closeText: 'fermer' }
              }
            }
          },
          de: {
            translations: {
              button: { buttonText: 'Suchen', buttonAriaLabel: 'Dokumentation durchsuchen' },
              modal: {
                displayDetails: 'Details anzeigen',
                resetButtonTitle: 'Löschen',
                backButtonTitle: 'Schließen',
                noResultsText: 'Keine Ergebnisse für',
                footer: { selectText: 'auswählen', navigateText: 'navigieren', closeText: 'schließen' }
              }
            }
          },
          pt: {
            translations: {
              button: { buttonText: 'Pesquisar', buttonAriaLabel: 'Pesquisar na documentação' },
              modal: {
                displayDetails: 'Exibir detalhes',
                resetButtonTitle: 'Limpar',
                backButtonTitle: 'Fechar',
                noResultsText: 'Nenhum resultado para',
                footer: { selectText: 'selecionar', navigateText: 'navegar', closeText: 'fechar' }
              }
            }
          },
          it: {
            translations: {
              button: { buttonText: 'Cerca', buttonAriaLabel: 'Cerca nella documentazione' },
              modal: {
                displayDetails: 'Mostra dettagli',
                resetButtonTitle: 'Cancella',
                backButtonTitle: 'Chiudi',
                noResultsText: 'Nessun risultato per',
                footer: { selectText: 'seleziona', navigateText: 'naviga', closeText: 'chiudi' }
              }
            }
          },
          cs: {
            translations: {
              button: { buttonText: 'Hledat', buttonAriaLabel: 'Prohledat dokumentaci' },
              modal: {
                displayDetails: 'Zobrazit podrobnosti',
                resetButtonTitle: 'Vymazat',
                backButtonTitle: 'Zavřít',
                noResultsText: 'Žádné výsledky pro',
                footer: { selectText: 'vybrat', navigateText: 'procházet', closeText: 'zavřít' }
              }
            }
          },
          pl: {
            translations: {
              button: { buttonText: 'Szukaj', buttonAriaLabel: 'Przeszukaj dokumentację' },
              modal: {
                displayDetails: 'Pokaż szczegóły',
                resetButtonTitle: 'Wyczyść',
                backButtonTitle: 'Zamknij',
                noResultsText: 'Brak wyników dla',
                footer: { selectText: 'wybierz', navigateText: 'nawiguj', closeText: 'zamknij' }
              }
            }
          }
        }
      }
    }
  }
})
