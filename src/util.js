const supportsLocalStorage = (function() {
  try {
    window.localStorage.setItem('test', '1');
    window.localStorage.removeItem('test');
    return true;
  }
  catch (error) {
    return false;
  }
})();

export function maybeStore(key, value) {
  if (supportsLocalStorage) {
    window.localStorage.setItem(key, value);
  }
}

export function shuffle(arr) {
  let currentIndex = arr.length;
  let temporaryValue;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    temporaryValue = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = temporaryValue;
  }

  return arr;
}
