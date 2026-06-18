# TrueForm - AI-Powered Fitness & Aesthetic Analyzer

**Экспериментальный Micro-SaaS проект** для автоматической оценки физической формы через искусственный интеллект.

## 💡 Концепция проекта

### Идея
ИИ заменяет первичную консультацию фитнес-тренера и дает пользователю моментальный аудит телосложения. Цель - создать инструмент, который может стать лид-магнитом для фитнес-бизнеса.

### Гипотеза монетизации
- Freemium модель (несколько бесплатных сканов)
- Премиум подписка для неограниченного доступа
- White-label решение для тренеров и студий

**Статус**: 🚧 В разработке. Пока не монетизируется.

## ⚙️ Реализованный функционал

### 1. AI Form Scanner
Анализ телосложения по фото:
- Определение типа телосложения
- Оценка визуальных пропорций
- Базовый анализ формы

### 2. Aesthetic Assessment
Генерация отчетов:
- Оценка текущей формы
- Зоны для улучшения
- Базовые рекомендации

### 3. SaaS Architecture
Заложен фундамент под:
- Систему подписок
- Лимиты использования
- Tracking прогресса

## 🎯 Целевая аудитория (предполагаемая)

- Фитнес-энтузиасты ищущие объективную оценку
- Новички в фитнесе
- Тренеры (как инструмент для клиентов)
- Фитнес-студии

## Технологический стек

### Frontend
- **Next.js 14** - React framework
- **TypeScript** 
- **Tailwind CSS**

### Backend & AI
- **Supabase** - база данных
- **OpenAI Vision API** / **Anthropic Claude** - AI анализ
- **Vercel** - хостинг

## Установка и запуск

### Требования
- Node.js 18+

### Установка

```bash
git clone https://github.com/Sashatsyhanov14/trueform.git
cd trueform
npm install
```

### Конфигурация

Создайте `.env.local`:
```env
DATABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Запуск

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Откройте [http://localhost:3000](http://localhost:3000)

## Структура проекта

```
trueform/
├── app/                # Next.js App Router
│   ├── page.tsx       # Главная
│   ├── scan/          # Сканирование
│   ├── results/       # Результаты
│   └── api/           # API endpoints
├── components/        # React компоненты
├── lib/              # Утилиты
├── public/           # Статика
└── schema.sql        # Database schema
```

## Deployment

### Vercel (рекомендуется)

```bash
npm i -g vercel
vercel
```

Или подключите через GitHub к Vercel Dashboard.

## Текущий статус

**Что работает:**
- ✅ Базовый UI/UX
- ✅ Загрузка фото
- ✅ AI анализ (базовый)
- ✅ Генерация отчетов

**В планах:**
- ⏳ Система подписок (Stripe)
- ⏳ История сканов
- ⏳ Отслеживание прогресса
- ⏳ Mobile app

**Что не реализовано:**
- ❌ Монетизация
- ❌ Пейволлы
- ❌ Marketing/landing
- ❌ Mobile приложение

## Disclaimer

Это **экспериментальный проект**, созданный для изучения AI-анализа изображений и SaaS архитектуры. Проект пока не приносит дохода и находится в стадии активной разработки.

⚠️ Не является медицинским инструментом. Результаты носят развлекательно-информационный характер.

## Лицензия

Proprietary

## Контакты

- **GitHub**: [@Sashatsyhanov14](https://github.com/Sashatsyhanov14)
- **Email**: alexandertsyhanov@gmail.com

---

*Проект создан как обучающий эксперимент в области AI + SaaS.*
