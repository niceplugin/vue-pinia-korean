---
layout: home

title: Pinia
titleTemplate: Vue.js를 위한 직관적인 스토어

hero:
  name: Pinia
  text: Vue.js를 위한 직관적인 스토어
  tagline: 타입 안전, 확장 가능, 모듈식 설계. 스토어를 사용하고 있다는 사실조차 잊게 됩니다.
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
    - theme: cta mastering-pinia
      text: ' '
      link: https://masteringpinia.com
    - theme: cta vueschool
      text: 비디오 소개 시청
      link: https://vueschool.io/lessons/introduction-to-pinia?friend=vuerouter&utm_source=pinia&utm_medium=link&utm_campaign=homepage
    - theme: cta vue-mastery
      text: Pinia 치트 시트 받기
      link: https://www.vuemastery.com/pinia?coupon=PINIA-DOCS&via=eduardo

features:
  - title: 💡 직관적
    details: 스토어는 컴포넌트만큼이나 익숙합니다. 잘 정리된 스토어를 작성할 수 있도록 설계된 API입니다.
  - title: 🔑 타입 안전
    details: 타입이 추론되어, 자바스크립트에서도 자동 완성 기능을 제공합니다!
  - title: ⚙️ 개발자 도구 지원
    details: Pinia는 Vue 개발자 도구와 연동되어 향상된 개발 경험을 제공합니다.
  - title: 🔌 확장 가능
    details: 스토어 변경 및 액션에 반응하여 트랜잭션, 로컬 스토리지 동기화 등으로 Pinia를 확장할 수 있습니다.
  - title: 🏗 설계부터 모듈식
    details: 여러 스토어를 만들고, 번들러가 자동으로 코드 분할을 하도록 하세요.
  - title: 📦 매우 가벼움
    details: Pinia의 무게는 약 1.5kb로, 존재조차 잊게 될 것입니다!
---

<script setup>
import '../.vitepress/theme/styles/home-links.css'
</script>
