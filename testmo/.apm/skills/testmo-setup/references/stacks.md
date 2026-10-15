# Catalogue des reporters JUnit par stack

Pour chaque stack : comment la détecter, quel reporter JUnit activer, et où il écrit son rapport. Le rapport est ensuite publié dans Testmo par la brique CI (`publish.sh` ou l'action GitHub), une source par suite.

**Principe :** activer le reporter sans changer le comportement local quand c'est possible (variable d'environnement, cible `make` dédiée, profil CI).

Ce catalogue est fait pour être enrichi au fil des projets : ajouter une section par stack nouvelle, avec un exemple vérifié.

## Elixir

- **Détection :** `mix.exs`
- **Reporter :** [`junit_formatter`](https://hex.pm/packages/junit_formatter) — `{:junit_formatter, "~> 3.4", only: :test}`
- **Activation** (`test/test_helper.exs`, avant `ExUnit.start()`) :
  ```elixir
  if System.get_env("JUNIT_REPORT") do
    ExUnit.configure(formatters: [JUnitFormatter, ExUnit.CLIFormatter])
  end
  ```
- **Rapport :** `_build/test/lib/<app>/test-junit-report.xml`
- **Piège :** `_build` est souvent en cache CI. Supprimer le rapport avant de lancer les tests, pour ne jamais publier celui d'un run précédent.

## Go

- **Détection :** `go.mod`
- **Reporter :** [`gotestsum`](https://github.com/gotestyourself/gotestsum), sans installation :
  ```makefile
  test-junit:
  	go run gotest.tools/gotestsum@v1.13.0 --junitfile test-results/go-junit.xml -- ./... -count=1
  ```
- **Rapport :** `test-results/go-junit.xml` (à ignorer dans git)

## JS / TS

- **Détection :** `package.json` (regarder les dépendances de test)
- **Jest :** `jest-junit` — `jest --reporters=default --reporters=jest-junit` ; rapport `junit.xml` (`JEST_JUNIT_OUTPUT_DIR` pour le déplacer)
  - Pour ne rien changer en local, l'activer seulement en CI dans `jest.config.js` : `reporters: process.env.CI ? ['default', ['jest-junit', {outputDirectory: 'test-results', outputName: 'jest-junit.xml'}]] : ['default']`.
- **Vitest :** `vitest run --reporter=default --reporter=junit --outputFile.junit=test-results/vitest-junit.xml`
- **Playwright :** `PLAYWRIGHT_JUNIT_OUTPUT_NAME=test-results/e2e-junit.xml npx playwright test --reporter=list,junit`

## Kotlin Multiplatform

- **Détection :** `build.gradle.kts` avec le plugin `kotlin("multiplatform")` (ou `kotlin-multiplatform`), et des source sets `commonTest`, `androidHostTest`, `jvmTest`, `iosTest`…
- **Reporter :** natif à Gradle, rien à activer. Chaque tâche de test écrit son propre dossier.
- **Tests du code partagé sur la JVM** (source set `androidHostTest`) : tâche `testAndroidHostTest` ; rapport `**/build/test-results/testAndroidHostTest/*.xml`.
- **Autres cibles** : `jvmTest` → `**/build/test-results/jvmTest/*.xml` ; `iosSimulatorArm64Test` (sur macOS seulement) → `**/build/test-results/iosSimulatorArm64Test/*.xml`.
- **Source Testmo :** une par tâche publiée (ex. `kmp-unit`), plutôt qu'un glob `**/build/test-results/**` qui mélangerait les cibles.
- **Piège :** si la même commande Gradle enchaîne lint et tests (`ktlintCheck testAndroidHostTest`), un échec de lint empêche les tests : aucun rapport, publication sautée avec un avertissement.

## Android

- **Détection :** `build.gradle` ou `build.gradle.kts`
- **Reporter :** natif à Gradle, rien à activer pour les tests unitaires.
- **Rapport :** `**/build/test-results/**/*.xml` (glob récursif, entre guillemets)
- **Tests instrumentés :** `**/build/outputs/androidTest-results/connected/**/*.xml`

## iOS

- **Détection :** `*.xcodeproj`, `*.xcworkspace`, `fastlane/Fastfile`
- **Fastlane :** `scan(output_types: "junit", output_directory: "test-results")` ; rapport `test-results/report.junit`
- **Sans Fastlane :** convertir le `.xcresult` avec [`xcresultparser`](https://github.com/a7ex/xcresultparser) — `xcresultparser -o junit Test.xcresult > test-results/ios-junit.xml`
- **Publication depuis Fastlane :** appeler `publish.sh` directement (`sh("…/publish.sh")`) avec les variables d'environnement documentées.
- **Pas de tests iOS** (cible de tests vide, lanes de build et de livraison seulement, CI limitée au lint) : rien à publier. Le signaler sans proposer de reporter ; en Kotlin Multiplatform, la logique partagée est souvent testée côté JVM (voir plus haut).

## UI mobile (Maestro)

- **Détection :** dossier `.maestro/`
- **Reporter :** `maestro test --format junit --output test-results/maestro-junit.xml .maestro/`

## À compléter

Flutter et React Native : à documenter au premier projet pilote.
