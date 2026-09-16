# Assessment 1 Video Script

## 0:00-0:40 - Introduction

Show my student ID and face.

"Hi, my name is Zac Whyte and my student number is 22308075. This is my Assessment 1 project, which is a frontend phoneme activity builder made with Next.js and React."

## 0:40-1:20 - Home and navigation

"This is the home page. I kept the layout simple because the users are teachers and they should be able to get to the two activities quickly. The main navigation has Home, Wordle, Word Search, About and Settings. The menu also gives a compact version of the navigation."

## 1:20-2:40 - Wordle

"The Wordle page is designed around phoneme symbols instead of normal spelling. For Assessment 1 I used the word thin, which is /θ ɪ n/. The teacher can see the phoneme word, the English word, choose whether hints are shown and choose the number of guesses."

Hover over /θ/ and show the hint: "TH (as in thin)".

"The phoneme keyboard is a reusable component, so the same type of keyboard can be used elsewhere later. The preview lets me select phonemes and check the answer."

Press Generate and download the HTML.

"The Generate button creates one standalone HTML file. I can open that file in a normal browser without needing the builder page."

## 2:40-3:50 - Word Search

Open Word Search.

"The Word Search uses a small fixed set of phoneme words for this assessment. This keeps the project frontend only. I can choose a difficulty, click the first and last phoneme of a word, and the app checks the selection. The teacher can also download a standalone HTML file."

Show a few words and find one by clicking its first and last cells.

## 3:50-4:40 - Settings and accessibility

"The Settings page has a light and dark theme and the theme is stored in a cookie, so it stays after a refresh. I also kept the controls keyboard accessible and used labels and visible focus states where possible. The layout changes for smaller screens as well."

## 4:40-5:50 - Code structure

Show folders.

"I used separate pages for the required parts of the application and small reusable components for common UI. I also kept the phoneme data and HTML generation code separate from the pages. This makes the project easier to change later when the database and larger word list are added in later assessments."

## 5:50-6:40 - Trade-offs

"A main trade-off was keeping Assessment 1 simple. I did not add a database because the brief says that comes later. The Wordle therefore uses one fixed word and the Word Search uses five fixed words. I focused the available time on making the interface usable, responsive and able to produce standalone HTML files."

## 6:40-7:20 - GitHub and close

Show the GitHub repository homepage and commits.

"My GitHub repository shows the project development through separate commits for the layout, pages, games and final improvements. Overall, this version is intended to be a foundation for the later assessments rather than a complete database system."
