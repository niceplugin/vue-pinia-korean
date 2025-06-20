# Vuex ≤4에서 마이그레이션 %{#migrating-from-vuex-4}%

Vuex와 Pinia 스토어의 구조는 다르지만, 많은 로직을 재사용할 수 있습니다. 이 가이드는 마이그레이션 과정을 도와주고, 자주 발생할 수 있는 몇 가지 주의사항을 알려줍니다.

## 준비 %{#preparation}%

먼저, [시작하기 가이드](../getting-started.md)를 따라 Pinia를 설치하세요.

## 모듈을 스토어로 재구성하기 %{#restructuring-modules-to-stores}%

Vuex에는 여러 _모듈_을 가진 단일 스토어의 개념이 있습니다. 이 모듈들은 선택적으로 네임스페이스를 가질 수 있고, 서로 중첩될 수도 있습니다.

이 개념을 Pinia에서 사용하기 가장 쉬운 방법은, 이전에 사용하던 각 모듈이 이제는 _스토어_가 되는 것입니다. 각 스토어는 Vuex의 네임스페이스와 유사한 `id`가 필요합니다. 즉, 각 스토어는 설계상 네임스페이스가 적용됩니다. 중첩된 모듈도 각각 자신의 스토어가 될 수 있습니다. 서로 의존하는 스토어는 단순히 다른 스토어를 import하면 됩니다.

Vuex 모듈을 Pinia 스토어로 어떻게 재구성할지는 전적으로 여러분의 선택이지만, 다음과 같은 방법을 제안합니다:

```bash
# Vuex 예시 (네임스페이스 모듈을 사용하는 경우) %{#vuex-example-assuming-namespaced-modules}%

src
└── store
    ├── index.js           # Vuex 초기화, 모듈 import
    └── modules
        ├── module1.js     # 'module1' 네임스페이스
        └── nested
            ├── index.js   # 'nested' 네임스페이스, module2 & module3 import
            ├── module2.js # 'nested/module2' 네임스페이스
            └── module3.js # 'nested/module3' 네임스페이스

# Pinia 대응 구조, id가 이전 네임스페이스와 일치함에 주목 %{#pinia-equivalent-note-ids-match-previous-namespaces}%

src
└── stores
    ├── index.js          # (선택사항) Pinia 초기화, 스토어 import 없음
    ├── module1.js        # 'module1' id
    ├── nested-module2.js # 'nestedModule2' id
    ├── nested-module3.js # 'nestedModule3' id
    └── nested.js         # 'nested' id
```

이렇게 하면 스토어에 대해 평면적인 구조를 만들면서도, 이전 네임스페이스를 동일한 `id`로 보존할 수 있습니다. 만약 스토어의 루트(즉, Vuex의 `store/index.js` 파일)에 state/getters/actions/mutations가 있다면, 해당 정보를 담는 `root`와 같은 또 다른 스토어를 만들 수도 있습니다.

Pinia의 디렉토리는 일반적으로 `store`가 아니라 `stores`로 불립니다. 이는 Pinia가 여러 개의 스토어를 사용하는 반면, Vuex는 단일 스토어를 사용한다는 점을 강조하기 위함입니다.

대규모 프로젝트의 경우, 한 번에 모든 것을 변환하기보다는 모듈별로 변환하는 것이 좋을 수 있습니다. 실제로 마이그레이션 중에는 Pinia와 Vuex를 함께 사용할 수 있으므로, 이 접근 방식도 가능하며 Pinia 디렉토리를 `stores`로 명명하는 또 다른 이유가 됩니다.

## 단일 모듈 변환하기 %{#converting-a-single-module}%

아래는 Vuex 모듈을 Pinia 스토어로 변환하는 전후의 전체 예시입니다. 단계별 가이드는 아래를 참고하세요. Pinia 예시는 구조가 Vuex와 가장 유사한 옵션 스토어를 사용합니다:

```ts
// 'auth/user' 네임스페이스의 Vuex 모듈
import { Module } from 'vuex'
import { api } from '@/api'
import { RootState } from '@/types' // Vuex 타입 정의를 사용하는 경우

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
    userId: null
  },
  getters: {
    firstName: (state) => state.firstName,
    fullName: (state) => `${state.firstName} ${state.lastName}`,
    loggedIn: (state) => state.userId !== null,
    // 다른 모듈의 state와 결합
    fullUserDetails: (state, getters, rootState, rootGetters) => {
      return {
        ...state,
        fullName: getters.fullName,
        // 'auth'라는 다른 모듈의 state 읽기
        ...rootState.auth.preferences,
        // 'auth' 아래에 중첩된 'email' 네임스페이스 모듈의 getter 읽기
        ...rootGetters['auth/email'].details
      }
    }
  },
  actions: {
    async loadUser ({ state, commit }, id: number) {
      if (state.userId !== null) throw new Error('이미 로그인됨')
      const res = await api.user.load(id)
      commit('updateUser', res)
    }
  },
  mutations: {
    updateUser (state, payload) {
      state.firstName = payload.firstName
      state.lastName = payload.lastName
      state.userId = payload.userId
    },
    clearUser (state) {
      state.firstName = ''
      state.lastName = ''
      state.userId = null
    }
  }
}

export default storeModule
```

```ts
// Pinia 스토어
import { defineStore } from 'pinia'
import { useAuthPreferencesStore } from './auth-preferences'
import { useAuthEmailStore } from './auth-email'
import vuexStore from '@/store' // 점진적 변환을 위한 예시, fullUserDetails 참고

interface State {
  firstName: string
  lastName: string
  userId: number | null
}

export const useAuthUserStore = defineStore('authUser', {
  // 함수로 변환
  state: (): State => ({
    firstName: '',
    lastName: '',
    userId: null
  }),
  getters: {
    // firstName getter 제거, 더 이상 필요 없음
    fullName: (state) => `${state.firstName} ${state.lastName}`,
    loggedIn: (state) => state.userId !== null,
    // `this`를 사용하므로 반환 타입 명시 필요
    fullUserDetails (state): FullUserDetails {
      // 다른 스토어에서 import
      const authPreferencesStore = useAuthPreferencesStore()
      const authEmailStore = useAuthEmailStore()
      return {
        ...state,
        // 다른 getter는 이제 `this`에 있음
        fullName: this.fullName,
        ...authPreferencesStore.$state,
        ...authEmailStore.details
      }

      // 다른 모듈이 아직 Vuex에 있다면 대안
      // return {
      //   ...state,
      //   fullName: this.fullName,
      //   ...vuexStore.state.auth.preferences,
      //   ...vuexStore.getters['auth/email'].details
      // }
    }
  },
  actions: {
    // 첫 번째 인자로 context 없음, 대신 `this` 사용
    async loadUser (id: number) {
      if (this.userId !== null) throw new Error('이미 로그인됨')
      const res = await api.user.load(id)
      this.updateUser(res)
    },
    // mutation은 이제 action이 될 수 있음, 첫 번째 인자로 `state` 대신 `this` 사용
    updateUser (payload) {
      this.firstName = payload.firstName
      this.lastName = payload.lastName
      this.userId = payload.userId
    },
    // `$reset`으로 state를 쉽게 초기화
    clearUser () {
      this.$reset()
    }
  }
})
```

위 내용을 단계별로 살펴보면:

1. 스토어에 필수 `id`를 추가합니다. 이전 네임스페이스와 동일하게 유지하는 것이 좋습니다. 또한 `id`는 _camelCase_로 지정하는 것이 `mapStores()`와 함께 사용할 때 더 편리합니다.
2. `state`를 함수로 변환합니다(이미 함수가 아니라면).
3. `getters` 변환
    1. state를 동일한 이름으로 반환하는 getter(예: `firstName: (state) => state.firstName`)는 제거합니다. 스토어 인스턴스에서 state에 직접 접근할 수 있으므로 필요하지 않습니다.
    2. 다른 getter에 접근해야 한다면, 두 번째 인자 대신 `this`에 있습니다. `this`를 사용하려면 화살표 함수 대신 일반 함수를 사용해야 하며, TS 제한으로 인해 반환 타입을 명시해야 합니다. 자세한 내용은 [여기](../core-concepts/getters.md#accessing-other-getters)를 참고하세요.
    3. `rootState`나 `rootGetters` 인자를 사용했다면, 해당 스토어를 직접 import해서 사용하거나, 아직 Vuex에 있다면 Vuex에서 직접 접근하세요.
4. `actions` 변환
    1. 각 action의 첫 번째 `context` 인자를 제거합니다. 모든 것은 대신 `this`에서 접근할 수 있습니다.
    2. 다른 스토어를 사용할 경우, getter와 마찬가지로 직접 import하거나 Vuex에서 접근하세요.
5. `mutations` 변환
    1. mutation은 더 이상 존재하지 않습니다. 대신 action으로 변환하거나, 컴포넌트 내에서 스토어에 직접 할당할 수 있습니다(예: `userStore.firstName = 'First'`).
    2. action으로 변환할 경우, 첫 번째 `state` 인자를 제거하고 모든 할당을 `this`로 변경하세요.
    3. state를 초기 상태로 리셋하는 mutation은 흔한데, 이는 스토어의 `$reset` 메서드로 내장되어 있습니다. 이 기능은 옵션 스토어에서만 사용할 수 있습니다.

보시다시피 대부분의 코드를 재사용할 수 있습니다. 타입 안전성 덕분에 변경이 필요한 부분도 쉽게 파악할 수 있습니다.

## 컴포넌트 내부에서의 사용 %{#usage-inside-components}%

이제 Vuex 모듈이 Pinia 스토어로 변환되었으므로, 해당 모듈을 사용하는 모든 컴포넌트나 파일도 업데이트해야 합니다.

이전에 Vuex의 `map` 헬퍼를 사용했다면, [setup() 없이 사용하기 가이드](./options-api.md)를 참고하세요. 대부분의 헬퍼를 재사용할 수 있습니다.

`useStore`를 사용했다면, 이제 새 스토어를 직접 import해서 state에 접근하면 됩니다. 예를 들어:

```ts
// Vuex
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  setup () {
    const store = useStore()

    const firstName = computed(() => store.state.auth.user.firstName)
    const fullName = computed(() => store.getters['auth/user/fullName'])

    return {
      firstName,
      fullName
    }
  }
})
```

```ts
// Pinia
import { defineComponent, computed } from 'vue'
import { useAuthUserStore } from '@/stores/auth-user'

export default defineComponent({
  setup () {
    const authUserStore = useAuthUserStore()

    const firstName = computed(() => authUserStore.firstName)
    const fullName = computed(() => authUserStore.fullName)

    return {
      // 컴포넌트에서 전체 스토어를 반환하여 접근할 수도 있음
      authUserStore,
      firstName,
      fullName
    }
  }
})
```

## 컴포넌트 외부에서의 사용 %{#usage-outside-components}%

컴포넌트 외부에서의 사용을 업데이트하는 것은 _함수 외부에서 스토어를 사용하지 않는 것_만 주의하면 간단합니다. 다음은 Vue Router 네비게이션 가드에서 스토어를 사용하는 예시입니다:

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
  // 반드시 함수 내부에서 사용해야 함!
  const authUserStore = useAuthUserStore()
  if (authUserStore.loggedIn) next()
  else next('/login')
})
```

자세한 내용은 [여기](../core-concepts/outside-component-usage.md)를 참고하세요.

## 고급 Vuex 사용법 %{#advanced-vuex-usage}%

Vuex 스토어에서 제공하는 고급 기능을 사용하는 경우, Pinia에서 동일하게 구현하는 방법에 대한 안내입니다. 이 중 일부는 [비교 요약](../introduction.md#Comparison-with-Vuex-3-x-4-x)에서도 다루고 있습니다.

### 동적 모듈 %{#dynamic-modules}%

Pinia에서는 동적으로 모듈을 등록할 필요가 없습니다. 스토어는 설계상 동적이며, 필요할 때만 등록됩니다. 한 번도 사용되지 않은 스토어는 "등록"되지 않습니다.

### 핫 모듈 교체 %{#hot-module-replacement}%

HMR도 지원되지만, 대체가 필요합니다. [HMR 가이드](./hot-module-replacement.md)를 참고하세요.

### 플러그인 %{#plugins}%

공개된 Vuex 플러그인을 사용한다면, Pinia 대체 플러그인이 있는지 확인하세요. 없다면 직접 작성하거나, 해당 플러그인이 여전히 필요한지 평가해야 합니다.

직접 플러그인을 작성했다면, Pinia에 맞게 업데이트할 수 있습니다. [플러그인 가이드](../core-concepts/plugins.md)를 참고하세요.