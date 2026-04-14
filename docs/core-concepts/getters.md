# 게터 %{#getters}%

<!-- <VueSchoolLink
  href="https://vueschool.io/lessons/getters-in-pinia"
  title="Pinia의 게터 완전히 이해하기"
/> -->

<MasteringPiniaLink
  href="https://masteringpinia.com/lessons/the-3-pillars-of-pinia-getters"
  title="Pinia의 게터 완전히 이해하기"
/>

게터는 Store의 state에 대한 [computed values](https://vuejs.org/guide/essentials/computed.html)와 정확히 같습니다. `defineStore()`의 `getters` 속성으로 정의할 수 있습니다. 게터는 첫 번째 매개변수로 `state`를 받는데, 이는 화살표 함수 사용을 **권장하기 위해서**입니다:

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

<RuleKitLink />

대부분의 경우 게터는 state에만 의존합니다. 하지만 다른 게터를 사용해야 할 때도 있습니다. 이 때문에 일반 함수를 정의할 때는 `this`를 통해 _스토어 인스턴스 전체_에 접근할 수 있지만, **반환 타입을 명시해야 합니다(TypeScript에서)**. 이는 TypeScript의 알려진 한계 때문이며, **화살표 함수로 정의한 게터나 `this`를 사용하지 않는 게터에는 영향을 주지 않습니다**:

```ts
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  getters: {
    // 반환 타입이 number로 자동 추론됩니다
    doubleCount(state) {
      return state.count * 2
    },
    // 반환 타입은 **반드시** 명시해야 합니다
    doublePlusOne(): number {
      // 스토어 전체에 대한 자동완성과 타입 지원 ✨
      return this.doubleCount + 1
    },
  },
})
```

그 다음에는 스토어 인스턴스에서 게터에 직접 접근할 수 있습니다:

```vue
<script setup>
import { useCounterStore } from './counterStore'

const store = useCounterStore()
</script>

<template>
  <p>두 배 카운트는 {{ store.doubleCount }}입니다</p>
</template>
```

## 다른 게터에 접근하기 %{#accessing-other-getters}%

computed 속성과 마찬가지로 여러 게터를 조합할 수 있습니다. 다른 게터에는 `this`를 통해 접근하세요. 이 경우에는 **게터의 반환 타입을 지정해야 합니다**.

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
// JavaScript에서는 JSDoc (https://jsdoc.app/tags-returns.html)을 사용할 수 있습니다
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  getters: {
    // `this`를 사용하지 않으므로 타입이 자동으로 추론됩니다
    doubleCount: (state) => state.count * 2,
    // 여기서는 타입을 직접 추가해야 합니다(JS에서는 JSDoc 사용). 또한 이를
    // 사용해 게터를 문서화할 수도 있습니다
    /**
     * count 값을 두 배로 한 뒤 1을 더한 값을 반환합니다.
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

## 게터에 인수 전달하기 %{#passing-arguments-to-getters}%

_getter_는 내부적으로 그저 _computed_ 속성이므로, 이들에게 매개변수를 직접 전달할 수는 없습니다. 하지만 _getter_에서 함수를 반환하면 어떤 인수든 받을 수 있습니다:

```js
export const useStore = defineStore('main', {
  getters: {
    getUserById: (state) => {
      return (userId) => state.users.find((user) => user.id === userId)
    },
  },
})
```

그리고 컴포넌트에서는 이렇게 사용합니다:

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useUserListStore } from './store'

const userList = useUserListStore()
const { getUserById } = storeToRefs(userList)
// 함수에 접근하려면 `getUserById.value`를 사용해야 한다는 점에 유의하세요
// <script setup> 안에서 말입니다
</script>

<template>
  <p>사용자 2: {{ getUserById(2) }}</p>
</template>
```

이렇게 하면 **게터가 더 이상 캐시되지 않는다는 점**에 유의하세요. 이것들은 단순히 호출하는 함수가 됩니다. 하지만 일반적이지는 않아도, 게터 자체 안에서 일부 결과를 캐시하면 더 나은 성능을 얻을 수 있습니다:

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

## 다른 스토어의 게터에 접근하기 %{#accessing-other-stores-getters}%

다른 스토어의 게터를 사용하려면, _getter_ 안에서 직접 _사용_하면 됩니다:

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

## `setup()`에서 사용하기 %{#usage-with-setup}%

게터는 store의 속성처럼 직접 접근할 수 있습니다(state 속성과 완전히 같습니다):

```vue
<script setup>
const store = useCounterStore()

store.count = 3
store.doubleCount // 6
</script>
```

## Options API에서 사용하기 %{#usage-with-the-options-api}%

<VueSchoolLink
  href="https://vueschool.io/lessons/access-pinia-getters-in-the-options-api"
  title="Options API에서 Pinia 게터에 접근하기"
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
  getters: {
    doubleCount(state) {
      return state.count * 2
    },
  },
})
```

### `setup()`과 함께 %{#with-setup}%

Composition API가 모두에게 맞는 것은 아니지만, `setup()` 훅은 Options API 안에서 Pinia를 더 쉽게 다루게 해 줄 수 있습니다. 별도의 map helper 함수도 필요 없습니다!

```vue
<script>
import { useCounterStore } from '../stores/counter'

export default defineComponent({
  setup() {
    const counterStore = useCounterStore()

    // 구조 분해하지 말고 **스토어 전체만 반환하세요**
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

이것은 Options API에서 Composition API로 컴포넌트를 마이그레이션하는 동안 유용하지만, **오직 마이그레이션 단계로만 사용해야 합니다**. 항상 같은 컴포넌트 안에서 두 API 스타일을 섞지 않도록 하세요.

### `setup()` 없이 %{#without-setup}%

[이전 state 섹션](./state.md#options-api)에서 사용한 것과 같은 `mapState()` 함수를 사용해 getter를 매핑할 수 있습니다:

```js
import { mapState } from 'pinia'
import { useCounterStore } from '../stores/counter'

export default {
  computed: {
    // 컴포넌트 안에서 this.doubleCount에 접근할 수 있게 합니다
    // store.doubleCount를 읽는 것과 같습니다
    ...mapState(useCounterStore, ['doubleCount']),
    // 위와 같지만 this.myOwnName으로 등록합니다
    ...mapState(useCounterStore, {
      myOwnName: 'doubleCount',
      // 스토어에 접근할 수 있는 함수를 작성할 수도 있습니다
      double: (store) => store.doubleCount,
    }),
  },
}
```
