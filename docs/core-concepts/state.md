# 상태 %{#state}%

<!-- <VueSchoolLink
  href="https://vueschool.io/lessons/access-state-from-a-pinia-store"
  title="Learn all about state in Pinia"
/> -->

<MasteringPiniaLink
  href="https://masteringpinia.com/lessons/the-3-pillars-of-pinia-state"
  title="Learn all about state in Pinia"
/>

상태는 대부분의 경우 스토어의 중심이 되는 부분입니다. 사람들은 종종 앱을 나타내는 상태를 정의하는 것부터 시작합니다. Pinia에서 상태는 초기 상태를 반환하는 함수로 정의됩니다. 이는 Pinia가 서버와 클라이언트 모두에서 동작할 수 있게 해줍니다.

```js
import { defineStore } from 'pinia'

export const useStore = defineStore('storeId', {
  // 전체 타입 추론을 위해 화살표 함수 사용을 권장합니다
  state: () => {
    return {
      // 이 모든 속성들은 자동으로 타입이 추론됩니다
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

Vue가 상태를 제대로 감지하려면, 초기 값이 `undefined`이더라도 모든 상태 항목을 반드시 `state`에 선언해야 합니다.

:::

## 타입스크립트 %{#typescript}%

상태를 TS와 호환되게 만들기 위해 특별히 할 일은 많지 않습니다: [`strict`](https://www.typescriptlang.org/tsconfig#strict) 또는 최소한 [`noImplicitThis`](https://www.typescriptlang.org/tsconfig#noImplicitThis)가 활성화되어 있으면 Pinia가 상태의 타입을 자동으로 추론합니다! 하지만 몇몇 경우에는 타입 캐스팅을 도와줘야 할 때가 있습니다:

```ts
export const useUserStore = defineStore('user', {
  state: () => {
    return {
      // 처음에 비어 있는 리스트의 경우
      userList: [] as UserInfo[],
      // 아직 로드되지 않은 데이터의 경우
      user: null as UserInfo | null,
    }
  },
})

interface UserInfo {
  name: string
  age: number
}
```

원한다면, 인터페이스로 상태를 정의하고 `state()`의 반환값에 타입을 지정할 수도 있습니다:

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

## `state` 접근하기 %{#accessing-the-state}%

기본적으로, `store` 인스턴스를 통해 상태를 직접 읽고 쓸 수 있습니다:

```js
const store = useStore()

store.count++
```

`state()`에 정의하지 않은 새로운 상태 속성을 **추가할 수 없습니다**. 반드시 초기 상태에 포함되어야 합니다. 예를 들어: `state()`에 `secondCount`가 정의되어 있지 않다면 `store.secondCount = 2`와 같이 할 수 없습니다.

## 상태 초기화 %{#resetting-the-state}%

[옵션 스토어](/core-concepts/index.md#option-stores)에서는, 스토어의 `$reset()` 메서드를 호출하여 상태를 _초기값_으로 되돌릴 수 있습니다:

```js
const store = useStore()

store.$reset()
```

내부적으로는, `state()` 함수를 호출하여 새로운 상태 객체를 만들고 현재 상태를 그것으로 교체합니다.

[셋업 스토어](/core-concepts/index.md#setup-stores)에서는, 직접 `$reset()` 메서드를 만들어야 합니다:

```ts
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)

  function $reset() {
    count.value = 0
  }

  return { count, $reset }
})
```

### 옵션 API에서의 사용 %{#usage-with-the-options-api}%

<VueSchoolLink
  href="https://vueschool.io/lessons/access-pinia-state-in-the-options-api"
  title="Access Pinia State via the Options API"
/>

다음 예제에서는 아래와 같은 스토어가 생성되었다고 가정합니다:

```js
// 예시 파일 경로:
// ./src/stores/counter.js

import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
})
```

Composition API를 사용하지 않고, `computed`, `methods` 등을 사용하는 경우, `mapState()` 헬퍼를 사용하여 상태 속성을 읽기 전용 계산 속성으로 매핑할 수 있습니다:

```js
import { mapState } from 'pinia'
import { useCounterStore } from '../stores/counter'

export default {
  computed: {
    // 컴포넌트 내부에서 this.count로 접근할 수 있습니다
    // store.count를 읽는 것과 동일합니다
    ...mapState(useCounterStore, ['count'])
    // 위와 같지만 this.myOwnName으로 등록됩니다
    ...mapState(useCounterStore, {
      myOwnName: 'count',
      // 스토어에 접근할 수 있는 함수를 작성할 수도 있습니다
      double: store => store.count * 2,
      // `this`에 접근할 수 있지만 타입이 올바르게 지정되지는 않습니다...
      magicValue(store) {
        return store.someGetter + this.count + this.double
      },
    }),
  },
}
```

#### 수정 가능한 상태 %{#modifiable-state}%

이러한 상태 속성에 값을 쓸 수 있도록 하려면(예: 폼이 있는 경우), 대신 `mapWritableState()`를 사용할 수 있습니다. 단, `mapState()`처럼 함수는 전달할 수 없습니다:

```js
import { mapWritableState } from 'pinia'
import { useCounterStore } from '../stores/counter'

export default {
  computed: {
    // 컴포넌트 내부에서 this.count로 접근 및 설정이 가능합니다
    // this.count++
    // store.count를 읽는 것과 동일합니다
    ...mapWritableState(useCounterStore, ['count']),
    // 위와 같지만 this.myOwnName으로 등록됩니다
    ...mapWritableState(useCounterStore, {
      myOwnName: 'count',
    }),
  },
}
```

:::tip
배열과 같은 컬렉션에는 전체 배열을 `cartItems = []`로 교체하지 않는 한 `mapWritableState()`가 필요하지 않습니다. `mapState()`만으로도 컬렉션의 메서드를 호출할 수 있습니다.
:::

## 상태 변경 %{#mutating-the-state}%

<!-- TODO: disable this with `strictMode` -->

`store.count++`와 같이 스토어를 직접 변경하는 것 외에도, `$patch` 메서드를 호출할 수 있습니다. 이는 부분적인 `state` 객체로 여러 변경을 한 번에 적용할 수 있게 해줍니다:

```js
store.$patch({
  count: store.count + 1,
  age: 120,
  name: 'DIO',
})
```

하지만, 이 문법으로 적용하기 어렵거나 비용이 많이 드는 변경도 있습니다: 컬렉션 수정(예: 배열에 요소 추가, 삭제, splice 등)은 새로운 컬렉션을 만들어야 합니다. 이런 경우를 위해 `$patch` 메서드는 패치 객체로 적용하기 어려운 변경을 함수로 묶어서 적용할 수도 있습니다:

```js
store.$patch((state) => {
  state.items.push({ name: 'shoes', quantity: 1 })
  state.hasChanged = true
})
```

<!-- TODO: disable this with `strictMode`, `{ noDirectPatch: true }` -->

여기서 주요 차이점은 `$patch()`를 사용하면 여러 변경을 devtools의 하나의 항목으로 묶을 수 있다는 점입니다. **state에 대한 직접 변경과 `$patch()` 모두 devtools에서 추적되며, 타임 트래블이 가능합니다.**

## `state` 교체하기 %{#replacing-the-state}%

스토어의 상태를 **정확히 교체할 수는 없습니다**. 그렇게 하면 반응성이 깨지기 때문입니다. 대신 _패치_할 수 있습니다:

```js
// 실제로는 `$state`를 교체하지 않습니다
store.$state = { count: 24 }
// 내부적으로는 `$patch()`를 호출합니다:
store.$patch({ count: 24 })
```

또한, 전체 애플리케이션의 **초기 상태를 설정**하려면 `pinia` 인스턴스의 `state`를 변경할 수 있습니다. 이는 [SSR 하이드레이션](../ssr/#state-hydration) 중에 사용됩니다.

```js
pinia.state.value = {}
```

## 상태 구독하기 %{#subscribing-to-the-state}%

스토어의 `$subscribe()` 메서드를 통해 상태와 그 변화를 감시할 수 있습니다. 이는 Vuex의 [subscribe 메서드](https://vuex.vuejs.org/api/#subscribe)와 유사합니다. `$subscribe()`를 일반 `watch()` 대신 사용하는 장점은 _구독_이 _패치_ 이후에 한 번만 트리거된다는 점입니다(위에서 사용한 함수 버전처럼).

```js
cartStore.$subscribe((mutation, state) => {
  // import { MutationType } from 'pinia'
  mutation.type // 'direct' | 'patch object' | 'patch function'
  // cartStore.$id와 동일
  mutation.storeId // 'cart'
  // mutation.type === 'patch object'일 때만 사용 가능
  mutation.payload // cartStore.$patch()에 전달된 패치 객체

  // 상태가 변경될 때마다 전체 상태를 로컬 스토리지에 저장
  localStorage.setItem('cart', JSON.stringify(state))
})
```

### 플러시 타이밍 %{#flush-timing}%

내부적으로 `$subscribe()`는 Vue의 `watch()` 함수를 사용합니다. `watch()`에서 사용할 수 있는 옵션을 동일하게 전달할 수 있습니다. 이는 **각** 상태 변경 후 즉시 구독을 트리거하고 싶을 때 유용합니다:

```ts{4}
cartStore.$subscribe((state) => {
  // 상태가 변경될 때마다 전체 상태를 로컬 스토리지에 저장
  localStorage.setItem('cart', JSON.stringify(state))
}, { flush: 'sync' })
```

### 구독 해제 %{#detaching-subscriptions}%

기본적으로, _상태 구독_은 추가된 컴포넌트에 바인딩됩니다(스토어가 컴포넌트의 `setup()` 내부에 있을 때). 즉, 컴포넌트가 언마운트되면 자동으로 제거됩니다. 컴포넌트가 언마운트된 후에도 구독을 유지하고 싶다면, 두 번째 인자로 `{ detached: true }`를 전달하여 _상태 구독_을 현재 컴포넌트에서 _분리_할 수 있습니다:

```vue
<script setup>
const someStore = useSomeStore()

// 이 구독은 컴포넌트가 언마운트된 후에도 유지됩니다
someStore.$subscribe(callback, { detached: true })
</script>
```

:::tip
`pinia` 인스턴스의 전체 상태를 단일 `watch()`로 _감시_할 수 있습니다:

```js
watch(
  pinia.state,
  (state) => {
    // 상태가 변경될 때마다 전체 상태를 로컬 스토리지에 저장
    localStorage.setItem('piniaState', JSON.stringify(state))
  },
  { deep: true }
)
```

:::
