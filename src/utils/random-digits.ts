export const randomDigit = (lenght = 60) => {
  let output = '';

  const characters = '0123456789';
  for (let i = 0; i < lenght; i++) {
    output += characters[Math.floor(Math.random() * lenght)];
  }
  return output;
};
