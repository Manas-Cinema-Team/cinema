1. Сначала исправь реальные баги

   1. Проблема дублей билетов сейчас возникает из-за того, что src/views/BookingSuccessView.vue:45 сохраняет билет на onMounted, а экран открывается не только после оплаты, но и из src/views/ProfileView.vue:208 и src/components/
      layout/AppHeader.vue:149. Любое повторное открытие страницы снова пишет билет в storage.
   2. Правильное исправление: перенос saveTicket() из success-экрана в действие завершения оплаты. Сохранять билет нужно в момент успешного pay(), а success-экран должен только читать уже созданный билет.
   3. Лучший маршрут: после оплаты переходить не на query-based success, а на ticketId-based экран, например /tickets/:ticketId или /tickets/:ticketId/success. Тогда и “просмотр билета” из профиля будет открывать тот же read-only
      экран без повторного сохранения.
   4. В store добавь idempotent-логику: если билет с тем же bookingCode или тем же набором sessionId + seats + total уже существует, store должен вернуть существующий билет, а не создавать новый.
   5. Ссылку “Мои билеты” в src/components/layout/AppHeader.vue:149 переведи на профиль с табом билетов или на отдельный список /tickets, но не на success-экран.

---

2. Что значит “modern composable Vue style” для этого проекта

   1. views должны быть тонкими: собирают страницу, читают route, вызывают composables, рендерят template.
   2. composables должны содержать page logic: таймеры, polling, валидацию формы, route-driven state, outside click, табы, фильтры, navigation flow.
   3. stores должны держать только глобальное состояние: auth, theme, i18n, tickets, возможно cart.
   4. lib/services должны быть pure: форматтеры, селекторы, генераторы, преобразование mock-данных. Без ref, computed, router, localStorage, document.
   5. Данные не должны зависеть от UI-store. Сейчас src/data/cinema.ts:1 импортирует locale, из-за этого слой данных связан с i18n. Это надо разорвать.

---

3. Целевая структура src

```
src/
    app/
        router/
    features/
        auth/
        booking/
        movies/
        profile/
        schedule/
    shared/
        ui/
        composables/
        lib/
        mock/
    stores/
```

---

4. Как разложить текущий код

   1. src/features/booking/composables/useSeatSelection.ts
      Перенеси туда всю логику из src/views/SeatsView.vue:19. Сейчас она уже вынесена в src/views/seats/useSeatSelection.ts:15, но view её не использует. Удали дублирование и оставь один источник истины.
   2. src/features/booking/composables/usePaymentForm.ts
      Вынеси из src/views/PaymentView.vue:34 форматирование карты, expiry, cardType, validate, errors, isProcessing.
   3. src/features/booking/composables/useCheckout.ts
      Пусть отвечает за pay(), создание билета, очистку корзины и навигацию.
   4. src/features/booking/composables/useTicket.ts
      Получение билета по ticketId для success/details экрана.
   5. src/features/movies/composables/useMovieSessions.ts
      Вынеси из src/views/MovieView.vue:22 выбор дат и фильтрацию сеансов.
   6. src/features/schedule/composables/useScheduleFilter.ts
      Вынеси из src/views/ScheduleView.vue:11 даты, активную дату и forDate.
   7. src/shared/composables/useDropdown.ts
      Вынеси dropdown/open-outside-click из src/components/layout/AppHeader.vue:50.

---

5. Что сделать с cinema.ts

   1. Оставь в mock только массивы movies, halls, sessions.
   2. В shared/lib/cinema/selectors.ts вынеси findMovie, findHall, findSession, scheduleItems, sessionsForMovie.
   3. В shared/lib/formatters.ts вынеси formatDateLabel, formatTime, formatPrice, formatDuration.
   4. Форматтеры должны принимать locale параметром или использовать useFormatters() composable, но не импортировать store напрямую из слоя данных.

---

6. Порядок рефакторинга без поломки логики

   1. Исправь flow билета: сохранение в оплате, success только читает.
   2. Исправь маршруты профиля и хедера.
   3. Переключи SeatsView на уже существующий useSeatSelection.
   4. Разрежь PaymentView на usePaymentForm и useCheckout.
   5. Вынеси дублирующиеся route-derived вычисления в composables.
   6. Раздели cinema.ts на mock, selectors, formatters.
   7. Только после этого решай, переводить ли глобальные stores на Pinia. Для простоты можно сделать это второй фазой, не первой.

---

7. Правила, которых стоит придерживаться дальше

   1. Один composable = один use-case, а не “всё для страницы”.
   2. Если код использует onMounted, watch, router, localStorage, document, window — почти всегда это кандидат в composable.
   3. Если код pure и не зависит от Vue — это lib/service, а не composable.
   4. Если состояние нужно нескольким страницам — store. Если только одной странице — composable.
   5. Success/detail экраны никогда не должны создавать данные, только отображать их.

---

8. Минимальный regression checklist

   1. Оплата одного заказа создаёт один билет.
   2. Повторное открытие success/details не создаёт дубль.
   3. Просмотр билета из профиля не создаёт дубль.
   4. Выбор мест всё ещё ограничен MAX_SEATS, таймер и polling работают.
   5. Логин/редирект и переходы по защищённым роутам не сломаны.

---

1. Исправить баг с дублями билетов.
2. Перенести saveTicket() из BookingSuccessView в успешный pay() в PaymentView.
3. Сделать BookingSuccessView только экраном чтения, без сохранения данных.
4. Добавить маршрут просмотра билета по ticketId.
5. Открывать билет из профиля по ticketId, а не через query-параметры оплаты.
6. Исправить ссылку “Мои билеты” в хедере: вести в профиль или список билетов, не в success page.
7. Добавить в store защиту от повторного сохранения одного и того же билета.
8. Сделать views тонкими.
9. Оставить во views только чтение route, вызов composables и рендер шаблона.
10. Убрать из views таймеры, polling, сложную валидацию, форматирование и побочные эффекты.
11. Убрать дублирование логики выбора мест.
12. Подключить SeatsView к useSeatSelection.
13. Удалить дублирующую логику выбора мест из SeatsView.
14. Оставить один источник истины для seat-selection flow.
15. Разделить логику оплаты.
16. Создать usePaymentForm для полей, ошибок, форматирования карты и валидации.
17. Создать useCheckout для оплаты, создания билета, очистки корзины и навигации.
18. Упростить PaymentView, чтобы он только собирал UI из composables.
19. Вынести page-логику в composables.
20. Создать composable для логики MovieView с выбором дат и фильтрацией сеансов.
21. Создать composable для логики ScheduleView с активной датой и фильтром.
22. Создать composable для dropdown/outside click логики AppHeader.
23. Создать composable для чтения и отображения билета по ticketId.
24. Очистить слой данных.
25. Оставить в data или mock только мок-массивы фильмов, залов и сеансов.
26. Вынести findMovie, findHall, findSession, scheduleItems, sessionsForMovie в selectors.
27. Вынести formatDateLabel, formatTime, formatPrice, formatDuration в formatters.
28. Убрать зависимость cinema.ts от i18n store.
29. Привести структуру к понятной.
30. Разнести код по features, shared, stores.
31. Держать UI-компоненты в shared/ui.
32. Держать composables по фичам рядом с бизнес-логикой.
33. Держать глобальное состояние только в stores.
34. Зафиксировать правила проекта.
35. Один composable = один сценарий.
36. Pure-функции без Vue API хранить в lib, не в composables.
37. Глобальное состояние хранить в store, локальное состояние страницы в composable.
38. Экраны результата не должны создавать данные, только показывать их.
39. Проверить, что логика не сломалась.
40. Один платёж создаёт один билет.
41. Повторное открытие билета не создаёт дубль.
42. Профиль открывает существующие билеты корректно.
43. Выбор мест, таймер и polling работают как раньше.
44. Логин, редирект и защищённые роуты работают как раньше.
45. Прогнать yarn type-check после каждого крупного шага.