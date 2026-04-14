# 시작하기 %{#getting-started}%

## 설치 %{#installation}%

<VueMasteryLogoLink for="pinia-cheat-sheet">
</VueMasteryLogoLink>

선호하는 패키지 매니저로 `pinia`를 설치하세요:

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
앱에서 Vue <2.7을 사용한다면 composition api인 `@vue/composition-api`도 설치해야 합니다. Nuxt를 사용 중이라면 [이 안내](/ssr/nuxt.md)를 따르세요.
:::

Vue CLI를 사용 중이라면 이 [**비공식 플러그인**](https://github.com/wobsoriano/vue-cli-plugin-pinia)도 시도해 볼 수 있습니다.

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

## 스토어란 무엇인가요? %{#what-is-a-store}%

스토어(Pinia와 같은)는 컴포넌트 트리에 묶여 있지 않은 상태와 비즈니스 로직을 담는 엔티티입니다. 다시 말해, **전역 상태를 보관하는 곳**입니다. 항상 존재하며 누구나 읽고 쓸 수 있는 컴포넌트와 조금 비슷합니다. 스토어에는 **세 가지 개념**, 즉 [state](./core-concepts/state.md), [getters](./core-concepts/getters.md), [actions](./core-concepts/actions.md)가 있으며, 이는 컴포넌트의 `data`, `computed`, `methods`에 해당한다고 볼 수 있습니다.

<RuleKitLink />

## 언제 스토어를 사용해야 하나요 %{#when-should-i-use-a-store}%

스토어에는 애플리케이션 전반에서 접근할 수 있어야 하는 데이터를 담아야 합니다. 예를 들어 네비게이션 바에 표시되는 사용자 정보처럼 여러 곳에서 쓰이는 데이터, 혹은 매우 복잡한 다단계 폼처럼 페이지를 거쳐도 유지되어야 하는 데이터가 여기에 해당합니다.

반대로, 페이지 내부 요소의 표시 여부처럼 컴포넌트 안에 둘 수 있는 로컬 데이터는 스토어에 넣지 않는 것이 좋습니다.

모든 애플리케이션에 전역 상태가 필요한 것은 아니지만, 필요하다면 Pinia가 작업을 더 수월하게 만들어 줄 것입니다.

## 언제 스토어를 **사용하지 말아야** 하나요 %{#when-should-i-not-use-a-store}%

때로는 스토어를 너무 많은 용도로 사용하게 됩니다. 애플리케이션이 스토어를 과도하게 사용하고 있다고 느껴진다면, 각 스토어의 목적을 다시 생각해 보세요. 일부 로직은 단순한 컴포저블이어야 할 수도 있고, 일부 상태는 컴포넌트 로컬 상태여야 할 수도 있습니다. 이 내용은 Mastering Pinia의 [(Not) Overusing stores](https://masteringpinia.com/lessons/not-overusing-stores) 강의에서 자세히 다룹니다.
