type Question = {
  id: number;
  text: string;
  hasOptions: boolean;
  answer?: string;
  options?: {
    id: number;
    text: string;
    isCorrect: boolean;
  }[];
};

type Questions = {
  [key: string]: Question[];
};

import questionsData from "./questions.json";
import { Random } from "random-js";

const questions: Questions = questionsData;

const getRandomQuestion = (topic: string | undefined): Question => {
  if (!topic) {
    throw new Error("Тема не выбрана");
  }

  const questionTopic = topic.toLowerCase();
  const random = new Random();
  const randomQuestionIndex = random.integer(
    0,
    questions[questionTopic].length - 1
  );
  return questions[questionTopic][randomQuestionIndex];
};

const getCorrectAnswer = (topic: string = '', id: number = 0) => {
  const question = questions[topic].find((question) => question.id === id);
  if (!question?.hasOptions) {
    return question?.answer;
  }
  const correctOption = question?.options?.find((option) => option.isCorrect);
  return correctOption ? correctOption.text : undefined;
};


export { getRandomQuestion, getCorrectAnswer };
