# 소개 %{#introduction}%

<!-- <VueSchoolLink
  href="https://vueschool.io/lessons/introduction-to-pinia"
  title="Pinia 시작하기"
/> -->

<MasteringPiniaLink
  href="https://play.gumlet.io/embed/651ecf274c2f339c6860e36b"
  mp-link="https://masteringpinia.com/lessons/the-what-and-why-of-state-management-and-stores"
  title="직접 Pinia를 처음부터 만들어보기"
/>

Pinia는 [2019년 11월경](https://github.com/vuejs/pinia/commit/06aeef54e2cad66696063c62829dac74e15fd19e) [Composition API](https://github.com/vuejs/composition-api)를 활용해 Vue의 스토어를 새롭게 설계하려는 실험으로 시작되었습니다. 그 이후로 초기 원칙은 그대로 유지되었고, 2025년에는 Vue 2 지원이 중단되었지만, Pinia는 **Composition API를 반드시 사용할 필요는 없습니다**.

## 왜 Pinia를 사용해야 하나요? %{#why-should-i-use-pinia}%

<!--
https://masteringpinia.com/lessons/why-use-pinia
 -->

Pinia는 Vue를 위한 스토어 라이브러리로, 컴포넌트/페이지 간에 상태를 공유할 수 있게 해줍니다. Composition API에 익숙하다면, 단순히 `export const state = reactive({})`로도 전역 상태를 공유할 수 있다고 생각할 수 있습니다. 이는 단일 페이지 애플리케이션(SPA)에서는 맞는 말이지만, 서버 사이드 렌더링(SSR)일 경우 **[보안 취약점](https://vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution)에 노출될 수 있습니다**. 하지만 작은 SPA에서도 Pinia를 사용하면 많은 이점을 얻을 수 있습니다:

- 테스트 유틸리티
- 플러그인: 플러그인으로 Pinia 기능 확장
- 적절한 TypeScript 지원 또는 JS 사용자에게 **자동완성**
- 서버 사이드 렌더링 지원
- 개발자 도구 지원
  - 액션과 변이를 추적할 수 있는 타임라인
  - 스토어가 사용된 컴포넌트에 표시됨
  - 타임 트래블 및 더 쉬운 디버깅
- 핫 모듈 교체
  - 페이지를 새로고침하지 않고 스토어 수정
  - 개발 중에도 기존 상태 유지

아직도 의문이 있다면, [**공식** Mastering Pinia 강좌](https://masteringpinia.com)를 확인해보세요. 처음에는 직접 `defineStore()` 함수를 만드는 방법을 다루고, 이후 공식 Pinia API로 넘어갑니다.

<VueMasteryLogoLink for="pinia-cheat-sheet">
</VueMasteryLogoLink>

## 기본 예제 %{#basic-example}%

Pinia를 사용하는 API는 다음과 같습니다([시작하기](./getting-started.md)에서 전체 지침을 꼭 확인하세요). 먼저 스토어를 생성합니다:

```js
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => {
    return { count: 0 }
  },
  // 이렇게도 정의할 수 있습니다
  // state: () => ({ count: 0 })
  actions: {
    increment() {
      this.count++
    },
  },
})
```

그리고 컴포넌트에서 _사용_ 합니다:

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()

counter.count++
// 자동완성 지원 ✨
counter.$patch({ count: counter.count + 1 })
// 또는 액션을 사용
counter.increment()
</script>

<template>
  <!-- 스토어에서 상태를 직접 접근 -->
  <div>현재 카운트: {{ counter.count }}</div>
</template>
```

[Playground에서 직접 해보기](https://play.pinia.vuejs.org/#eNqNVM1O3DAQfpVpVGkXQWIQLYfVgqCIQ3toq9JjLsEZWNPEtuzJstUqb9IH6HP1STq2k/2hFeKyG49nvvnmsz+vsytri2WH2Sybe+mUJfBInb0otWqtcQRr6Dxem04TulsyDqGHe2damBRCpnDx6CelLrU02hMMQTh/Xjg9SEmpJv4fHpZaCHhStICqIyNNaxskZTT8+fV7m/zWViQX03UCn409Eggcwgn0DM5IxnFXpR+g0lDJCKSYFFb1Fkxp6bBFTYHQXKSxeWBeEHL/ipBXAPM3eQ5XUqL3QAsET7wDtXIoqfmZREjxoEqep6JaLS+uO+cYH+L0M1gPvDeE+34uQl5ov2mZHWVJ8rytLEtqNB/KOmCWw4YvMwYLkRCzSqsqRMpMxO8CfZvfOfPk45GU2dGYesknLGpckjGNzyurUtmCyPqZELLWnF9jo5au0EhC21b8U3N5VrwvTkSj7gQ3EkrXuNpvwxV5je1r0MfUy+Pi5F1xFlGXpwNoG1ADaF/qnmUhzzfrXj08EyVcFtWg+2LDOe+LUzWNefoUY+Q63FCUC5Q//hN/9KvE+qtDlm+JO2NR5R6Q0vbN7Wdc8fdmszV113D2C5vf0JumCxxT2odO10x7Jy+y/RjPmO/ud3+zItR+HCoQjWrE/Cjz9Qujb+meFqc7Km7NyhJuzF3jvdK4b+x4m6KjcRXTkrGfvwPnu8XTyYA/OUpUoltmMD2A84uRnOOnxWnuOtj4OHAbB2P3cripoWq8gTt2WkTntR+29yC3jwGjsJFh8LvfSLHj8zEEbFjlt29PiKTu4bc/yPq/puS2IQ==)

더 고급 사용 사례를 위해 컴포넌트의 `setup()`과 유사하게 함수로 스토어를 정의할 수도 있습니다:

```js
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  function increment() {
    count.value++
  }

  return { count, increment }
})
```

[Playground에서 직접 해보기](https://play.pinia.vuejs.org/#eNqNVEFu2zAQ/MpWKGAHscQGaXMwnCBpkEN7aIumR10Uah0zlUiCXCkuDP2kD+i7+pIuSVt20iLoSeJydnZ2yOUmu7K26DvM5tnCS6csgUfq7EWpVWuNI9hA5/HadJrQ3ZJxCAMsnWlhUgiZwsWDn5S61NJoT7ANwvnzxOlRAqWc+D0+LrUQ8KhoBVVHRprWNkjKaPj989ce/NpWJFfTTSKf72okEjiGExiYnJmM46pK30OloZKRSLEorOo9mdLSYYuagqCFSG1zw7wg5PoVIa8AFq/yHK6kRO+BVgieeAdq5VBS8yOZkOLBlTxPSbXqL64755gfYvdz2Gx1j4KHYSECLpQfS2azLFmet5VlS43mQ9kEznK74cuMyUIkxKzSqgqRMhPxv0Df5nfOPPp4JGU220Ev+YRFjT0Z0/i8siqlrYisnwsha834GhvVu0IjCW1b8VfO5VnxrjgRjboTXEgoXeP6aRnOyGts/4d9B718U5y8Lc4ia3+6JW0DayAdSj2wLeT5Zi3V/TNTwmVRDbrPNpzzU3OqpjGPH2OMXIejRLlC+f0f8Qe/Tqq/OGT7ejxoiyp3j5S2b24/4Zr/x83W1F3D6Bc2v6I3TRc0Jtj7Ttcs+wAX1X6IZ8x395u/WRNqv2sqCI1uRHy0+fqF1vdyT4vTAxf3w8oWjsPtcDkONBPzHI9bNS6VxqczHy9aHHZcR1ia+edPxPlh8nSyLT2ZwfQIzi+S1oPXgvGsY/qG5xFg2end4I5zuusuoou+ajoMT0fsLXwcv1lOs+YImO1TY/NH2fAHelGuuQ==)

아직 `setup()`과 Composition API가 익숙하지 않더라도 걱정하지 마세요. Pinia는 [_map 헬퍼_ (Vuex와 유사)](https://vuex.vuejs.org/guide/state.html#the-mapstate-helper)도 지원합니다. 스토어는 동일하게 정의하고, 이후 `mapStores()`, `mapState()`, `mapActions()`를 사용합니다:

```js {22,24,28}
const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: {
    double: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++
    },
  },
})

const useUserStore = defineStore('user', {
  // ...
})

export default defineComponent({
  computed: {
    // 다른 계산 속성들
    // ...
    // this.counterStore와 this.userStore에 접근 가능
    ...mapStores(useCounterStore, useUserStore),
    // this.count와 this.double에 읽기 접근 가능
    ...mapState(useCounterStore, ['count', 'double']),
  },
  methods: {
    // this.increment()에 접근 가능
    ...mapActions(useCounterStore, ['increment']),
  },
})
```

[Playground에서 직접 해보기](https://play.pinia.vuejs.org/#eNqdVcFy0zAQ/RWNL0lpIrUUesikmRTooRyAoXDCHBxrm6i1JY8kp5nJ+N9ZS7bsOIFhekmk1b7dt0/a9T66LQq6LSGaRXOTalHYRSxFXihtyZ5weBQSPircS5CWVORRq5yMEDDqueVJ8WCVBjPxy8SCW92mVihpAqwQUiR9YGkweCktaIcPjpSl3kyfzMD/pzl2RnPjGUvYOV9knpSZ++9XMN7HkpAUt6UFPiNuSwhjRNkN6HBCCq0K0FaACR6U0rBeiy0YkqQpGEOsInYjDG04e3aJ5N5ak3MmD8YoQa7xoP7JQYFnk0E6DQk/mbNLxlW5ygaZ8DaOE/0aOeRoQkYeM/rt81XuNwe7Udz0BTpZspCphrwW9qyftLn4U2kDop+wQvSchfeHGwt5kSFz3BEy52K7cIGQ0B4vqQvZCFBVc1Y7Be9Prijn7us7dFmV1ipJlmkm0uebOAqs4mhx367nzLshZM4CoWgS+fc4xULx1SmJveNkwjDuwMRREC6O3KOvLXHE3JqCyacrrV78q42j5p7jaIl9xThsrVKZmSaF8LCNtYWZMZZyif4cMrHVVIJlssjZEWZ5Td/TS5aJFcNETEgOu8M0iJhyyP8neuu6vKCX7+i1i7q9aoLmdVR3hXiDKIs1qZKPYj0Qpe4pkYH+WrhHcSBOkmXq5bOzWV1CoJhuIH0+YX8yO8/6G7YP6C30yrKJXgNeYH189/AFdrgOh7niJTbGvw6/g1FZWXP0bh9KyZF2z8+xvXd3LOT6h7nbWZCmLaom2nWQk7meO38rvaN7Ra96KnaTDyUcTOLDwdeO0zD0UH5jj4bqTR889n0PGjvfUTH1fJiR8Rm5WZBx01wzckEq357IEb27SeC7CQEO6FBu1TTiG/K2N0YSPwcCuDcuWhPpzbHzc2/z4HYwoCbNgH+9IN1XY6BGHbmVop3xLmn1B2TmaJo=)

각 _map 헬퍼_에 대한 더 많은 정보는 핵심 개념에서 확인할 수 있습니다.

## 공식 강좌 %{#official-course}%

Pinia의 공식 강좌는 [Mastering Pinia](https://masteringpinia.com)입니다. Pinia의 저자가 직접 작성했으며, 기본부터 플러그인, 테스트, 서버 사이드 렌더링과 같은 고급 주제까지 모두 다룹니다. Pinia를 시작하고 마스터하는 가장 좋은 방법입니다.

## 왜 _Pinia_ 인가 %{#why-pinia}%

Pinia(발음은 `/piːnjʌ/`, 영어로 "피냐"와 비슷)는 _piña_ (스페인어로 _파인애플_)와 가장 가까운, 유효한 패키지 이름입니다. 파인애플은 실제로 개별 꽃들이 모여 하나의 복합 과일을 이루는 구조입니다. 각각의 스토어가 개별적으로 태어나지만, 결국 모두 연결된다는 점에서 유사합니다. 또한 남아메리카가 원산지인 맛있는 열대 과일이기도 합니다.

## 더 현실적인 예제 %{#a-more-realistic-example}%

여기 Pinia의 API를 **JavaScript에서도 타입과 함께** 사용할 수 있는 더 완성도 높은 예제가 있습니다. 어떤 분들에게는 이 예제만으로도 바로 시작할 수 있겠지만, 나머지 문서도 꼭 확인하거나, 이 예제를 건너뛰고 _핵심 개념_을 모두 읽은 후 다시 돌아오는 것을 추천합니다.

```js
import { defineStore } from 'pinia'

export const useTodos = defineStore('todos', {
  state: () => ({
    /** @type {{ text: string, id: number, isFinished: boolean }[]} */
    todos: [],
    /** @type {'all' | 'finished' | 'unfinished'} */
    filter: 'all',
    // 타입은 자동으로 number로 추론됩니다
    nextId: 0,
  }),
  getters: {
    finishedTodos(state) {
      // 자동완성! ✨
      return state.todos.filter((todo) => todo.isFinished)
    },
    unfinishedTodos(state) {
      return state.todos.filter((todo) => !todo.isFinished)
    },
    /**
     * @returns {{ text: string, id: number, isFinished: boolean }[]}
     */
    filteredTodos(state) {
      if (this.filter === 'finished') {
        // 자동완성으로 다른 getter 호출 ✨
        return this.finishedTodos
      } else if (this.filter === 'unfinished') {
        return this.unfinishedTodos
      }
      return this.todos
    },
  },
  actions: {
    // 인자 개수 제한 없음, 프로미스 반환 여부도 자유
    addTodo(text) {
      // 상태를 직접 변경할 수 있습니다
      this.todos.push({ text, id: this.nextId++, isFinished: false })
    },
  },
})
```

[Playground에서 직접 해보기](https://play.pinia.vuejs.org/#eNqtVs1y2zYQfpU1L5QdmUzGbQ4cyWO3k86kh7STuKcwB4pcWohJgIMfWRqVb9IH6HP1SboA+Cu7nkzbiygQu99++Haxy2Nw2zTRzmCQBCuVS9ZoUKhNc51yVjdCajiCxBJaKKWoISTTcLKltJB4Jz5iqQaThnGWTY2MIpNCjBZRrO06+qrILOW54EqDe/XJ4sF6cFmc99tHKFmlUS67JxY95nrKYjHCkGvvzPHRWt/hXpM5nWcRhm67NDzXTHDICoe3OIdjygFYCYuziVe0yyqD3SYQgjaS3AFaiwIT8lGP9NTbGj55S3xCUoFwVrFPAElPC411U2UaaQWwqrINVtcrxhujYXdZiwKrdRp4KdIA9KFBWsusYIKWDpnWWVWlwTXcVtUq9hD/Ba2kxKotFhbyp+7//4Fr+BT5t2E1w95K/zR+baMxilEKSQhWfmB8XhoUIXnAQ7cdMYvuXcn5lKM3Uf2xRrL5FvOHjdhPnI9Hl+9I23JqKXMOMa6YZxh3FDs5/PYHfATLKumsT+NP6mKMbQPQ6oZO0UhUKkJOx7N59TXWcZrptDFaUz0nBVPZpsKCrKeFbOHyiuUPM5TbgsT2noSyiofiC5aBv8aXddbQfRWcGoW7BGm3QTIn/bVIA3f37Zs0iN3/CFV9uZHiUaEk/zRY9qY31EriAndaiEpdZg3zblutG5XEcV5wsidx2E5GHHXMmzp+4nPzNvo+ekPSb2IKFDNe4H4ehjwuC6y/Bb03vXkdvfkueutQd1cdaG1RuxvfkixaUWsp2f2JKLmoG1ah/KWxbWUuDt1G8fize6elwYGiK7Fn3n9VVHWW9a+UfJQ7nBxLZ/IeKZt2+92nDy6zwyYVlanI+oXNj6hEZSxHb/aD4QXRntg5tu9djhm/v1Pv9hq56g9liTo1nL2T+ccXjj7SvYqupip2c4AEHMZFgdQA0E+C05mSctw7M9/Xh8mynnotQgcbLn18pamSE6DWvr6GRUcpvriAG3vN3G0mhRKyk3TQJbAiAW7qjZ01Y0dIYENFhxmH9vOXFi5ij+MiJfD5S6fbBDckBUP4HcK+n7nF2OzCEcX3rQScS48UuzYAj6yqYIOQGS3qTLOcbA7U7EqU1OmIQEfWe5E++j2Rfe1Q2nP3IOkJnmh2h+8Z+BHr9BlGmwtsY9lKrtCm8gz++uPPftePPi9q5NPn2S/c6HUinzRTN/j6UgEYFXg+/rdEOHs5BGWhQ6NseDz17xLdw8wS9U/M7VeD3rKeL6zXNNyHdE8Mncg2kSD0lgy7BFGu9fZE/Kn2gzZdkImKvUkLWCl8nsmk9GZcpqAnyRlgT5LjbF1upsL738x9UY3VZuuJHyCrheEaRAnUC0xNo0wte7gMGrrmjIgLCVxo79h/SdmszevzIAzJx6FgEnNN16E2NhVEC33d9LYjz6gxarvwJeBT7/b8fXn1al4BZWZFbGdVZX/b86D9GztAvyY=)

## Vuex와의 비교 %{#comparison-with-vuex}%

Pinia는 Vuex의 차기 버전이 어떤 모습일지 탐구하는 과정에서 시작되었으며, Vuex 5를 위한 핵심 팀 논의에서 나온 많은 아이디어를 통합했습니다. 결국 Pinia가 우리가 Vuex 5에서 원했던 대부분을 이미 구현하고 있다는 것을 깨닫고, Pinia를 새로운 권장 사항으로 삼기로 결정했습니다.

Vuex와 비교했을 때, Pinia는 더 간단한 API와 적은 형식적 절차, Composition-API 스타일의 API, 그리고 TypeScript 사용 시 강력한 타입 추론 지원을 제공합니다.

### RFC %{#rfcs}%

초기에는 Pinia가 별도의 RFC 과정을 거치지 않았습니다. 애플리케이션 개발 경험, 다른 사람의 코드 읽기, Pinia를 사용하는 클라이언트와의 작업, Discord에서 질문에 답변하는 경험을 바탕으로 아이디어를 실험했습니다.
이 덕분에 다양한 상황과 애플리케이션 크기에 맞는 솔루션을 제공할 수 있었습니다. 자주 배포하며 핵심 API는 그대로 유지한 채 라이브러리를 발전시켰습니다.

이제 Pinia가 기본 상태 관리 솔루션이 된 만큼, Vue 생태계의 다른 핵심 라이브러리와 동일한 RFC 과정을 거치며, API도 안정적인 상태에 들어섰습니다.

### Vuex 3.x/4.x와의 비교 %{#comparison-with-vuex-3x4x}%

> Vuex 3.x는 Vue 2용, Vuex 4.x는 Vue 3용입니다

Pinia API는 Vuex ≤4와 매우 다릅니다. 주요 차이점은 다음과 같습니다:

- _mutations_가 더 이상 존재하지 않습니다. 이는 종종 **_매우_ 장황하다**고 여겨졌습니다. 초기에는 개발자 도구 통합을 위해 도입되었으나, 이제는 더 이상 문제가 되지 않습니다.
- TypeScript 지원을 위해 복잡한 래퍼를 만들 필요가 없습니다. 모든 것이 타입화되어 있고, API 자체가 TS 타입 추론을 최대한 활용하도록 설계되었습니다.
- 더 이상 매직 스트링을 주입할 필요 없이, 함수를 import하고 호출하면 자동완성을 누릴 수 있습니다!
- 동적으로 스토어를 추가할 필요가 없습니다. 모든 스토어가 기본적으로 동적이며, 이를 신경 쓸 필요도 없습니다. 물론 원한다면 수동으로 스토어를 등록할 수도 있지만, 자동이기 때문에 걱정할 필요가 없습니다.
- _modules_의 중첩 구조가 사라졌습니다. 여전히 다른 스토어를 import하고 _사용_하여 암묵적으로 중첩할 수 있지만, Pinia는 기본적으로 평면 구조를 제공하며, 스토어 간의 교차 조합도 지원합니다. **스토어 간 순환 참조도 가능합니다**.
- _namespaced modules_이 없습니다. 스토어의 평면 아키텍처 덕분에, "네임스페이스"는 스토어 정의 방식에 내재되어 있으며, 모든 스토어가 네임스페이스화되어 있다고 볼 수 있습니다.

기존 Vuex ≤4 프로젝트를 Pinia로 변환하는 자세한 방법은 [Vuex 마이그레이션 가이드](./cookbook/migration-vuex.md)를 참고하세요.