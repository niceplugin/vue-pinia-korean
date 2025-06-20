import { defineConfig } from 'vitepress'
import { koSearch } from './ko'

export const META_IMAGE = 'https://pinia.vuejs.org/social.png'

const rControl = /[\u0000-\u001f]/g
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g
const rCombining = /[\u0300-\u036F]/g

/**
 * Default slugification function
 */
export const slugify = (str: string): string =>
  str
    .normalize('NFKD')
    // Remove accents
    .replace(rCombining, '')
    // Remove control characters
    .replace(rControl, '')
    // Replace special characters
    .replace(rSpecial, '-')
    // ensure it doesn't start with a number
    .replace(/^(\d)/, '_$1')

export const sharedConfig = defineConfig({
  srcDir: 'docs',

  title: 'Pinia',
  appearance: 'dark',

  markdown: {
    theme: {
      dark: 'dracula-soft',
      light: 'vitesse-light',
    },

    attrs: {
      leftDelimiter: '%{',
      rightDelimiter: '}%',
    },

    anchor: {
      slugify,
    },
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],

    ['meta', { property: 'og:type', content: 'website'}],

    ['meta', { property: 'twitter:card', content: 'summary_large_image'}],
    ['meta', { property: 'twitter:image', content: META_IMAGE }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    outline: {
      label: '이 페이지 목차',
      level: [2, 3]
    },

    socialLinks: [
      { icon: 'x', link: 'https://twitter.com/posva' },
      {
        icon: 'github',
        link: 'https://github.com/vuejs/pinia',
      },
      {
        icon: 'discord',
        link: 'https://chat.vuejs.org',
      },
    ],

    footer: {
      message: '모두를 위한 문서 한글화',
    },

    editLink: {
      pattern: 'https://github.com/niceplugin/vue-pinia-korean/edit/issue/docs/:path',
      text: '이 페이지 편집 제안하기',
    },

    search: {
      provider: 'algolia',
      options: { ...koSearch },
    },
  },
})
