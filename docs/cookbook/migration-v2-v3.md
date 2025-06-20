# v2에서 v3로 마이그레이션 %{#migrating-from-v2-to-v3}%

Pinia v3는 새로운 기능이 없는 _지루한_ 메이저 릴리스입니다. 사용이 중단된 API를 제거하고 주요 의존성을 업데이트했습니다. 오직 Vue 3만 지원합니다. Vue 2를 사용 중이라면 v2를 계속 사용할 수 있습니다. 도움이 필요하다면 [Pinia의 저자에게 도움을 요청하세요](https://cal.com/posva/consultancy).

대부분의 사용자에게 마이그레이션은 **변경이 필요 없습니다**. 이 가이드는 문제가 발생할 경우 도움을 드리기 위해 마련되었습니다.

## 사용 중단 %{#deprecations}%

### `defineStore({ id })` %{#definestore-id}%

`id` 속성이 있는 객체를 받는 `defineStore()` 시그니처는 사용이 중단되었습니다. 대신 `id` 매개변수를 사용해야 합니다:

```ts
defineStore({ // [!code --]
  id: 'storeName', // [!code --]
defineStore('storeName', { // [!code ++]
  // ...
})
```

### `PiniaStorePlugin` %{#piniastoreplugin}%

이 사용 중단된 타입 별칭은 `PiniaPlugin`으로 대체되어 제거되었습니다.

## 새로운 버전 %{#new-versions}%

- 오직 Vue 3만 지원합니다.
- TypeScript 5 이상이 필요합니다.
- devtools API가 [v7](https://devtools.vuejs.org)로 업그레이드되었습니다.

## Nuxt %{#nuxt}%

Nuxt 모듈이 Nuxt 3을 지원하도록 업데이트되었습니다. Nuxt 2 또는 Nuxt bridge를 사용 중이라면 이전 버전의 Pinia를 계속 사용할 수 있습니다.