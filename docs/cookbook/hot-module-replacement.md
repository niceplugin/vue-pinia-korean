# HMR (핫 모듈 교체) %{#hmr-hot-module-replacement}%

<RuleKitLink />

Pinia는 핫 모듈 교체를 지원하므로 페이지를 다시 불러오지 않고도 스토어를 편집하고 앱 안에서 직접 상호작용할 수 있습니다. 따라서 기존 상태를 유지한 채 state, action, getter를 추가하거나 제거할 수 있습니다.

현재 공식적으로 지원되는 것은 [Vite](https://vitejs.dev/guide/api-hmr.html#hmr-api)뿐이지만, `import.meta.hot` 명세를 구현한 어떤 번들러든 동작해야 합니다(예: [webpack](https://webpack.js.org/api/module-variables/#importmetawebpackhot)은 `import.meta.hot` 대신 `import.meta.webpackHot`을 사용하는 것으로 보입니다).
각 스토어 선언 옆에는 이 코드 조각을 추가해야 합니다. 예를 들어 `auth.js`, `cart.js`, `chat.js`라는 세 개의 스토어가 있다면, _스토어 정의_를 만든 뒤에 다음 코드를 추가하고(필요에 맞게 수정해야 합니다):

```js
// auth.js
import { defineStore, acceptHMRUpdate } from 'pinia'

export const useAuth = defineStore('auth', {
  // 옵션...
})

// 이 경우에는 올바른 스토어 정의인 `useAuth`를 전달해야 합니다.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuth, import.meta.hot))
}
```
