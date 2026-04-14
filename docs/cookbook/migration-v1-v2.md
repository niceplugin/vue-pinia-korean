# 0.x (v1)에서 v2로 마이그레이션 %{#migrating-from-0-x-v1-to-v2}%

<RuleKitLink />

`2.0.0-rc.4`부터 pinia는 Vue 2와 Vue 3를 모두 지원합니다! 즉, 모든 새 업데이트가 이 버전 2에 적용되므로 Vue 2와 Vue 3 사용자 모두가 그 혜택을 받을 수 있습니다. Vue 3를 사용 중이라면 이미 rc를 사용하고 있었기 때문에 이것이 특별히 바꾸는 것은 없고, 변경 사항에 대한 자세한 설명은 [CHANGELOG](https://github.com/vuejs/pinia/blob/v2/packages/pinia/CHANGELOG.md)에서 확인할 수 있습니다. 그렇지 않다면 **이 가이드가 바로 당신을 위한 것입니다**!

## 사용 중단 %{#deprecations}%

코드에 적용해야 할 변경 사항을 살펴봅시다. 먼저, 사용 중단 경고를 확인할 수 있도록 최신 0.x 버전을 실행하고 있는지 확인하세요:

```shell
npm i 'pinia@^0.x.x'
# 또는 yarn 사용 시
yarn add 'pinia@^0.x.x'
```

ESLint를 사용 중이라면, 사용 중단된 항목을 찾기 위해 [이 플러그인](https://github.com/gund/eslint-plugin-deprecation)을 고려해 볼 수 있습니다. 그렇지 않더라도 취소선으로 표시되므로 확인할 수 있어야 합니다. 제거된 사용 중단 API는 다음과 같습니다:

- `createStore()`는 `defineStore()`가 되었습니다
- 구독에서 `storeName`은 `storeId`가 되었습니다
- `PiniaPlugin`은 `PiniaVuePlugin`으로 이름이 바뀌었습니다(Vue 2용 Pinia 플러그인)
- `$subscribe()`는 더 이상 두 번째 매개변수로 _boolean_을 받지 않습니다. 대신 `detached: true`가 있는 객체를 전달하세요.
- Pinia 플러그인은 더 이상 스토어의 `id`를 직접 받지 않습니다. 대신 `store.$id`를 사용하세요.

## 브레이킹 체인지 %{#breaking-changes}%

이것들을 제거한 후에는 다음과 같이 v2로 업그레이드할 수 있습니다:

```shell
npm i 'pinia@^2.x.x'
# 또는 yarn 사용 시
yarn add 'pinia@^2.x.x'
```

그리고 코드를 업데이트하기 시작하세요.

### Generic Store 타입 %{#generic-store-type}%

[2.0.0-rc.0](https://github.com/vuejs/pinia/blob/v2/packages/pinia/CHANGELOG.md#200-rc0-2021-07-28)에 추가됨

`GenericStore` 타입을 사용하는 모든 곳을 `StoreGeneric`으로 바꾸세요. 이것은 어떤 종류의 스토어든 받을 수 있어야 하는 새로운 제네릭 스토어 타입입니다. 제네릭을 전달하지 않고 `Store` 타입(예: `Store<Id, State, Getters, Actions>`)을 사용해 함수를 작성했다면, 제네릭 없는 `Store` 타입은 빈 스토어 타입을 만들기 때문에 `StoreGeneric`을 사용해야 합니다.

```ts
function takeAnyStore(store: Store) {} // [!code --]
function takeAnyStore(store: StoreGeneric) {} // [!code ++]

function takeAnyStore(store: GenericStore) {} // [!code --]
function takeAnyStore(store: StoreGeneric) {} // [!code ++]
```

## 플러그인용 `DefineStoreOptions` %{#define-store-options-for-plugins}%

플러그인을 작성하고 있고 TypeScript를 사용하며 `DefineStoreOptions` 타입을 확장해 사용자 정의 옵션을 추가했다면, 이름을 `DefineStoreOptionsBase`로 바꿔야 합니다. 이 타입은 setup 스토어와 options 스토어 모두에 적용됩니다.

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

`PiniaStorePlugin` 타입은 `PiniaPlugin`으로 이름이 바뀌었습니다.

```ts
import { PiniaStorePlugin } from 'pinia' // [!code --]
import { PiniaPlugin } from 'pinia' // [!code ++]

const piniaPlugin: PiniaStorePlugin = () => { // [!code --]
const piniaPlugin: PiniaPlugin = () => { // [!code ++]
  // ...
}
```

**이 변경은 사용 중단 경고가 없는 최신 버전의 Pinia로 업그레이드한 뒤에만 할 수 있다는 점에 유의하세요**.

## `@vue/composition-api` 버전 %{#vue-composition-api-version}%

pinia가 이제 `effectScope()`에 의존하므로, 최소 `@vue/composition-api` `1.1.0` 버전을 사용해야 합니다:

```shell
npm i @vue/composition-api@latest
# 또는 yarn 사용 시
+yarn add @vue/composition-api@latest
```

## webpack 4 지원 %{#webpack-4-support}%

webpack 4를 사용 중이라면(Vue CLI는 webpack 4를 사용합니다), 다음과 같은 오류를 만날 수 있습니다:

```
ERROR  Failed to compile with 18 errors

 error  in ./node_modules/pinia/dist/pinia.mjs

Can't import the named export 'computed' from non EcmaScript module (only default export is available)
```

이것은 Node.js에서 네이티브 ESM 모듈을 지원하기 위해 dist 파일이 현대화되었기 때문입니다. 이제 파일은 `.mjs`와 `.cjs` 확장자를 사용해 Node가 이를 활용할 수 있게 합니다. 이 문제를 해결하는 방법은 두 가지입니다:

- Vue CLI 4.x를 사용 중이라면 의존성을 업그레이드하세요. 아래 수정도 포함되어 있어야 합니다.
  - 업그레이드가 불가능하다면 `vue.config.js`에 다음을 추가하세요:

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

- webpack을 직접 다루고 있다면, `.mjs` 파일을 어떻게 처리할지 알려주어야 합니다:

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

## Devtools %{#devtools}%

Pinia v2는 더 이상 Vue Devtools v5를 가로채지 않으며, Vue Devtools v6를 필요로 합니다. 확장 프로그램의 **베타 채널** 다운로드 링크는 [Vue Devtools 문서](https://devtools.vuejs.org/guide/installation.html#chrome)에서 찾을 수 있습니다.

## Nuxt %{#nuxt}%

Nuxt를 사용 중이라면, pinia는 이제 전용 Nuxt 패키지를 갖고 있습니다 ✨. 다음과 같이 설치하세요:

```bash
npm i @pinia/nuxt
# 또는 yarn 사용 시
yarn add @pinia/nuxt
```

또한 **`@nuxtjs/composition-api` 패키지를 업데이트해야 한다는 점도 잊지 마세요**.

그 다음 `nuxt.config.js`와, TypeScript를 사용 중이라면 `tsconfig.json`도 수정하세요:

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

또한 [전용 Nuxt 섹션](../ssr/nuxt.md)도 읽어보는 것을 권장합니다.
