import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const META_URL = 'https://pinia.vuejs.kr'
export const META_TITLE = 'Pinia 🍍'
export const META_DESCRIPTION = '직관적, Type-safe 그리고 유연한 Vue Store'

export const koConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
  description: META_DESCRIPTION,
  head: [
    ['meta', { property: 'og:url', content: META_URL }],
    ['meta', { property: 'og:description', content: META_DESCRIPTION }],
    ['meta', { property: 'twitter:url', content: META_URL }],
    ['meta', { property: 'twitter:title', content: META_TITLE }],
    ['meta', { property: 'twitter:description', content: META_DESCRIPTION }],
  ],

  themeConfig: {

    nav: [
      {
        text: '가이드',
        link: '/core-concepts/',
        activeMatch: '^/core-concepts/',
      },
      { text: 'API', link: 'https://pinia.vuejs.org/api/' },
      { text: '쿡북', link: '/cookbook/', activeMatch: '^/cookbook/' },
      {
        text: 'Links',
        items: [
          {
            text: 'Discussions',
            link: 'https://github.com/vuejs/pinia/discussions',
          },
          {
            text: 'Changelog',
            link: 'https://github.com/vuejs/pinia/blob/v3/packages/pinia/CHANGELOG.md',
          },
          {
            text: 'Vue.js Certification',
            link: 'https://certificates.dev/vuejs/?friend=VUEROUTER&utm_source=pinia_vuejs&utm_medium=link&utm_campaign=pinia_vuejs_links&utm_content=navbar',
          },
        ],
      },
      {
        text: 'v3.x',
        items: [{ text: 'v2.x', link: 'https://v2.pinia.vuejs.org' }],
      },
    ],

    sidebar: {
      // catch-all fallback
      '/': [
        {
          text: '소개',
          items: [
            {
              text: 'Pinia란?',
              link: '/introduction.html',
            },
            {
              text: '시작하기',
              link: '/getting-started.html',
            },
          ],
        },
        {
          text: '핵심 개념',
          items: [
            { text: '스토어 정의하기', link: '/core-concepts/' },
            { text: '상태(State)', link: '/core-concepts/state.html' },
            { text: '게터(Getters)', link: '/core-concepts/getters.html' },
            { text: '액션(Actions)', link: '/core-concepts/actions.html' },
            { text: '플러그인(Plugins)', link: '/core-concepts/plugins.html' },
            {
              text: '컴포넌트 외부에서의 스토어 사용',
              link: '/core-concepts/outside-component-usage.html',
            },
          ],
        },
        {
          text: '서버 사이드 렌더링 (SSR)',
          items: [
            {
              text: 'Vue와 Vite',
              link: '/ssr/',
            },
            {
              text: 'Nuxt',
              link: '/ssr/nuxt.html',
            },
          ],
        },
        {
          text: '쿡북',
          collapsed: false,
          items: [
            {
              text: '목차',
              link: '/cookbook/',
            },
            {
              text: 'Vuex ≤4에서 마이그레이션',
              link: '/cookbook/migration-vuex.html',
            },
            {
              text: '핫 모듈 교체 (HMR)',
              link: '/cookbook/hot-module-replacement.html',
            },
            {
              text: '테스트',
              link: '/cookbook/testing.html',
            },
            {
              text: 'setup() 없이 사용하기',
              link: '/cookbook/options-api.html',
            },
            {
              text: '스토어 구성하기',
              link: '/cookbook/composing-stores.html',
            },
            {
              text: 'VSCode 스니펫',
              link: '/cookbook/vscode-snippets.html',
            },
            {
              text: 'v2에서 v3로 마이그레이션',
              link: '/cookbook/migration-v2-v3.html',
            },
            {
              text: 'v0/v1에서 v2로 마이그레이션',
              link: '/cookbook/migration-v1-v2.html',
            },
            {
              text: '컴포저블 다루기',
              link: '/cookbook/composables.html',
            },
          ],
        },
      ],
    }
    ,
  },
}

export const koSearch: DefaultTheme.AlgoliaSearchOptions = {
  appId: 'PTO6MRQ22K',
  apiKey: 'e0f61835af3061f18d9b9fdb0f49aa9f',
  indexName: 'pinia-vuejs',
  placeholder: '문서 검색',
  translations: {
    button: {
      buttonText: '검색',
      buttonAriaLabel: '검색',
    },
    modal: {
      searchBox: {
        resetButtonTitle: '검색 지우기',
        resetButtonAriaLabel: '검색 지우기',
        cancelButtonText: '취소',
        cancelButtonAriaLabel: '취소',
      },
      startScreen: {
        recentSearchesTitle: '검색 기록',
        noRecentSearchesText: '최근 검색 없음',
        saveRecentSearchButtonTitle: '검색 기록에 저장',
        removeRecentSearchButtonTitle: '검색 기록에서 삭제',
        favoriteSearchesTitle: '즐겨찾기',
        removeFavoriteSearchButtonTitle: '즐겨찾기에서 삭제',
      },
      errorScreen: {
        titleText: '결과를 가져올 수 없습니다',
        helpText: '네트워크 연결을 확인하세요',
      },
      footer: {
        selectText: '선택',
        navigateText: '탐색',
        closeText: '닫기',
        searchByText: '검색 기준',
      },
      noResultsScreen: {
        noResultsText: '결과를 찾을 수 없습니다',
        suggestedQueryText: '새로운 검색을 시도할 수 있습니다',
        reportMissingResultsText: '해당 검색어에 대한 결과가 있어야 합니까?',
        reportMissingResultsLinkText: '피드백 보내기 클릭',
      },
    },
  },
}
