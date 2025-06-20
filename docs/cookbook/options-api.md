# `setup()` 없이 사용하기 %{#usage-without-setup}%

Pinia는 컴포지션 API를 사용하지 않아도 사용할 수 있습니다(만약 Vue <2.7을 사용 중이라면, `@vue/composition-api` 플러그인을 설치해야 합니다). 컴포지션 API를 시도해보고 배우는 것을 권장하지만, 아직 여러분이나 팀에게 적합한 시기가 아닐 수도 있고, 애플리케이션을 마이그레이션하는 중이거나, 그 외의 이유가 있을 수 있습니다. 몇 가지 함수가 있습니다:

- [mapStores](#giving-access-to-the-whole-store)
- [mapState](../core-concepts/state.md#usage-with-the-options-api)
- [mapWritableState](../core-concepts/state.md#modifiable-state)
- ⚠️ [mapGetters](../core-concepts/getters.md#without-setup) (마이그레이션 편의를 위한 것으로, 대신 `mapState()`를 사용하세요)
- [mapActions](../core-concepts/actions.md#without-setup)

## 전체 스토어에 접근하기 %{#giving-access-to-the-whole-store}%

스토어의 거의 모든 것에 접근해야 한다면, 스토어의 모든 속성을 하나하나 매핑하는 것은 너무 번거로울 수 있습니다... 대신 `mapStores()`를 사용하여 전체 스토어에 접근할 수 있습니다:

```js
import { mapStores } from 'pinia'

// 다음과 같은 id를 가진 두 개의 스토어가 있다고 가정합니다
const useUserStore = defineStore('user', {
  // ...
})
const useCartStore = defineStore('cart', {
  // ...
})

export default {
  computed: {
    // 배열을 전달하는 것이 아니라, 스토어를 하나씩 나열합니다
    // 각 스토어는 id + 'Store'로 접근할 수 있습니다
    ...mapStores(useCartStore, useUserStore)
  },

  methods: {
    async buyStuff() {
      // 어디서든 사용할 수 있습니다!
      if (this.userStore.isAuthenticated()) {
        await this.cartStore.buy()
        this.$router.push('/purchased')
      }
    },
  },
}
```

기본적으로 Pinia는 각 스토어의 `id`에 `"Store"` 접미사를 추가합니다. 이 동작은 `setMapStoreSuffix()`를 호출하여 커스터마이즈할 수 있습니다:

```js
import { createPinia, setMapStoreSuffix } from 'pinia'

// 접미사를 완전히 제거: this.user, this.cart
setMapStoreSuffix('')
// this.user_store, this.cart_store (괜찮아요, 판단하지 않아요)
setMapStoreSuffix('_store')
export const pinia = createPinia()
```

## TypeScript %{#typescript}%

기본적으로 모든 map 헬퍼는 자동완성을 지원하며, 별도의 작업이 필요하지 않습니다. 만약 `"Store"` 접미사를 변경하기 위해 `setMapStoreSuffix()`를 호출했다면, TS 파일이나 `global.d.ts` 파일 어딘가에 해당 값을 추가해야 합니다. 가장 편리한 위치는 `setMapStoreSuffix()`를 호출하는 곳과 동일한 위치입니다:

```ts
import { createPinia, setMapStoreSuffix } from 'pinia'

setMapStoreSuffix('') // 접미사를 완전히 제거
export const pinia = createPinia()

declare module 'pinia' {
  export interface MapStoresCustomization {
    // 위와 동일한 값으로 설정하세요
    suffix: ''
  }
}
```

:::warning
TypeScript 선언 파일(예: `global.d.ts`)을 사용하는 경우, 모든 기존 타입을 노출하기 위해 파일 상단에 반드시 `import 'pinia'`를 추가하세요.
:::
