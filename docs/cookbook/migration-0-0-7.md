# 0.0.7에서 마이그레이션 %{#migrating-from-0-0-7}%

`0.0.7` 이후 버전인 `0.1.0`, `0.2.0`에는 몇 가지 큰 브레이킹 체인지가 포함되어 있습니다. 이 가이드는 Vue 2를 사용하든 Vue 3를 사용하든 마이그레이션을 도와줍니다. 전체 변경 로그는 저장소에서 확인할 수 있습니다:

- [Vue 2용 Pinia <= 1](https://github.com/vuejs/pinia/blob/v1/CHANGELOG.md)
- [Vue 3용 Pinia >= 2](https://github.com/vuejs/pinia/blob/v3/packages/pinia/CHANGELOG.md)

마이그레이션과 관련해 질문이나 문제가 있다면, 편하게 [discussion을 열어](https://github.com/vuejs/pinia/discussions/categories/q-a) 도움을 요청하세요.

## 더 이상 `store.state`는 없습니다 %{#no-more-store-state}%

이제는 `state` 속성을 통해 스토어 state에 접근하지 않습니다. 어떤 state 속성이든 직접 접근할 수 있습니다.

다음과 같이 정의된 스토어가 있다고 합시다:

```js
const useStore({
  id: 'main',
  state: () => ({ count: 0 })
})
```

다음처럼 하세요

```diff
 const store = useStore()

-store.state.count++
+store.count.++
```

필요하다면 여전히 `$state`로 스토어 전체 state에 접근할 수 있습니다:

```diff
-store.state = newState
+store.$state = newState
```

## 스토어 속성 이름 변경 %{#rename-of-store-properties}%

이제 모든 스토어 속성(`id`, `patch`, `reset` 등) 앞에는 `$`가 붙습니다. 이렇게 해야 동일한 이름을 가진 속성을 스토어 위에 정의할 수 있기 때문입니다. 팁: 각 스토어 속성에서 F2(또는 우클릭 + Refactor)를 사용해 코드베이스 전체를 리팩터링할 수 있습니다

```diff
 const store = useStore()
-store.patch({ count: 0 })
+store.$patch({ count: 0 })

-store.reset()
+store.$reset()

-store.id
+store.$id
```

## Pinia 인스턴스 %{#the-pinia-instance}%

이제는 pinia 인스턴스를 생성하고 설치해야 합니다:

Vue 2를 사용 중이라면(Pinia <= 1):

```js
import Vue from 'vue'
import { createPinia, PiniaVuePlugin } from 'pinia'

const pinia = createPinia()
Vue.use(PiniaVuePlugin)
new Vue({
  el: '#app',
  pinia,
  // ...
})
```

Vue 3를 사용 중이라면(Pinia >= 2):

```js
import { createApp } from 'vue'
import { createPinia, PiniaVuePlugin } from 'pinia'
import App from './App.vue'

const pinia = createPinia()
createApp(App).use(pinia).mount('#app')
```

`pinia` 인스턴스는 state를 담는 곳이며, **애플리케이션마다 고유해야 합니다**. 더 자세한 내용은 문서의 SSR 섹션을 확인하세요.

## SSR 변경 사항 %{#ssr-changes}%

SSR 플러그인 `PiniaSsr`는 더 이상 필요하지 않으며 제거되었습니다.
pinia 인스턴스가 도입되면서 `getRootState()`도 더 이상 필요하지 않게 되었고, `pinia.state.value`로 대체해야 합니다:

Vue 2를 사용 중이라면(Pinia <= 1):

```diff
// entry-server.js
-import { getRootState, PiniaSsr } from 'pinia',
+import { createPinia, PiniaVuePlugin } from 'pinia',


-// setup과 onServerPrefetch에서 올바른 컨텍스트를 자동으로 사용하도록 플러그인을 설치합니다
-Vue.use(PiniaSsr);
+Vue.use(PiniaVuePlugin)

 export default context => {
+  const pinia = createPinia()
   const app = new Vue({
     // other options
+    pinia
   })

   context.rendered = () => {
     // state를 context에 전달합니다
-    context.piniaState = getRootState(context.req)
+    context.piniaState = pinia.state.value
   };

-   return { app }
+   return { app, pinia }
 }
```

`setActiveReq()`와 `getActiveReq()`는 각각 `setActivePinia()`와 `getActivePinia()`로 대체되었습니다. `setActivePinia()`에는 `createPinia()`로 생성한 `pinia` 인스턴스만 전달할 수 있습니다. **대부분의 경우 이 함수들을 직접 사용할 일은 없다는 점에 유의하세요**.
