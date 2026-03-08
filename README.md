# SEG3125 Lab 6 + Lab 1 Integration

This version uses the Module 6 Express starter and adds the Lab 1 Costco UI survey requirements.

## Included requirements
- Express backend with `app.js` and `server.js`
- Accessible client-side survey at `/survey`
- Analyst/server-side view at `/analysis`
- REST API to submit and read survey results
  - `POST /api/survey`
  - `GET /api/results`
  - `GET /api/submissions`
- Data saved in the `data` folder as JSON files matching the survey questions
- Pie charts / bar chart in the analyst view using Chart.js
- Incoming answers shown in a server-side dashboard

## Run
1. `npm install`
2. `npm start`
3. Open `http://localhost:3000/survey`

## Notes
- Each submission is saved in `data/submissions.json`
- Aggregated results are also stored in per-question files in `data/`
- The submit button sends the survey to the backend and redirects to the analyst page
