# Vuex ≤4에서 마이그레이션 %{#migrating-from-vuex-≤4}%

Vuex와 Pinia 스토어의 구조는 다르지만, 많은 로직은 재사용할 수 있습니다. 이 가이드는 마이그레이션 과정을 도와주고, 마주칠 수 있는 몇 가지 일반적인 함정을 짚어줍니다.

## 준비 %{#preparation}%

먼저 [시작하기 가이드](../getting-started.md)를 따라 Pinia를 설치하세요.

## 모듈을 스토어로 재구성하기 %{#restructuring-modules-to-stores}%

Vuex에는 여러 개의 _module_을 가진 단일 store라는 개념이 있습니다. 이 모듈들은 선택적으로 네임스페이스를 가질 수 있고, 서로 안에 중첩될 수도 있습니다.

이 개념을 Pinia로 옮기는 가장 쉬운 방법은, 이전에 사용하던 각 모듈을 이제 하나의 _store_로 바꾸는 것입니다. 각 store에는 Vuex의 namespace와 비슷한 `id`가 필요합니다. 즉, 각 store는 설계상 네임스페이스를 갖게 됩니다. 중첩 모듈도 각각 자신의 store가 될 수 있습니다. 서로 의존하는 store는 다른 store를 가져와 import하면 됩니다.

Vuex 모듈을 Pinia store로 어떻게 재구성할지는 전적으로 당신의 선택이지만, 여기 한 가지 제안이 있습니다:

<RuleKitLink />

```bash
# Vuex 예제(네임스페이스 모듈을 가정)
src
└── store
    ├── index.js           # Vuex를 초기화하고, 모듈을 가져옵니다
    └── modules
        ├── module1.js     # 'module1' namespace
        └── nested
            ├── index.js   # 'nested' namespace, module2와 module3를 가져옵니다
            ├── module2.js # 'nested/module2' namespace
            └── module3.js # 'nested/module3' namespace

# Pinia에서의 대응 예시, id는 이전 namespace와 일치하도록 합니다
src
└── stores
    ├── index.js          # (선택 사항) Pinia를 초기화하지만 store를 import하지는 않습니다
    ├── module1.js        # 'module1' id
    ├── nested-module2.js # 'nestedModule2' id
    ├── nested-module3.js # 'nestedModule3' id
    └── nested.js         # 'nested' id
```

이렇게 하면 스토어 구조는 평평해지지만, 동등한 `id`를 사용해 이전 네임스페이스도 보존할 수 있습니다. Vuex의 `store/index.js` 파일 루트에 state/getters/actions/mutations가 있었다면, 그 정보를 담는 `root` 같은 다른 store를 하나 만들고 싶을 수도 있습니다.

Pinia의 디렉터리는 일반적으로 `store` 대신 `stores`라고 부릅니다. 이는 Pinia가 Vuex의 단일 store 대신 여러 store를 사용한다는 점을 강조하기 위함입니다.

대규모 프로젝트라면 모든 것을 한 번에 바꾸기보다 모듈 단위로 이 변환을 진행하고 싶을 수 있습니다. 실제로 마이그레이션 중에는 Pinia와 Vuex를 함께 섞어 쓸 수 있으므로, 이 방식도 잘 동작하며 Pinia 디렉터리 이름을 `stores`로 짓는 또 다른 이유가 됩니다.

## 단일 모듈 변환하기 %{#converting-a-single-module}%

아래는 Vuex 모듈을 Pinia store로 바꾸기 전후의 전체 예제입니다. 단계별 가이드는 아래를 참고하세요. Pinia 예제는 구조가 Vuex와 가장 유사하므로 option store를 사용합니다:

```ts
// 'auth/user' namespace에 있는 Vuex 모듈
import { Module } from 'vuex'
import { api } from '@/api'
import { RootState } from '@/types' // Vuex 타입 정의를 사용 중이라면

interface State {
  firstName: string
  lastName: string
  userId: number | null
}

const storeModule: Module<State, RootState> = {
  namespaced: true,
  state: {
    firstName: '',
    lastName: '',
    userId: null,
  },
  getters: {
    firstName: (state) => state.firstName,
    fullName: (state) => `${state.firstName} ${state.lastName}`,
    loggedIn: (state) => state.userId !== null,
    // 다른 모듈의 state와 결합합니다
    fullUserDetails: (state, getters, rootState, rootGetters) => {
      return {
        ...state,
        fullName: getters.fullName,
        // `auth`라는 다른 모듈의 state를 읽습니다
        ...rootState.auth.preferences,
        // `auth` 아래에 중첩된 `email`이라는 namespaced module의 getter를 읽습니다
        ...rootGetters['auth/email'].details,
      }
    },
  },
  actions: {
    async loadUser({ state, commit }, id: number) {
      if (state.userId !== null) throw new Error('Already logged in')
      const res = await api.user.load(id)
      commit('updateUser', res)
    },
  },
  mutations: {
    updateUser(state, payload) {
      state.firstName = payload.firstName
      state.lastName = payload.lastName
      state.userId = payload.userId
    },
    clearUser(state) {
      state.firstName = ''
      state.lastName = ''
      state.userId = null
    },
  },
}

export default storeModule
```

```ts
// Pinia Store
import { defineStore } from 'pinia'
import { useAuthPreferencesStore } from './auth-preferences'
import { useAuthEmailStore } from './auth-email'
import vuexStore from '@/store' // 점진적 전환을 위한 것, fullUserDetails를 참고하세요

interface State {
  firstName: string
  lastName: string
  userId: number | null
}

export const useAuthUserStore = defineStore('authUser', {
  // 함수 형태로 변환합니다
  state: (): State => ({
    firstName: '',
    lastName: '',
    userId: null,
  }),
  getters: {
    // firstName getter는 더 이상 필요 없으므로 제거했습니다
    fullName: (state) => `${state.firstName} ${state.lastName}`,
    loggedIn: (state) => state.userId !== null,
    // `this`를 사용하므로 반환 타입을 정의해야 합니다
    fullUserDetails(state): FullUserDetails {
      // 다른 스토어에서 import 합니다
      const authPreferencesStore = useAuthPreferencesStore()
      const authEmailStore = useAuthEmailStore()
      return {
        ...state,
        // 다른 getter들은 이제 `this`에 있습니다
        fullName: this.fullName,
        ...authPreferencesStore.$state,
        ...authEmailStore.details,
      }

      // 다른 모듈이 아직 Vuex에 남아 있다면 대안은 다음과 같습니다
      // return {
      //   ...state,
      //   fullName: this.fullName,
      //   ...vuexStore.state.auth.preferences,
      //   ...vuexStore.getters['auth/email'].details
      // }
    },
  },
  actions: {
    // 첫 번째 인수로 context를 받지 않고, 대신 `this`를 사용합니다
    async loadUser(id: number) {
      if (this.userId !== null) throw new Error('Already logged in')
      const res = await api.user.load(id)
      this.updateUser(res)
    },
    // mutations는 이제 actions가 될 수 있으며, 첫 번째 인수로 `state` 대신 `this`를 사용합니다
    updateUser(payload) {
      this.firstName = payload.firstName
      this.lastName = payload.lastName
      this.userId = payload.userId
    },
    // `$reset`으로 상태를 쉽게 초기화합니다
    clearUser() {
      this.$reset()
    },
  },
})
```

위 내용을 단계별로 나누면 다음과 같습니다:

1. 스토어에 필요한 `id`를 추가합니다. 이 값은 이전 namespace와 같게 유지하고 싶을 수도 있습니다. 또한 `mapStores()`와 함께 사용하기 쉽도록 `id`를 _camelCase_로 만드는 것을 권장합니다.
2. `state`가 아직 함수가 아니라면 함수로 바꿉니다
3. `getters`를 변환합니다
   1. 같은 이름으로 state를 그대로 반환하는 getter(예: `firstName: (state) => state.firstName`)는 제거합니다. 스토어 인스턴스에서 어떤 state든 직접 접근할 수 있으므로 필요 없습니다
   2. 다른 getter에 접근해야 한다면, 두 번째 인수 대신 `this`에 있습니다. `this`를 사용한다면 화살표 함수 대신 일반 함수를 써야 한다는 점을 기억하세요. 또한 TS 한계 때문에 반환 타입을 지정해야 하며, 자세한 내용은 [여기](../core-concepts/getters.md#accessing-other-getters)를 참고하세요
   3. `rootState`나 `rootGetters` 인수를 사용하고 있었다면, 다른 store를 직접 import해서 대체하거나, 그것들이 아직 Vuex에 있다면 Vuex에서 직접 접근하세요
4. `actions`를 변환합니다
   1. 각 action의 첫 번째 `context` 인수를 제거합니다. 모든 것은 대신 `this`에서 접근할 수 있어야 합니다
   2. 다른 스토어를 사용하고 있다면 getters와 마찬가지로 직접 import하거나 Vuex에서 접근하세요
5. `mutations`를 변환합니다
   1. Mutation은 더 이상 존재하지 않습니다. 이것들은 대신 `actions`로 변환할 수 있고, 아니면 컴포넌트 안에서 스토어에 직접 할당해도 됩니다(예: `userStore.firstName = 'First'`)
   2. action으로 변환한다면 첫 번째 `state` 인수를 제거하고, 모든 할당은 대신 `this`로 바꾸세요
   3. 흔한 mutation 중 하나는 state를 초기 상태로 되돌리는 것입니다. 이것은 스토어의 `$reset` 메서드로 내장 지원됩니다. 이 기능은 option store에만 존재한다는 점에 유의하세요.

보시다시피 대부분의 코드는 재사용할 수 있습니다. 타입 안전성도 빠진 변경 사항이 있다면 무엇을 바꿔야 하는지 식별하는 데 도움이 될 것입니다.

## 컴포넌트 내부에서 사용하기 %{#usage-inside-components}%

이제 Vuex 모듈을 Pinia store로 변환했으니, 그 모듈을 사용하는 컴포넌트나 다른 파일도 함께 업데이트해야 합니다.

이전에 Vuex의 `map` helper를 사용하고 있었다면, 대부분의 helper를 재사용할 수 있으므로 [setup() 없이 사용하기 가이드](./options-api.md)를 살펴보는 것이 좋습니다.

이전에 `useStore`를 사용하고 있었다면, 이제는 대신 새 store를 직접 import하고 그 위에서 state에 접근하세요. 예를 들면 다음과 같습니다:

```ts
// Vuex
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  setup() {
    const store = useStore()

    const firstName = computed(() => store.state.auth.user.firstName)
    const fullName = computed(() => store.getters['auth/user/fullName'])

    return {
      firstName,
      fullName,
    }
  },
})
```

```ts
// Pinia
import { defineComponent, computed } from 'vue'
import { useAuthUserStore } from '@/stores/auth-user'

export default defineComponent({
  setup() {
    const authUserStore = useAuthUserStore()

    const firstName = computed(() => authUserStore.firstName)
    const fullName = computed(() => authUserStore.fullName)

    return {
      // 반환하면 컴포넌트에서 스토어 전체에도 접근할 수 있습니다
      authUserStore,
      firstName,
      fullName,
    }
  },
})
```

## 컴포넌트 외부에서 사용하기 %{#usage-outside-components}%

컴포넌트 외부 사용을 업데이트하는 일은, _함수 바깥에서 스토어를 사용하지 않도록_ 주의하기만 하면 간단합니다. 다음은 Vue Router 내비게이션 가드에서 스토어를 사용하는 예제입니다:

```ts
// Vuex
import vuexStore from '@/store'

router.beforeEach((to, from, next) => {
  if (vuexStore.getters['auth/user/loggedIn']) next()
  else next('/login')
})
```

```ts
// Pinia
import { useAuthUserStore } from '@/stores/auth-user'

router.beforeEach((to, from, next) => {
  // 반드시 함수 안에서 사용해야 합니다!
  const authUserStore = useAuthUserStore()
  if (authUserStore.loggedIn) next()
  else next('/login')
})
```

더 자세한 내용은 [여기](../core-concepts/outside-component-usage.md)에서 확인할 수 있습니다.

## 고급 Vuex 사용법 %{#advanced-vuex-usage}%

Vuex 스토어가 제공하는 더 고급 기능을 사용하고 있다면, Pinia에서 같은 일을 어떻게 수행할 수 있는지에 대한 안내가 여기에 있습니다. 이 중 일부는 [이 비교 요약](../introduction.md#Comparison-with-Vuex-3-x-4-x)에서도 이미 다루고 있습니다.

### 동적 모듈 %{#dynamic-modules}%

Pinia에서는 모듈을 동적으로 등록할 필요가 없습니다. 스토어는 설계상 동적이며, 필요할 때만 등록됩니다. 어떤 스토어도 사용되지 않으면 절대 "등록"되지 않습니다.

### 핫 모듈 교체 %{#hot-module-replacement}%

HMR도 지원되지만 대체 방식이 필요합니다. [HMR 가이드](./hot-module-replacement.md)를 참고하세요.

### 플러그인 %{#plugins}%

공개 Vuex 플러그인을 사용하고 있다면 Pinia 대안이 있는지 확인하세요. 없다면 직접 작성하거나, 그 플러그인이 정말 여전히 필요한지 평가해야 합니다.

직접 작성한 플러그인이 있다면, Pinia와 동작하도록 업데이트할 수 있을 가능성이 큽니다. [플러그인 가이드](../core-concepts/plugins.md)를 참고하세요.
