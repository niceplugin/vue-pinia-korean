# HMR (Hot Module Replacement) %{#hmr-hot-module-replacement}%

Pinia는 Hot Module Replacement(HMR)를 지원하므로, 스토어를 수정하고 페이지를 새로 고침하지 않고도 앱에서 직접 상호작용할 수 있습니다. 이를 통해 기존 상태를 유지하면서 상태, 액션, 게터를 추가하거나 제거할 수 있습니다.

현재는 [Vite](https://vitejs.dev/guide/api-hmr.html#hmr-api)만 공식적으로 지원되지만, `import.meta.hot` 스펙을 구현한 번들러라면 모두 동작해야 합니다(예: [webpack](https://webpack.js.org/api/module-variables/#importmetawebpackhot)은 `import.meta.hot` 대신 `import.meta.webpackHot`을 사용하는 것으로 보입니다).
스토어 선언 옆에 아래 코드 스니펫을 추가해야 합니다. 예를 들어, `auth.js`, `cart.js`, `chat.js` 세 개의 스토어가 있다면, _스토어 정의_를 생성한 후에 아래와 같이(적절히 수정하여) 추가해야 합니다:

```js
// auth.js
import { defineStore, acceptHMRUpdate } from 'pinia'

export const useAuth = defineStore('auth', {
  // 옵션...
})

// 올바른 스토어 정의(`useAuth`인 경우)를 전달해야 합니다.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuth, import.meta.hot))
}
```