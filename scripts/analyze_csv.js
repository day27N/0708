const fs = require('fs')
const path = require('path')

function pad(n){return n<10? '0'+n: ''+n}

function parseDateToken(raw){
  if (!raw) return null
  // extract groups of digits
  const m = raw.match(/(\d{2,4})[^\d]*(\d{1,2})[^\d]*(\d{1,2})/)
  if (!m) return null
  let yy = m[1], mm = m[2], dd = m[3]
  let year = yy.length===4 ? Number(yy) : 2000 + Number(yy)
  return `${year}-${pad(Number(mm))}-${pad(Number(dd))}`
}

function toDate(s){ return new Date(s + 'T00:00:00') }

function diffDays(a,b){ return Math.round((b.getTime()-a.getTime())/(1000*60*60*24)) }

const csvPath = process.argv[2] || 'c:\\Users\\ekyex\\Downloads\\국제_원유가격20080706_20260707.csv'
const text = fs.readFileSync(csvPath, {encoding:'binary'})
// try to decode cp949 if characters look garbled
let utf8 = text
try{ utf8 = Buffer.from(text, 'binary').toString('utf8') }catch(e){}
const lines = utf8.split(/\r?\n/).filter(Boolean)
const header = lines[0].split(',')
const dubaiIdx = header.findIndex(h=>/dubai|두바이/i.test(h))
const dateIdx = 0

const data = []
for(let i=1;i<lines.length;i++){
  const cols = lines[i].split(',')
  const rawDate = cols[dateIdx]
  const date = parseDateToken(rawDate)
  const rawDubai = cols[dubaiIdx>=0? dubaiIdx : 1]
  const val = rawDubai ? Number(String(rawDubai).replace(/[,\s]/g,'')) : NaN
  if (!date || isNaN(val)) continue
  data.push({date, value: val})
}

data.sort((a,b)=> a.date < b.date ? -1 : a.date > b.date ? 1 : 0)
const unique = []
const seen = new Set()
for(const r of data){ if (!seen.has(r.date)){ unique.push(r); seen.add(r.date) } }

const availableUntil = unique.length ? unique[unique.length-1].date : null
const ticketingDate = '2026-07-08'

function getIssueMonth(ticketDate){ const d = toDate(ticketDate); return `${d.getFullYear()}-${pad(d.getMonth()+1)}` }

function getCurrentReferencePeriod(issueMonth){ const [y,m] = issueMonth.split('-').map(Number); const issue = new Date(y, m-1, 1); const start = new Date(issue.getFullYear(), issue.getMonth()-2, 16); const end = new Date(issue.getFullYear(), issue.getMonth()-1, 15); return {start: start.toISOString().slice(0,10), end: end.toISOString().slice(0,10)} }

function getFullNextReferencePeriod(ticketDate){ const d = toDate(ticketDate); const prev = new Date(d.getFullYear(), d.getMonth()-1, 1); const start = new Date(prev.getFullYear(), prev.getMonth(), 16); const end = new Date(d.getFullYear(), d.getMonth(), 15); return {start: start.toISOString().slice(0,10), end: end.toISOString().slice(0,10)} }

function getNextPredictionPeriod(ticketDate, availableUntil, fullNext){ const d = toDate(ticketDate); const prev = new Date(d.getFullYear(), d.getMonth()-1, 1); const start = new Date(prev.getFullYear(), prev.getMonth(), 16); const candidates = [d.toISOString().slice(0,10), availableUntil, fullNext.end].filter(Boolean); const end = candidates.sort()[0] // lexicographic works for YYYY-MM-DD
  return { start: start.toISOString().slice(0,10), end }
}

function averageFor(period){ const s = toDate(period.start), e = toDate(period.end); const slice = unique.filter(r=> toDate(r.date) >= s && toDate(r.date) <= e); const count = slice.length; if (count===0) return {average:null,count:0}; const sum = slice.reduce((a,b)=>a+b.value,0); return {average: sum/count, count}
}

const issueMonth = getIssueMonth(ticketingDate)
const currentPeriod = getCurrentReferencePeriod(issueMonth)
const fullNext = getFullNextReferencePeriod(ticketingDate)
const nextPrediction = getNextPredictionPeriod(ticketingDate, availableUntil, fullNext)
const cur = averageFor(currentPeriod)
const nextp = averageFor(nextPrediction)
const changeRate = cur.average === null || nextp.average === null ? null : ((nextp.average - cur.average)/cur.average)*100

// confidence: progressed days = days from fullNext.start to nextPrediction.end inclusive
const totalDays = diffDays(toDate(fullNext.start), toDate(fullNext.end)) + 1
const progressedDays = diffDays(toDate(fullNext.start), toDate(nextPrediction.end)) + 1
const progress = Math.max(0, Math.min(100, Math.round((progressedDays/totalDays)*100)))
const label = progress <30 ? '낮음' : progress <70 ? '보통' : '높음'

const recommendation = (rate)=>{
  if (rate===null) return 'NEUTRAL'
  if (rate >= 7) return 'BUY_NOW'
  if (rate <= -7) return 'WAIT'
  return 'NEUTRAL'
}

const out = {
  ticketingDate,
  availableUntil,
  issueMonth,
  currentPeriod,
  fullNext,
  nextPrediction,
  currentAverage: cur,
  nextPartialAverage: nextp,
  changeRate: changeRate===null? null: Number(changeRate.toFixed(4)),
  confidenceProgress: progress,
  confidenceLabel: label,
  recommendation: recommendation(changeRate)
}

console.log(JSON.stringify(out, null, 2))
