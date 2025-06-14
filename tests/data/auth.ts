const timestamp = Date.now();
export const registerData = {
  firstname: "Joe",
  lastname: "Doe",
  email: `f-${timestamp}f@gmail.com`,
  password: "My$ecure55",
  confirmPassword: "My$ecure55",
};

export const loginData = {
  email: `f-${timestamp}f@gmail.com`,
  password: "My$ecure55",
};

export const resetPasswordData = {
  email: `f-${timestamp}f@gmail.com`,
};

export const createQuizData = {
  title: "TEST",
  description: "TEST",
  timeLimit: 12,
  questions: [
    {
      photoUrl: "string",
      correctAnswer: "a",
      options: ["TEST"],
      questionText: "string",
      questionType: "string",
    },
  ],
};
