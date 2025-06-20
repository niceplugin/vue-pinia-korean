# 액션 %{#actions}%

<!-- <VueSchoolLink
  href="https://vueschool.io/lessons/synchronous-and-asynchronous-actions-in-pinia"
  title="Learn all about actions in Pinia"
/> -->

<MasteringPiniaLink
  href="https://masteringpinia.com/lessons/the-3-pillars-of-pinia-actions"
  title="Pinia의 액션에 대해 모두 알아보기"
/>

액션은 컴포넌트의 [메서드](https://vuejs.org/api/options-state.html#methods)와 동일합니다. `defineStore()`의 `actions` 속성으로 정의할 수 있으며, **비즈니스 로직을 정의하기에 완벽합니다**:

```js
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  actions: {
    // `this`를 사용하므로, 화살표 함수는 사용할 수 없습니다
    increment() {
      this.count++
    },
    randomizeCounter() {
      this.count = Math.round(100 * Math.random())
    },
  },
})
```

[getters](./getters.md)와 마찬가지로, 액션은 **전체 스토어 인스턴스**에 `this`를 통해 접근할 수 있으며 **완전한 타입(및 자동완성 ✨) 지원**을 받습니다. **getter와 달리, `actions`는 비동기일 수 있습니다.** 액션 내부에서 API 호출이나 다른 액션을 `await`할 수 있습니다! 아래는 [Mande](https://github.com/posva/mande)를 사용하는 예시입니다. 어떤 라이브러리를 사용하든 `Promise`만 반환하면 상관없습니다. 브라우저 환경에서는 네이티브 `fetch` 함수도 사용할 수 있습니다:

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
        // 폼 컴포넌트가 에러를 표시할 수 있도록 반환
        return error
      }
    },
  },
})
```

원하는 인자를 자유롭게 설정하고, 어떤 값이든 반환할 수 있습니다. 액션을 호출할 때 모든 것이 자동으로 추론됩니다!

액션은 일반 함수나 메서드처럼 호출합니다:

```vue
<script setup>
const store = useCounterStore()
// 스토어의 메서드로 액션을 호출
store.randomizeCounter()
</script>

<template>
  <!-- 템플릿에서도 사용 가능 -->
  <button @click="store.randomizeCounter()">Randomize</button>
</template>
```

## 다른 스토어의 액션 접근하기 %{#accessing-other-stores-actions}%

다른 스토어를 사용하려면, _액션_ 내부에서 직접 _사용_하면 됩니다:

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

## Options API에서의 사용 %{#usage-with-the-options-api}%

<VueSchoolLink
  href="https://vueschool.io/lessons/access-pinia-actions-in-the-options-api"
  title="Options API에서 Pinia Getter 접근하기"
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
  actions: {
    increment() {
      this.count++
    },
  },
})
```

### `setup()`과 함께 사용하기 %{#with-setup}%

Composition API가 모두에게 맞는 것은 아니지만, Options API를 사용할 때 `setup()` 훅을 사용하면 Pinia를 더 쉽게 다룰 수 있습니다. 별도의 map 헬퍼 함수가 필요 없습니다!

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
      console.log('New Count:', this.counterStore.count)
    },
  },
})
</script>
```

### `setup()` 없이 사용하기 %{#without-setup}%

Composition API를 전혀 사용하고 싶지 않다면, `mapActions()` 헬퍼를 사용하여 액션 속성을 컴포넌트의 메서드로 매핑할 수 있습니다:

```js
import { mapActions } from 'pinia'
import { useCounterStore } from '../stores/counter'

export default {
  methods: {
    // 컴포넌트 내부에서 this.increment()로 접근 가능
    // store.increment()를 호출하는 것과 동일
    ...mapActions(useCounterStore, ['increment']),
    // 위와 같지만 this.myOwnName()으로 등록됨
    ...mapActions(useCounterStore, { myOwnName: 'increment' }),
  },
}
```

## 액션 구독하기 %{#subscribing-to-actions}%

`store.$onAction()`을 사용하여 액션과 그 결과를 관찰할 수 있습니다. 전달된 콜백은 액션 자체가 실행되기 전에 실행됩니다. `after`는 프로미스를 처리하며, 액션이 resolve된 후에 함수를 실행할 수 있습니다. 비슷하게, `onError`는 액션이 throw하거나 reject될 때 함수를 실행할 수 있습니다. 이는 런타임 에러를 추적하는 데 유용하며, [Vue 문서의 이 팁](https://vuejs.org/guide/best-practices/production-deployment#tracking-runtime-errors)과 유사합니다.

아래는 액션 실행 전과 resolve/reject 후에 로그를 남기는 예시입니다.

```js
const unsubscribe = someStore.$onAction(
  ({
    name, // 액션 이름
    store, // 스토어 인스턴스, `someStore`와 동일
    args, // 액션에 전달된 파라미터 배열
    after, // 액션이 반환되거나 resolve된 후의 훅
    onError, // 액션이 throw하거나 reject될 때의 훅
  }) => {
    // 이 액션 호출에만 해당하는 공유 변수
    const startTime = Date.now()
    // `store`에서 액션이 실행되기 전에 트리거됨
    console.log(`Start "${name}" with params [${args.join(', ')}].`)

    // 액션이 성공적으로 실행되고 완전히 끝난 후 트리거됨.
    // 반환된 프로미스를 기다림
    after((result) => {
      console.log(
        `Finished "${name}" after ${
          Date.now() - startTime
        }ms.\nResult: ${result}.`
      )
    })

    // 액션이 throw하거나 reject된 프로미스를 반환할 때 트리거됨
    onError((error) => {
      console.warn(
        `Failed "${name}" after ${Date.now() - startTime}ms.\nError: ${error}.`
      )
    })
  }
)

// 리스너를 수동으로 제거
unsubscribe()
```

기본적으로, _액션 구독_은 추가된 컴포넌트에 바인딩됩니다(스토어가 컴포넌트의 `setup()` 내부에 있을 때). 즉, 컴포넌트가 언마운트될 때 자동으로 제거됩니다. 컴포넌트가 언마운트된 후에도 유지하고 싶다면, 두 번째 인자로 `true`를 전달하여 _액션 구독_을 현재 컴포넌트에서 _분리_할 수 있습니다:

```vue
<script setup>
const someStore = useSomeStore()

// 이 구독은 컴포넌트가 언마운트된 후에도 유지됩니다
someStore.$onAction(callback, true)
</script>
```