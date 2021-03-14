<!-- ⚠️ This README has been generated from the file(s) "blueprint.md" ⚠️-->
[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#my-gists)

# ➤ My Gists

--



[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#about)

## ➤ About:







---
Downloading Gists:

```py


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#first-mkdir-user--cd-user--cp-pathtoget_gistspy-)

# ➤ first: mkdir user && cd user && cp /path/to/get_gists.py .

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png)](#python3-get_gistspy-user)

# ➤ python3 get_gists.py user
import requests
import sys
from subprocess import call

user = sys.argv[1]

r = requests.get('https://api.github.com/users/{0}/gists'.format(user))

for i in r.json():
    call(['git', 'clone', i['git_pull_url']])

    description_file = './{0}/description.txt'.format(i['id'])
    with open(description_file, 'w') as f:
        f.write('{0}\n'.format(i['description']))




```
---


```

.
├── Mega-JS-Snip-Comp
│   ├── batch-snippets1.js
│   ├── mega-snips1.js
│   ├── mega-snips3.js
│   ├── right.html
│   └── snippets-mega-comp4.js
├── README.md
├── _CONTAINER
│   ├── 02d3612c59187115f560a78c75e57680
│   │   ├── description.txt
│   │   ├── right.html
│   │   └── simple-python-game.py
│   ├── 042b1153d977cfb4c6d948dcb8c52e39
│   │   ├── description.txt
│   │   ├── javascript-is-weird.js
│   │   └── right.html
│   ├── 09115567409c7b2fd3a455ca29bfe3fc
│   │   ├── READFILE.js
│   │   ├── convert-2-atag.js
│   │   ├── create-dir.js
│   │   ├── description.txt
│   │   ├── dir-stream.js
│   │   ├── isDir.js
│   │   ├── readStream.js
│   │   ├── reading-dir.js
│   │   ├── remove-dir.js
│   │   ├── right.html
│   │   └── write-stream.js
│   ├── 0d4010f180dbbe3e97b45b604317f6d7
│   │   ├── description.txt
│   │   ├── heroku-github-workflow.md
│   │   └── right.html
│   ├── 1087fe7c9d2e32f90c3cb28ccef20ba0
│   │   ├── Board.html
│   │   ├── description.txt
│   │   ├── right.html
│   │   ├── tic-tac-toe.js
│   │   └── toe.css
│   ├── 15496cd2043c6ff5380ffefb04cf4377
│   │   ├── description.txt
│   │   ├── list-of-public-apis.md
│   │   └── right.html
│   ├── 15871d71b1048975bbb32da20da66bd8
│   │   ├── description.txt
│   │   ├── right.html
│   │   └── web-dev-enviorment-setup.md
│   ├── 15f0936a8fc5c59f011722146f4852b8
│   │   ├── DOM-VS-BOM.md
│   │   ├── description.txt
│   │   └── right.html
│   ├── 166b3c732e281005bb7338bc6d566193
│   │   ├── description.txt
│   │   ├── right.html
│   │   └── webpack-setup.md
│   ├── 1ad31003fc1b2880201642b48df87e2e
│   │   ├── description.txt
│   │   ├── refactored.js
│   │   └── right.html
│   ├── 1b9ae0955205e4d7aaf4701a94185ff4
│   │   ├── description.txt
│   │   ├── mongo-dp-experiment.js
│   │   └── right.html
│   ├── 22ba574c318b387aa6ac200a756cf4fb
│   │   ├── description.txt
│   │   ├── get-gists.py
│   │   ├── memoize.py
│   │   └── right.html
│   ├── 24632d1017733d8de75a197d0a97889e
│   │   ├── description.txt
│   │   ├── mapper_tutorial.py
│   │   └── right.html
│   ├── 3623344a6292e5210c9a11307a5549e6
│   │   ├── description.txt
│   │   ├── readfile.js
│   │   └── right.html
│   ├── 365d2de3f4a8e453f70c9cac6b74f26f
│   │   ├── browser-feature-detections.js
│   │   ├── description.txt
│   │   ├── right.html
│   │   └── setVisibility.js
│   ├── 38896d2a01cd9a97a02e98db83e89b71
│   │   ├── description.txt
│   │   ├── regex-quick-sheet.md
│   │   └── right.html
│   ├── 3d369ac15bccbb30ae24243a1af9c3ac
│   │   ├── description.txt
│   │   ├── right.html
│   │   └── tic-tac-toe-soln.js
│   ├── 40479d5c41c585bb1fe000a0f83fd7d5
│   │   ├── description.txt
│   │   ├── right.html
│   │   ├── states_hash.json
│   │   └── states_titlecase.json
│   ├── 414de59e9a6474cc45aeec2bc117a7bc
│   │   ├── Runkit-ds-algo-dynamic.js
│   │   ├── description.txt
│   │   └── right.html
│   ├── 42a46d97654db0e6c6eef77f80b59606
│   │   ├── description.txt
│   │   ├── read-split-on-new-line.js
│   │   └── right.html
│   ├── 48b79d0e098323b694ffbbeb078924e6
│   │   ├── Big-O.md
│   │   ├── description.txt
│   │   └── right.html
│   ├── 53d120a0fbdd46a13c59f76e5f3a2eec
│   │   ├── description.txt
│   │   ├── restart-docker-desktop.ps1
│   │   └── right.html
│   ├── 5864435b9041997efe6b14ea633871b8
│   │   ├── description.txt
│   │   ├── keypress.js
│   │   └── right.html
│   ├── 5ddc129e1e27bce575afa09c082a24b9
│   │   ├── description.txt
│   │   ├── right.html
│   │   └── sorting.java
│   ├── 6665786ba69d51ac36646421bdc6c06c
│   │   ├── My-Markdown-Project-Template-Readme.md
│   │   ├── description.txt
│   │   └── right.html
│   ├── 69bb5ef5e62f9350d2766df123cc6e54
│   │   ├── description.txt
│   │   ├── github-markdown-formatting.md
│   │   └── right.html
│   ├── 6af1b7b3b0e7075cef628bb8497b961f
│   │   ├── alt-web-dev-setup.md
│   │   ├── description.txt
│   │   └── right.html
│   ├── 74c3cbe6710415e63e42759b98221769
│   │   ├── command.txt
│   │   ├── description.txt
│   │   ├── makefile
│   │   └── right.html
│   ├── 82154f50603f73826c27377ebaa498b5
│   │   ├── description.txt
│   │   ├── python-study-guide.py
│   │   └── right.html
│   ├── 86949afff1760ed0d5ed3ec44da32b41
│   │   ├── description.txt
│   │   ├── postgres-setup.md
│   │   └── right.html
│   ├── 8898ad673bd2ecee9d93f8ec267cf213
│   │   ├── create-a-nnew-file.js
│   │   ├── description.txt
│   │   └── right.html
│   ├── 8d3ba6828f5ba9a4692d0a938697099f
│   │   ├── description.txt
│   │   ├── right.html
│   │   └── write-n-replace.js
│   ├── 9307f60ec7a5e7827184a70d05012067
│   │   ├── description.txt
│   │   ├── embeds.html
│   │   └── right.html
│   ├── _BASH
│   │   ├── APPEND-DIR.js
│   │   ├── Download-all-weblinks-of-certain-file-type.sh
│   │   ├── Download-website.sh
│   │   ├── File_Transfer.sh
│   │   ├── Recursively-remove-files-byname.sh
│   │   ├── Recursively-remove-folders-byname.sh
│   │   ├── Recusrive-npm-install.sh
│   │   ├── Remove-script-tags-from-html.sh
│   │   ├── Resursivleydeletenodemodules.sh
│   │   ├── Sanatize-directory.sh
│   │   ├── Windows-WSL-Postgres-terminal-prompt-command.sh
│   │   ├── add-extension-to-files-in-folder.sh
│   │   ├── add-text-2-end-of-file.sh
│   │   ├── batch-download-videos.sh
│   │   ├── change-file-extensions.sh
│   │   ├── clone-folder-structure-populate-with-specific-file-type.sh
│   │   ├── clone-folder-structure-without-files.sh
│   │   ├── concatinate-all-html-files.sh
│   │   ├── concatinate-markdown-files-to-single-html.sh
│   │   ├── convert-html-2-md.sh
│   │   ├── convert-markdown-2-html.sh
│   │   ├── create-dummy-text-file-4-every-subfolder.sh
│   │   ├── delete-files-bigger-than.sh
│   │   ├── delete-git-files.sh
│   │   ├── delete-zip.sh
│   │   ├── generate-directory-index.html-from-files-in-working-directory.sh
│   │   ├── get-links-from-webpage.sh
│   │   ├── gistfile1.txt
│   │   ├── git-filter-branch.sh
│   │   ├── list-html-files.sh
│   │   ├── output.md
│   │   ├── print-file-paths-recursive.sh
│   │   ├── recursive-action.sh
│   │   ├── recursive-remove-lines-contaning-string.sh
│   │   ├── recursive-unzip.sh
│   │   ├── recursivley-create-numbered-folders.sh
│   │   ├── remember-git-credentials.sh
│   │   ├── remove-invalid-characters-from-file-names.sh
│   │   ├── remove-lines-contaning-string.sh
│   │   ├── remove-space-from-filenames.sh
│   │   ├── remove-string-from-file-names.sh
│   │   ├── remove-trailing-whitespace-from-file-names.sh
│   │   ├── remove-unnecessary-files-folders.sh
│   │   └── right.html
│   ├── _JAVASCRIPT
│   │   ├── APPEND-DIR.js
│   │   ├── READFILE.js
│   │   ├── Random-bool.js
│   │   ├── arr-intersection.js
│   │   ├── arr-of-cum-partial-sums.js
│   │   ├── batch2.js
│   │   ├── camel2Kabab.js
│   │   ├── camelCase.js
│   │   ├── concatLinkedLists.js
│   │   ├── convert-2-atag.js
│   │   ├── count-string-char.js
│   │   ├── create-dir.js
│   │   ├── dir-stream.js
│   │   ├── doesUserFrequentStarbucks.js
│   │   ├── fast-is-alpha-numeric.js
│   │   ├── find-n-replace.js
│   │   ├── flatten-arr.js
│   │   ├── generalizedAvg.js
│   │   ├── inFocus.js
│   │   ├── isDir.js
│   │   ├── isEven?orIs.js
│   │   ├── isWeekDay.js
│   │   ├── javascript-is-weird.js
│   │   ├── keypress.js
│   │   ├── longest-common-prefix.js
│   │   ├── mongo-dp-experiment.js
│   │   ├── readStream.js
│   │   ├── reading-dir.js
│   │   ├── remove-dir.js
│   │   ├── removePUNK.js
│   │   ├── rev-string.js
│   │   ├── right.html
│   │   ├── startedFromTheBottom.js
│   │   ├── timeFromDate.js
│   │   ├── touchEventSupport.js
│   │   ├── trunc2FixedDec.js
│   │   ├── twoSum.js
│   │   ├── weRENumberOne.js
│   │   ├── write-stream.js
│   │   └── xor.js
│   ├── _MARKDOWN
│   │   ├── Big-O.md
│   │   ├── Data-structures-in-js.md
│   │   ├── Deploy-React-App-2-Heroku.md
│   │   ├── Websites-to-return-2.md
│   │   ├── alt-web-dev-setup.md
│   │   ├── express-server.md
│   │   ├── fancy-css-headers.md
│   │   ├── fix-postgresql-server-issues.md
│   │   ├── gulp.md
│   │   ├── heroku-github-workflow.md
│   │   ├── intro-2-js.md
│   │   ├── list-of-public-apis.md
│   │   ├── postgres-setup.md
│   │   ├── postgresql-cheat-sheet.md
│   │   ├── right.html
│   │   ├── shortcuts.md
│   │   ├── trouble-shooting-log.md
│   │   ├── web-dev-enviorment-setup.md
│   │   ├── webpack-setup.md
│   │   └── wsl-setup.md
│   ├── _python
│   │   ├── file_to_string.py
│   │   ├── get-gists.py
│   │   ├── mapper_tutorial.py
│   │   ├── memoize.py
│   │   ├── right.html
│   │   ├── simple-python-game.py
│   │   └── unique.py
│   ├── a60b88ec9ecce568fb1a6d1bcc1bec81
│   │   ├── description.txt
│   │   ├── right.html
│   │   └── wsl-setup.md
│   ├── ac7c525ffa115ac8687a838b55a9d2c5
│   │   ├── Websites-to-return-2.md
│   │   ├── description.txt
│   │   └── right.html
│   ├── b8eb08d8065456540618860621143dfc
│   │   ├── description.txt
│   │   ├── intro-2-js.md
│   │   └── right.html
│   ├── bfbe6abe4ec63107d4bbb74072fc1080
│   │   ├── description.txt
│   │   ├── javascript-array-methods.md
│   │   └── right.html
│   ├── c559a8e4d6fd2eb586b2e8452d6e233b
│   │   ├── description.txt
│   │   ├── regex-cheatsheet.md
│   │   └── right.html
│   ├── c7658139004c1e0bc02e0674188eaeb6
│   │   ├── code-review.md
│   │   ├── description.txt
│   │   └── right.html
│   ├── c9fc5460aaf86fa752eeb5a9120634c0
│   │   ├── capKeys.js
│   │   ├── description.txt
│   │   └── right.html
│   ├── cae36a07000d5dec8769d0e8cbc431b3
│   │   ├── description.txt
│   │   ├── module.exports.js
│   │   └── right.html
│   ├── cdb893d3a4d980ab9a562aa9b45b0b33
│   │   ├── description.txt
│   │   ├── right.html
│   │   └── trouble-shooting-log.md
│   ├── d0d4805c0622c147a509f8e11aff5d30
│   │   ├── APPEND-DIR.js
│   │   ├── Random-bool.js
│   │   ├── arr-intersection.js
│   │   ├── arr-of-cum-partial-sums.js
│   │   ├── batch2.js
│   │   ├── camel2Kabab.js
│   │   ├── camelCase.js
│   │   ├── concatLinkedLists.js
│   │   ├── count-string-char.js
│   │   ├── description.txt
│   │   ├── doesUserFrequentStarbucks.js
│   │   ├── fast-is-alpha-numeric.js
│   │   ├── find-n-replace.js
│   │   ├── flatten-arr.js
│   │   ├── generalizedAvg.js
│   │   ├── inFocus.js
│   │   ├── isEven?orIs.js
│   │   ├── isWeekDay.js
│   │   ├── longest-common-prefix.js
│   │   ├── mega-snips2.js
│   │   └── right.html
│   ├── d110afc16efa1d28b852e34bcff3da4e
│   │   ├── description.txt
│   │   ├── fix-postgresql-server-issues.md
│   │   └── right.html
│   ├── d88181af6d0ce040a371ff9ec7c8e1ef
│   │   ├── psql-ex.sql
│   │   └── right.html
│   ├── e7b3e62408aaf51922cccb8405760bb5
│   │   ├── Deploy-React-App-2-Heroku.md
│   │   ├── description.txt
│   │   └── right.html
│   ├── e8d986746603502a075f25c33f88f732
│   │   ├── add-line-nums-2-code-bloack.js
│   │   ├── description.txt
│   │   ├── right.html
│   │   ├── traverse-files-and-remove-comments.js
│   │   └── utils.js
│   ├── e9eeb8ae2b3c45e0f6368248d1a41bc4
│   │   ├── description.txt
│   │   ├── input-output-error.md
│   │   └── right.html
│   ├── f07841d4701271218f1817ed12fcbafb
│   │   ├── description.txt
│   │   ├── enum-2-string.py
│   │   └── right.html
│   ├── fa4a41ac2ef7d66d5bc2dba07eec7591
│   │   ├── description.txt
│   │   ├── fancy-css-headers.md
│   │   └── right.html
│   ├── get-gists.py
│   └── right.html
├── index.html
├── left.html
├── right.html
└── scrap.js

56 directories, 306 files
```



