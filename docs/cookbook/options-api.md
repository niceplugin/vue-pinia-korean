# `setup()` 없이 사용하기 %{#usage-without-setup}%

Pinia는 Composition API를 사용하지 않아도 사용할 수 있습니다(Vue <2.7을 사용한다면 여전히 `@vue/composition-api` 플러그인을 설치해야 합니다). Composition API를 시도해 보고 익혀 보기를 권장하지만, 아직은 당신과 팀에 적절한 시기가 아닐 수도 있고, 애플리케이션을 마이그레이션하는 중일 수도 있으며, 그 밖의 다른 이유도 있을 수 있습니다. 사용할 수 있는 함수는 몇 가지가 있습니다:

- [mapStores](#giving-access-to-the-whole-store)
- [mapState](../core-concepts/state.md#usage-with-the-options-api)
- [mapWritableState](../core-concepts/state.md#modifiable-state)
- ⚠️ [mapGetters](../core-concepts/getters.md#without-setup) (마이그레이션 편의를 위한 것일 뿐이므로, 대신 `mapState()`를 사용하세요)
- [mapActions](../core-concepts/actions.md#without-setup)

<RuleKitLink />

## 스토어 전체에 접근하기 %{#giving-access-to-the-whole-store}%

스토어에서 거의 모든 것에 접근해야 한다면, 스토어의 모든 속성을 일일이 매핑하는 것은 너무 번거로울 수 있습니다... 대신 `mapStores()`로 스토어 전체에 접근할 수 있습니다:

```js
import { mapStores } from 'pinia'

// 다음과 같은 id를 가진 두 스토어가 있다고 가정합니다
const useUserStore = defineStore('user', {
  // ...
})
const useCartStore = defineStore('cart', {
  // ...
})

export default {
  computed: {
    // 배열을 전달하는 것이 아니라 스토어를 하나씩 순서대로 전달합니다
    // 각 스토어는 자신의 id + 'Store'로 접근할 수 있습니다
    ...mapStores(useCartStore, useUserStore),
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

기본적으로 Pinia는 각 스토어의 `id`에 `"Store"` 접미사를 붙입니다. 이 동작은 `setMapStoreSuffix()`를 호출해 커스터마이즈할 수 있습니다:

```js
import { createPinia, setMapStoreSuffix } from 'pinia'

// 접미사를 완전히 제거합니다: this.user, this.cart
setMapStoreSuffix('')
// this.user_store, this.cart_store (괜찮습니다, 판단하진 않겠습니다)
setMapStoreSuffix('_store')
export const pinia = createPinia()
```

## TypeScript %{#typescript}%

기본적으로 모든 map 헬퍼는 자동완성을 지원하므로 별도로 할 일은 없습니다. `"Store"` 접미사를 변경하기 위해 `setMapStoreSuffix()`를 호출했다면, TS 파일이나 `global.d.ts` 파일 어딘가에 그 값을 함께 추가해야 합니다. 가장 편한 위치는 `setMapStoreSuffix()`를 호출하는 바로 그곳입니다:

```ts
import { createPinia, setMapStoreSuffix } from 'pinia'

setMapStoreSuffix('') // 접미사를 완전히 제거합니다
export const pinia = createPinia()

declare module 'pinia' {
  export interface MapStoresCustomization {
    // 위와 같은 값으로 설정하세요
    suffix: ''
  }
}
```

:::warning
TypeScript 선언 파일(예: `global.d.ts`)을 사용한다면, 기존 타입이 모두 노출되도록 파일 상단에 반드시 `import 'pinia'`를 추가하세요.
:::
