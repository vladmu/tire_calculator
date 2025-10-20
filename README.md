# 🚗 Калькулятор підбору шин і дисків

Сучасний React + TypeScript застосунок з MobX для керування станом та Material UI для інтерфейсу. Реалізує логіку з вихідного HTML/JS: пошук максимально можливого діаметра диска з мінімальною дельтою, дотримання лімітів для R/W/V, відбір основних і альтернативних варіантів.

## Стек
- React 19 + TypeScript (CRA)
- MobX + mobx-react-lite
- Material UI (MUI)

## Структура
```
src/
  components/
    Header.tsx
    InfoBlock.tsx
    InputForm.tsx
    ResultCard.tsx
    ResultsArea.tsx
  services/
    calculator.ts          // Вся бізнес-логіка та константи
  stores/
    CalculatorStore.ts     // MobX-стан і дії
  themes/
    theme.ts               // Тема MUI
  types/
    types.ts               // Типи для результатів/вхідних даних
  App.tsx                  // Каркас застосунку
  index.tsx                // Точка входу (без ThemeProvider, використовується дефолтна тема MUI)
```

## Запуск
- Встановити залежності (якщо потрібно):
  npm install
- Режим розробки:
  npm start
- Продакшн-збірка:
  npm run build

## Використання
1. Введіть вихідні параметри: R (ціле число), W (кратне 5), V (кратне 5, не менше 20).
2. Натисніть "Розрахувати нові розміри".
3. Побачите:
   - Картку поточного розміру (діаметр у мм).
   - Варіанти для W, W+10, W+20 (картки). Найкращий у межах основних варіантів виділено зеленим.
   - Якщо існує кращий варіант поза основним діапазоном (крок 10 мм), показується окрема картка (жовта).

Обмеження: дельта діаметра не більше ±2%, профіль ≥ 20% з кроком 5%. Застосовуються мінімальні/максимальні ліміти для кожного R (див. блок з таблицею в UI).

## Примітки по реалізації
- Алгоритм перенесено у services/calculator.ts як чисті функції з покриттям всіх умов вихідного коду.
- Пріоритезація: спершу більший R, далі мінімальна |дельта|.
- Інтерфейс адаптивний: MUI + CSS Grid (без залежності від версії Grid2).
- Стан і валідації — у MobX-сторі (stores/CalculatorStore.ts).

## Ліцензії/завваження
Цей проєкт базується на Create React App. Деталі деплою: https://cra.link/deployment

## Деплой на GitHub Pages (через GitHub Actions)
Проєкт готовий до завантаження у приватний репозиторій GitHub та автоматичного розгортання на GitHub Pages за допомогою пайплайнів.

Що вже налаштовано:
- .github/workflows/ci.yml — CI: встановлення залежностей, тести з покриттям, продакшн-збірка, артефакт з coverage.
- .github/workflows/deploy.yml — build + deploy на GitHub Pages через офіційний actions/deploy-pages.

Кроки для запуску у вашому репозиторії:
1) Створіть приватний репозиторій на GitHub та запуште код (гілка main).
2) У репозиторії відкрийте Settings → Pages:
   - У секції “Build and deployment” оберіть Source: “GitHub Actions”.
3) Опційно (якщо у вас SPA з роутингом): ми вже копіюємо index.html у 404.html під час CI, щоб працювали прямі переходи.
4) Зробіть push у main або запустіть воркфлоу Deploy вручну (Actions → Deploy to GitHub Pages → Run workflow).
5) Після успішного деплою посилання на сайт зʼявиться у Settings → Pages (або у вихідних даних джоба Deploy у Actions).

Примітки:
- Для проектних сторінок (https://<user>.github.io/<repo>/) у CRA зазвичай задають поле "homepage" у package.json. Для деплою через GitHub Actions це не обовʼязково, бо воркфлоу публікує в корінь Pages середовища. Якщо ви використовуєте роутер з basename, встановіть його відповідно.
- Приватні репозиторії: GitHub Pages може бути доступним публічно; контроль видимості залежить від типу акаунта/плану. Перевірте можливості вашої організації/акаунта.
- Воркфлоу deploy.yml також запускає тести перед збиранням — деплой відбудеться лише якщо тестування успішне.

---

## Як запушити код на GitHub (виправлення «Invalid username or token. Password authentication is not supported for Git operations»)

GitHub більше не приймає паролі для Git‑операцій. Використовуйте один із двох способів:

### Варіант A (рекомендовано): GitHub CLI (gh)
1. Встановіть GitHub CLI: https://cli.github.com/
2. У корені проекту виконайте:
   - gh auth login
   - Оберіть: GitHub.com → HTTPS → Login with a web browser → підтвердьте у браузері.
3. Створіть (або привʼяжіть) репозиторій і запуште:
   - Створити новий приватний репозиторій і одразу запушити:  
     gh repo create <owner>/<repo> --private --source . --remote origin --push
   - Або привʼязати існуючий:  
     git remote add origin https://github.com/<owner>/<repo>.git  
     git branch -M main  
     git push -u origin main

### Варіант B: Персональний токен доступу (PAT)
1. Створіть PAT: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token.
   - Поставте scope: repo. Увімкнено 2FA? PAT обовʼязковий.
2. Налаштуйте збереження облікових даних (рекомендовано):
   - macOS: git config --global credential.helper osxkeychain
   - Windows: git config --global credential.helper manager-core
   - Linux: git config --global credential.helper libsecret (або cache)
3. Перевірте/додайте віддалений репозиторій і виконайте push:
   - git remote add origin https://github.com/<owner>/<repo>.git  (або git remote set-url origin ...)
   - git branch -M main
   - git push -u origin main
   - Коли запитає «Username»: введіть ваш GitHub логін; «Password»: вставте PAT.

### Базова конфігурація Git (за потреби)
- git config --global user.name "Ваше імʼя"
- git config --global user.email "you@example.com"

### Поширені помилки та як їх усунути
- Invalid username or token:
  - Перегенеруйте PAT зі scope repo, переконайтесь що вставляєте саме токен як «пароль».
  - Якщо ви в організації з SSO — авторизуйте токен для цієї організації (Profile → Settings → Organizations).
- 2FA увімкнено:
  - Пароль не працюватиме. Використовуйте PAT або gh auth login.
- Кешовані некоректні облікові дані:
  - macOS Keychain: відкрийте Keychain Access → знайдіть github.com → видаліть записи для git.
  - Або в терміналі: git credential reject; також можна скинути helper: git config --global --unset-all credential.helper
- 403/Request forbidden by administrative rules:
  - Перевірте політики організації, SSO‑авторизацію токена та віддалений URL (HTTPS vs SSH).
- SSH замість HTTPS:
  - Налаштуйте SSH ключі (ssh-keygen; додайте публічний ключ у GitHub) і використовуйте URL виду git@github.com:owner/repo.git.

Після успішного push, GitHub Actions автоматично запустить CI та деплой на Pages (якщо увімкнено в Settings → Pages → GitHub Actions).
