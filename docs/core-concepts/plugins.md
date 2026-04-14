# 플러그인 %{#plugins}%

<MasteringPiniaLink
  href="https://masteringpinia.com/lessons/What-is-a-pinia-plugin"
  title="Pinia 플러그인 완전히 이해하기"
/>

Pinia 스토어는 저수준 API 덕분에 완전히 확장할 수 있습니다. 할 수 있는 일은 다음과 같습니다:

- 스토어에 새로운 속성 추가
- 스토어 정의 시 새로운 옵션 추가
- 스토어에 새로운 메서드 추가
- 기존 메서드 감싸기
- 액션과 그 결과 가로채기
- [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) 같은 부수 효과 구현
- 특정 스토어에만 **선택적으로** 적용

<RuleKitLink />

플러그인은 `pinia.use()`로 pinia 인스턴스에 추가합니다. 가장 단순한 예시는 객체를 반환해 모든 스토어에 정적 속성을 추가하는 것입니다:

```js
import { createPinia } from 'pinia'

// 이 플러그인이 설치된 뒤에 생성되는 모든 store에
// `secret`이라는 속성을 추가합니다. 이 함수는 다른 파일에 있어도 됩니다
function SecretPiniaPlugin() {
  return { secret: 'the cake is a lie' }
}

const pinia = createPinia()
// pinia에 플러그인을 전달합니다
pinia.use(SecretPiniaPlugin)

// 다른 파일에서
const store = useStore()
store.secret // 'the cake is a lie'
```

이것은 router, modal, toast manager 같은 전역 객체를 추가할 때 유용합니다.

## 소개 %{#introduction}%

Pinia 플러그인은 선택적으로 스토어에 추가할 속성을 반환하는 함수입니다. 이 함수는 선택적 인수인 _context_를 받습니다:

```js
export function myPiniaPlugin(context) {
  context.pinia // `createPinia()`로 생성한 pinia
  context.app // `createApp()`으로 생성한 현재 앱
  context.store // 플러그인이 확장 중인 스토어
  context.options // `defineStore()`에 전달된 스토어 정의 옵션 객체
  // ...
}
```

이 함수는 그다음 `pinia.use()`를 통해 `pinia`에 전달됩니다:

```js
pinia.use(myPiniaPlugin)
```

플러그인은 **플러그인 자체가 등록된 후에 생성된 스토어에만**, 그리고 **`pinia`가 앱에 전달된 이후에만** 적용됩니다. 그렇지 않으면 적용되지 않습니다.

## 스토어 확장하기 %{#augmenting-a-store}%

플러그인에서 객체를 반환하기만 해도 모든 스토어에 속성을 추가할 수 있습니다:

```js
pinia.use(() => ({ hello: 'world' }))
```

속성을 `store`에 직접 설정할 수도 있지만, **가능하다면 devtools가 자동 추적할 수 있도록 반환 방식 사용을 권장합니다**:

```js
pinia.use(({ store }) => {
  store.hello = 'world'
})
```

플러그인이 _반환한_ 속성은 devtools에서 자동 추적됩니다. 따라서 `hello`를 devtools에 보이게 하려면, devtools에서 디버깅하려는 경우 **개발 모드에서만** `store._customProperties`에 추가해야 합니다:

```js
// 위 예제에서 이어집니다
pinia.use(({ store }) => {
  store.hello = 'world'
  // 번들러가 이 코드를 처리하는지 확인하세요. webpack과 vite는 기본적으로 됩니다
  if (process.env.NODE_ENV === 'development') {
    // 스토어에 설정한 키를 추가합니다
    store._customProperties.add('hello')
  }
})
```

모든 스토어는 [`reactive`](https://vuejs.org/api/reactivity-core#reactive)로 감싸져 있으므로, 내부에 있는 모든 Ref(`ref()`, `computed()`, ...)를 자동으로 언래핑한다는 점에 유의하세요:

```js
const sharedRef = ref('shared')
pinia.use(({ store }) => {
  // 각 스토어는 자신만의 `hello` 속성을 가집니다
  store.hello = ref('secret')
  // 자동으로 언래핑됩니다
  store.hello // 'secret'

  // 모든 스토어가 `shared` 속성 값을 공유합니다
  store.shared = sharedRef
  store.shared // 'shared'
})
```

이것이 `.value` 없이 모든 computed 속성에 접근할 수 있고, 그것들이 반응형인 이유입니다.

### 새로운 state 추가하기 %{#adding-new-state}%

스토어에 새로운 state 속성이나 하이드레이션 중에 사용될 속성을 추가하려면 **두 곳에 추가해야 합니다**:

- `store.myState`로 접근할 수 있도록 `store`에
- devtools에서 사용되고 **SSR 중 직렬화될 수 있도록** `store.$state`에

게다가 서로 다른 접근 사이에서 값을 공유하려면, 거의 확실히 `ref()`(또는 다른 반응형 API)를 사용해야 합니다:

```js
import { toRef, ref } from 'vue'

pinia.use(({ store }) => {
  // SSR을 올바르게 처리하려면, 기존 값을 덮어쓰지 않도록
  // 보장해야 합니다
  if (!Object.hasOwn(store.$state, 'hasError')) {
    // hasError는 플러그인 안에서 정의되므로 각 스토어는 자신만의
    // state 속성을 갖습니다
    const hasError = ref(false)
    // `$state`에 값을 설정하면 SSR 중 직렬화될 수 있습니다
    store.$state.hasError = hasError
  }
  // state의 ref를 store로 옮겨야 합니다. 이렇게 해야
  // store.hasError와 store.$state.hasError 두 접근 모두 동작하고
  // 같은 변수를 공유합니다
  // https://vuejs.org/api/reactivity-utilities.html#toref 참고
  store.hasError = toRef(store.$state, 'hasError')

  // 이 경우 `hasError`를 반환하지 않는 편이 좋습니다. 그렇지 않으면
  // devtools의 `state` 섹션에 어차피 표시되는데,
  // 반환까지 하면 devtools에 두 번 보이게 됩니다.
})
```

플러그인 안에서 일어나는 state 변경이나 추가(`store.$patch()` 호출 포함)는 스토어가 활성화되기 전에 발생하므로 **어떤 subscription도 트리거하지 않습니다**.

#### 플러그인에서 추가한 state 초기화하기 %{#resetting-state-added-in-plugins}%

기본적으로 `$reset()`은 플러그인이 추가한 state를 초기화하지 않지만, 오버라이드해서 추가한 state도 초기화하게 만들 수 있습니다:

```js
import { toRef, ref } from 'vue'

pinia.use(({ store }) => {
  // 위와 동일한 코드이며, 참고용입니다
  if (!Object.hasOwn(store.$state, 'hasError')) {
    const hasError = ref(false)
    store.$state.hasError = hasError
  }
  store.hasError = toRef(store.$state, 'hasError')

  // context(`this`)가 store가 되도록 설정해야 합니다
  const originalReset = store.$reset.bind(store)

  // $reset 함수를 오버라이드합니다
  return {
    $reset() {
      originalReset()
      store.hasError = false
    },
  }
})
```

## 새로운 외부 속성 추가하기 %{#adding-new-external-properties}%

외부 속성, 다른 라이브러리에서 온 클래스 인스턴스, 혹은 단순히 반응형이 아닌 것을 추가할 때는 pinia에 전달하기 전에 `markRaw()`로 객체를 감싸야 합니다. 다음은 모든 스토어에 router를 추가하는 예제입니다:

```js
import { markRaw } from 'vue'
// router의 위치에 맞게 경로를 조정하세요
import { router } from './router'

pinia.use(({ store }) => {
  store.router = markRaw(router)
})
```

## 플러그인 안에서 `$subscribe` 호출하기 %{#calling-subscribe-inside-plugins}%

플러그인 안에서도 [store.$subscribe](./state.md#Subscribing-to-the-state)와 [store.$onAction](./actions.md#Subscribing-to-actions)를 사용할 수 있습니다:

```ts
pinia.use(({ store }) => {
  store.$subscribe(() => {
    // store 변경에 반응합니다
  })
  store.$onAction(() => {
    // store action에 반응합니다
  })
})
```

## 새로운 옵션 추가하기 %{#adding-new-options}%

스토어를 정의할 때 새로운 옵션을 만들어 두고, 이후 플러그인에서 소비하는 것도 가능합니다. 예를 들어 어떤 action이든 디바운스할 수 있게 해 주는 `debounce` 옵션을 만들 수 있습니다:

```js
defineStore('search', {
  actions: {
    searchContacts() {
      // ...
    },
  },

  // 이것은 나중에 플러그인이 읽습니다
  debounce: {
    // searchContacts action을 300ms 동안 디바운스합니다
    searchContacts: 300,
  },
})
```

그러면 플러그인은 그 옵션을 읽어서 action을 감싸고 원래 action을 대체할 수 있습니다:

```js
// 어떤 debounce 라이브러리든 사용하세요
import debounce from 'lodash/debounce'

pinia.use(({ options, store }) => {
  if (options.debounce) {
    // 기존 action을 새로운 것으로 덮어씁니다
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

setup 문법을 사용할 때는 사용자 정의 옵션이 세 번째 인수로 전달된다는 점에 유의하세요:

```js
defineStore(
  'search',
  () => {
    // ...
  },
  {
    // 이것은 나중에 플러그인이 읽습니다
    debounce: {
      // searchContacts action을 300ms 동안 디바운스합니다
      searchContacts: 300,
    },
  }
)
```

## TypeScript %{#typescript}%

위에서 보여준 모든 것은 타입 지원과 함께 할 수 있으므로, `any`나 `@ts-ignore`를 쓸 필요가 전혀 없습니다.

### 플러그인 타입 지정 %{#typing-plugins}%

Pinia 플러그인은 다음과 같이 타입을 지정할 수 있습니다:

```ts
import { PiniaPluginContext } from 'pinia'

export function myPiniaPlugin(context: PiniaPluginContext) {
  // ...
}
```

### 새로운 스토어 속성 타입 지정 %{#typing-new-store-properties}%

스토어에 새 속성을 추가할 때는 `PiniaCustomProperties` 인터페이스도 확장해야 합니다.

```ts
import 'pinia'
import type { Router } from 'vue-router'

declare module 'pinia' {
  export interface PiniaCustomProperties {
    // setter를 사용하면 문자열과 ref 둘 다 허용할 수 있습니다
    set hello(value: string | Ref<string>)
    get hello(): string

    // 더 단순한 값도 정의할 수 있습니다
    simpleNumber: number

    // 위 플러그인이 추가한 router 타입 지정 (#adding-new-external-properties)
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
  // @ts-expect-error: 아직 이것을 올바르게 타입 지정하지 않았습니다
  store.simpleNumber = ref(Math.random())
})
```

`PiniaCustomProperties`는 스토어의 속성을 참조할 수 있게 해 주는 제네릭 타입입니다. 예를 들어 초기 옵션을 `$options`로 복사한다고 가정해 봅시다(이것은 option store에서만 동작합니다):

```ts
pinia.use(({ options }) => ({ $options: options }))
```

`PiniaCustomProperties`의 4개 제네릭 타입을 사용하면 이것을 올바르게 타입 지정할 수 있습니다:

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
제네릭 안에서 타입을 확장할 때는 **반드시 원본 코드와 정확히 같은 이름**을 사용해야 합니다. `Id`를 `id`나 `I`라고 부를 수 없고, `S`를 `State`라고 부를 수도 없습니다. 각 글자가 의미하는 바는 다음과 같습니다:

- S: State
- G: Getters
- A: Actions
- SS: Setup Store / Store

:::

### 새로운 state 타입 지정 %{#typing-new-state}%

새 state 속성을(`store`와 `store.$state` 둘 다에) 추가할 때는 대신 `PiniaCustomStateProperties`에 타입을 추가해야 합니다. `PiniaCustomProperties`와 달리 이것은 `State` 제네릭 하나만 받습니다:

```ts
import 'pinia'

declare module 'pinia' {
  export interface PiniaCustomStateProperties<S> {
    hello: string
  }
}
```

### 새로운 생성 옵션 타입 지정 %{#typing-new-creation-options}%

`defineStore()`를 위한 새로운 옵션을 만들 때는 `DefineStoreOptionsBase`를 확장해야 합니다. `PiniaCustomProperties`와 달리 여기서는 State와 Store 타입 두 개의 제네릭만 노출되므로, 무엇을 정의할 수 있을지 더 잘 제한할 수 있습니다. 예를 들어 action 이름을 사용할 수 있습니다:

```ts
import 'pinia'

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    // 어떤 action이든 ms 단위 숫자를 정의할 수 있도록 허용합니다
    debounce?: Partial<Record<keyof StoreActions<Store>, number>>
  }
}
```

:::tip

Store 타입에서 _getters_를 추출하는 `StoreGetters` 타입도 있습니다. 또한 `DefineStoreOptions`와 `DefineSetupStoreOptions` 타입을 각각 확장하면 _setup stores_ 또는 _option stores_의 옵션만 **선택적으로** 확장할 수도 있습니다.

:::

## Nuxt %{#nuxt}%

[pinia를 Nuxt와 함께 사용할 때](../ssr/nuxt.md)는 먼저 [Nuxt plugin](https://nuxt.com/docs/guide/directory-structure/plugins)을 만들어야 합니다. 그러면 `pinia` 인스턴스에 접근할 수 있습니다:

```ts{14-16}
// plugins/myPiniaPlugin.ts
import { PiniaPluginContext } from 'pinia'

function MyPiniaPlugin({ store }: PiniaPluginContext) {
  store.$subscribe((mutation) => {
    // store 변경에 반응합니다
    console.log(`[🍍 ${mutation.storeId}]: ${mutation.type}.`)
  })

  // TS를 사용 중이라면 여기는 타입 지정이 필요합니다
  return { creationTime: new Date() }
}

export default defineNuxtPlugin(({ $pinia }) => {
  $pinia.use(MyPiniaPlugin)
})
```

::: info

위 예제는 TypeScript를 사용합니다. `.js` 파일을 사용 중이라면 타입 주석 `PiniaPluginContext`와 `Plugin`, 그리고 그 import들을 제거해야 합니다.

:::

## 기존 플러그인 %{#existing-plugins}%

GitHub에서 _pinia-plugin_ 토픽으로 [기존 Pinia 플러그인](https://github.com/topics/pinia-plugin)을 확인할 수 있습니다.
