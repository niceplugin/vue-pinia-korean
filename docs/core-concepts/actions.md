# 액션 %{#actions}%

<!-- <VueSchoolLink
  href="https://vueschool.io/lessons/synchronous-and-asynchronous-actions-in-pinia"
  title="Pinia의 액션 완전히 이해하기"
/> -->

<MasteringPiniaLink
  href="https://masteringpinia.com/lessons/the-3-pillars-of-pinia-actions"
  title="Pinia의 액션 완전히 이해하기"
/>

액션은 컴포넌트의 [methods](https://vuejs.org/api/options-state.html#methods)에 해당합니다. `defineStore()`의 `actions` 속성으로 정의할 수 있으며, **비즈니스 로직을 정의하기에 완벽합니다**:

```js
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  actions: {
    // `this`에 의존하므로 화살표 함수를 사용할 수 없습니다
    increment() {
      this.count++
    },
    randomizeCounter() {
      this.count = Math.round(100 * Math.random())
    },
  },
})
```

<RuleKitLink />

[getters](./getters.md)와 마찬가지로 액션은 `this`를 통해 _스토어 인스턴스 전체_에 접근할 수 있으며, **완전한 타입 지원(자동완성 ✨ 포함)**을 받습니다. **getter와 달리 `actions`는 비동기일 수 있으므로**, 액션 안에서 어떤 API 호출이든, 심지어 다른 액션조차도 `await`할 수 있습니다! 아래는 [Mande](https://github.com/posva/mande)를 사용하는 예제입니다. 사용하는 라이브러리는 `Promise`만 반환할 수 있으면 무엇이든 상관없습니다. 네이티브 `fetch` 함수(브라우저 전용)도 사용할 수 있습니다:

```js
import { mande } from 'mande'

const api = mande('/api/users')

export const useUsers = defineStore('users', {
  state: () => ({
    userData: null,
    // ...
  }),

  actions: {
    async registerUser(login, password) {
      try {
        this.userData = await api.post({ login, password })
        showTooltip(`Welcome back ${this.userData.name}!`)
      } catch (error) {
        showTooltip(error)
        // 폼 컴포넌트가 오류를 표시하게 합니다
        return error
      }
    },
  },
})
```

원하는 어떤 인수든 자유롭게 설정하고 무엇이든 반환할 수도 있습니다. 액션을 호출할 때는 모든 것이 자동으로 추론됩니다!

액션은 일반 함수나 메서드처럼 호출됩니다:

```vue
<script setup>
const store = useCounterStore()
// 스토어의 메서드처럼 액션을 호출합니다
store.randomizeCounter()
</script>

<template>
  <!-- 템플릿 안에서도 마찬가지입니다 -->
  <button @click="store.randomizeCounter()">무작위로 바꾸기</button>
</template>
```

## 다른 스토어의 action에 접근하기 %{#accessing-other-stores-actions}%

다른 스토어를 사용하려면, _action_ 안에서 직접 _사용_하면 됩니다:

```js
import { useAuthStore } from './auth-store'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    preferences: null,
    // ...
  }),
  actions: {
    async fetchUserPreferences() {
      const auth = useAuthStore()
      if (auth.isAuthenticated) {
        this.preferences = await fetchPreferences()
      } else {
        throw new Error('User must be authenticated')
      }
    },
  },
})
```

## Options API에서 사용하기 %{#usage-with-the-options-api}%

<VueSchoolLink
  href="https://vueschool.io/lessons/access-pinia-actions-in-the-options-api"
  title="Options API에서 Pinia 액션에 접근하기"
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
  actions: {
    increment() {
      this.count++
    },
  },
})
```

### `setup()`과 함께 %{#with-setup}%

Composition API가 모두에게 맞는 것은 아니지만, `setup()` 훅을 사용하면 Options API를 쓰면서도 Pinia를 더 쉽게 다룰 수 있습니다. 별도의 map helper 함수도 필요 없습니다!

```vue
<script>
import { useCounterStore } from '../stores/counter'

export default defineComponent({
  setup() {
    const counterStore = useCounterStore()

    return { counterStore }
  },
  methods: {
    incrementAndPrint() {
      this.counterStore.increment()
      console.log('새 카운트:', this.counterStore.count)
    },
  },
})
</script>
```

### `setup()` 없이 %{#without-setup}%

Composition API를 전혀 사용하지 않고 싶다면, `mapActions()` helper를 사용해 액션 속성을 컴포넌트의 메서드로 매핑할 수 있습니다:

```js
import { mapActions } from 'pinia'
import { useCounterStore } from '../stores/counter'

export default {
  methods: {
    // 컴포넌트 안에서 this.increment()에 접근할 수 있게 합니다
    // store.increment()를 호출하는 것과 같습니다
    ...mapActions(useCounterStore, ['increment']),
    // 위와 같지만 this.myOwnName()으로 등록합니다
    ...mapActions(useCounterStore, { myOwnName: 'increment' }),
  },
}
```

## action 구독하기 %{#subscribing-to-actions}%

`store.$onAction()`으로 액션과 그 결과를 관찰할 수 있습니다. 여기에 전달하는 콜백은 액션 자체가 실행되기 전에 호출됩니다. `after`는 프로미스를 처리하며, 액션이 해결된 뒤에 함수를 실행할 수 있게 해 줍니다. 비슷하게 `onError`는 액션이 throw 하거나 reject될 때 함수를 실행하게 해 줍니다. 이것들은 [Vue 문서의 이 팁](https://vuejs.org/guide/best-practices/production-deployment#tracking-runtime-errors)과 비슷하게 런타임 오류를 추적하는 데 유용합니다.

아래는 액션 실행 전과 resolve/reject 후를 기록하는 예제입니다.

```js
const unsubscribe = someStore.$onAction(
  ({
    name, // 액션 이름
    store, // 스토어 인스턴스, `someStore`와 동일합니다
    args, // 액션에 전달된 매개변수 배열
    after, // 액션이 반환되거나 resolve된 뒤의 훅
    onError, // 액션이 throw 하거나 reject될 때의 훅
  }) => {
    // 이 특정 액션 호출에 대한 공용 변수입니다
    const startTime = Date.now()
    // `store`의 액션이 실행되기 전에 트리거됩니다
    console.log(`Start "${name}" with params [${args.join(', ')}].`)

    // 액션이 성공하고 완전히 실행된 후 트리거됩니다.
    // 반환된 프로미스가 있다면 기다립니다
    after((result) => {
      console.log(
        `Finished "${name}" after ${
          Date.now() - startTime
        }ms.\nResult: ${result}.`
      )
    })

    // 액션이 throw 하거나 reject되는 프로미스를 반환하면 트리거됩니다
    onError((error) => {
      console.warn(
        `Failed "${name}" after ${Date.now() - startTime}ms.\nError: ${error}.`
      )
    })
  }
)

// 리스너를 수동으로 제거합니다
unsubscribe()
```

기본적으로 _action subscriptions_는 추가된 컴포넌트에 바인딩됩니다(스토어가 컴포넌트의 `setup()` 안에 있다면). 즉, 컴포넌트가 언마운트되면 자동으로 제거됩니다. 컴포넌트가 언마운트된 뒤에도 유지하고 싶다면, 두 번째 인수로 `true`를 전달하여 현재 컴포넌트에서 _action subscription_을 _detach_하세요:

```vue
<script setup>
const someStore = useSomeStore()

// 이 구독은 컴포넌트가 언마운트된 뒤에도 유지됩니다
someStore.$onAction(callback, true)
</script>
```
