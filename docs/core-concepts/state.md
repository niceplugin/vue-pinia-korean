# 상태 %{#state}%

<!-- <VueSchoolLink
  href="https://vueschool.io/lessons/access-state-from-a-pinia-store"
  title="Pinia의 상태 완전히 이해하기"
/> -->

<MasteringPiniaLink
  href="https://masteringpinia.com/lessons/the-3-pillars-of-pinia-state"
  title="Pinia의 상태 완전히 이해하기"
/>

state는 대부분의 경우 스토어의 중심이 되는 부분입니다. 사람들은 종종 자신의 앱을 나타내는 state를 정의하는 것부터 시작합니다. Pinia에서 state는 초기 state를 반환하는 함수로 정의됩니다. 이 덕분에 Pinia는 서버와 클라이언트 양쪽 모두에서 동작할 수 있습니다.

```js
import { defineStore } from 'pinia'

export const useStore = defineStore('storeId', {
  // 완전한 타입 추론을 위해 화살표 함수를 권장합니다
  state: () => {
    return {
      // 이 모든 속성은 자동으로 타입이 추론됩니다
      count: 0,
      name: 'Eduardo',
      isAdmin: true,
      items: [],
      hasChanged: true,
    }
  },
})
```

:::tip

Vue가 state를 올바르게 감지하려면, 초기값이 `undefined`이더라도 모든 state 조각을 `state` 안에 선언해야 합니다.

:::

<RuleKitLink />

## TypeScript %{#typescript}%

state를 TS와 호환되게 만들기 위해 해야 할 일은 많지 않습니다. [`strict`](https://www.typescriptlang.org/tsconfig#strict), 혹은 최소한 [`noImplicitThis`](https://www.typescriptlang.org/tsconfig#noImplicitThis)가 활성화되어 있으면 Pinia가 state의 타입을 자동으로 추론합니다! 하지만 몇 가지 경우에는 타입 단언으로 도와주어야 합니다:

```ts
export const useUserStore = defineStore('user', {
  state: () => {
    return {
      // 처음에 비어 있는 리스트를 위한 경우
      userList: [] as UserInfo[],
      // 아직 로드되지 않은 데이터를 위한 경우
      user: null as UserInfo | null,
    }
  },
})

interface UserInfo {
  name: string
  age: number
}
```

원한다면 interface로 state를 정의하고 `state()`의 반환 타입을 지정할 수도 있습니다:

```ts
interface State {
  userList: UserInfo[]
  user: UserInfo | null
}

export const useUserStore = defineStore('user', {
  state: (): State => {
    return {
      userList: [],
      user: null,
    }
  },
})

interface UserInfo {
  name: string
  age: number
}
```

## `state`에 접근하기 %{#accessing-the-state}%

기본적으로는 `store` 인스턴스를 통해 state에 직접 읽고 쓸 수 있습니다:

```ts
const store = useStore()

store.count++
```

그렇습니다. 즉 Vuex처럼 **장황한 래퍼가 필요 없으므로**, `v-model`에 바로 바인딩할 수 있습니다:

```vue-html
<input v-model="store.count" type="number" />
```

::: info

`state()`에 정의하지 않았다면 **새로운 state 속성을 추가할 수 없습니다**. 초기 state를 포함하고 있어야 합니다. 예를 들어 `secondCount`가 `state()`에 정의되어 있지 않다면 `store.secondCount = 2`는 할 수 없습니다.

:::

## state 초기화하기 %{#resetting-the-state}%

[Option Stores](/core-concepts/index.md#option-stores)에서는 스토어의 `$reset()` 메서드를 호출해 state를 초기값으로 _초기화_할 수 있습니다:

```js
const store = useStore()

store.$reset()
```

내부적으로는 `state()` 함수를 호출해 새로운 state 객체를 만들고 현재 state를 그것으로 교체합니다.

[Setup Stores](/core-concepts/index.md#setup-stores)에서는 직접 `$reset()` 메서드를 만들어야 합니다:

```ts
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)

  function $reset() {
    count.value = 0
  }

  return { count, $reset }
})
```

### Options API에서 사용하기 %{#usage-with-the-options-api}%

<VueSchoolLink
  href="https://vueschool.io/lessons/access-pinia-state-in-the-options-api"
  title="Options API로 Pinia 상태에 접근하기"
/>

다음 예제들에서는 아래와 같은 스토어가 생성되었다고 가정할 수 있습니다:

```js
// Example File Path:
// ./src/stores/counter.js

import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
})
```

Composition API를 사용하지 않고 `computed`, `methods`, ...를 사용한다면, `mapState()` helper로 state 속성을 읽기 전용 computed 속성으로 매핑할 수 있습니다:

```js
import { mapState } from 'pinia'
import { useCounterStore } from '../stores/counter'

export default {
  computed: {
    // 컴포넌트 안에서 this.count에 접근할 수 있게 합니다
    // store.count를 읽는 것과 같습니다
    ...mapState(useCounterStore, ['count'])
    // 위와 같지만 this.myOwnName으로 등록합니다
    ...mapState(useCounterStore, {
      myOwnName: 'count',
      // 스토어에 접근할 수 있는 함수를 작성할 수도 있습니다
      double: store => store.count * 2,
      // `this`에도 접근할 수 있지만 타입은 올바르게 잡히지 않습니다...
      magicValue(store) {
        return store.someGetter + this.count + this.double
      },
    }),
  },
}
```

#### 수정 가능한 state %{#modifiable-state}%

이 state 속성들에 쓸 수도 있어야 한다면(예: 폼이 있을 경우), `mapWritableState()`를 대신 사용할 수 있습니다. `mapState()`와 달리 함수는 전달할 수 없다는 점에 유의하세요:

```js
import { mapWritableState } from 'pinia'
import { useCounterStore } from '../stores/counter'

export default {
  computed: {
    // 컴포넌트 안에서 this.count에 접근하고 값을 설정할 수도 있습니다
    // this.count++
    // store.count를 읽는 것과 같습니다
    ...mapWritableState(useCounterStore, ['count']),
    // 위와 같지만 this.myOwnName으로 등록합니다
    ...mapWritableState(useCounterStore, {
      myOwnName: 'count',
    }),
  },
}
```

:::tip
배열 같은 컬렉션의 경우 전체 배열을 `cartItems = []`처럼 교체하는 것이 아니라면 `mapWritableState()`는 필요하지 않습니다. `mapState()`로도 컬렉션 메서드를 호출할 수 있습니다.
:::

## state 변경하기 %{#mutating-the-state}%

<!-- TODO: `strictMode`로 이것을 비활성화 -->

`store.count++`로 스토어를 직접 변경하는 것 외에도 `$patch` 메서드를 호출할 수 있습니다. 이 메서드는 부분 `state` 객체로 여러 변경을 한 번에 적용할 수 있게 해 줍니다:

```js
store.$patch({
  count: store.count + 1,
  age: 120,
  name: 'DIO',
})
```

하지만 어떤 변경은 이 문법으로 적용하기가 어렵거나 비용이 큽니다. 컬렉션 수정(예: 배열에 요소 추가, 제거, splice)은 새 컬렉션을 만들어야 하기 때문입니다. 그래서 `$patch` 메서드는 패치 객체로 적용하기 어려운 이런 변경들을 묶기 위해 함수를 받는 방식도 지원합니다:

```js
store.$patch((state) => {
  state.items.push({ name: 'shoes', quantity: 1 })
  state.hasChanged = true
})
```

<!-- TODO: `strictMode`, `{ noDirectPatch: true }`로 이것을 비활성화 -->

여기서 핵심 차이는 `$patch()`가 여러 변경을 devtools 안의 단일 항목 하나로 묶어 준다는 점입니다. **state에 대한 직접 변경과 `$patch()` 모두 devtools에 추적되며** 타임 트래블도 할 수 있다는 점에 유의하세요.

## `state` 교체하기 %{#replacing-the-state}%

스토어의 state를 **정확히 그대로 교체할 수는 없습니다**. 그러면 반응성이 깨지기 때문입니다. 하지만 _patch_는 할 수 있습니다:

```js
// 이것은 실제로 `$state`를 교체하지 않습니다
store.$state = { count: 24 }
// 내부적으로는 `$patch()`를 호출합니다:
store.$patch({ count: 24 })
```

`pinia` 인스턴스의 `state`를 변경해 애플리케이션 전체의 **초기 상태를 설정할 수도 있습니다**. 이것은 [SSR 하이드레이션](../ssr/#state-hydration) 중에 사용됩니다.

```js
pinia.state.value = {}
```

## state 구독하기 %{#subscribing-to-the-state}%

Vuex의 [subscribe 메서드](https://vuex.vuejs.org/api/#subscribe)와 비슷하게, 스토어의 `$subscribe()` 메서드로 state와 그 변화를 관찰할 수 있습니다. 일반 `watch()`보다 `$subscribe()`를 사용하는 장점은 _patches_ 이후에 _subscriptions_가 한 번만 트리거된다는 점입니다(예: 위의 함수 버전을 사용할 때).

```js
cartStore.$subscribe((mutation, state) => {
  // import { MutationType } from 'pinia'
  mutation.type // 'direct' | 'patch object' | 'patch function'
  // cartStore.$id와 같습니다
  mutation.storeId // 'cart'
  // mutation.type === 'patch object'일 때만 사용할 수 있습니다
  mutation.payload // cartStore.$patch()에 전달된 patch 객체

  // state가 바뀔 때마다 전체 state를 로컬 스토리지에 저장합니다
  localStorage.setItem('cart', JSON.stringify(state))
})
```

### 플러시 타이밍 %{#flush-timing}%

내부적으로 `$subscribe()`는 Vue의 `watch()` 함수를 사용합니다. `watch()`에 전달하듯 똑같은 옵션을 넘길 수 있습니다. 이는 **각** state 변경 직후에 구독을 바로 트리거하고 싶을 때 유용합니다:

```ts{4}
cartStore.$subscribe((mutation, state) => {
  // state가 바뀔 때마다 전체 state를 로컬 스토리지에 저장합니다
  localStorage.setItem('cart', JSON.stringify(state))
}, { flush: 'sync' })
```

### 구독 분리하기 %{#detaching-subscriptions}%

기본적으로 _state subscriptions_는 추가된 컴포넌트에 바인딩됩니다(스토어가 컴포넌트의 `setup()` 안에 있다면). 즉, 컴포넌트가 언마운트되면 자동으로 제거됩니다. 컴포넌트가 언마운트된 뒤에도 유지하고 싶다면, 두 번째 인수로 `{ detached: true }`를 전달해 현재 컴포넌트에서 _state subscription_을 _detach_하세요:

```vue
<script setup>
const someStore = useSomeStore()

// 이 구독은 컴포넌트가 언마운트된 뒤에도 유지됩니다
someStore.$subscribe(callback, { detached: true })
</script>
```

:::tip
`pinia` 인스턴스의 전체 state는 단일 `watch()`로 _watch_할 수 있습니다:

```js
watch(
  pinia.state,
  (state) => {
    // state가 바뀔 때마다 전체 state를 로컬 스토리지에 저장합니다
    localStorage.setItem('piniaState', JSON.stringify(state))
  },
  { deep: true }
)
```

:::
