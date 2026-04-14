# Nuxt %{#nuxt}%

<MasteringPiniaLink
  href="https://masteringpinia.com/lessons/ssr-friendly-state"
  title="SSR 모범 사례 알아보기"
/>

[Nuxt](https://nuxt.com/)와 함께 Pinia를 사용하는 것은 더 쉽습니다. Nuxt가 _서버 사이드 렌더링_과 관련된 많은 일을 처리해 주기 때문입니다. 예를 들어 **직렬화나 XSS 공격을 신경 쓸 필요가 없습니다**. Pinia는 Nuxt 3와 4를 지원합니다.

<RuleKitLink />

## 설치 %{#installation}%

```bash
npx nuxi@latest module add pinia
```

이 명령은 `@pinia/nuxt`와 `pinia`를 모두 프로젝트에 추가합니다. **`pinia`가 설치되지 않은 것을 발견했다면, 패키지 매니저로 직접 설치해 주세요**: `npm i pinia`.

:::tip
npm을 사용 중이라면 _ERESOLVE unable to resolve dependency tree_ 오류를 만날 수 있습니다. 이 경우 `package.json`에 다음을 추가하세요:

```js
"overrides": {
  "vue": "latest"
}
```

:::

모든 것을 처리해 주는 _module_을 제공하므로, `nuxt.config.js` 파일의 `modules`에 추가하기만 하면 됩니다:

```js
// nuxt.config.js
export default defineNuxtConfig({
  // ... 다른 옵션
  modules: [
    // ...
    '@pinia/nuxt',
  ],
})
```

이제 끝입니다. 평소처럼 스토어를 사용하세요!

## 페이지에서 action 기다리기 %{#awaiting-for-actions-in-pages}%

`onServerPrefetch()`와 마찬가지로 `callOnce()` 컴포저블 안에서 스토어 action을 호출할 수 있습니다.
이렇게 하면 Nuxt가 action을 한 번만 실행하므로 이미 존재하는 데이터를 다시 가져오는 일을 피할 수 있습니다.

```vue{3-4}
<script setup>
const store = useStore()
// 데이터를 따로 꺼낼 수도 있지만, 이미 스토어 안에 있습니다
await callOnce('user', () => store.fetchUser())
</script>
```

요구 사항에 따라 action을 클라이언트에서 한 번만 실행할지, 아니면 모든 내비게이션마다 실행할지 선택할 수 있습니다(`useFetch()`/`useAsyncData()`의 데이터 가져오기 동작에 더 가깝습니다)

```vue{3}
<script setup>
const store = useStore()
await callOnce('user', () => store.fetchUser(), { mode: 'navigation' })
</script>
```

::: tip

`setup()`이나 _injection aware_ 컨텍스트(예: 내비게이션 가드, 다른 스토어, Nuxt 미들웨어 등) 밖에서 스토어를 사용하고 싶다면, [여기](https://pinia.vuejs.org/core-concepts/outside-component-usage.html#SSR-Apps)에서 설명한 이유로 `pinia` 인스턴스를 `useStore()`에 전달해야 한다는 점을 기억하세요. `pinia` 인스턴스를 가져오는 방식은 상황에 따라 달라질 수 있습니다.

```ts
import { useStore } from '~/stores/myStore'

// 이 줄은 보통 pinia 인스턴스를 가져올 수 있는 함수 안에
// 있습니다
const store = useStore(pinia)
```

다행히 대부분의 경우에는 **이 번거로운 과정을 거칠 필요가 없습니다**.

:::

## 자동 import %{#auto-imports}%

기본적으로 `@pinia/nuxt`는 몇 가지 자동 import를 노출합니다:

- `usePinia()`: `getActivePinia()`와 비슷하지만 Nuxt에서 더 잘 동작합니다.
- `defineStore()`: 스토어를 정의할 때 사용합니다
- `storeToRefs()`: 스토어에서 개별 ref를 추출해야 할 때 사용합니다
- `acceptHMRUpdate()`: [핫 모듈 교체](../cookbook/hot-module-replacement.md)를 위해 사용합니다

또한 `stores` 폴더(Nuxt 4에서는 `app/stores`) 안에 정의된 **모든 스토어**를 자동으로 import합니다. 다만 중첩된 스토어는 찾지 않습니다. 이 동작은 `storesDirs` 옵션으로 커스터마이즈할 수 있습니다:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  // ... 다른 옵션
  modules: ['@pinia/nuxt'],
  pinia: {
    storesDirs: ['./stores/**', './custom-folder/stores/**'],
  },
})
```

이 폴더들은 프로젝트 루트를 기준으로 한 상대 경로입니다. `srcDir` 옵션을 바꿨다면 경로도 그에 맞게 조정해야 합니다.
