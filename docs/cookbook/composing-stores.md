# 스토어 구성하기 %{#composing-stores}%

<RuleKitLink />

스토어 구성은 서로를 사용하는 스토어를 만드는 것을 뜻하며, Pinia는 이를 지원합니다. 따라야 할 규칙은 하나입니다:

**두 개 이상의 스토어가 서로를 사용할 때**, _getter_나 _action_을 통해 무한 루프를 만들 수는 없습니다. setup 함수 안에서 서로의 state를 **둘 다** 직접 읽어서는 안 됩니다:

```js
const useX = defineStore('x', () => {
  const y = useY()

  // y도 x.name을 읽으려 하기 때문에 이는 불가능합니다
  y.name

  function doSomething() {
    // computed나 action 안에서 y의 속성을 읽으세요
    const yName = y.name
    // ...
  }

  return {
    name: ref('I am X'),
  }
})

const useY = defineStore('y', () => {
  const x = useX()

  // x도 y.name을 읽으려 하기 때문에 이는 불가능합니다
  x.name

  function doSomething() {
    // computed나 action 안에서 x의 속성을 읽으세요
    const xName = x.name
    // ...
  }

  return {
    name: ref('I am Y'),
  }
})
```

## 중첩 스토어 %{#nested-stores}%

하나의 스토어가 다른 스토어를 사용한다면, _action_과 _getter_ 안에서 직접 `useStore()` 함수를 import해서 호출할 수 있습니다. 그러면 Vue 컴포넌트 안에서 하듯이 해당 스토어와 상호작용할 수 있습니다. [공유 Getter](#shared-getters)와 [공유 Action](#shared-actions)을 참고하세요.

_setup stores_의 경우에는 스토어 함수 **맨 위에서** 스토어 중 하나를 사용하면 됩니다:

```ts
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { apiPurchase } from './api'

export const useCartStore = defineStore('cart', () => {
  const user = useUserStore()
  const list = ref([])

  const summary = computed(() => {
    return `Hi ${user.name}, you have ${list.value.length} items in your cart. It costs ${price.value}.`
  })

  function purchase() {
    return apiPurchase(user.id, list.value)
  }

  return { list, summary, purchase }
})
```

## 공유 Getter %{#shared-getters}%

_getter_ 안에서는 `useUserStore()`를 간단히 호출하면 됩니다:

```js
import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', {
  getters: {
    summary(state) {
      const user = useUserStore()

      return `Hi ${user.name}, you have ${state.list.length} items in your cart. It costs ${state.price}.`
    },
  },
})
```

## 공유 Action %{#shared-actions}%

_action_에도 똑같이 적용됩니다:

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
        // 다른 action
        this.emptyCart()
      } catch (err) {
        displayError(err)
      }
    },
  },
})
```

action은 비동기일 수 있으므로 **모든 `useStore()` 호출이 어떤 `await`보다도 앞에 오도록** 해야 합니다. 그렇지 않으면 _SSR 앱_에서 잘못된 pinia 인스턴스를 사용하게 될 수 있습니다:

```js{7-8,11-13}
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { apiOrderCart } from './api'

export const useCartStore = defineStore('cart', {
  actions: {
    async orderCart() {
      // 어떤 `await`보다도 먼저 action 맨 위에서 호출합니다
      const user = useUserStore()

      try {
        await apiOrderCart(user.token, this.items)
        // `await` 문 뒤에서 호출되었습니다
        const otherStore = useOtherStore()
        // 다른 action
        this.emptyCart()
      } catch (err) {
        displayError(err)
      }
    },
  },
})
```
