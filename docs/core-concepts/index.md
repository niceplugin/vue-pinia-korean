# 스토어 정의하기 %{#defining-a-store}%

<!-- <VueSchoolLink
  href="https://vueschool.io/lessons/define-your-first-pinia-store"
  title="Pinia에서 스토어를 정의하고 사용하는 방법 배우기"
/> -->

<MasteringPiniaLink
  href="https://play.gumlet.io/embed/651ecff2e4c322668b0a17af"
  mp-link="https://masteringpinia.com/lessons/quick-start-with-pinia"
  title="Pinia 시작하기"
/>

핵심 개념으로 들어가기 전에, 스토어는 `defineStore()`를 사용해 정의되며 첫 번째 인수로 전달되는 **고유한** 이름이 필요하다는 점을 알아야 합니다:

```js
import { defineStore } from 'pinia'

// `defineStore()`의 반환값에는 원하는 어떤 이름이든 붙일 수 있지만,
// 스토어 이름을 사용하고 앞뒤에 `use`와
// `Store`를 붙이는 것이 가장 좋습니다(예: `useUserStore`, `useCartStore`, `useProductStore`)
// 첫 번째 인수는 애플리케이션 전체에서 고유한 스토어 id입니다
export const useAlertsStore = defineStore('alerts', {
  // 다른 옵션들...
})
```

이 _이름_은 _id_라고도 하며, 반드시 필요하고 Pinia가 스토어를 devtools에 연결할 때 사용됩니다. 반환된 함수를 _use..._ 형태로 이름 짓는 것은 컴포저블 전반에서 사용을 자연스럽게 만들기 위한 관례입니다.

`defineStore()`는 두 번째 인수로 서로 다른 두 값을 받습니다. Setup 함수 또는 Options 객체입니다.

<RuleKitLink />

## Option Stores %{#option-stores}%

Vue의 Options API와 비슷하게, `state`, `actions`, `getters` 속성을 가진 Options 객체를 전달할 수도 있습니다.

```js {2-10}
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0, name: 'Eduardo' }),
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++
    },
  },
})
```

`state`는 스토어의 `data`, `getters`는 스토어의 `computed` 속성, `actions`는 `methods`라고 생각할 수 있습니다.

옵션 스토어는 직관적이고 시작하기 쉬운 방식으로 느껴져야 합니다.

## Setup Stores %{#setup-stores}%

스토어를 정의하는 또 다른 문법도 있습니다. Vue Composition API의 [setup 함수](https://vuejs.org/api/composition-api-setup.html)와 비슷하게, 반응형 속성과 메서드를 정의하는 함수를 전달하고 노출하고 싶은 속성과 메서드를 담은 객체를 반환할 수 있습니다.

```js
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const name = ref('Eduardo')
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, name, doubleCount, increment }
})
```

_Setup Stores_에서는:

- `ref()`는 `state` 속성이 됩니다
- `computed()`는 `getters`가 됩니다
- `function()`은 `actions`가 됩니다

Pinia가 setup 스토어의 모든 상태 속성을 state로 인식할 수 있도록, **반드시 모든 상태 속성을 반환해야 한다는 점**에 유의하세요. 다시 말해, [스토어 안에 _private_ 상태 속성을 둘 수 없습니다](https://masteringpinia.com/blog/how-to-create-private-state-in-stores). 모든 상태 속성을 반환하지 않거나 **읽기 전용으로 만들면** [SSR](../cookbook/composables.md), devtools, 기타 플러그인이 망가집니다.

Setup 스토어는 [Option Stores](#Option-Stores)보다 훨씬 더 유연합니다. 스토어 안에서 watcher를 만들 수 있고, 어떤 [컴포저블](https://vuejs.org/guide/reusability/composables.html#composables)이든 자유롭게 사용할 수 있기 때문입니다. 다만 SSR을 사용할 때는 컴포저블 사용이 더 복잡해진다는 점을 염두에 두세요.

Setup 스토어는 Router나 Route처럼 전역으로 _provide_된 속성에도 의존할 수 있습니다. [App 수준에서 provide된](https://vuejs.org/api/application.html#app-provide) 어떤 속성이든 컴포넌트처럼 `inject()`를 사용해 스토어 안에서 접근할 수 있습니다:

```ts
import { inject } from 'vue'
import { useRoute } from 'vue-router'
import { defineStore } from 'pinia'

export const useSearchFilters = defineStore('search-filters', () => {
  const route = useRoute()
  // `app.provide('appProvided', 'value')`가 호출되었다고 가정합니다
  const appProvided = inject('appProvided')

  // ...

  return {
    // ...
  }
})
```

:::warning
`route`나 `appProvided`(위 예시의 것처럼) 같은 속성은 스토어 자체에 속한 것이 아니므로 반환하지 마세요. 이런 값은 컴포넌트 안에서 `useRoute()`와 `inject('appProvided')`로 직접 접근할 수 있습니다.
:::

## 어떤 문법을 선택해야 하나요? %{#what-syntax-should-i-pick}%

[Vue의 Composition API와 Options API](https://vuejs.org/guide/introduction.html#which-to-choose)와 마찬가지로, 가장 편하게 느껴지는 것을 선택하세요. 둘 다 장단점이 있습니다. 옵션 스토어는 다루기 쉽고, Setup 스토어는 더 유연하고 강력합니다. 차이를 더 깊이 알고 싶다면 Mastering Pinia의 [Option Stores vs Setup Stores 장](https://masteringpinia.com/lessons/when-to-choose-one-syntax-over-the-other)을 확인해 보세요.

## 스토어 사용하기 %{#using-the-store}%

우리는 스토어를 _정의_하고 있을 뿐인데, 이는 `use...Store()`가 컴포넌트의 `<script setup>` 안에서(또는 **모든 컴포저블처럼** `setup()` 안에서) 호출되기 전까지는 스토어가 생성되지 않기 때문입니다:

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'

// 컴포넌트 어디에서든 `store` 변수에 접근할 수 있습니다 ✨
const store = useCounterStore()
</script>
```

:::tip
아직 `setup` 컴포넌트를 사용하지 않더라도, [_map helpers_와 함께 Pinia를 사용할 수 있습니다](../cookbook/options-api.md).
:::

원하는 만큼 많은 스토어를 정의할 수 있으며, **Pinia를 최대한 활용하려면 각 스토어를 서로 다른 파일에 정의해야 합니다**(번들러의 코드 분할을 자동으로 허용하고 TypeScript 추론을 제공하는 등의 이점이 있습니다).

스토어가 인스턴스화되면 `state`, `getters`, `actions`에 정의된 모든 속성에 스토어에서 직접 접근할 수 있습니다. 다음 페이지들에서 이를 자세히 살펴보겠지만, 자동완성이 큰 도움이 될 것입니다.

`store`는 `reactive`로 감싸진 객체이므로 getter 뒤에 `.value`를 쓸 필요가 없습니다. 하지만 `setup`의 `props`와 마찬가지로 **구조 분해할 수는 없습니다**:

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'
import { computed } from 'vue'

const store = useCounterStore()
// ❌ 반응성을 깨뜨리기 때문에 이것은 동작하지 않습니다
// reactive도 마찬가지입니다: https://vuejs.org/guide/essentials/reactivity-fundamentals.html#limitations-of-reactive
const { name, doubleCount } = store // [!code warning]
name // 항상 "Eduardo"입니다 // [!code warning]
doubleCount // 항상 0입니다 // [!code warning]

setTimeout(() => {
  store.increment()
}, 1000)

// ✅ 이것은 반응형으로 동작합니다
// 💡 하지만 `store.doubleCount`를 직접 써도 됩니다
const doubleValue = computed(() => store.doubleCount)
</script>
```

## 스토어에서 구조 분해하기 %{#destructuring-from-a-store}%

반응성을 유지하면서 스토어에서 속성을 꺼내려면 `storeToRefs()`를 사용해야 합니다. 이것은 모든 반응형 속성에 대한 ref를 만들어 줍니다. 스토어의 state만 사용하고 action은 호출하지 않을 때 유용합니다. action은 스토어 자체에 바인딩되어 있으므로, 스토어에서 직접 구조 분해할 수 있다는 점에도 유의하세요:

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

const store = useCounterStore()
// `name`과 `doubleCount`는 반응형 ref입니다
// 이것은 플러그인이 추가한 속성의 ref도 추출합니다
// 하지만 action이나 비반응형(non ref/reactive) 속성은 건너뜁니다
const { name, doubleCount } = storeToRefs(store)
// increment action은 그냥 구조 분해해도 됩니다
const { increment } = store
</script>
```
