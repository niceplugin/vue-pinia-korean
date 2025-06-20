# 서버 사이드 렌더링 (SSR) %{#server-side-rendering-ssr}%

<MasteringPiniaLink
  href="https://masteringpinia.com/lessons/ssr-friendly-state"
  title="SSR 모범 사례에 대해 알아보기"
/>

:::tip
**Nuxt**를 사용하고 있다면, 대신 [**이 안내문**](./nuxt.md)을 읽어야 합니다.
:::

Pinia로 스토어를 생성하는 것은 `setup` 함수, `getters`, `actions`의 맨 위에서 `useStore()` 함수를 호출하기만 하면 SSR에서 바로 동작해야 합니다:

```vue
<script setup>
// 이것이 동작하는 이유는 pinia가 어떤 애플리케이션이
// `setup` 안에서 실행되고 있는지 알기 때문입니다.
const main = useMainStore()
</script>
```

## `setup()` 외부에서 스토어 사용하기 %{#using-the-store-outside-of-setup}%

스토어를 다른 곳에서 사용해야 한다면, [앱에 전달된](../getting-started.md#installation) `pinia` 인스턴스를 `useStore()` 함수 호출에 전달해야 합니다:

```js
const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)

router.beforeEach((to) => {
  // ✅ 이것은 동작합니다. 현재 실행 중인 앱에 대해 올바른 스토어가
  // 사용되도록 보장합니다.
  const main = useMainStore(pinia)

  if (to.meta.requiresAuth && !main.isLoggedIn) return '/login'
})
```

Pinia는 편리하게도 자신을 `$pinia`로 앱에 추가하므로, `serverPrefetch()`와 같은 함수에서 사용할 수 있습니다:

```js
export default {
  serverPrefetch() {
    const store = useStore(this.$pinia)
  },
}
```

`onServerPrefetch()`를 사용할 때는 특별히 할 일이 없습니다:

```vue
<script setup>
const store = useStore()
onServerPrefetch(async () => {
  // ✅ 이것은 동작합니다.
  await store.fetchData()
})
</script>
```

## 상태 하이드레이션 %{#state-hydration}%

초기 상태를 하이드레이트하려면, Pinia가 나중에 이를 가져올 수 있도록 rootState가 HTML 어딘가에 포함되어야 합니다. SSR에서 무엇을 사용하느냐에 따라, **보안상의 이유로 상태를 이스케이프해야 합니다.** Nuxt에서 사용하는 [devalue](https://github.com/Rich-Harris/devalue)를 사용하는 것을 권장합니다:

```js
import devalue from 'devalue'
import { createPinia } from 'pinia'
// 서버 사이드에서 rootState를 가져옵니다.
const pinia = createPinia()
const app = createApp(App)
app.use(router)
app.use(pinia)

// 페이지 렌더링 후, root state가 생성되어 `pinia.state.value`에서
// 직접 읽을 수 있습니다.

// 직렬화, 이스케이프(상태의 내용이 사용자가 변경할 수 있는 경우가 거의 항상
// 그렇기 때문에 매우 중요), 그리고 페이지 어딘가에, 예를 들어 전역 변수로
// 배치합니다.
devalue(pinia.state.value)
```

SSR에서 무엇을 사용하느냐에 따라, HTML에 직렬화될 _초기 상태_ 변수를 설정하게 됩니다. 또한 XSS 공격으로부터 자신을 보호해야 합니다. 필요에 따라 [다른 대안들](https://github.com/Rich-Harris/devalue#see-also)을 `devalue` 대신 사용할 수 있습니다. 예를 들어, 상태를 `JSON.stringify()`/`JSON.parse()`로 직렬화 및 파싱할 수 있다면, **성능을 크게 향상시킬 수 있습니다.**

Nuxt를 사용하지 않는 경우 상태의 직렬화와 하이드레이션을 직접 처리해야 합니다. 다음은 몇 가지 예시입니다:

- [Vitesse 템플릿](https://github.com/antfu/vitesse/blob/main/src/modules/pinia.ts)
- [vite-plugin-ssr](https://vite-plugin-ssr.com/pinia)

이 전략을 자신의 환경에 맞게 적용하세요. **클라이언트 사이드에서 어떤 `useStore()` 함수도 호출하기 전에 반드시 pinia의 상태를 하이드레이트해야 합니다.** 예를 들어, 상태를 `<script>` 태그에 직렬화하여 클라이언트 사이드에서 `window.__pinia`를 통해 전역적으로 접근할 수 있게 했다면, 다음과 같이 작성할 수 있습니다:

```ts
const pinia = createPinia()
const app = createApp(App)
app.use(pinia)

// `isClient`는 환경에 따라 다릅니다. 예를 들어 Nuxt에서는 `import.meta.client`입니다.
if (isClient) {
  pinia.state.value = JSON.parse(window.__pinia)
}
```
