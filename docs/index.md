---
layout: home

title: Pinia
titleTemplate: Vue.js를 위한 직관적인 스토어

hero:
  name: Pinia
  text: Vue.js를 위한 직관적인 스토어
  tagline: 타입 안전하고, 확장 가능하며, 설계부터 모듈식입니다. 스토어를 쓰고 있다는 사실조차 잊게 됩니다.
  image:
    src: /logo.svg
    alt: Pinia
  actions:
    - theme: brand
      text: 시작하기
      link: /introduction
    - theme: alt
      text: 데모
      link: https://stackblitz.com/github/piniajs/example-vue-3-vite
    - theme: cta rulekit
      text: RuleKit
      link: https://rulekit.dev?from=pinia
    - theme: cta mastering-pinia
      text: ' '
      link: https://masteringpinia.com
    - theme: cta vueschool
      text: 소개 영상 보기
      link: https://vueschool.io/lessons/introduction-to-pinia?friend=vuerouter&utm_source=pinia&utm_medium=link&utm_campaign=homepage
    - theme: cta vue-mastery
      text: Pinia 치트시트 받기
      link: https://www.vuemastery.com/pinia?coupon=PINIA-DOCS&via=eduardo

features:
  - title: 💡 직관적
    details: 스토어는 컴포넌트만큼 익숙합니다. 잘 정리된 스토어를 작성할 수 있도록 API가 설계되었습니다.
  - title: 🔑 타입 안전
    details: 타입이 추론되므로 JavaScript에서도 자동완성을 제공합니다!
  - title: ⚙️ 개발자 도구 지원
    details: Pinia는 Vue 개발자 도구와 연동되어 더 향상된 개발 경험을 제공합니다.
  - title: 🔌 확장 가능
    details: 스토어 변경과 액션에 반응하여 트랜잭션, 로컬 스토리지 동기화 등으로 Pinia를 확장할 수 있습니다.
  - title: 🏗 설계부터 모듈식
    details: 여러 스토어를 만들고 번들러가 자동으로 코드를 분할하도록 하세요.
  - title: 📦 매우 가벼움
    details: Pinia의 크기는 약 1.5kb에 불과해, 존재를 잊게 될 것입니다!
---

<script setup>
import HomeSponsors from './.vitepress/theme/components/HomeSponsors.vue'
import './.vitepress/theme/styles/home-links.css'
</script>

<HomeSponsors />
