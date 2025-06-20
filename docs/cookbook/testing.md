# 스토어 테스트 %{#testing-stores}%

<MasteringPiniaLink
  href="https://play.gumlet.io/embed/65f9a9c10bfab01f414c25dc"
  title="Watch a free video of Mastering Pinia about testing stores"
/>

스토어는 설계상 여러 곳에서 사용되며, 이로 인해 테스트가 생각보다 훨씬 더 어려워질 수 있습니다. 다행히도, 반드시 그럴 필요는 없습니다. 스토어를 테스트할 때는 세 가지를 신경 써야 합니다:

- `pinia` 인스턴스: 스토어는 이것 없이는 동작하지 않습니다
- `actions`: 대부분의 경우, 스토어에서 가장 복잡한 로직을 담고 있습니다. 기본적으로 mock 처리된다면 정말 좋지 않을까요?
- 플러그인: 플러그인에 의존한다면, 테스트에서도 설치해야 합니다

무엇을, 어떻게 테스트하느냐에 따라 이 세 가지를 다루는 방법이 달라집니다.

## 스토어 단위 테스트 %{#unit-testing-a-store}%

스토어를 단위 테스트하려면, 가장 중요한 부분은 `pinia` 인스턴스를 생성하는 것입니다:

```js
// stores/counter.spec.ts
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '../src/stores/counter'

describe('Counter Store', () => {
  beforeEach(() => {
    // 새로운 pinia를 생성하고 활성화합니다
    // 그래서 어떤 useStore() 호출에서도 자동으로 사용됩니다
    // pinia를 직접 전달할 필요 없이: `useStore(pinia)`
    setActivePinia(createPinia())
  })

  it('increments', () => {
    const counter = useCounterStore()
    expect(counter.n).toBe(0)
    counter.increment()
    expect(counter.n).toBe(1)
  })

  it('increments by amount', () => {
    const counter = useCounterStore()
    counter.increment(10)
    expect(counter.n).toBe(10)
  })
})
```

스토어 플러그인이 있다면, 한 가지 중요한 점이 있습니다: **플러그인은 `pinia`가 App에 설치되기 전까지는 사용되지 않습니다**. 이는 빈 App이나 가짜 App을 생성하여 해결할 수 있습니다:

```js
import { setActivePinia, createPinia } from 'pinia'
import { createApp } from 'vue'
import { somePlugin } from '../src/stores/plugin'

// 위와 동일한 코드...

// 테스트마다 앱을 하나씩 만들 필요는 없습니다
const app = createApp({})
beforeEach(() => {
  const pinia = createPinia().use(somePlugin)
  app.use(pinia)
  setActivePinia(pinia)
})
```

## 컴포넌트 단위 테스트 %{#unit-testing-components}%

<!-- NOTE: 너무 길 수도 있지만 가치 있음 -->
<!-- <MasteringPiniaLink
  href="https://play.gumlet.io/embed/6630f540c418f8419b73b2b2?t1=1715867840&t2=1715867570609?preload=false&autoplay=false&loop=false&disable_player_controls=false"
  title="Watch a free video of Mastering Pinia about testing stores"
/> -->

이것은 `createTestingPinia()`로 달성할 수 있으며, 이는 컴포넌트 단위 테스트를 돕기 위해 설계된 pinia 인스턴스를 반환합니다.

먼저 `@pinia/testing`을 설치하세요:

```shell
npm i -D @pinia/testing
```

그리고 컴포넌트를 마운트할 때 테스트용 pinia를 생성해야 합니다:

```js
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
// 테스트에서 상호작용할 스토어를 import
import { useSomeStore } from '@/stores/myStore'

const wrapper = mount(Counter, {
  global: {
    plugins: [createTestingPinia()],
  },
})

const store = useSomeStore() // 테스트용 pinia를 사용합니다!

// state는 직접 조작할 수 있습니다
store.name = 'my new name'
// patch를 통해서도 가능합니다
store.$patch({ name: 'new name' })
expect(store.name).toBe('new name')

// actions는 기본적으로 stub 처리되어, 기본적으로 코드를 실행하지 않습니다.
// 아래에서 이 동작을 커스터마이즈하는 방법을 확인하세요.
store.someAction()

expect(store.someAction).toHaveBeenCalledTimes(1)
expect(store.someAction).toHaveBeenLastCalledWith()
```

### 초기 상태 설정 %{#initial-state}%

테스트용 pinia를 생성할 때 `initialState` 객체를 전달하여 **모든 스토어의 초기 상태**를 설정할 수 있습니다. 이 객체는 스토어가 생성될 때 테스트용 pinia가 _patch_ 하는 데 사용됩니다. 예를 들어, 이 스토어의 상태를 초기화하고 싶다고 가정해봅시다:

```ts
import { defineStore } from 'pinia'

const useCounterStore = defineStore('counter', {
  state: () => ({ n: 0 }),
  // ...
})
```

스토어 이름이 _"counter"_이므로, `initialState`에 일치하는 객체를 추가해야 합니다:

```ts
// 테스트 내 어딘가에서
const wrapper = mount(Counter, {
  global: {
    plugins: [
      createTestingPinia({
        initialState: {
          counter: { n: 20 }, // 카운터를 0이 아닌 20에서 시작
        },
      }),
    ],
  },
})

const store = useSomeStore() // 테스트용 pinia를 사용합니다!
store.n // 20
```

### 액션 동작 커스터마이즈 %{#customizing-behavior-of-actions}%

`createTestingPinia`는 별도의 지시가 없는 한 모든 스토어 액션을 stub 처리합니다. 이를 통해 컴포넌트와 스토어를 별도로 테스트할 수 있습니다.

이 동작을 되돌리고, 테스트 중에 액션이 실제로 실행되게 하려면, `createTestingPinia` 호출 시 `stubActions: false`를 지정하세요:

```js
const wrapper = mount(Counter, {
  global: {
    plugins: [createTestingPinia({ stubActions: false })],
  },
})

const store = useSomeStore()

// 이제 이 호출은 스토어에 정의된 구현을 실제로 실행합니다
store.someAction()

// ...하지만 여전히 spy로 감싸져 있으므로 호출을 검사할 수 있습니다
expect(store.someAction).toHaveBeenCalledTimes(1)
```

### 액션의 반환값 mock 처리 %{#mocking-the-returned-value-of-an-action}%

액션은 자동으로 spy 처리되지만, 타입상으로는 여전히 일반 액션입니다. 올바른 타입을 얻으려면, 각 액션에 `Mock` 타입을 적용하는 커스텀 타입 래퍼를 구현해야 합니다. **이 타입은 사용하는 테스트 프레임워크에 따라 다릅니다**. 아래는 Vitest 예시입니다:

```ts
import type { Mock } from 'vitest'
import type { UnwrapRef } from 'vue'
import type { Store, StoreDefinition } from 'pinia'

function mockedStore<TStoreDef extends () => unknown>(
  useStore: TStoreDef
): TStoreDef extends StoreDefinition<
  infer Id,
  infer State,
  infer Getters,
  infer Actions
>
  ? Store<
      Id,
      State,
      Record<string, never>,
      {
        [K in keyof Actions]: Actions[K] extends (...args: any[]) => any
          ? // 👇 사용하는 테스트 프레임워크에 따라 다름
            Mock<Actions[K]>
          : Actions[K]
      }
    > & {
      [K in keyof Getters]: UnwrapRef<Getters[K]>
    }
  : ReturnType<TStoreDef> {
  return useStore() as any
}
```

이것은 테스트에서 올바른 타입의 스토어를 얻는 데 사용할 수 있습니다:

```ts
import { mockedStore } from './mockedStore'
import { useSomeStore } from '@/stores/myStore'

const store = mockedStore(useSomeStore)
// 타입이 지정됨!
store.someAction.mockResolvedValue('some value')
```

이와 같은 더 많은 트릭을 배우고 싶다면, [Mastering Pinia](https://masteringpinia.com/lessons/exercise-mocking-stores-introduction)의 Testing 강의를 확인해보세요.

### createSpy 함수 지정 %{#specifying-the-createspy-function}%

Jest를 사용하거나, `globals: true`가 설정된 vitest를 사용할 때, `createTestingPinia`는 기존 테스트 프레임워크(`jest.fn` 또는 `vitest.fn`)에 따라 자동으로 액션을 spy 함수로 stub 처리합니다. `globals: true`를 사용하지 않거나 다른 프레임워크를 사용하는 경우, [createSpy](https://pinia.vuejs.org/api/@pinia/testing/interfaces/TestingOptions.html#createSpy-) 옵션을 제공해야 합니다:

::: code-group

```ts [vitest]
// NOTE: `globals: true`에서는 필요 없음
import { vi } from 'vitest'

createTestingPinia({
  createSpy: vi.fn,
})
```

```ts [sinon]
import sinon from 'sinon'

createTestingPinia({
  createSpy: sinon.spy,
})
```

:::

더 많은 예시는 [testing 패키지의 테스트](https://github.com/vuejs/pinia/blob/v3/packages/testing/src/testing.spec.ts)에서 확인할 수 있습니다.

### getter mock 처리 %{#mocking-getters}%

기본적으로, 모든 getter는 일반 사용과 같이 계산되지만, 원하는 값으로 getter를 직접 설정하여 강제로 값을 지정할 수 있습니다:

```ts
import { defineStore } from 'pinia'
import { createTestingPinia } from '@pinia/testing'

const useCounterStore = defineStore('counter', {
  state: () => ({ n: 1 }),
  getters: {
    double: (state) => state.n * 2,
  },
})

const pinia = createTestingPinia()
const counter = useCounterStore(pinia)

counter.double = 3 // 🪄 getter는 테스트에서만 쓰기 가능합니다

// undefined로 설정하면 기본 동작으로 리셋됩니다
// @ts-expect-error: 일반적으로는 숫자입니다
counter.double = undefined
counter.double // 2 (=1 x 2)
```

### Pinia 플러그인 %{#pinia-plugins}%

Pinia 플러그인이 있다면, `createTestingPinia()`를 호출할 때 반드시 전달하여 올바르게 적용되도록 하세요. **일반 pinia처럼 `testingPinia.use(MyPlugin)`으로 추가하지 마세요**:

```js
import { createTestingPinia } from '@pinia/testing'
import { somePlugin } from '../src/stores/plugin'

// 어떤 테스트 내에서
const wrapper = mount(Counter, {
  global: {
    plugins: [
      createTestingPinia({
        stubActions: false,
        plugins: [somePlugin],
      }),
    ],
  },
})
```

## E2E 테스트 %{#e2e-tests}%

Pinia와 관련해서는, E2E 테스트를 위해 별도로 변경할 필요가 없습니다. 이것이 바로 이러한 테스트의 핵심입니다! HTTP 요청을 테스트할 수도 있겠지만, 그건 이 가이드의 범위를 훨씬 벗어납니다 😄.