# 컴포넌트 외부에서 스토어 사용하기 %{#using-a-store-outside-of-a-component}%

<MasteringPiniaLink
  href="https://play.gumlet.io/embed/651ed1ec4c2f339c6860fd06"
  mp-link="https://masteringpinia.com/lessons/how-does-usestore-work"
  title="컴포넌트 외부에서 스토어 사용하기"
/>

Pinia 스토어는 모든 호출에서 같은 스토어 인스턴스를 공유하기 위해 `pinia` 인스턴스에 의존합니다. 대부분의 경우에는 `useStore()` 함수를 그냥 호출하기만 해도 바로 동작합니다. 예를 들어 `setup()`에서는 별도로 할 일이 없습니다. 하지만 컴포넌트 밖에서는 상황이 조금 다릅니다.
내부적으로 `useStore()`는 앱에 넘겨준 `pinia` 인스턴스를 _inject_합니다. 즉, `pinia` 인스턴스를 자동으로 주입할 수 없는 경우에는 `useStore()` 함수에 이를 직접 전달해야 합니다.
이 문제는 작성 중인 애플리케이션 종류에 따라 서로 다른 방식으로 해결할 수 있습니다.

<RuleKitLink />

## 싱글 페이지 애플리케이션 %{#single-page-applications}%

SSR(서버 사이드 렌더링)을 전혀 하지 않는다면, `app.use(pinia)`로 pinia 플러그인을 설치한 뒤의 모든 `useStore()` 호출은 동작합니다:

```js
import { useUserStore } from '@/stores/user'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'

// pinia가 생성되기 전에 호출되므로 실패합니다
const userStore = useUserStore()

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)

// 이제 pinia 인스턴스가 활성화되었으므로 동작합니다
const userStore = useUserStore()
```

이 규칙이 항상 적용되도록 하려면, `useStore()` 호출을 pinia 설치 이후에 항상 실행되는 함수 안으로 옮겨 _지연_시키는 것이 가장 쉽습니다.

Vue Router의 내비게이션 가드 안에서 스토어를 사용하는 다음 예제를 살펴봅시다:

```js
import { createRouter } from 'vue-router'
const router = createRouter({
  // ...
})

// import 순서에 따라 이것은 실패할 수 있습니다
const store = useUserStore()

router.beforeEach((to, from, next) => {
  // 여기서 스토어를 사용하고 싶었습니다
  if (store.isLoggedIn) next()
  else next('/login')
})

router.beforeEach((to) => {
  // 라우터는 설치된 뒤에 탐색을 시작하고
  // pinia도 함께 설치되므로 이것은 동작합니다
  const store = useUserStore()

  if (to.meta.requiresAuth && !store.isLoggedIn) return '/login'
})
```

## SSR 앱 %{#ssr-apps}%

서버 사이드 렌더링을 다룰 때는 `pinia` 인스턴스를 `useStore()`에 전달해야 합니다. 이렇게 해야 Pinia가 서로 다른 애플리케이션 인스턴스 사이에서 전역 상태를 공유하지 않습니다.

이에 대해서는 [SSR 가이드](/ssr/index.md)에서 전체 섹션을 따로 다루고 있으며, 여기서는 짧게만 설명합니다.
