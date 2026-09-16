# Phoneme Activity Builder - Assessment 2

This is my Assessment 2 full stack project. It builds on the Assessment 1 frontend and adds a backend, database and Docker support for managing phoneme based Wordle and Word Search activities.

## Pages

- Home
- About
- Wordle
- Word Search
- Settings
- Words
- Activities

## Main features

- phoneme based Wordle game
- phoneme Word Search game
- phoneme hover hints
- Word management with create, read, update and delete
- Activity management with create, read, update and delete
- SQLite database using Prisma
- multiple words can be saved to a Word Search activity
- Wordle and Word Search activities use saved database data
- validation and basic error handling
- light and dark themes saved with cookies
- responsive layout
- download a standalone HTML file for each activity
- health check API at /health
- Docker support

For Assessment 2 the application uses a SQLite database to store phoneme words and activity settings. Wordle activities use one saved word, while Word Search activities can use multiple saved words.

## Run the project

```bash
npm install
npx prisma generate
npm run dev

## Student details

Name: Zac Whyte

Student number: 22308075
