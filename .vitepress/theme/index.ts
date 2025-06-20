import { h } from 'vue'
import { type Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import AsideSponsors from './components/AsideSponsors.vue'
import PiniaLogo from './components/PiniaLogo.vue'
import './styles/vars.css'
import './styles/playground-links.css'
import VueSchoolLink from './components/VueSchoolLink.vue'
import VueMasteryLogoLink from './components/VueMasteryLogoLink.vue'
import MasteringPiniaLink from './components/MasteringPiniaLink.vue'

const theme: Theme = {
  ...DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-image': () => h('div', { class: 'image-src' }, h(PiniaLogo)),
      'aside-ads-before': () => h(AsideSponsors),
    })
  },

  enhanceApp({ app }) {
    app.component('VueSchoolLink', VueSchoolLink)
    app.component('VueMasteryLogoLink', VueMasteryLogoLink)
    app.component('MasteringPiniaLink', MasteringPiniaLink)
  },
}

export default theme
