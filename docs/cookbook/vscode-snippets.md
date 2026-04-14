# VS Code 스니펫 %{#vs-code-snippets}%

<RuleKitLink />

VS Code에서 작업을 더 수월하게 하기 위해 제가 사용하는 몇 가지 스니펫입니다.

사용자 스니펫은 <kbd>⇧ Shift</kbd>+<kbd>⌘ Command</kbd>+<kbd>P</kbd> / <kbd>⇧ Shift</kbd>+<kbd>⌃ Control</kbd>+<kbd>P</kbd>로 연 뒤 `Snippets: Configure User Snippets`를 선택해 관리할 수 있습니다.

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
    "description": "Bootstrap the code needed for a Vue.js Pinia Options Store file"
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
    "description": "Bootstrap the code needed for a Vue.js Pinia Setup Store file"
  }
}
```
