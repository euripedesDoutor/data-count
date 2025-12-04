import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('datacount.db');

export const initDatabase = () => {
    db.execSync(`
    CREATE TABLE IF NOT EXISTS surveys (
      id INTEGER PRIMARY KEY,
      title TEXT,
      questions TEXT
    );
    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      surveyId INTEGER,
      data TEXT,
      location TEXT,
      synced INTEGER DEFAULT 0
    );
  `);
};

export const saveSurvey = (id: number, title: string, questions: string) => {
    db.runSync('INSERT OR REPLACE INTO surveys (id, title, questions) VALUES (?, ?, ?)', [id, title, questions]);
};

export const getSurveys = () => {
    return db.getAllSync('SELECT * FROM surveys');
};

export const saveResponse = (surveyId: number, data: string, location: string) => {
    db.runSync('INSERT INTO responses (surveyId, data, location, synced) VALUES (?, ?, ?, 0)', [surveyId, data, location]);
};

export const getUnsyncedResponses = () => {
    return db.getAllSync('SELECT * FROM responses WHERE synced = 0');
};

export const markResponseSynced = (id: number) => {
    db.runSync('UPDATE responses SET synced = 1 WHERE id = ?', [id]);
};
