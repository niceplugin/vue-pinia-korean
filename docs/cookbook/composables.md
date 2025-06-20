# 컴포저블 다루기 %{#dealing-with-composables}%

[컴포저블](https://vuejs.org/guide/reusability/composables.html#composables)은 Vue Composition API를 활용하여 상태 기반 로직을 캡슐화하고 재사용하는 함수입니다. 직접 작성하든, [외부 라이브러리](https://vueuse.org/)를 사용하든, 또는 둘 다 사용하든, Pinia 스토어에서 컴포저블의 모든 기능을 완전히 활용할 수 있습니다.

## 옵션 스토어 %{#option-stores}%

<MasteringPiniaLink
  href="https://masteringpinia.com/lessons/using-composables-in-option-stores"
  title="옵션 스토어에서 컴포저블 사용하기"
/>

옵션 스토어를 정의할 때, `state` 속성 안에서 컴포저블을 호출할 수 있습니다:

```ts
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: useLocalStorage('pinia/auth/login', 'bob'),
  }),
})
```

**반드시 쓸 수 있는(writable) 상태**(예: `ref()`)만 반환할 수 있다는 점을 명심하세요. 사용할 수 있는 컴포저블의 예시는 다음과 같습니다:

- [useLocalStorage](https://vueuse.org/core/useLocalStorage/)
- [useAsyncState](https://vueuse.org/core/useAsyncState/)

옵션 스토어에서는 사용할 수 없지만(설정 스토어에서는 사용 가능) 다음과 같은 컴포저블의 예시도 있습니다:

- [useMediaControls](https://vueuse.org/core/useMediaControls/): 함수 제공
- [useMemoryInfo](https://vueuse.org/core/useMemory/): 읽기 전용 데이터 제공
- [useEyeDropper](https://vueuse.org/core/useEyeDropper/): 읽기 전용 데이터와 함수 제공

## 설정 스토어 %{#setup-stores}%

<MasteringPiniaLink
  href="https://masteringpinia.com/lessons/using-composables-in-setup-stores"
  title="설정 스토어에서 컴포저블 사용하기"
/>

반면, 설정 스토어를 정의할 때는 모든 속성이 상태, 액션, 게터로 구분되기 때문에 거의 모든 컴포저블을 사용할 수 있습니다:

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
일반적인 상태와는 다르게, `ref<HTMLVideoElement>()`는 DOM 엘리먼트에 대한 직렬화할 수 없는 참조를 포함합니다. 그래서 직접 반환하지 않습니다. 클라이언트 전용 상태이기 때문에 서버에서는 설정되지 않으며, 클라이언트에서 **항상** `undefined`로 시작합니다.
:::

## SSR %{#ssr}%

[서버 사이드 렌더링](../ssr/index.md)을 다룰 때, 스토어 내에서 컴포저블을 사용하려면 몇 가지 추가 단계를 거쳐야 합니다.

[옵션 스토어](#option-stores)에서는 `hydrate()` 함수를 정의해야 합니다. 이 함수는 스토어가 클라이언트(브라우저)에서 인스턴스화될 때, 스토어가 생성되는 시점에 초기 상태가 있을 경우 호출됩니다. 이 함수를 정의해야 하는 이유는 이런 상황에서는 `state()`가 호출되지 않기 때문입니다.

```ts
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: useLocalStorage('pinia/auth/login', 'bob'),
  }),

  hydrate(state, initialState) {
    // 이 경우 브라우저에서 값을 읽고 싶으므로 초기 상태는 완전히 무시할 수 있습니다
    state.user = useLocalStorage('pinia/auth/login', 'bob')
  },
})
```

[설정 스토어](#setup-stores)에서는 초기 상태에서 가져오지 않아야 하는 상태 속성에 `skipHydrate()`라는 헬퍼를 사용해야 합니다. 옵션 스토어와는 다르게, 설정 스토어는 _`state()` 호출을 건너뛸 수 없으므로_, hydrate할 수 없는 속성에 `skipHydrate()`를 표시합니다. 이 기능은 상태 속성에만 적용된다는 점에 유의하세요:

```ts
import { defineStore, skipHydrate } from 'pinia'
import { useEyeDropper, useLocalStorage } from '@vueuse/core'

export const useColorStore = defineStore('colors', () => {
  const { isSupported, open, sRGBHex } = useEyeDropper()
  const lastColor = useLocalStorage('lastColor', sRGBHex)
  // ...
  return {
    lastColor: skipHydrate(lastColor), // Ref<string>
    open, // 함수
    isSupported, // boolean (반응형도 아님)
  }
})
```
