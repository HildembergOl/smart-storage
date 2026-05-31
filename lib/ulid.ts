const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const ENCODING_LEN = ENCODING.length;

export function generateUlid(): string {
  let time = Date.now();
  let timeChars = "";
  for (let i = 9; i >= 0; i--) {
    const mod = time % ENCODING_LEN;
    timeChars = ENCODING.charAt(mod) + timeChars;
    time = Math.floor(time / ENCODING_LEN);
  }

  let randomChars = "";
  for (let i = 0; i < 16; i++) {
    const rand = Math.floor(Math.random() * ENCODING_LEN);
    randomChars += ENCODING.charAt(rand);
  }

  return timeChars + randomChars;
}
