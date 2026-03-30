const WORD_LIST = ["APPLE", "GRAPE", "TRAIN", "PLANT", "BREAD", "SHARE"];
const MAX_TRIES = 6;

const target = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
let tries = 0;
let won = false;

const form = document.getElementById("guess-form");
const input = document.getElementById("guess-input");
const message = document.getElementById("message");
const history = document.getElementById("history");

message.textContent = `You have ${MAX_TRIES} tries. Good luck!`;

function scoreGuess(guess, answer) {
  let matchCount = 0;
  for (let i = 0; i < guess.length; i += 1) {
    if (guess[i] === answer[i]) {
      matchCount += 1;
    }
  }
  return matchCount;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (won || tries >= MAX_TRIES) {
    return;
  }

  const raw = input.value.trim().toUpperCase();
  if (!/^[A-Z]{5}$/.test(raw)) {
    message.textContent = "Please enter exactly 5 letters.";
    return;
  }

  tries += 1;
  const score = scoreGuess(raw, target);

  const item = document.createElement("li");
  const guessSpan = document.createElement("span");
  guessSpan.textContent = `${tries}. ${raw}`;

  const resultSpan = document.createElement("span");

  if (raw === target) {
    won = true;
    resultSpan.textContent = "Correct";
    resultSpan.className = "ok";
    message.textContent = `You win in ${tries} tries!`;
  } else {
    resultSpan.textContent = `${score}/5 position match`;
    resultSpan.className = "bad";
    message.textContent =
      tries < MAX_TRIES
        ? `${MAX_TRIES - tries} tries left.`
        : `Game over. Answer: ${target}`;
  }

  item.append(guessSpan, resultSpan);
  history.prepend(item);

  input.value = "";
  input.focus();
});
