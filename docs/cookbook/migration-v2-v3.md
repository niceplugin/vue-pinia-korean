# v2에서 v3로 마이그레이션 %{#migrating-from-v2-to-v3}%

<RuleKitLink />

Pinia v3는 새로운 기능이 없는, 다소 _심심한_ 메이저 릴리스입니다. 사용 중단된 API를 제거하고 주요 의존성을 업데이트했습니다. Vue 3만 지원합니다. Vue 2를 사용 중이라면 v2를 계속 사용할 수 있습니다. 도움이 필요하다면 [Pinia 저자에게 도움을 요청하세요](https://cal.com/posva/consultancy).

대부분의 사용자에게 이 마이그레이션은 **아무 변경도** 요구하지 않을 것입니다. 이 가이드는 혹시 문제를 만났을 때 도움이 되도록 준비되어 있습니다.

## 사용 중단 %{#deprecations}%

### `defineStore({ id })` %{#definestore-id}%

`id` 속성이 있는 객체를 받는 `defineStore()` 시그니처는 더 이상 사용되지 않습니다. 대신 `id` 매개변수를 사용해야 합니다:

```ts
defineStore({ // [!code --]
  id: 'storeName', // [!code --]
defineStore('storeName', { // [!code ++]
  // ...
})
```

### `PiniaStorePlugin` %{#piniastoreplugin}%

이 사용 중단된 타입 별칭은 `PiniaPlugin`으로 대체되며 제거되었습니다.

## 새 버전 요구사항 %{#new-versions}%

- Vue 3만 지원합니다.
- TypeScript 5 이상이 필요합니다.
- devtools API가 [v7](https://devtools.vuejs.org)로 업그레이드되었습니다.

## Nuxt %{#nuxt}%

Nuxt 모듈은 Nuxt 3를 지원하도록 업데이트되었습니다. Nuxt 2나 Nuxt bridge를 사용 중이라면 이전 버전의 Pinia를 계속 사용할 수 있습니다.
