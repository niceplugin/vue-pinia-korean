# 스토어 조합하기 %{#composing-stores}%

스토어 조합은 서로를 사용하는 스토어를 만드는 것이며, 이는 Pinia에서 지원됩니다. 따라야 할 규칙이 하나 있습니다:

**두 개 이상의 스토어가 서로를 사용할 경우**, _getter_나 _action_을 통해 무한 루프를 만들 수 없습니다. setup 함수 내에서 **서로의 state를 직접** 읽을 수 없습니다:

```js
const useX = defineStore('x', () => {
  const y = useY()

  // ❌ 이것은 불가능합니다. y도 x.name을 읽으려고 시도하기 때문입니다.
  y.name

  function doSomething() {
    // ✅ computed나 action에서 y의 속성을 읽으세요
    const yName = y.name
    // ...
  }

  return {
    name: ref('나는 X입니다'),
  }
})

const useY = defineStore('y', () => {
  const x = useX()

  // ❌ 이것은 불가능합니다. x도 y.name을 읽으려고 시도하기 때문입니다.
  x.name

  function doSomething() {
    // ✅ computed나 action에서 x의 속성을 읽으세요
    const xName = x.name
    // ...
  }

  return {
    name: ref('나는 Y입니다'),
  }
})
```

## 중첩 스토어 %{#nested-stores}%

한 스토어가 다른 스토어를 사용할 경우, _action_과 _getter_ 내에서 `useStore()` 함수를 직접 import하여 호출할 수 있습니다. 그러면 Vue 컴포넌트 내에서처럼 스토어와 상호작용할 수 있습니다. [공유 Getter](#Shared-Getters)와 [공유 Action](#Shared-Actions)를 참고하세요.

_setup 스토어_의 경우, 스토어 함수의 **맨 위**에서 다른 스토어를 간단히 사용할 수 있습니다:

```ts
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { apiPurchase } from './api'

export const useCartStore = defineStore('cart', () => {
  const user = useUserStore()
  const list = ref([])

  const summary = computed(() => {
    return `안녕하세요 ${user.name}님, 장바구니에 ${list.value.length}개의 아이템이 있습니다. 총 가격은 ${price.value}입니다.`
  })

  function purchase() {
    return apiPurchase(user.id, list.value)
  }

  return { summary, purchase }
})
```

## 공유 Getter %{#shared-getters}%

_getter_ 내에서 `useUserStore()`를 간단히 호출할 수 있습니다:

```js
import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', {
  getters: {
    summary(state) {
      const user = useUserStore()

      return `안녕하세요 ${user.name}님, 장바구니에 ${state.list.length}개의 아이템이 있습니다. 총 가격은 ${state.price}입니다.`
    },
  },
})
```

## 공유 Action %{#shared-actions}%

_action_에도 동일하게 적용됩니다:

```js
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { apiOrderCart } from './api'
 
export const useCartStore = defineStore('cart', {
  actions: {
    async orderCart() {
      const user = useUserStore()

      try {
        await apiOrderCart(user.token, this.items)
        // 또 다른 action
        this.emptyCart()
      } catch (err) {
        displayError(err)
      }
    },
  },
})
```

action은 비동기일 수 있으므로, **모든 `useStore()` 호출이 어떤 `await`보다 먼저 나오도록** 해야 합니다. 그렇지 않으면 _SSR 앱_에서 잘못된 pinia 인스턴스를 사용할 수 있습니다:

```js{7-8,11-13}
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { apiOrderCart } from './api'
  
export const useCartStore = defineStore('cart', {
  actions: {
    async orderCart() {
      // ✅ action의 맨 위에서 어떤 `await`보다 먼저 호출하세요
      const user = useUserStore()

      try {
        await apiOrderCart(user.token, this.items)
        // ❌ `await`문 이후에 호출됨
        const otherStore = useOtherStore()
        // 또 다른 action
        this.emptyCart()
      } catch (err) {
        displayError(err)
      }
    },
  },
})
```
