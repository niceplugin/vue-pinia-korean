# Nuxt %{#nuxt}%

<MasteringPiniaLink
  href="https://masteringpinia.com/lessons/ssr-friendly-state"
  title="SSR 모범 사례에 대해 알아보기"
/>

[Nuxt](https://nuxt.com/)와 함께 Pinia를 사용하는 것은 _서버 사이드 렌더링_과 관련된 많은 부분을 Nuxt가 처리해주기 때문에 더 쉽습니다. 예를 들어, **직렬화나 XSS 공격에 대해 신경 쓸 필요가 없습니다**. Pinia는 Nuxt Bridge와 Nuxt 3을 지원합니다. 순수 Nuxt 2 지원에 대해서는 [아래](#nuxt-2-without-bridge)를 참고하세요.

## 설치 %{#installation}%

```bash
npx nuxi@latest module add pinia
```

이 명령은 `@pinia/nuxt`와 `pinia`를 프로젝트에 추가합니다. **만약 `pinia`가 설치되지 않은 것을 발견했다면, 패키지 매니저를 사용해 수동으로 설치하세요**: `npm i pinia`.

:::tip
npm을 사용한다면 _ERESOLVE unable to resolve dependency tree_ 오류가 발생할 수 있습니다. 이 경우, `package.json`에 다음을 추가하세요:

```js
"overrides": {
  "vue": "latest"
}
```

:::

모든 것을 처리해주는 _모듈_을 제공하므로, `nuxt.config.js` 파일의 `modules`에 추가하기만 하면 됩니다:

```js
// nuxt.config.js
export default defineNuxtConfig({
  // ... 기타 옵션
  modules: [
    // ...
    '@pinia/nuxt',
  ],
})
```

이제 끝입니다. 평소처럼 스토어를 사용하세요!

## 페이지에서 액션 대기 %{#awaiting-for-actions-in-pages}%

`onServerPrefetch()`와 마찬가지로, `callOnce()` 컴포저블 내에서 스토어 액션을 호출할 수 있습니다.
이렇게 하면 Nuxt가 액션을 한 번만 실행하고 이미 존재하는 데이터를 다시 가져오는 것을 방지할 수 있습니다.

```vue{3-4}
<script setup>
const store = useStore()
// 데이터를 추출할 수도 있지만, 이미 스토어에 존재합니다
await callOnce('user', () => store.fetchUser())
</script>
```

요구 사항에 따라, 클라이언트에서 한 번만 액션을 실행하거나, 모든 내비게이션마다 실행할 수 있습니다 (`useFetch()`/`useAsyncData()`의 데이터 패칭 동작과 유사).

```vue{3}
<script setup>
const store = useStore()
await callOnce('user', () => store.fetchUser(), { mode: 'navigation' })
</script>
```

::: tip

`setup()` 또는 _주입 인식_ 컨텍스트(예: 내비게이션 가드, 다른 스토어, Nuxt 미들웨어 등) 외부에서 스토어를 사용하려면, [여기](https://pinia.vuejs.kr/core-concepts/outside-component-usage.html#SSR-Apps)에서 언급한 이유로 `useStore()`에 `pinia` 인스턴스를 전달해야 합니다. `pinia` 인스턴스를 가져오는 방법은 상황에 따라 다를 수 있습니다.

```ts
import { useStore } from '~/stores/myStore'

// 이 코드는 보통 pinia 인스턴스를 가져올 수 있는 함수 내부에 있습니다
const store = useStore(pinia)
```

다행히도, 대부분의 경우 **이런 번거로움을 겪을 필요가 없습니다**.

:::

## 자동 임포트 %{#auto-imports}%

기본적으로 `@pinia/nuxt`는 몇 가지 자동 임포트를 제공합니다:

- `usePinia()`: `getActivePinia()`와 유사하지만 Nuxt와 더 잘 작동합니다.
- `defineStore()`: 스토어 정의용
- `storeToRefs()`: 스토어에서 개별 ref를 추출할 때 사용
- `acceptHMRUpdate()`: [핫 모듈 교체](../cookbook/hot-module-replacement.md)용

또한 `stores` 폴더 내에 정의된 **모든 스토어**를 자동으로 임포트합니다. 단, 중첩된 스토어는 탐색하지 않습니다. 이 동작은 `storesDirs` 옵션으로 커스터마이즈할 수 있습니다:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  // ... 기타 옵션
  modules: ['@pinia/nuxt'],
  pinia: {
    storesDirs: ['./stores/**', './custom-folder/stores/**'],
  },
})
```

폴더 경로는 프로젝트 루트 기준입니다. `srcDir` 옵션을 변경했다면, 경로도 그에 맞게 조정해야 합니다.

## Nuxt 2에서 브리지 없이 %{#nuxt-2-without-bridge}%

Pinia는 `@pinia/nuxt` v0.2.1까지 Nuxt 2를 지원합니다. 반드시 [`@nuxtjs/composition-api`](https://composition-api.nuxtjs.org/)를 `pinia`와 함께 설치하세요:

```bash
yarn add pinia @pinia/nuxt@0.2.1 @nuxtjs/composition-api
# 또는 npm 사용 %{#or-with-npm}%

npm install pinia @pinia/nuxt@0.2.1 @nuxtjs/composition-api
```

모든 것을 처리해주는 _모듈_을 제공하므로, `nuxt.config.js` 파일의 `buildModules`에 추가하기만 하면 됩니다:

```js
// nuxt.config.js
export default {
  // ... 기타 옵션
  buildModules: [
    // Nuxt 2 전용:
    // https://composition-api.nuxtjs.org/getting-started/setup#quick-start
    '@nuxtjs/composition-api/module',
    '@pinia/nuxt',
  ],
}
```

### 타입스크립트 %{#typescript}%

Nuxt 2(`@pinia/nuxt` < 0.3.0)에서 TypeScript를 사용하거나 `jsconfig.json`이 있다면, `context.pinia`의 타입도 추가해야 합니다:

```json
{
  "types": [
    // ...
    "@pinia/nuxt"
  ]
}
```

이렇게 하면 자동 완성도 사용할 수 있습니다 😉 .

### Pinia와 Vuex를 함께 사용하기 %{#using-pinia-alongside-vuex}%

**Pinia와 Vuex를 동시에 사용하는 것은 권장하지 않지만**, 둘 다 사용해야 한다면 Pinia가 Vuex를 비활성화하지 않도록 설정해야 합니다:

```js
// nuxt.config.js
export default {
  buildModules: [
    '@nuxtjs/composition-api/module',
    ['@pinia/nuxt', { disableVuex: false }],
  ],
  // ... 기타 옵션
}
```