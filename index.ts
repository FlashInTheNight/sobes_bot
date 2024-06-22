import { Bot, GrammyError, HttpError, InlineKeyboard, Keyboard } from "grammy";
import { config } from "dotenv";
import { getCorrectAnswer, getRandomQuestion } from "./utils";

config();

const bot = new Bot(process.env.BOT_API_KEY || "default_value");

bot.command("start", async (ctx) => {
  const startKeyboard = new Keyboard()
    .text("HTML")
    .text("CSS")
    .row()
    .text("JavaScript")
    .text("React")
    .resized();

  await ctx.reply(
    "Привет! Я - Frontend Interview Prep Bot ? \nЯ помогу тебе подготовиться к интервью по фронтенду"
  );
  await ctx.reply("С чего начнем? Выбери тему вопроса в меню ?", {
    reply_markup: startKeyboard,
  });
});

bot.hears(["HTML", "CSS", "JavaScript", "React"], async (ctx) => {
  const topic = ctx.message?.text;
  const question = getRandomQuestion(topic);
  let keyboard;
  if (question.hasOptions) {
    const buttonRows: any = question.options?.map((option) => [
      InlineKeyboard.text(
        option.text,
        JSON.stringify({
          type: `${topic?.toLowerCase()}-option`,
          isCorrect: option.isCorrect,
          questionId: question.id,
        })
      ),
    ]);
    keyboard = InlineKeyboard.from(buttonRows);
  } else {
    keyboard = new InlineKeyboard().text(
      "Узнать ответ",
      JSON.stringify({
        type: ctx.message?.text?.toLowerCase(),
        questionId: question.id,
      })
    );
  }
  await ctx.reply(question.text, {
    reply_markup: keyboard,
  });
});

bot.on("callback_query:data", async (ctx) => {
  const callbackData = JSON.parse(ctx.callbackQuery.data);
  if (!callbackData.type.includes("option")) {
    const answer = getCorrectAnswer(callbackData.type, callbackData.questionId);

    if (answer !== undefined) {
      await ctx.reply(answer, {
        parse_mode: "HTML",
      });
      await ctx.answerCallbackQuery();
      return;
    } else {
      await ctx.reply("Произошла ошибка ❌");
    }
  }

  if (callbackData.isCorrect) {
    await ctx.reply("Верно ✅");
    await ctx.answerCallbackQuery();
    return;
  }

  await ctx.reply(
    `Неверно ❌ Правильный ответ: ${getCorrectAnswer(
      callbackData.type.split("-")[0],
      callbackData.questionId
    )}`
  );
  await ctx.answerCallbackQuery();
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

bot.start();
