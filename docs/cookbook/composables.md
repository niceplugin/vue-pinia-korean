# 컴포저블 다루기 %{#dealing-with-composables}%

[컴포저블](https://vuejs.org/guide/reusability/composables.html#composables)은 Vue Composition API를 활용해 상태를 가진 로직을 캡슐화하고 재사용하는 함수입니다. 직접 작성하든, [외부 라이브러리](https://vueuse.org/)를 사용하든, 혹은 둘 다 하든, pinia 스토어 안에서 컴포저블의 힘을 충분히 활용할 수 있습니다.

## Option Stores %{#option-stores}%

<MasteringPiniaLink
  href="https://masteringpinia.com/lessons/using-composables-in-option-stores"
  title="Option Stores에서 컴포저블 사용하기"
/>

옵션 스토어를 정의할 때는 `state` 속성 안에서 컴포저블을 호출할 수 있습니다:

```ts
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: useLocalStorage('pinia/auth/login', 'bob'),
  }),
})
```

**반드시 쓰기 가능한 상태만 반환할 수 있다는 점**(예: `ref()`)을 기억하세요. 사용할 수 있는 컴포저블의 예시는 다음과 같습니다:

<RuleKitLink />

- [useLocalStorage](https://vueuse.org/core/useLocalStorage/)
- [useAsyncState](https://vueuse.org/core/useAsyncState/)

반대로, 다음 컴포저블들은 옵션 스토어에서는 사용할 수 없습니다(하지만 setup 스토어에서는 사용할 수 있습니다):

- [useMediaControls](https://vueuse.org/core/useMediaControls/): 함수를 노출합니다
- [useMemoryInfo](https://vueuse.org/core/useMemory/): 읽기 전용 데이터를 노출합니다
- [useEyeDropper](https://vueuse.org/core/useEyeDropper/): 읽기 전용 데이터와 함수를 노출합니다

## Setup Stores %{#setup-stores}%

<MasteringPiniaLink
  href="https://masteringpinia.com/lessons/using-composables-in-setup-stores"
  title="Setup Stores에서 컴포저블 사용하기"
/>

반면 setup 스토어를 정의할 때는 거의 모든 컴포저블을 사용할 수 있습니다. 각 속성이 state, action, getter로 판별되기 때문입니다:

```ts
import { defineStore } from 'pinia'
import { useMediaControls } from '@vueuse/core'

export const useVideoPlayer = defineStore('video', () => {
  // 이 엘리먼트는 직접 노출(반환)하지 않습니다
  const videoElement = ref<HTMLVideoElement>()
  const src = ref('/data/video.mp4')
  const { playing, volume, currentTime, togglePictureInPicture } =
    useMediaControls(videoElement, { src })

  function loadVideo(element: HTMLVideoElement, src: string) {
    videoElement.value = element
    src.value = src
  }

  return {
    src,
    playing,
    volume,
    currentTime,

    loadVideo,
    togglePictureInPicture,
  }
})
```

:::warning
일반적인 상태와 달리 `ref<HTMLVideoElement>()`에는 DOM 엘리먼트에 대한 직렬화할 수 없는 참조가 들어 있습니다. 그래서 이를 직접 반환하지 않습니다. 이것은 클라이언트 전용 상태이므로, 서버에서는 설정되지 않으며 클라이언트에서는 **항상** `undefined`로 시작한다는 것을 알고 있습니다.
:::

## SSR %{#ssr}%

[서버 사이드 렌더링](../ssr/index.md)을 다룰 때는 스토어 안에서 컴포저블을 사용하기 위해 몇 가지 추가 단계를 신경 써야 합니다.

[Option Stores](#option-stores)에서는 `hydrate()` 함수를 정의해야 합니다. 이 함수는 스토어가 생성될 때 초기 상태를 사용할 수 있는 경우, 클라이언트(브라우저)에서 스토어가 인스턴스화될 때 호출됩니다. 이 함수를 정의해야 하는 이유는 이런 상황에서는 `state()`가 호출되지 않기 때문입니다.

```ts
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: useLocalStorage('pinia/auth/login', 'bob'),
  }),

  hydrate(state, initialState) {
    // 이 경우에는 브라우저에서 값을 읽고 싶기 때문에
    // 초기 상태를 완전히 무시해도 됩니다
    state.user = useLocalStorage('pinia/auth/login', 'bob')
  },
})
```

[Setup Stores](#setup-stores)에서는 초기 상태에서 가져오면 안 되는 모든 상태 속성에 `skipHydrate()`라는 헬퍼를 사용해야 합니다. 옵션 스토어와 달리 setup 스토어는 단순히 _`state()` 호출을 건너뛸 수_ 없기 때문에, 하이드레이션할 수 없는 속성을 `skipHydrate()`로 표시합니다. 이것은 상태 속성에만 적용된다는 점에 주의하세요:

```ts
import { defineStore, skipHydrate } from 'pinia'
import { useEyeDropper, useLocalStorage } from '@vueuse/core'

export const useColorStore = defineStore('colors', () => {
  const { isSupported, open, sRGBHex } = useEyeDropper()
  const lastColor = useLocalStorage('lastColor', sRGBHex)
  // ...
  return {
    lastColor: skipHydrate(lastColor), // Ref<string>
    open, // Function
    isSupported, // boolean (반응형조차 아님)
  }
})
```
