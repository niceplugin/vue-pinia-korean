# 플러그인 %{#plugins}%

<MasteringPiniaLink
  href="https://masteringpinia.com/lessons/What-is-a-pinia-plugin"
  title="Pinia 플러그인에 대해 모두 알아보기"
/>

Pinia 스토어는 저수준 API 덕분에 완전히 확장할 수 있습니다. 다음은 할 수 있는 일들의 목록입니다:

- 스토어에 새로운 속성 추가
- 스토어를 정의할 때 새로운 옵션 추가
- 스토어에 새로운 메서드 추가
- 기존 메서드 감싸기
- 액션과 그 결과 가로채기
- [로컬 스토리지](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)와 같은 부수 효과 구현
- 특정 스토어에만 **적용**

플러그인은 `pinia.use()`로 pinia 인스턴스에 추가됩니다. 가장 간단한 예시는 객체를 반환하여 모든 스토어에 정적 속성을 추가하는 것입니다:

```js
import { createPinia } from 'pinia'

// 이 플러그인이 설치된 후 생성되는 모든 스토어에
// `secret`이라는 속성을 추가합니다. 이 코드는 다른 파일에 있을 수도 있습니다.
function SecretPiniaPlugin() {
  return { secret: 'the cake is a lie' }
}

const pinia = createPinia()
// pinia에 플러그인을 전달합니다.
pinia.use(SecretPiniaPlugin)

// 다른 파일에서
const store = useStore()
store.secret // 'the cake is a lie'
```

이 방법은 라우터, 모달, 토스트 매니저와 같은 전역 객체를 추가할 때 유용합니다.

## 소개 %{#introduction}%

Pinia 플러그인은 선택적으로 스토어에 추가할 속성을 반환하는 함수입니다. 이 함수는 선택적 인수인 _context_를 받습니다:

```js
export function myPiniaPlugin(context) {
  context.pinia // `createPinia()`로 생성된 pinia
  context.app // `createApp()`으로 생성된 현재 앱
  context.store // 플러그인이 확장하는 스토어
  context.options // `defineStore()`에 전달된 스토어를 정의하는 옵션 객체
  // ...
}
```

이 함수는 `pinia.use()`로 pinia에 전달됩니다:

```js
pinia.use(myPiniaPlugin)
```

플러그인은 **플러그인 자체와 `pinia`가 앱에 전달된 이후에 생성된 스토어에만 적용**되며, 그렇지 않으면 적용되지 않습니다.

## 스토어 확장 %{#augmenting-a-store}%

플러그인에서 객체를 반환하여 모든 스토어에 속성을 추가할 수 있습니다:

```js
pinia.use(() => ({ hello: 'world' }))
```

속성을 `store`에 직접 설정할 수도 있지만, **가능하다면 반환 방식(return version)을 사용하여 devtools에서 자동으로 추적할 수 있도록 하세요**:

```js
pinia.use(({ store }) => {
  store.hello = 'world'
})
```

플러그인에서 _반환된_ 모든 속성은 devtools에서 자동으로 추적되므로, `hello`를 devtools에서 보이게 하려면 **디버깅을 원할 때 dev 모드에서만** `store._customProperties`에 추가하세요:

```js
// 위 예시에서
pinia.use(({ store }) => {
  store.hello = 'world'
  // 번들러가 이 코드를 처리하는지 확인하세요. webpack과 vite는 기본적으로 처리합니다.
  if (process.env.NODE_ENV === 'development') {
    // store에 설정한 모든 키를 추가하세요.
    store._customProperties.add('hello')
  }
})
```

모든 스토어는 [`reactive`](https://vuejs.org/api/reactivity-core#reactive)로 감싸져 있으므로, 내부에 있는 Ref(`ref()`, `computed()` 등)는 자동으로 언래핑됩니다:

```js
const sharedRef = ref('shared')
pinia.use(({ store }) => {
  // 각 스토어는 개별적인 `hello` 속성을 가집니다.
  store.hello = ref('secret')
  // 자동으로 언래핑됩니다.
  store.hello // 'secret'

  // 모든 스토어가 `shared` 값을 공유합니다.
  store.shared = sharedRef
  store.shared // 'shared'
})
```

이 때문에 모든 계산 속성에 `.value` 없이 접근할 수 있고, 반응형이 유지됩니다.

### 새로운 state 추가 %{#adding-new-state}%

스토어에 새로운 state 속성이나 hydration 중에 사용될 속성을 추가하려면, **두 곳에 추가해야 합니다**:

- `store`에 추가하여 `store.myState`로 접근할 수 있도록 함
- `store.$state`에 추가하여 devtools에서 사용하고 **SSR 중에 직렬화**될 수 있도록 함

또한, 값을 여러 접근에서 공유하려면 반드시 `ref()`(또는 다른 반응형 API)를 사용해야 합니다:

```js
import { toRef, ref } from 'vue'

pinia.use(({ store }) => {
  // SSR을 올바르게 처리하려면 기존 값을 덮어쓰지 않도록 해야 합니다.
  if (!store.$state.hasOwnProperty('hasError')) {
    // hasError는 플러그인 내에서 정의되므로 각 스토어는 개별적인
    // state 속성을 가집니다.
    const hasError = ref(false)
    // `$state`에 변수를 설정하면 SSR 중에 직렬화할 수 있습니다.
    store.$state.hasError = hasError
  }
  // state에서 store로 ref를 옮겨야 하므로,
  // store.hasError와 store.$state.hasError 모두 접근 가능하고
  // 동일한 변수를 공유합니다.
  // https://vuejs.org/api/reactivity-utilities.html#toref 참고
  store.hasError = toRef(store.$state, 'hasError')

  // 이 경우에는 `hasError`를 반환하지 않는 것이 더 좋습니다.
  // 어차피 devtools의 `state` 섹션에 표시되며,
  // 반환하면 devtools에 두 번 표시됩니다.
})
```

플러그인 내에서 발생하는 state 변경 또는 추가(여기에는 `store.$patch()` 호출도 포함)는 스토어가 활성화되기 전에 발생하므로 **어떤 구독도 트리거하지 않습니다**.

#### 플러그인에서 추가한 state 초기화 %{#resetting-state-added-in-plugins}%

기본적으로 `$reset()`은 플러그인에서 추가한 state를 초기화하지 않지만, 이를 오버라이드하여 추가한 state도 초기화할 수 있습니다:

```js
import { toRef, ref } from 'vue'

pinia.use(({ store }) => {
  // 참고용으로 위와 동일한 코드입니다.
  if (!store.$state.hasOwnProperty('hasError')) {
    const hasError = ref(false)
    store.$state.hasError = hasError
  }
  store.hasError = toRef(store.$state, 'hasError')

  // context(`this`)를 store로 설정해야 합니다.
  const originalReset = store.$reset.bind(store)

  // $reset 함수를 오버라이드합니다.
  return {
    $reset() {
      originalReset()
      store.hasError = false
    },
  }
})
```

## 새로운 외부 속성 추가 %{#adding-new-external-properties}%

외부 속성, 다른 라이브러리에서 온 클래스 인스턴스, 또는 단순히 반응형이 아닌 객체를 추가할 때는 pinia에 전달하기 전에 `markRaw()`로 객체를 감싸야 합니다. 다음은 모든 스토어에 라우터를 추가하는 예시입니다:

```js
import { markRaw } from 'vue'
// 라우터 위치에 따라 수정하세요.
import { router } from './router'

pinia.use(({ store }) => {
  store.router = markRaw(router)
})
```

## 플러그인 내에서 `$subscribe` 호출 %{#calling-subscribe-inside-plugins}%

플러그인 내에서도 [store.$subscribe](./state.md#Subscribing-to-the-state)와 [store.$onAction](./actions.md#Subscribing-to-actions)을 사용할 수 있습니다:

```ts
pinia.use(({ store }) => {
  store.$subscribe(() => {
    // 스토어 변경에 반응
  })
  store.$onAction(() => {
    // 스토어 액션에 반응
  })
})
```

## 새로운 옵션 추가 %{#adding-new-options}%

스토어를 정의할 때 새로운 옵션을 만들어 나중에 플러그인에서 사용할 수 있습니다. 예를 들어, 모든 액션을 디바운스할 수 있는 `debounce` 옵션을 만들 수 있습니다:

```js
defineStore('search', {
  actions: {
    searchContacts() {
      // ...
    },
  },

  // 이 옵션은 나중에 플러그인에서 읽힙니다.
  debounce: {
    // searchContacts 액션을 300ms 동안 디바운스
    searchContacts: 300,
  },
})
```

플러그인은 해당 옵션을 읽어 액션을 감싸고 원래 액션을 대체할 수 있습니다:

```js
// 아무 debounce 라이브러리나 사용하세요.
import debounce from 'lodash/debounce'

pinia.use(({ options, store }) => {
  if (options.debounce) {
    // 새로운 액션으로 기존 액션을 오버라이드합니다.
    return Object.keys(options.debounce).reduce((debouncedActions, action) => {
      debouncedActions[action] = debounce(
        store[action],
        options.debounce[action]
      )
      return debouncedActions
    }, {})
  }
})
```

setup 문법을 사용할 때는 커스텀 옵션이 세 번째 인수로 전달된다는 점에 유의하세요:

```js
defineStore(
  'search',
  () => {
    // ...
  },
  {
    // 이 옵션은 나중에 플러그인에서 읽힙니다.
    debounce: {
      // searchContacts 액션을 300ms 동안 디바운스
      searchContacts: 300,
    },
  }
)
```

## TypeScript %{#typescript}%

위에서 보여준 모든 것은 타입 지원과 함께 할 수 있으므로, `any`나 `@ts-ignore`를 사용할 필요가 없습니다.

### 플러그인 타입 지정 %{#typing-plugins}%

Pinia 플러그인은 다음과 같이 타입을 지정할 수 있습니다:

```ts
import { PiniaPluginContext } from 'pinia'

export function myPiniaPlugin(context: PiniaPluginContext) {
  // ...
}
```

### 새로운 스토어 속성 타입 지정 %{#typing-new-store-properties}%

스토어에 새로운 속성을 추가할 때는 `PiniaCustomProperties` 인터페이스도 확장해야 합니다.

```ts
import 'pinia'
import type { Router } from 'vue-router'

declare module 'pinia' {
  export interface PiniaCustomProperties {
    // setter를 사용하면 문자열과 ref 모두 허용할 수 있습니다.
    set hello(value: string | Ref<string>)
    get hello(): string

    // 더 단순한 값도 정의할 수 있습니다.
    simpleNumber: number

    // 위 플러그인에서 추가한 라우터 타입 지정 (#adding-new-external-properties)
    router: Router
  }
}
```

이제 안전하게 읽고 쓸 수 있습니다:

```ts
pinia.use(({ store }) => {
  store.hello = 'Hola'
  store.hello = ref('Hola')

  store.simpleNumber = Math.random()
  // @ts-expect-error: 올바르게 타입 지정하지 않았습니다.
  store.simpleNumber = ref(Math.random())
})
```

`PiniaCustomProperties`는 스토어의 속성을 참조할 수 있도록 해주는 제네릭 타입입니다. 다음 예시처럼 초기 옵션을 `$options`로 복사하는 경우(이 방법은 옵션 스토어에서만 동작합니다):

```ts
pinia.use(({ options }) => ({ $options: options }))
```

`PiniaCustomProperties`의 4가지 제네릭 타입을 사용해 올바르게 타입을 지정할 수 있습니다:

```ts
import 'pinia'

declare module 'pinia' {
  export interface PiniaCustomProperties<Id, S, G, A> {
    $options: {
      id: Id
      state?: () => S
      getters?: G
      actions?: A
    }
  }
}
```

:::tip
제네릭에서 타입을 확장할 때는 **소스 코드와 정확히 같은 이름**을 사용해야 합니다. `Id`를 `id`나 `I`로, `S`를 `State`로 바꿀 수 없습니다. 각 문자의 의미는 다음과 같습니다:

- S: State
- G: Getters
- A: Actions
- SS: Setup Store / Store

:::

### 새로운 state 타입 지정 %{#typing-new-state}%

새로운 state 속성을 추가할 때(`store`와 `store.$state` 모두), 대신 `PiniaCustomStateProperties`에 타입을 추가해야 합니다. `PiniaCustomProperties`와 달리, 오직 `State` 제네릭만 받습니다:

```ts
import 'pinia'

declare module 'pinia' {
  export interface PiniaCustomStateProperties<S> {
    hello: string
  }
}
```

### 새로운 생성 옵션 타입 지정 %{#typing-new-creation-options}%

`defineStore()`에 새로운 옵션을 만들 때는 `DefineStoreOptionsBase`를 확장해야 합니다. `PiniaCustomProperties`와 달리, State와 Store 타입 두 가지만 노출하여 정의할 수 있는 범위를 제한할 수 있습니다. 예를 들어, 액션 이름을 사용할 수 있습니다:

```ts
import 'pinia'

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    // 모든 액션에 대해 ms 단위의 숫자를 정의할 수 있도록 허용
    debounce?: Partial<Record<keyof StoreActions<Store>, number>>
  }
}
```

:::tip

Store 타입에서 _getters_를 추출하는 `StoreGetters` 타입도 있습니다. _setup 스토어_ 또는 _옵션 스토어_의 옵션만 **확장**하려면 각각 `DefineStoreOptions`와 `DefineSetupStoreOptions` 타입을 확장하세요.

:::

## Nuxt %{#nuxt}%

[Nuxt와 함께 pinia를 사용할 때](../ssr/nuxt.md)는 먼저 [Nuxt 플러그인](https://nuxt.com/docs/guide/directory-structure/plugins)을 생성해야 합니다. 이렇게 하면 `pinia` 인스턴스에 접근할 수 있습니다:

```ts{14-16}
// plugins/myPiniaPlugin.ts
import { PiniaPluginContext } from 'pinia'

function MyPiniaPlugin({ store }: PiniaPluginContext) {
  store.$subscribe((mutation) => {
    // 스토어 변경에 반응
    console.log(`[🍍 ${mutation.storeId}]: ${mutation.type}.`)
  })

  // TypeScript를 사용하는 경우 타입을 지정해야 합니다.
  return { creationTime: new Date() }
}

export default defineNuxtPlugin(({ $pinia }) => {
  $pinia.use(MyPiniaPlugin)
})
```

::: info

위 예시는 TypeScript를 사용하고 있으므로, `.js` 파일을 사용할 경우 타입 어노테이션 `PiniaPluginContext`와 `Plugin` 및 해당 import를 제거해야 합니다.

:::

## 기존 플러그인 %{#existing-plugins}%

[GitHub의 기존 Pinia 플러그인](https://github.com/topics/pinia-plugin)에서 _pinia-plugin_ 토픽으로 확인할 수 있습니다.
