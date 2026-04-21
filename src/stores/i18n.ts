import { computed, ref, watch } from 'vue'

export type Locale = 'ru' | 'en' | 'ky'

export const LOCALES: Locale[] = ['ru', 'en', 'ky']

const STORAGE_KEY = 'cinema.locale'

export const LOCALE_LABELS: Record<Locale, string> = {
  ru: 'RU',
  en: 'EN',
  ky: 'KG',
}

type Dict = Record<string, string>

const ru: Dict = {
  'nav.home': 'Главная',
  'nav.afisha': 'Афиша',
  'nav.schedule': 'Расписание',

  'auth.login': 'Вход',
  'auth.register': 'Регистрация',
  'auth.logout': 'Выйти',
  'auth.signInTitle': 'Войдите в аккаунт',
  'auth.signUpTitle': 'Создайте аккаунт',
  'auth.signInSubmit': 'Войти',
  'auth.signUpSubmit': 'Создать аккаунт',
  'auth.email': 'Email',
  'auth.password': 'Пароль',
  'auth.passwordPlaceholder': 'Введите пароль',
  'auth.passwordMin': 'Минимум 6 символов',
  'auth.passwordConfirm': 'Повторите пароль',
  'auth.noAccount': 'Нет аккаунта?',
  'auth.hasAccount': 'Уже есть аккаунт?',
  'auth.goRegister': 'Зарегистрироваться',
  'auth.goLogin': 'Войти',
  'auth.errorShort': 'Пароль должен быть не короче 6 символов.',
  'auth.errorMismatch': 'Пароли не совпадают.',

  'aria.themeLight': 'Включить светлую тему',
  'aria.themeDark': 'Включить тёмную тему',
  'aria.menuOpen': 'Открыть меню',
  'aria.menuClose': 'Закрыть меню',
  'aria.languageToggle': 'Сменить язык',

  'common.back': 'Назад',
  'common.home': 'На главную',
  'common.remove': 'Убрать',

  'home.welcome': 'Добро пожаловать',
  'home.heroLine1': 'Фильмы, сеансы',
  'home.heroConnector': 'и',
  'home.heroLine2': 'бронь в пару кликов',
  'home.heroSub': 'Выберите фильм, сеанс и удобное место в зале — онлайн, без очередей.',
  'home.ctaMovies': 'Афиша',
  'home.ctaSchedule': 'Расписание',
  'home.nowShowing': 'В прокате',
  'home.allMovies': 'Вся афиша',
  'home.upcoming': 'Ближайшие сеансы',
  'home.fullSchedule': 'Полное расписание',

  'afisha.eyebrow': 'Афиша',
  'afisha.title': 'Фильмы в прокате',

  'movie.notFound': 'Фильм не найден.',
  'movie.toAfisha': 'В афишу',
  'movie.release': 'Премьера',
  'movie.sessions': 'Сеансы',
  'movie.noSessions': 'Нет запланированных сеансов.',

  'schedule.eyebrow': 'Расписание',
  'schedule.title': 'Сеансы',
  'schedule.noSessions': 'На эту дату сеансов нет.',

  'seats.notFound': 'Сеанс не найден.',
  'seats.toSchedule': 'К расписанию',
  'seats.holdTimer': 'Бронь истекает через {time}',
  'seats.screen': 'Экран',
  'seats.legendAvailable': 'Свободно',
  'seats.legendSelected': 'Выбрано',
  'seats.legendHeld': 'Забронировано',
  'seats.legendBooked': 'Куплено',
  'seats.orderEyebrow': 'Заказ',
  'seats.empty': 'Выберите места на схеме',
  'seats.price': 'Цена билета',
  'seats.total': 'Итого',
  'seats.confirm': 'Подтвердить',
  'seats.max': 'Максимум {n} мест',
  'seats.seatLabel': 'Место {seat}',

  'success.eyebrow': 'Бронирование подтверждено',
  'success.title': 'Места забронированы',
  'success.session': 'Сеанс',
  'success.date': 'Дата',
  'success.time': 'Время',
  'success.seats': 'Места',
  'success.sum': 'Сумма',

  'notfound.text': 'Страница не найдена.',

  'date.today': 'Сегодня',
}

const en: Dict = {
  'nav.home': 'Home',
  'nav.afisha': 'Movies',
  'nav.schedule': 'Schedule',

  'auth.login': 'Sign in',
  'auth.register': 'Sign up',
  'auth.logout': 'Log out',
  'auth.signInTitle': 'Sign in to your account',
  'auth.signUpTitle': 'Create an account',
  'auth.signInSubmit': 'Sign in',
  'auth.signUpSubmit': 'Create account',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.passwordPlaceholder': 'Enter password',
  'auth.passwordMin': 'At least 6 characters',
  'auth.passwordConfirm': 'Confirm password',
  'auth.noAccount': "Don't have an account?",
  'auth.hasAccount': 'Already have an account?',
  'auth.goRegister': 'Sign up',
  'auth.goLogin': 'Sign in',
  'auth.errorShort': 'Password must be at least 6 characters long.',
  'auth.errorMismatch': 'Passwords do not match.',

  'aria.themeLight': 'Switch to light theme',
  'aria.themeDark': 'Switch to dark theme',
  'aria.menuOpen': 'Open menu',
  'aria.menuClose': 'Close menu',
  'aria.languageToggle': 'Change language',

  'common.back': 'Back',
  'common.home': 'Back home',
  'common.remove': 'Remove',

  'home.welcome': 'Welcome',
  'home.heroLine1': 'Movies, sessions',
  'home.heroConnector': 'and',
  'home.heroLine2': 'booking in a few clicks',
  'home.heroSub': 'Pick a movie, a session and a seat — online, no queues.',
  'home.ctaMovies': 'Movies',
  'home.ctaSchedule': 'Schedule',
  'home.nowShowing': 'Now showing',
  'home.allMovies': 'All movies',
  'home.upcoming': 'Upcoming sessions',
  'home.fullSchedule': 'Full schedule',

  'afisha.eyebrow': 'Movies',
  'afisha.title': 'Now showing',

  'movie.notFound': 'Movie not found.',
  'movie.toAfisha': 'To movies',
  'movie.release': 'Release',
  'movie.sessions': 'Sessions',
  'movie.noSessions': 'No scheduled sessions.',

  'schedule.eyebrow': 'Schedule',
  'schedule.title': 'Sessions',
  'schedule.noSessions': 'No sessions on this date.',

  'seats.notFound': 'Session not found.',
  'seats.toSchedule': 'To schedule',
  'seats.holdTimer': 'Reservation expires in {time}',
  'seats.screen': 'Screen',
  'seats.legendAvailable': 'Available',
  'seats.legendSelected': 'Selected',
  'seats.legendHeld': 'On hold',
  'seats.legendBooked': 'Sold',
  'seats.orderEyebrow': 'Order',
  'seats.empty': 'Pick seats from the map',
  'seats.price': 'Ticket price',
  'seats.total': 'Total',
  'seats.confirm': 'Confirm',
  'seats.max': 'Up to {n} seats',
  'seats.seatLabel': 'Seat {seat}',

  'success.eyebrow': 'Booking confirmed',
  'success.title': 'Your seats are reserved',
  'success.session': 'Session',
  'success.date': 'Date',
  'success.time': 'Time',
  'success.seats': 'Seats',
  'success.sum': 'Total',

  'notfound.text': 'Page not found.',

  'date.today': 'Today',
}

const ky: Dict = {
  'nav.home': 'Башкы',
  'nav.afisha': 'Афиша',
  'nav.schedule': 'Жадыбал',

  'auth.login': 'Кирүү',
  'auth.register': 'Катталуу',
  'auth.logout': 'Чыгуу',
  'auth.signInTitle': 'Аккаунтка кириңиз',
  'auth.signUpTitle': 'Аккаунт түзүңүз',
  'auth.signInSubmit': 'Кирүү',
  'auth.signUpSubmit': 'Аккаунт түзүү',
  'auth.email': 'Email',
  'auth.password': 'Сырсөз',
  'auth.passwordPlaceholder': 'Сырсөздү киргизиңиз',
  'auth.passwordMin': 'Кеминде 6 белги',
  'auth.passwordConfirm': 'Сырсөздү кайталаңыз',
  'auth.noAccount': 'Аккаунтуңуз жокпу?',
  'auth.hasAccount': 'Аккаунтуңуз барбы?',
  'auth.goRegister': 'Катталуу',
  'auth.goLogin': 'Кирүү',
  'auth.errorShort': 'Сырсөз 6 белгиден кем болбошу керек.',
  'auth.errorMismatch': 'Сырсөздөр дал келбейт.',

  'aria.themeLight': 'Жарык темага өтүү',
  'aria.themeDark': 'Караңгы темага өтүү',
  'aria.menuOpen': 'Менюну ачуу',
  'aria.menuClose': 'Менюну жабуу',
  'aria.languageToggle': 'Тилди алмаштыруу',

  'common.back': 'Артка',
  'common.home': 'Башкыга',
  'common.remove': 'Өчүрүү',

  'home.welcome': 'Кош келиңиз',
  'home.heroLine1': 'Тасмалар, сеанстар',
  'home.heroConnector': 'жана',
  'home.heroLine2': 'бир канча чыкылдатуу менен бронь',
  'home.heroSub': 'Тасма, сеанс жана залдан ыңгайлуу орун тандаңыз — онлайн, кезексиз.',
  'home.ctaMovies': 'Афиша',
  'home.ctaSchedule': 'Жадыбал',
  'home.nowShowing': 'Прокатта',
  'home.allMovies': 'Бардык тасмалар',
  'home.upcoming': 'Жакынкы сеанстар',
  'home.fullSchedule': 'Толук жадыбал',

  'afisha.eyebrow': 'Афиша',
  'afisha.title': 'Прокаттагы тасмалар',

  'movie.notFound': 'Тасма табылган жок.',
  'movie.toAfisha': 'Афишага',
  'movie.release': 'Премьера',
  'movie.sessions': 'Сеанстар',
  'movie.noSessions': 'Пландалган сеанстар жок.',

  'schedule.eyebrow': 'Жадыбал',
  'schedule.title': 'Сеанстар',
  'schedule.noSessions': 'Бул күнү сеанстар жок.',

  'seats.notFound': 'Сеанс табылган жок.',
  'seats.toSchedule': 'Жадыбалга',
  'seats.holdTimer': 'Бронь мөөнөтү: {time}',
  'seats.screen': 'Экран',
  'seats.legendAvailable': 'Бош',
  'seats.legendSelected': 'Тандалды',
  'seats.legendHeld': 'Брондолгон',
  'seats.legendBooked': 'Сатылды',
  'seats.orderEyebrow': 'Заказ',
  'seats.empty': 'Схемадан орун тандаңыз',
  'seats.price': 'Билет баасы',
  'seats.total': 'Жалпы',
  'seats.confirm': 'Ырастоо',
  'seats.max': 'Максимум {n} орун',
  'seats.seatLabel': 'Орун {seat}',

  'success.eyebrow': 'Бронь ырасталды',
  'success.title': 'Орундар брондолду',
  'success.session': 'Сеанс',
  'success.date': 'Күн',
  'success.time': 'Убакыт',
  'success.seats': 'Орундар',
  'success.sum': 'Жалпы',

  'notfound.text': 'Бет табылган жок.',

  'date.today': 'Бүгүн',
}

const dict: Record<Locale, Dict> = { ru, en, ky }

const plurals: Record<Locale, Record<string, string[]>> = {
  ru: { seats: ['место', 'места', 'мест'] },
  en: { seats: ['seat', 'seats'] },
  ky: { seats: ['орун'] },
}

const load = (): Locale => {
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  return LOCALES.includes(raw as Locale) ? (raw as Locale) : 'ru'
}

export const locale = ref<Locale>(load())

export const localeLabel = computed(() => LOCALE_LABELS[locale.value])

const apply = (l: Locale) => {
  if (typeof document !== 'undefined') document.documentElement.lang = l
}
apply(locale.value)

watch(locale, (l) => {
  apply(l)
  try {
    localStorage.setItem(STORAGE_KEY, l)
  } catch {
    /* ignore */
  }
})

export const t = (key: string, params?: Record<string, string | number>): string => {
  const table = dict[locale.value] ?? dict.ru
  let text = table[key] ?? dict.ru[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.split(`{${k}}`).join(String(v))
    }
  }
  return text
}

export const tPlural = (n: number, key: string): string => {
  const forms = plurals[locale.value]?.[key]
  if (!forms || forms.length === 0) return key
  if (locale.value === 'ru') {
    const n10 = n % 10
    const n100 = n % 100
    if (n10 === 1 && n100 !== 11) return forms[0]!
    if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1] ?? forms[0]!
    return forms[2] ?? forms[0]!
  }
  if (locale.value === 'en') {
    return n === 1 ? forms[0]! : (forms[1] ?? forms[0]!)
  }
  return forms[0]!
}

export const cycleLocale = () => {
  const idx = LOCALES.indexOf(locale.value)
  locale.value = LOCALES[(idx + 1) % LOCALES.length]!
}

export const setLocale = (l: Locale) => {
  locale.value = l
}
