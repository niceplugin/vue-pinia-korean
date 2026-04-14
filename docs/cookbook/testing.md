# 스토어 테스트 %{#testing-stores}%

<MasteringPiniaLink
  href="https://play.gumlet.io/embed/65f9a9c10bfab01f414c25dc"
  title="스토어 테스트에 관한 Mastering Pinia 무료 영상 보기"
/>

스토어는 설계상 여러 곳에서 사용되며, 그 때문에 테스트가 생각보다 훨씬 어려워질 수 있습니다. 다행히 꼭 그럴 필요는 없습니다. 스토어를 테스트할 때는 세 가지를 신경 써야 합니다:

- `pinia` 인스턴스: 스토어는 이것 없이는 동작할 수 없습니다
- `actions`: 대부분의 경우 스토어에서 가장 복잡한 로직을 담고 있습니다. 기본적으로 목 처리된다면 좋지 않을까요?
- 플러그인: 플러그인에 의존한다면 테스트에서도 설치해야 합니다

무엇을, 어떻게 테스트하느냐에 따라 이 세 가지를 다루는 방법이 달라집니다.

<RuleKitLink />

## 스토어 단위 테스트 %{#unit-testing-a-store}%

스토어를 단위 테스트할 때 가장 중요한 부분은 `pinia` 인스턴스를 만드는 것입니다:

```js
// stores/counter.spec.ts
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '../src/stores/counter'

describe('Counter Store', () => {
  beforeEach(() => {
    // 새 pinia를 만들고 활성 상태로 설정합니다
    // 그러면 어떤 useStore() 호출에서도 자동으로 잡힙니다
    // 직접 전달하지 않아도 됩니다: `useStore(pinia)`
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

스토어 플러그인이 있다면 알아야 할 중요한 점이 하나 있습니다. **플러그인은 `pinia`가 App에 설치되기 전까지 사용되지 않습니다**. 이것은 빈 App이나 가짜 App을 만들어 해결할 수 있습니다:

```js
import { setActivePinia, createPinia } from 'pinia'
import { createApp } from 'vue'
import { somePlugin } from '../src/stores/plugin'

// 위와 같은 코드...

// 테스트마다 앱을 하나씩 만들 필요는 없습니다
const app = createApp({})
beforeEach(() => {
  const pinia = createPinia().use(somePlugin)
  app.use(pinia)
  setActivePinia(pinia)
})
```

## 컴포넌트 단위 테스트 %{#unit-testing-components}%

<!-- NOTE: too long maybe but good value -->
<!-- <MasteringPiniaLink
  href="https://play.gumlet.io/embed/6630f540c418f8419b73b2b2?t1=1715867840&t2=1715867570609?preload=false&autoplay=false&loop=false&disable_player_controls=false"
  title="스토어 테스트에 관한 Mastering Pinia 무료 영상 보기"
/> -->

이것은 `createTestingPinia()`로 해결할 수 있습니다. 이 함수는 컴포넌트 단위 테스트를 돕도록 설계된 pinia 인스턴스를 반환합니다.

먼저 `@pinia/testing`을 설치하세요:

```shell
npm i -D @pinia/testing
```

그리고 컴포넌트를 마운트할 때 테스트용 pinia를 생성했는지 확인하세요:

```js
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
// 테스트에서 상호작용하고 싶은 스토어를 import 합니다
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

// actions는 기본적으로 stub 처리되므로, 기본 구현 코드를 실행하지 않습니다.
// 이 동작을 커스터마이즈하는 방법은 아래를 보세요.
store.someAction()

expect(store.someAction).toHaveBeenCalledTimes(1)
expect(store.someAction).toHaveBeenLastCalledWith()
```

### 초기 상태 %{#initial-state}%

테스트용 pinia를 만들 때 `initialState` 객체를 전달하면 **모든 스토어의** 초기 상태를 설정할 수 있습니다. 이 객체는 테스트용 pinia가 스토어를 생성할 때 _patch_하는 데 사용됩니다. 예를 들어 다음 스토어의 상태를 초기화하고 싶다고 해 봅시다:

```ts
import { defineStore } from 'pinia'

const useCounterStore = defineStore('counter', {
  state: () => ({ n: 0 }),
  // ...
})
```

스토어 이름이 _"counter"_이므로, `initialState`에 일치하는 객체를 추가해야 합니다:

```ts
// 테스트 안 어딘가에서
const wrapper = mount(Counter, {
  global: {
    plugins: [
      createTestingPinia({
        initialState: {
          counter: { n: 20 }, // 카운터를 0이 아니라 20에서 시작합니다
        },
      }),
    ],
  },
})

const store = useSomeStore() // 테스트용 pinia를 사용합니다!
store.n // 20
```

### action 동작 커스터마이즈하기 %{#customizing-behavior-of-actions}%

`createTestingPinia`는 따로 지시하지 않는 한 모든 스토어 action을 stub 처리합니다. 덕분에 컴포넌트와 스토어를 분리해서 테스트할 수 있습니다.

이 동작을 되돌리고 테스트 중에 action을 평소처럼 실행하고 싶다면, `createTestingPinia` 호출 시 `stubActions: false`를 지정하세요:

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

### 선택적 action 스텁 처리 %{#selective-action-stubbing}%

때로는 특정 action만 stub 처리하고 나머지는 정상 실행되게 하고 싶을 수 있습니다. 이 경우 `stubActions` 옵션에 action 이름 배열을 전달하면 됩니다:

```js
// 'increment'와 'reset' action만 stub 처리합니다
const wrapper = mount(Counter, {
  global: {
    plugins: [
      createTestingPinia({
        stubActions: ['increment', 'reset'],
      }),
    ],
  },
})

const store = useSomeStore()

// 이 action들은 stub 처리됩니다(실행되지 않음)
store.increment() // stubbed
store.reset() // stubbed

// 다른 action은 정상 실행되지만 여전히 spy로 감싸집니다
store.fetchData() // executed normally
expect(store.fetchData).toHaveBeenCalledTimes(1)
```

더 복잡한 시나리오에서는 action 이름과 store 인스턴스를 받아, 해당 action을 stub 처리할지 여부를 반환하는 함수를 전달할 수도 있습니다:

```js
// 사용자 정의 로직에 따라 action을 stub 처리합니다
const wrapper = mount(Counter, {
  global: {
    plugins: [
      createTestingPinia({
        stubActions: (actionName, store) => {
          // 'set'으로 시작하는 모든 action을 stub 처리합니다
          if (actionName.startsWith('set')) return true

          // 초기 store 상태에 따라 action을 stub 처리합니다
          if (store.isPremium) return false

          return true
        },
      }),
    ],
  },
})

const store = useSomeStore()

// 'set'으로 시작하는 action은 stub 처리됩니다
store.setValue(42) // stubbed

// 다른 action은 초기 store 상태에 따라 실행되거나 stub 처리될 수 있습니다
store.fetchData() // executed or stubbed based on initial store.isPremium
```

::: tip

- 빈 배열 `[]`은 어떤 action도 stub 처리하지 않겠다는 뜻입니다(`false`와 동일)
- 함수는 store 설정 시점에 한 번 평가되며, 초기 상태의 store 인스턴스를 받습니다

:::

스토어를 만든 뒤에 특정 action만 수동으로 mock할 수도 있습니다:

```ts
const store = useSomeStore()
vi.spyOn(store, 'increment').mockImplementation(() => {})
// 또는 stub 처리된 action과 함께 testing pinia를 사용하는 경우
store.increment.mockImplementation(() => {})
```

### action의 반환값 모킹하기 %{#mocking-the-returned-value-of-an-action}%

action은 자동으로 spy 처리되지만, 타입 측면에서는 여전히 원래 action 타입입니다. 올바른 타입을 얻으려면 각 action에 `Mock` 타입을 적용하는 사용자 정의 타입 래퍼를 구현해야 합니다. **이 타입은 사용 중인 테스트 프레임워크에 따라 달라집니다**. 아래는 Vitest 예제입니다:

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
          ? // 👇 사용 중인 테스트 프레임워크에 따라 달라집니다
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

이것은 테스트에서 올바르게 타입 지정된 store를 얻는 데 사용할 수 있습니다:

```ts
import { mockedStore } from './mockedStore'
import { useSomeStore } from '@/stores/myStore'

const store = mockedStore(useSomeStore)
// 타입이 올바르게 잡힙니다!
store.someAction.mockResolvedValue('some value')
```

이런 트릭을 더 배우고 싶다면 [Mastering Pinia](https://masteringpinia.com/lessons/exercise-mocking-stores-introduction)의 Testing 강의를 확인해 보세요.

### createSpy 함수 지정하기 %{#specifying-the-createspy-function}%

Jest를 사용하거나 `globals: true`가 켜진 vitest를 사용할 때, `createTestingPinia`는 현재 테스트 프레임워크(`jest.fn` 또는 `vitest.fn`)를 기반으로 spy 함수를 사용해 action을 자동으로 stub 처리합니다. `globals: true`를 사용하지 않거나 다른 프레임워크를 사용한다면, [createSpy](https://pinia.vuejs.org/api/@pinia/testing/interfaces/TestingOptions.html#createSpy-) 옵션을 제공해야 합니다:

::: code-group

```ts [vitest]
// NOTE: `globals: true`일 때는 필요하지 않습니다
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

### 게터 모킹하기 %{#mocking-getters}%

기본적으로 모든 getter는 평소처럼 계산되지만, 원하는 값을 직접 지정해 강제로 설정할 수도 있습니다:

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

counter.double = 3 // 🪄 게터는 테스트에서만 쓰기 가능합니다

// 기본 동작으로 되돌리려면 undefined로 설정합니다
// @ts-expect-error: 보통은 number입니다
counter.double = undefined
counter.double // 2 (=1 x 2)
```

### Pinia 플러그인 %{#pinia-plugins}%

pinia 플러그인이 있다면 `createTestingPinia()`를 호출할 때 반드시 전달해서 올바르게 적용되도록 하세요. 일반 pinia처럼 **`testingPinia.use(MyPlugin)`으로 추가하면 안 됩니다**:

```js
import { createTestingPinia } from '@pinia/testing'
import { somePlugin } from '../src/stores/plugin'

// 어떤 테스트 안에서
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

Pinia의 경우 E2E 테스트를 위해 바꿔야 할 것은 없습니다. 그게 바로 이런 테스트의 핵심이니까요! HTTP 요청 정도는 테스트할 수도 있겠지만, 그것은 이 가이드의 범위를 훨씬 벗어납니다 😄.
