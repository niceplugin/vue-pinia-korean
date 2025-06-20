# 0.x(v1)에서 v2로 마이그레이션 %{#migrating-from-0x-v1-to-v2}%

`2.0.0-rc.4` 버전부터 pinia는 Vue 2와 Vue 3를 모두 지원합니다! 이는 모든 새로운 업데이트가 이 버전 2에 적용되어 Vue 2와 Vue 3 사용자 모두가 혜택을 받을 수 있음을 의미합니다. Vue 3를 사용하고 있다면, 이미 rc를 사용하고 있었으므로 달라지는 점이 없으며, 변경된 모든 사항에 대한 자세한 설명은 [CHANGELOG](https://github.com/vuejs/pinia/blob/v2/packages/pinia/CHANGELOG.md)를 확인할 수 있습니다. 그렇지 않다면, **이 가이드가 여러분을 위한 것입니다**!

## 사용 중단된 항목들 %{#deprecations}%

코드에 적용해야 할 모든 변경 사항을 살펴보겠습니다. 먼저, 이미 최신 0.x 버전을 실행 중인지 확인하여 사용 중단된 항목을 확인하세요:

```shell
npm i 'pinia@^0.x.x'
# 또는 yarn으로 %{#or-with-yarn}%

yarn add 'pinia@^0.x.x'
```

ESLint를 사용 중이라면, [이 플러그인](https://github.com/gund/eslint-plugin-deprecation)을 사용하여 사용 중단된 모든 사용법을 찾는 것을 고려해보세요. 그렇지 않으면, 사용 중단된 항목이 나타날 때 취소선으로 표시되는 것을 볼 수 있습니다. 다음은 제거된 사용 중단 API입니다:

- `createStore()`가 `defineStore()`로 변경됨
- 구독에서 `storeName`이 `storeId`로 변경됨
- `PiniaPlugin`이 `PiniaVuePlugin`으로 이름이 변경됨 (Vue 2용 Pinia 플러그인)
- `$subscribe()`는 더 이상 두 번째 매개변수로 _불리언_을 허용하지 않으며, 대신 `detached: true`가 포함된 객체를 전달해야 합니다.
- Pinia 플러그인은 더 이상 스토어의 `id`를 직접 받지 않습니다. 대신 `store.$id`를 사용하세요.

## 주요 변경 사항 %{#breaking-changes}%

이 항목들을 제거한 후, 다음과 같이 v2로 업그레이드할 수 있습니다:

```shell
npm i 'pinia@^2.x.x'
# 또는 yarn으로 %{#or-with-yarn}%

yarn add 'pinia@^2.x.x'
```

그리고 코드를 업데이트하기 시작하세요.

### Generic Store 타입 %{#generic-store-type}%

[2.0.0-rc.0](https://github.com/vuejs/pinia/blob/v2/packages/pinia/CHANGELOG.md#200-rc0-2021-07-28)에서 추가됨

`GenericStore` 타입의 모든 사용을 `StoreGeneric`으로 교체하세요. 이것이 모든 종류의 스토어를 허용하는 새로운 제네릭 스토어 타입입니다. 만약 제네릭 없이 `Store` 타입(예: `Store<Id, State, Getters, Actions>`)을 사용하여 함수를 작성했다면, 역시 `StoreGeneric`을 사용해야 합니다. 제네릭 없이 `Store` 타입을 사용하면 빈 스토어 타입이 생성됩니다.

```ts
function takeAnyStore(store: Store) {} // [!code --]
function takeAnyStore(store: StoreGeneric) {} // [!code ++]

function takeAnyStore(store: GenericStore) {} // [!code --]
function takeAnyStore(store: StoreGeneric) {} // [!code ++]
```

## 플러그인용 `DefineStoreOptions` %{#definestoreoptions-for-plugins}%

플러그인을 작성하고, TypeScript를 사용하며, 사용자 정의 옵션을 추가하기 위해 `DefineStoreOptions` 타입을 확장했다면, 이를 `DefineStoreOptionsBase`로 이름을 변경해야 합니다. 이 타입은 setup 스토어와 options 스토어 모두에 적용됩니다.

```ts
declare module 'pinia' {
  export interface DefineStoreOptions<S, Store> { // [!code --]
  export interface DefineStoreOptionsBase<S, Store> { // [!code ++]
    debounce?: {
      [k in keyof StoreActions<Store>]?: number
    }
  }
}
```

## `PiniaStorePlugin` 이름 변경 %{#piniastoreplugin-was-renamed}%

`PiniaStorePlugin` 타입이 `PiniaPlugin`으로 이름이 변경되었습니다.

```ts
import { PiniaStorePlugin } from 'pinia' // [!code --]
import { PiniaPlugin } from 'pinia' // [!code ++]

const piniaPlugin: PiniaStorePlugin = () => { // [!code --]
const piniaPlugin: PiniaPlugin = () => { // [!code ++]
  // ...
}
```

**이 변경은 Pinia의 최신 버전으로 업그레이드하여 사용 중단 항목이 없는 상태에서만 적용할 수 있습니다.**

## `@vue/composition-api` 버전 %{#vuecomposition-api-version}%

pinia가 이제 `effectScope()`에 의존하므로, `@vue/composition-api`의 최소 버전 `1.1.0`을 사용해야 합니다:

```shell
npm i @vue/composition-api@latest
# 또는 yarn으로 %{#or-with-yarn}%

yarn add @vue/composition-api@latest
```

## webpack 4 지원 %{#webpack-4-support}%

webpack 4(Vue CLI는 webpack 4를 사용함)를 사용 중이라면, 다음과 같은 오류가 발생할 수 있습니다:

```
ERROR  Failed to compile with 18 errors

 error  in ./node_modules/pinia/dist/pinia.mjs

Can't import the named export 'computed' from non EcmaScript module (only default export is available)
```

이는 dist 파일이 Node.js의 네이티브 ESM 모듈을 지원하도록 현대화되었기 때문입니다. 파일이 이제 `.mjs`와 `.cjs` 확장자를 사용하여 Node가 이를 활용할 수 있도록 했습니다. 이 문제를 해결하려면 두 가지 방법이 있습니다:

- Vue CLI 4.x를 사용 중이라면, 의존성을 업그레이드하세요. 아래의 수정 사항이 포함되어야 합니다.
  - 업그레이드가 불가능하다면, `vue.config.js`에 다음을 추가하세요:

    ```js
    // vue.config.js
    module.exports = {
      configureWebpack: {
        module: {
          rules: [
            {
              test: /\.mjs$/,
              include: /node_modules/,
              type: 'javascript/auto',
            },
          ],
        },
      },
    }
    ```

- webpack을 수동으로 다루고 있다면, `.mjs` 파일을 어떻게 처리할지 webpack에 알려야 합니다:

  ```js
  // webpack.config.js
  module.exports = {
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
        },
      ],
    },
  }
  ```

## 개발자 도구 %{#devtools}%

Pinia v2는 더 이상 Vue Devtools v5를 가로채지 않으며, Vue Devtools v6가 필요합니다. 확장 프로그램의 **베타 채널**에 대한 다운로드 링크는 [Vue Devtools 문서](https://devtools.vuejs.org/guide/installation.html#chrome)에서 확인할 수 있습니다.

## Nuxt %{#nuxt}%

Nuxt를 사용 중이라면, pinia는 이제 자체 Nuxt 패키지를 제공합니다 🎉. 다음과 같이 설치하세요:

```bash
npm i @pinia/nuxt
# 또는 yarn으로 %{#or-with-yarn}%

yarn add @pinia/nuxt
```

또한 **`@nuxtjs/composition-api` 패키지도 반드시 업데이트**하세요.

TypeScript를 사용 중이라면, `nuxt.config.js`와 `tsconfig.json`도 다음과 같이 수정하세요:

```js
// nuxt.config.js
module.exports {
  buildModules: [
    '@nuxtjs/composition-api/module',
    'pinia/nuxt', // [!code --]
    '@pinia/nuxt', // [!code ++]
  ],
}
```

```json
// tsconfig.json
{
  "types": [
    // ...
    "pinia/nuxt/types" // [!code --]
    "@pinia/nuxt" // [!code ++]
  ]
}
```

[전용 Nuxt 섹션](../ssr/nuxt.md)도 읽어보는 것을 권장합니다.
