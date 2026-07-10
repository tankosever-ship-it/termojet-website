// canHover() — true лише на пристроях зі справжнім hover (десктоп із мишею/трекпадом).
//
// Навіщо: на тач-екранах перший тап по елементу з hover-ефектом (розкриття
// підкатегорій, зміна стилю тощо) браузер трактує як «наведення» і НЕ виконує
// перехід — доводиться тапати вдруге. Якщо вмикати hover-стан лише коли
// canHover() === true, на мобільному hover не вмикається і клік/перехід
// спрацьовує з ОДНОГО тапу.
//
// Використання: onMouseEnter={() => canHover() && setHovered(true)}
export const canHover = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(hover: hover)').matches
