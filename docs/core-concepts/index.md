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

핵심 개념을 살펴보기 전에, 스토어는 `defineStore()`를 사용하여 정의하며, **고유한** 이름이 첫 번째 인자로 필요하다는 것을 알아야 합니다:

```js
import { defineStore } from 'pinia'

// `defineStore()`의 반환값은 원하는 대로 이름을 지을 수 있지만,
// 스토어의 이름을 사용하고 `use`와 `Store`로 감싸는 것이 가장 좋습니다
// (예: `useUserStore`, `useCartStore`, `useProductStore`)
// 첫 번째 인자는 애플리케이션 전체에서 고유한 스토어의 id입니다
export const useAlertsStore = defineStore('alerts', {
  // 기타 옵션...
})
```

이 _이름_은 _id_라고도 하며, Pinia가 스토어를 devtools와 연결하는 데 필요합니다. 반환된 함수의 이름을 _use..._로 짓는 것은 컴포저블에서 관례로, 사용을 직관적으로 만듭니다.

`defineStore()`는 두 번째 인자로 Setup 함수 또는 Options 객체, 두 가지 값을 받을 수 있습니다.

## 옵션 스토어 %{#option-stores}%

Vue의 Options API와 유사하게, `state`, `actions`, `getters` 속성이 있는 Options 객체를 전달할 수도 있습니다.

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

옵션 스토어는 직관적이고 쉽게 시작할 수 있도록 설계되었습니다.

## Setup 스토어 %{#setup-stores}%

스토어를 정의하는 또 다른 문법도 있습니다. Vue Composition API의 [setup 함수](https://vuejs.org/api/composition-api-setup.html)와 유사하게, 반응형 속성과 메서드를 정의하는 함수를 전달하고, 노출하고 싶은 속성과 메서드를 객체로 반환할 수 있습니다.

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

_Setup 스토어_에서는:

- `ref()`는 `state` 속성이 됩니다
- `computed()`는 `getters`가 됩니다
- `function()`은 `actions`가 됩니다

Setup 스토어에서는 Pinia가 상태로 인식할 **모든 상태 속성을 반드시 반환해야** 합니다. 즉, [스토어에서 _비공개_ 상태 속성](https://masteringpinia.com/blog/how-to-create-private-state-in-stores)을 가질 수 없습니다. 모든 상태 속성을 반환하지 않거나 **읽기 전용으로 만들면** [SSR](../cookbook/composables.md), devtools, 기타 플러그인이 동작하지 않을 수 있습니다.

Setup 스토어는 [옵션 스토어](#option-stores)보다 훨씬 더 유연합니다. 스토어 내에서 watcher를 만들 수 있고, [composable](https://vuejs.org/guide/reusability/composables.html#composables)을 자유롭게 사용할 수 있습니다. 하지만 SSR을 사용할 때는 composable 사용이 더 복잡해질 수 있다는 점을 유념하세요.

Setup 스토어는 라우터나 라우트와 같은 전역적으로 _provide_된 속성에도 의존할 수 있습니다. [앱 레벨에서 provide된](https://vuejs.org/api/application.html#app-provide) 모든 속성은 컴포넌트에서와 마찬가지로 `inject()`를 사용해 스토어에서 접근할 수 있습니다:

```ts
import { inject } from 'vue'
import { useRoute } from 'vue-router'
import { defineStore } from 'pinia'

export const useSearchFilters = defineStore('search-filters', () => {
  const route = useRoute()
  // 이 코드는 `app.provide('appProvided', 'value')`가 호출되었다고 가정합니다
  const appProvided = inject('appProvided')

  // ...

  return {
    // ...
  }
})
```

:::warning
위 예시의 `route`나 `appProvided`와 같은 속성은 스토어 자체에 속하지 않으므로 반환하지 마세요. 컴포넌트 내에서 `useRoute()`와 `inject('appProvided')`로 직접 접근할 수 있습니다.
:::

## 어떤 문법을 선택해야 할까요? %{#what-syntax-should-i-pick}%

[Vue의 Composition API와 Options API](https://vuejs.org/guide/introduction.html#which-to-choose)처럼, 가장 편한 것을 선택하세요. 두 방식 모두 장단점이 있습니다. 옵션 스토어는 더 쉽게 다룰 수 있고, Setup 스토어는 더 유연하고 강력합니다. 차이점을 더 깊이 알고 싶다면 Mastering Pinia의 [Option Stores vs Setup Stores 챕터](https://masteringpinia.com/lessons/when-to-choose-one-syntax-over-the-other)를 참고하세요.

## 스토어 사용하기 %{#using-the-store}%

우리는 스토어를 _정의_하고 있는 것이며, 실제로는 컴포넌트의 `<script setup>`(또는 **모든 컴포저블처럼** `setup()` 내)에서 `use...Store()`가 호출될 때 스토어가 생성됩니다:

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'

// 컴포넌트 어디서든 `store` 변수를 사용할 수 있습니다 ✨
const store = useCounterStore()
</script>
```

:::tip
아직 `setup` 컴포넌트를 사용하지 않는다면, [여전히 _map helpers_와 함께 Pinia를 사용할 수 있습니다](../cookbook/options-api.md).
:::

원하는 만큼 많은 스토어를 정의할 수 있으며, **각 스토어는 다른 파일에 정의하는 것이 Pinia의 장점을 최대한 활용하는 방법**입니다(예: 번들러가 자동으로 코드 분할을 허용하고 TypeScript 추론을 제공).

스토어가 인스턴스화되면, `state`, `getters`, `actions`에 정의된 모든 속성에 스토어에서 직접 접근할 수 있습니다. 이 부분은 다음 페이지에서 자세히 다루겠지만, 자동 완성이 도움을 줄 것입니다.

`store`는 `reactive`로 감싸진 객체이므로, getter 뒤에 `.value`를 쓸 필요가 없지만, `setup`의 `props`처럼 **구조 분해 할당을 할 수 없습니다**:

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'
import { computed } from 'vue'

const store = useCounterStore()
// ❌ 반응성이 깨지므로 동작하지 않습니다
// reactive와 동일: https://vuejs.org/guide/essentials/reactivity-fundamentals.html#limitations-of-reactive
const { name, doubleCount } = store // [!code warning]
name // 항상 "Eduardo"입니다 // [!code warning]
doubleCount // 항상 0입니다 // [!code warning]

setTimeout(() => {
  store.increment()
}, 1000)

// ✅ 이 방식은 반응성을 유지합니다
// 💡 하지만 그냥 `store.doubleCount`를 직접 사용해도 됩니다
const doubleValue = computed(() => store.doubleCount)
</script>
```

## 스토어에서 구조 분해 할당하기 %{#destructuring-from-a-store}%

스토어에서 속성을 추출하면서 반응성을 유지하려면 `storeToRefs()`를 사용해야 합니다. 이 함수는 모든 반응형 속성에 대해 ref를 생성합니다. 스토어의 state만 사용하고 action은 호출하지 않을 때 유용합니다. action은 스토어에 바인딩되어 있으므로 직접 구조 분해 할당할 수 있습니다:

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

const store = useCounterStore()
// `name`과 `doubleCount`는 반응형 ref입니다
// 플러그인에 의해 추가된 속성도 ref로 추출하지만
// action이나 비반응형(비 ref/reactive) 속성은 건너뜁니다
const { name, doubleCount } = storeToRefs(store)
// increment action은 그냥 구조 분해 할당하면 됩니다
const { increment } = store
</script>
```