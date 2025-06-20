# VS Code 스니펫 %{#vs-code-snippets}%

여기 제가 VS Code에서 더 편리하게 작업하기 위해 사용하는 몇 가지 스니펫이 있습니다.

<kbd>⇧ Shift</kbd>+<kbd>⌘ Command</kbd>+<kbd>P</kbd> / <kbd>⇧ Shift</kbd>+<kbd>⌃ Control</kbd>+<kbd>P</kbd>를 누른 후 `Snippets: Configure User Snippets`로 사용자 스니펫을 관리할 수 있습니다.

```json
{
  "Pinia Options Store Boilerplate": {
    "scope": "javascript,typescript",
    "prefix": "pinia-options",
    "body": [
      "import { defineStore, acceptHMRUpdate } from 'pinia'",
      "",
      "export const use${TM_FILENAME_BASE/^(.*)$/${1:/pascalcase}/}Store = defineStore('$TM_FILENAME_BASE', {",
      " state: () => ({",
      "   $0",
      " }),",
      " getters: {},",
      " actions: {},",
      "})",
      "",
      "if (import.meta.hot) {",
      " import.meta.hot.accept(acceptHMRUpdate(use${TM_FILENAME_BASE/^(.*)$/${1:/pascalcase}/}Store, import.meta.hot))",
      "}",
      ""
    ],
    "description": "Vue.js Pinia Options Store 파일에 필요한 코드를 부트스트랩합니다"
  },
  "Pinia Setup Store Boilerplate": {
    "scope": "javascript,typescript",
    "prefix": "pinia-setup",
    "body": [
      "import { defineStore, acceptHMRUpdate } from 'pinia'",
      "",
      "export const use${TM_FILENAME_BASE/^(.*)$/${1:/pascalcase}/}Store = defineStore('$TM_FILENAME_BASE', () => {",
      " $0",
      " return {}",
      "})",
      "",
      "if (import.meta.hot) {",
      " import.meta.hot.accept(acceptHMRUpdate(use${TM_FILENAME_BASE/^(.*)$/${1:/pascalcase}/}Store, import.meta.hot))",
      "}",
      ""
    ],
    "description": "Vue.js Pinia Setup Store 파일에 필요한 코드를 부트스트랩합니다"
  }
}
```