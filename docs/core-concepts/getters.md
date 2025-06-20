# 게터 %{#getters}%

<!-- <VueSchoolLink
  href="https://vueschool.io/lessons/getters-in-pinia"
  title="Learn all about getters in Pinia"
/> -->

<MasteringPiniaLink
  href="https://masteringpinia.com/lessons/the-3-pillars-of-pinia-getters"
  title="Learn all about getters in Pinia"
/>

게터는 스토어의 상태에 대한 [computed 값](https://vuejs.org/guide/essentials/computed.html)과 정확히 동일합니다. `defineStore()`의 `getters` 속성으로 정의할 수 있습니다. **화살표 함수 사용을 장려하기 위해** `state`를 첫 번째 매개변수로 받습니다:

```js
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
  },
})
```

대부분의 경우, 게터는 상태에만 의존합니다. 그러나 다른 게터를 사용할 필요가 있을 수도 있습니다. 이 때문에, 일반 함수를 정의할 때 `this`를 통해 _전체 스토어 인스턴스_에 접근할 수 있습니다. **하지만 반환 타입을 명시적으로 지정해야 합니다(TypeScript에서)**. 이는 TypeScript의 알려진 한계 때문이며, **화살표 함수로 정의된 게터나 `this`를 사용하지 않는 게터에는 영향을 주지 않습니다**:

```ts
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  getters: {
    // 반환 타입이 자동으로 number로 추론됨
    doubleCount(state) {
      return state.count * 2
    },
    // 반환 타입을 **명시적으로** 지정해야 함
    doublePlusOne(): number {
      // 전체 스토어에 대한 자동완성 및 타입 지원 ✨
      return this.doubleCount + 1
    },
  },
})
```

그런 다음 스토어 인스턴스에서 직접 게터에 접근할 수 있습니다:

```vue
<script setup>
import { useCounterStore } from './counterStore'

const store = useCounterStore()
</script>

<template>
  <p>Double count is {{ store.doubleCount }}</p>
</template>
```

## 다른 게터 접근하기 %{#accessing-other-getters}%

computed 속성과 마찬가지로, 여러 게터를 조합할 수 있습니다. `this`를 통해 다른 게터에 접근하세요. 이 경우, **게터의 반환 타입을 지정해야 합니다**.

::: code-group

```ts [counterStore.ts]
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  getters: {
    doubleCount(state) {
      return state.count * 2
    },
    doubleCountPlusOne(): number {
      return this.doubleCount + 1
    },
  },
})
```

```js [counterStore.js]
// JavaScript에서는 JSDoc(https://jsdoc.app/tags-returns.html)을 사용할 수 있습니다
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  getters: {
    // `this`를 사용하지 않으므로 타입이 자동으로 추론됨
    doubleCount: (state) => state.count * 2,
    // 여기서는 타입을 직접 추가해야 함(JS에서는 JSDoc 사용). 또한
    // 게터에 대한 문서화도 할 수 있음
    /**
     * count 값을 두 배로 한 후 1을 더해 반환합니다.
     *
     * @returns {number}
     */
    doubleCountPlusOne() {
      // 자동완성 ✨
      return this.doubleCount + 1
    },
  },
})
```

:::

## 게터에 인자 전달하기 %{#passing-arguments-to-getters}%

_게터_는 내부적으로 _computed_ 속성일 뿐이므로, 인자를 전달할 수 없습니다. 하지만, _게터_에서 함수를 반환하여 인자를 받을 수 있습니다:

```js
export const useStore = defineStore('main', {
  getters: {
    getUserById: (state) => {
      return (userId) => state.users.find((user) => user.id === userId)
    },
  },
})
```

그리고 컴포넌트에서 사용하기:

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useUserListStore } from './store'

const userList = useUserListStore()
const { getUserById } = storeToRefs(userList)
// <script setup> 내에서 함수에 접근하려면 반드시 `getUserById.value`를 사용해야 함에 유의
</script>

<template>
  <p>User 2: {{ getUserById(2) }}</p>
</template>
```

이렇게 하면 **게터가 더 이상 캐시되지 않는다는 점**에 유의하세요. 단순히 호출하는 함수가 됩니다. 하지만, 게터 내부에서 일부 결과를 캐시할 수 있습니다. 이는 흔하지 않지만 성능상 더 유리할 수 있습니다:

```js
export const useStore = defineStore('main', {
  getters: {
    getActiveUserById(state) {
      const activeUsers = state.users.filter((user) => user.active)
      return (userId) => activeUsers.find((user) => user.id === userId)
    },
  },
})
```

## 다른 스토어의 게터 접근하기 %{#accessing-other-stores-getters}%

다른 스토어의 게터를 사용하려면, _게터_ 내부에서 직접 _사용_할 수 있습니다:

```js
import { useOtherStore } from './other-store'

export const useStore = defineStore('main', {
  state: () => ({
    // ...
  }),
  getters: {
    otherGetter(state) {
      const otherStore = useOtherStore()
      return state.localData + otherStore.data
    },
  },
})
```

## `setup()`에서의 사용 %{#usage-with-setup}%

스토어의 모든 게터에 (상태 속성과 정확히 동일하게) 직접 접근할 수 있습니다:

```vue
<script setup>
const store = useCounterStore()

store.count = 3
store.doubleCount // 6
</script>
```

## Options API에서의 사용 %{#usage-with-the-options-api}%

<VueSchoolLink
  href="https://vueschool.io/lessons/access-pinia-getters-in-the-options-api"
  title="Access Pinia Getters via the Options API"
/>

다음 예시에서는 아래와 같은 스토어가 생성되었다고 가정합니다:

```js
// 예시 파일 경로:
// ./src/stores/counter.js

import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  getters: {
    doubleCount(state) {
      return state.count * 2
    },
  },
})
```

### `setup()`과 함께 %{#with-setup}%

Composition API가 모두에게 적합한 것은 아니지만, `setup()` 훅을 사용하면 Options API에서 Pinia를 더 쉽게 사용할 수 있습니다. 별도의 map 헬퍼 함수가 필요 없습니다!

```vue
<script>
import { useCounterStore } from '../stores/counter'

export default defineComponent({
  setup() {
    const counterStore = useCounterStore()

    // **전체 스토어만 반환**하고 구조 분해하지 마세요
    return { counterStore }
  },
  computed: {
    quadrupleCounter() {
      return this.counterStore.doubleCount * 2
    },
  },
})
</script>
```

이는 컴포넌트를 Options API에서 Composition API로 마이그레이션할 때 유용하지만, **마이그레이션 단계에서만 사용해야 합니다**. 한 컴포넌트 내에서 두 API 스타일을 혼용하지 않도록 항상 주의하세요.

### `setup()` 없이 %{#without-setup}%

[이전 state 섹션](./state.md#options-api)에서 사용한 것과 동일한 `mapState()` 함수를 사용하여 게터를 매핑할 수 있습니다:

```js
import { mapState } from 'pinia'
import { useCounterStore } from '../stores/counter'

export default {
  computed: {
    // 컴포넌트 내에서 this.doubleCount로 접근 가능
    // store.doubleCount에서 읽는 것과 동일
    ...mapState(useCounterStore, ['doubleCount']),
    // 위와 같지만 this.myOwnName으로 등록됨
    ...mapState(useCounterStore, {
      myOwnName: 'doubleCount',
      // 스토어에 접근할 수 있는 함수를 작성할 수도 있음
      double: (store) => store.doubleCount,
    }),
  },
}
```
