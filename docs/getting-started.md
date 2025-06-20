# 시작하기 %{#getting-started}%

## 설치 %{#installation}%

<VueMasteryLogoLink for="pinia-cheat-sheet">
</VueMasteryLogoLink>

`pinia`를 선호하는 패키지 매니저로 설치하세요:


::: code-group

```bash [npm]
npm install pinia
```

```bash [yarn]
yarn add pinia
```

```bash [pnpm]
pnpm add pinia
```

```bash [bun]
bun add pinia
```

:::

:::tip
앱이 Vue <2.7을 사용하고 있다면, composition api인 `@vue/composition-api`도 설치해야 합니다. Nuxt를 사용 중이라면 [이 안내](/ssr/nuxt.md)를 따라야 합니다.
:::

Vue CLI를 사용 중이라면, 대신 [**비공식 플러그인**](https://github.com/wobsoriano/vue-cli-plugin-pinia)을 시도해 볼 수 있습니다.

pinia 인스턴스(루트 스토어)를 생성하고 앱에 플러그인으로 전달하세요:

```js {2,5-6,8}
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#app')
```

## 스토어란? %{#what-is-a-store}%

스토어(Pinia와 같은)는 컴포넌트 트리에 종속되지 않는 상태와 비즈니스 로직을 보관하는 엔티티입니다. 다시 말해, **전역 상태를 관리합니다**. 항상 존재하며 모든 사람이 읽고 쓸 수 있는 컴포넌트와 비슷합니다. 세 가지 개념, 즉 [state](./core-concepts/state.md), [getters](./core-concepts/getters.md), [actions](./core-concepts/actions.md)가 있으며, 이 개념들은 컴포넌트의 `data`, `computed`, `methods`와 동일하다고 생각해도 무방합니다.

## 언제 스토어를 사용해야 하나요 %{#when-should-i-use-a-store}%

스토어에는 애플리케이션 전체에서 접근할 수 있는 데이터를 포함해야 합니다. 여기에는 여러 곳에서 사용되는 데이터(예: 네비게이션 바에 표시되는 사용자 정보)와 페이지를 이동해도 유지되어야 하는 데이터(예: 매우 복잡한 다단계 폼)가 포함됩니다.

반면, 페이지에 국한된 요소의 가시성처럼 컴포넌트에 보관할 수 있는 로컬 데이터는 스토어에 포함하지 않는 것이 좋습니다.

모든 애플리케이션이 전역 상태에 접근할 필요는 없지만, 필요하다면 Pinia가 훨씬 쉽게 만들어 줄 것입니다.

## 언제 스토어를 **사용하지 말아야** 하나요 %{#when-should-i-not-use-a-store}%

때로는 너무 많은 것에 스토어를 사용하게 됩니다. 애플리케이션이 스토어를 과도하게 사용하고 있다고 느껴진다면, 스토어의 목적을 다시 생각해 볼 필요가 있습니다. 즉, 일부 로직은 컴포저블로 분리하거나, 일부 상태는 컴포넌트의 로컬 상태로 두는 것이 더 적합할 수 있습니다. 이 내용은 Mastering Pinia의 [(스토어를) 과도하게 사용하지 않기](https://masteringpinia.com/lessons/not-overusing-stores) 강의에서 자세히 다룹니다.