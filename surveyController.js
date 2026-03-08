const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

const questionConfig = {
  ageBelong: { type: 'single', label: 'Age group' },
  taskTried: { type: 'text', label: 'Task tried' },
  easeFinding: { type: 'single', label: 'Ease of finding items' },
  deviceUsed: { type: 'single', label: 'Device used' },
  webVisit: { type: 'single', label: 'Visit frequency' },
  liked: { type: 'multi', label: 'What users liked' },
  speedOk: { type: 'single', label: 'Page speed' },
  firstImpression: { type: 'text', label: 'First impression' },
  filterHelpfulness: { type: 'single', label: 'Filter helpfulness' },
  productInfoStatus: { type: 'single', label: 'Product information sufficiency' },
  productInformation: { type: 'text', label: 'Missing product information details' },
  overallRating: { type: 'rating', label: 'Overall rating' },
  comments: { type: 'text', label: 'Additional comments' }
};

function ensureDataFile(fileName, fallback) {
  const filePath = path.join(dataDir, `${fileName}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
  }
}

function initializeDataFiles() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  ensureDataFile('submissions', []);

  Object.entries(questionConfig).forEach(([key, config]) => {
    const fallback = config.type === 'text' ? [] : [];
    ensureDataFile(key, fallback);
  });
}

function readData(fileName) {
  const filePath = path.join(dataDir, `${fileName}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeData(fileName, data) {
  const filePath = path.join(dataDir, `${fileName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function normalizeToArray(value) {
  if (value === undefined || value === null || value === '') {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function incrementCount(fileName, fieldName, value) {
  if (!value) {
    return;
  }

  const info = readData(fileName);
  const existing = info.find((entry) => entry[fieldName] === value);

  if (existing) {
    existing.count = Number(existing.count || 0) + 1;
  } else {
    info.push({ [fieldName]: value, count: 1 });
  }

  writeData(fileName, info);
}

function appendTextEntry(fileName, value, submissionId) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) {
    return;
  }

  const info = readData(fileName);
  info.push({ value: trimmed, submissionId });
  writeData(fileName, info);
}

function getAnalystData() {
  const chartGroups = [
    'ageBelong',
    'easeFinding',
    'deviceUsed',
    'webVisit',
    'liked',
    'speedOk',
    'filterHelpfulness',
    'productInfoStatus'
  ].map((key) => ({
    key,
    label: questionConfig[key].label,
    entries: readData(key)
  }));

  const textGroups = ['taskTried', 'firstImpression', 'productInformation', 'comments'].map((key) => ({
    key,
    label: questionConfig[key].label,
    entries: readData(key)
  }));

  const ratings = readData('overallRating');
  const submissions = readData('submissions');
  const ratingValues = ratings.map((entry) => Number(entry.rating)).filter((value) => !Number.isNaN(value));
  const averageRating = ratingValues.length
    ? (ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length).toFixed(2)
    : 'N/A';

  return {
    chartGroups,
    textGroups,
    ratings,
    averageRating,
    submissions,
    submissionCount: submissions.length
  };
}

initializeDataFiles();

module.exports = function (app) {
  app.get('/', (req, res) => {
    res.redirect('/survey');
  });

  app.get('/survey', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'niceSurvey.html'));
  });

  app.get('/analysis', (req, res) => {
    res.render('showResults', getAnalystData());
  });

  app.get('/api/results', (req, res) => {
    res.json(getAnalystData());
  });

  app.get('/api/submissions', (req, res) => {
    res.json(readData('submissions'));
  });

  app.post('/api/survey', (req, res) => {
    const body = req.body;
    const submissionId = `submission-${Date.now()}`;

    const submission = {
      submissionId,
      submittedAt: new Date().toISOString(),
      firstname: body.firstname ? body.firstname.trim() : '',
      lastname: body.lastname ? body.lastname.trim() : '',
      ageBelong: body.ageBelong || '',
      taskTried: body.taskTried ? body.taskTried.trim() : '',
      easeFinding: body.easeFinding || '',
      deviceUsed: body.deviceUsed || '',
      webVisit: body.webVisit || '',
      liked: normalizeToArray(body.liked),
      speedOk: body.speedOk || '',
      firstImpression: body.firstImpression ? body.firstImpression.trim() : '',
      filterHelpfulness: body.filterHelpfulness || '',
      productInfoStatus: body.productInfoStatus || '',
      productInformation: body.productInformation ? body.productInformation.trim() : '',
      overallRating: body.overallRating || '',
      comments: body.comments ? body.comments.trim() : ''
    };

    const submissions = readData('submissions');
    submissions.push(submission);
    writeData('submissions', submissions);

    incrementCount('ageBelong', 'ageBelong', submission.ageBelong);
    appendTextEntry('taskTried', submission.taskTried, submissionId);
    incrementCount('easeFinding', 'easeFinding', submission.easeFinding);
    incrementCount('deviceUsed', 'deviceUsed', submission.deviceUsed);
    incrementCount('webVisit', 'webVisit', submission.webVisit);
    submission.liked.forEach((item) => incrementCount('liked', 'liked', item));
    incrementCount('speedOk', 'speedOk', submission.speedOk);
    appendTextEntry('firstImpression', submission.firstImpression, submissionId);
    incrementCount('filterHelpfulness', 'filterHelpfulness', submission.filterHelpfulness);
    incrementCount('productInfoStatus', 'productInfoStatus', submission.productInfoStatus);
    appendTextEntry('productInformation', submission.productInformation, submissionId);
    incrementCount('overallRating', 'rating', submission.overallRating);
    appendTextEntry('comments', submission.comments, submissionId);

    res.json({
      success: true,
      redirectUrl: '/analysis'
    });
  });
};
