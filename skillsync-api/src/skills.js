// naive skill extraction and comparison (improve with TF-IDF or embeddings later)
const DICT = [
  'java','javascript','typescript','python','swift','c++','c','html','css','react','angular','node','express',
  'postgresql','mysql','mongodb','docker','kubernetes','git','aws','gcp','azure','linux','bash','rest','graphql'
];

export function extractSkills(text) {
  const t = (text || '').toLowerCase();
  const found = new Set();
  for (const s of DICT) {
    const re = new RegExp(`\\b${s.replace('+','\\+')}\\b`, 'i');
    if (re.test(t)) found.add(s);
  }
  return [...found].sort();
}

export function compareSkills(resume, job) {
  const jobSet = new Set(job);
  const resSet = new Set(resume);
  const missing = [...jobSet].filter(s => !resSet.has(s));
  const matched = [...jobSet].filter(s => resSet.has(s));
  const extra = [...resSet].filter(s => !jobSet.has(s));
  return { missing, matched, extra, coverage: matched.length / Math.max(job.length, 1) };
}

export function curatedResources(missing) {
  // In a real app, fetch from providers; here are placeholders
  return missing.map(skill => ({
    skill,
    resources: [
      { title: `${skill.toUpperCase()} — Official Docs`, url: `https://www.google.com/search?q=${encodeURIComponent(skill + ' official docs')}` },
      { title: `${skill} Crash Course`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' crash course')}` }
    ]
  }));
}
