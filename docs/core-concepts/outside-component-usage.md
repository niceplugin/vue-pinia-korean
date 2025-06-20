# 컴포넌트 외부에서 스토어 사용하기 %{#using-a-store-outside-of-a-component}%

<MasteringPiniaLink
  href="https://play.gumlet.io/embed/651ed1ec4c2f339c6860fd06"
  mp-link="https://masteringpinia.com/lessons/how-does-usestore-work"
  title="컴포넌트 외부에서 스토어 사용하기"
/>

Pinia 스토어는 모든 호출에서 동일한 스토어 인스턴스를 공유하기 위해 `pinia` 인스턴스에 의존합니다. 대부분의 경우, 단순히 `useStore()` 함수를 호출하면 바로 동작합니다. 예를 들어, `setup()`에서는 추가로 아무것도 할 필요가 없습니다. 하지만 컴포넌트 외부에서는 약간 다릅니다.
내부적으로, `useStore()`는 여러분이 `app`에 제공한 `pinia` 인스턴스를 _주입_합니다. 이는 `pinia` 인스턴스가 자동으로 주입될 수 없는 경우, 직접 `useStore()` 함수에 제공해야 함을 의미합니다.
작성하는 애플리케이션의 종류에 따라 이를 다르게 해결할 수 있습니다.

## 싱글 페이지 애플리케이션 %{#single-page-applications}%

SSR(서버 사이드 렌더링)을 사용하지 않는 경우, `app.use(pinia)`로 pinia 플러그인을 설치한 후의 모든 `useStore()` 호출은 정상적으로 동작합니다:

```js
import { useUserStore } from '@/stores/user'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'

// ❌  pinia가 생성되기 전에 호출되어 실패함
const userStore = useUserStore()

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)

// ✅ 이제 pinia 인스턴스가 활성화되어 정상 동작함
const userStore = useUserStore()
```

이것이 항상 적용되도록 보장하는 가장 쉬운 방법은, `useStore()` 호출을 pinia가 설치된 이후에 항상 실행되는 함수 내부에 _지연_시키는 것입니다.

다음은 Vue Router의 네비게이션 가드 내에서 스토어를 사용하는 예시입니다:

```js
import { createRouter } from 'vue-router'
const router = createRouter({
  // ...
})

// ❌ import 순서에 따라 실패할 수 있음
const store = useUserStore()

router.beforeEach((to, from, next) => {
  // 여기서 스토어를 사용하고자 했음
  if (store.isLoggedIn) next()
  else next('/login')
})

router.beforeEach((to) => {
  // ✅ 라우터가 설치된 후 네비게이션이 시작되므로
  // pinia도 설치되어 이 코드는 정상 동작함
  const store = useUserStore()

  if (to.meta.requiresAuth && !store.isLoggedIn) return '/login'
})
```

## SSR 앱 %{#ssr-apps}%

서버 사이드 렌더링을 다룰 때는, `pinia` 인스턴스를 `useStore()`에 전달해야 합니다. 이는 pinia가 서로 다른 애플리케이션 인스턴스 간에 전역 상태를 공유하지 않도록 방지합니다.

이에 대한 전체 내용은 [SSR 가이드](/ssr/index.md)에 자세히 설명되어 있으며, 여기는 간단한 설명만 제공합니다.
