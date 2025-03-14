export const generateRandomPassword = () => {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    let password = "";
    // Ensure at least one uppercase and one number
    password += upper[Math.floor(Math.random() * upper.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    const allChars = lower + upper + numbers;
    for (let i = 0; i < 6; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    return password.split("").sort(() => 0.5 - Math.random()).join("");
  };
  