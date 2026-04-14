# 서버 사이드 렌더링 (SSR) %{#server-side-rendering-ssr}%

<MasteringPiniaLink
  href="https://masteringpinia.com/lessons/ssr-friendly-state"
  title="SSR 모범 사례 알아보기"
/>

:::tip
**Nuxt를 사용 중이라면,** 대신 [**이 안내**](./nuxt.md)를 읽어야 합니다.
:::

Pinia로 스토어를 만드는 일은 `useStore()` 함수를 `setup` 함수, `getter`, `action`의 맨 위에서 호출하기만 하면 SSR에서도 바로 동작해야 합니다:

```vue
<script setup>
// pinia는 현재 어떤 애플리케이션 안에서 실행 중인지 알고 있으므로
// `setup` 안에서는 이것이 동작합니다
const main = useMainStore()
</script>
```

<RuleKitLink />

## `setup()` 밖에서 스토어 사용하기 %{#using-the-store-outside-of-setup}%

다른 곳에서 스토어를 사용해야 한다면, `useStore()` 함수 호출에 [앱에 전달했던](../getting-started.md#installation) `pinia` 인스턴스를 함께 넘겨야 합니다:

```js
const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)

router.beforeEach((to) => {
  // 이렇게 하면 현재 실행 중인 앱에 맞는 올바른 스토어가
  // 사용되도록 보장할 수 있습니다
  const main = useMainStore(pinia)

  if (to.meta.requiresAuth && !main.isLoggedIn) return '/login'
})
```

Pinia는 편의를 위해 앱에 자신을 `$pinia`로 추가하므로, `serverPrefetch()` 같은 함수 안에서도 사용할 수 있습니다:

```js
export default {
  serverPrefetch() {
    const store = useStore(this.$pinia)
  },
}
```

`onServerPrefetch()`를 사용할 때는 특별히 할 일이 없다는 점에 유의하세요:

```vue
<script setup>
const store = useStore()
onServerPrefetch(async () => {
  // 이것은 동작합니다
  await store.fetchData()
})
</script>
```

## 상태 하이드레이션 %{#state-hydration}%

초기 상태를 하이드레이션하려면, 나중에 Pinia가 가져갈 수 있도록 rootState가 HTML 어딘가에 포함되어 있어야 합니다. SSR에 무엇을 사용하는지에 따라, **보안상의 이유로 상태를 이스케이프해야 합니다**. Nuxt에서도 사용하는 [devalue](https://github.com/Rich-Harris/devalue)를 권장합니다:

```js
import devalue from 'devalue'
import { createPinia } from 'pinia'
// 서버 측에서 rootState를 가져옵니다
const pinia = createPinia()
const app = createApp(App)
app.use(router)
app.use(pinia)

// 페이지를 렌더링한 뒤에는 루트 상태가 만들어지며
// `pinia.state.value`에서 직접 읽을 수 있습니다.

// 직렬화하고, 이스케이프하고(상태 내용이 사용자의 입력으로
// 바뀔 수 있다면 이것은 매우 중요하며, 거의 항상 그렇습니다),
// 페이지 어딘가에 두세요. 예를 들어 전역 변수로 둘 수 있습니다.
devalue(pinia.state.value)
```

SSR에 무엇을 사용하는지에 따라 HTML 안에 직렬화될 _초기 상태_ 변수를 설정하게 됩니다. 또한 XSS 공격에도 대비해야 합니다. 필요에 따라 `devalue`의 [다른 대안](https://github.com/Rich-Harris/devalue#see-also)을 사용할 수 있습니다. 예를 들어 `JSON.stringify()`/`JSON.parse()`로 상태를 직렬화하고 파싱할 수 있다면, **성능을 크게 개선할 수 있습니다**.

Nuxt를 사용하지 않는다면 상태의 직렬화와 하이드레이션을 직접 처리해야 합니다. 다음은 몇 가지 예시입니다:

- [Vitesse template](https://github.com/antfu/vitesse/blob/main/src/modules/pinia.ts)
- [vite-plugin-ssr](https://vite-plugin-ssr.com/pinia)

이 전략을 자신의 환경에 맞게 조정하세요. **클라이언트 측에서 어떤 `useStore()` 함수보다도 먼저 pinia의 상태를 하이드레이션해야 합니다**. 예를 들어 상태를 `<script>` 태그에 직렬화하여 클라이언트에서 `window.__pinia`를 통해 전역으로 접근 가능하게 만들었다면, 다음과 같이 작성할 수 있습니다:

```ts
const pinia = createPinia()
const app = createApp(App)
app.use(pinia)

// `isClient`는 환경에 따라 달라집니다. 예를 들어 Nuxt에서는 `import.meta.client`입니다
if (isClient) {
  pinia.state.value = JSON.parse(window.__pinia)
}
```
