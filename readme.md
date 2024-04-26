# Chatbot interface

A simple web interface for a chatbot.

## To-do

Front-end:

- [ ] allow markdown for pretty stuff like code input (easy: <90m)
- [ ] light/dark theme (easy: <90m)
- [ ] pretty response rendering like in [generative UI](https://sdk.vercel.ai/docs/concepts/ai-rsc) (medium: 1-3h)

Back-end:

- [ ] Support other model providers like Together, possibly do this through Vercel AI SDK? (medium: 1-3h)
- [ ] Better usage of persistence layer, don't get/set every time you operate on conversation history (easy: <90m);
- [ ] Serve LM directly, not through 3rd party API (hard: >3h);
