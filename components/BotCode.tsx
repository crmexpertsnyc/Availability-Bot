
import React from 'react';

const BotCode: React.FC = () => {
  const code = `/**
 * AvailabilityIQ - Google Chat poll bot + Google Sheets storage
 * Hard-scoped for: CRM Experts Online Core Team
 */

const CONFIG = {
  SPREADSHEET_ID: '1J19KZRbhr7shEikN1GgWDgrCKyWds-l4VvsLmA6FLac',
  USERS_SHEET: 'Users',
  RESPONSES_SHEET: 'Responses',
  POLLLOG_SHEET: 'PollLog',
  TIMEZONE: 'America/New_York',
  LEADERSHIP_SPACE_NAME: "spaces/AAQAaff1VdE"
};

const ALLOWED_EMAILS = new Set([
  "lorenna@service-push.com",
  "samantha@service-push.com",
  "daria@service-push.com",
  "jasmine@service-push.com",
  "myousaf@service-push.com",
  "hesham@service-push.com",
  "princess@service-push.com",
  "gwen@service-push.com"
]);

/**
 * NEW: API Endpoint for Dashboard
 * Returns current team status as JSON
 */
function doGet(e) {
  const users = getActiveUsersDetailed_();
  const pollId = todayPollId_();
  const resSheet = getSheet_(CONFIG.RESPONSES_SHEET);
  const responses = resSheet.getDataRange().getValues();
  
  // Filter for today's responses only
  const todayResponses = responses.filter(r => r[1] === pollId);

  const payload = users.map(u => {
    const userResp = todayResponses.find(r => r[2].toLowerCase() === u.email.toLowerCase());
    return {
      email: u.email,
      displayName: u.displayName,
      dmSpaceName: u.dmSpaceName,
      active: true,
      currentStatus: userResp ? userResp[4] : 'NO_RESPONSE',
      lastRespondedAt: userResp ? userResp[8] : null,
      notes: userResp ? userResp[7] : '',
      startTime: userResp ? userResp[5] : '',
      endTime: userResp ? userResp[6] : ''
    };
  });

  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const event = JSON.parse(e.postData.contents);
  const type = event.type;
  if (type === 'MESSAGE') return onMessage_(event);
  if (type === 'CARD_CLICKED') return onCardClick_(event);
  if (type === 'ADDED_TO_SPACE') return onAddedToSpace_(event);
  return { text: "AvailabilityIQ is active." };
}

function onMessage_(event) {
  const userEmail = (event.user && event.user.email) ? event.user.email.toLowerCase() : '';
  const displayName = event.user?.displayName || '';
  const spaceName = event.space?.name || '';
  const text = (event.message?.text || '').trim().toLowerCase();

  if (!ALLOWED_EMAILS.has(userEmail)) {
    return { text: "Enrollment Restricted: You are not on the core AvailabilityIQ roster." };
  }

  if (text === 'register') {
    upsertUser_(userEmail, displayName, spaceName, true);
    return { text: \`Thanks \${displayName}. You are registered for daily availability polls.\` };
  }

  return { text: "Hi! I'm AvailabilityIQ. Type \`register\` in this DM to enroll in daily checks." };
}

function onCardClick_(event) {
  const userEmail = event.user?.email || '';
  const displayName = event.user?.displayName || '';
  const spaceName = event.space?.name || '';
  const action = event.action || {};
  const params = {};
  (action.parameters || []).forEach(p => params[p.key] = p.value);

  const status = params.status || 'UNKNOWN';
  const pollId = params.pollId || todayPollId_();

  const formInputs = (event.common && event.common.formInputs) ? event.common.formInputs : {};
  const startTime = readFormInput_(formInputs, 'startTime');
  const endTime = readFormInput_(formInputs, 'endTime');
  const notes = readFormInput_(formInputs, 'notes');

  appendResponse_({
    date: todayPollId_(),
    pollId, email: userEmail, displayName, status,
    startTime, endTime, notes, respondedAt: new Date().toISOString(), spaceName
  });

  return { text: \`Recorded: \${status}. Thank you!\` };
}

function readFormInput_(fi, key) {
  if (!fi[key] || !fi[key].stringInputs || !fi[key].stringInputs.value) return '';
  return fi[key].stringInputs.value[0] || '';
}

/** 
 * TRIGGER JOBS
 */
function runPoll_9am() { runPollInternal_("9AM"); }
function runPoll_12pm() { runPollInternal_("12PM"); }

function runPollInternal_(runLabel) {
  const users = getActiveUsersDetailed_();
  const pollId = todayPollId_();
  users.forEach(u => {
    if (!hasRespondedToday_(u.email, pollId)) {
      sendPollToUser_(u, pollId, runLabel);
    }
  });
}

function runManagerSummary_1205() {
  const pollId = todayPollId_();
  const nonResponders = getNonRespondersDetailed_(pollId);
  const header = \`AvailabilityIQ – Non-Responders (\${pollId})\`;
  const body = nonResponders.length
    ? nonResponders.map(u => \`• \${u.displayName} (\${u.email})\`).join('\\n')
    : "All polled team members have responded.";
  
  Chat.Spaces.Messages.create({ text: \`\${header}\\n\\n\${body}\` }, CONFIG.LEADERSHIP_SPACE_NAME);
}

/**
 * PERSISTENCE & HELPERS
 */
function hasRespondedToday_(email, pollId) {
  const values = getSheet_(CONFIG.RESPONSES_SHEET).getDataRange().getValues();
  for (let r = values.length - 1; r >= 1; r--) {
    if (values[r][2].toLowerCase() === email.toLowerCase() && values[r][1] === pollId) return true;
  }
  return false;
}

function sendPollToUser_(u, pollId, label) {
  const message = buildPollCardMessage_(pollId);
  try {
    Chat.Spaces.Messages.create(message, u.dmSpaceName);
    appendPollLog_({ date: pollId, pollId, email: u.email, spaceName: u.dmSpaceName, sentAt: new Date().toISOString(), sendStatus: \`SENT_\${label}\` });
  } catch (e) {
    appendPollLog_({ date: pollId, pollId, email: u.email, spaceName: u.dmSpaceName, sentAt: new Date().toISOString(), sendStatus: 'FAILED', error: String(e) });
  }
}

function buildPollCardMessage_(pollId) {
  return {
    cardsV2: [{
      cardId: \`poll_\${pollId}\`,
      card: {
        header: { title: "Daily Availability", subtitle: pollId },
        sections: [{
          widgets: [
            { textParagraph: { text: "Confirm your availability for today:" } },
            { textInput: { name: "startTime", label: "Start (optional)" } },
            { textInput: { name: "endTime", label: "End (optional)" } },
            { textInput: { name: "notes", label: "Notes" } },
            {
              buttonList: {
                buttons: [
                  { text: "Available", onClick: { action: { actionMethodName: "submit", parameters: [{key:"pollId", value:pollId},{key:"status", value:"AVAILABLE"}] } } },
                  { text: "Limited", onClick: { action: { actionMethodName: "submit", parameters: [{key:"pollId", value:pollId},{key:"status", value:"LIMITED"}] } } },
                  { text: "Unavailable", onClick: { action: { actionMethodName: "submit", parameters: [{key:"pollId", value:pollId},{key:"status", value:"UNAVAILABLE"}] } } }
                ]
              }
            }
          ]
        }]
      }
    }]
  };
}

function getSheet_(name) { return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(name); }
function todayPollId_() { return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd"); }

function upsertUser_(email, name, space, active) {
  const sh = getSheet_(CONFIG.USERS_SHEET);
  const data = sh.getDataRange().getValues();
  for(let i=1; i<data.length; i++) {
    if(data[i][0].toLowerCase() === email.toLowerCase()) {
      sh.getRange(i+1, 2, 1, 3).setValues([[name, space, active]]);
      return;
    }
  }
  sh.appendRow([email, name, space, active]);
}

function getActiveUsersDetailed_() {
  const data = getSheet_(CONFIG.USERS_SHEET).getDataRange().getValues();
  const out = [];
  for(let i=1; i<data.length; i++) {
    if(data[i][2] && String(data[i][3]).toLowerCase() === 'true') {
      out.push({ email: data[i][0], displayName: data[i][1], dmSpaceName: data[i][2] });
    }
  }
  return out;
}

function getNonRespondersDetailed_(pollId) {
  const users = getActiveUsersDetailed_();
  const res = getSheet_(CONFIG.RESPONSES_SHEET).getDataRange().getValues();
  const responded = new Set(res.filter(r => r[1] === pollId).map(r => r[2].toLowerCase()));
  return users.filter(u => !responded.has(u.email.toLowerCase()));
}

function appendResponse_(r) { getSheet_(CONFIG.RESPONSES_SHEET).appendRow([r.date, r.pollId, r.email, r.displayName, r.status, r.startTime, r.endTime, r.notes, r.respondedAt, r.spaceName]); }
function appendPollLog_(l) { getSheet_(CONFIG.POLLLOG_SHEET).appendRow([l.date, l.pollId, l.email, l.spaceName, l.sentAt, l.sendStatus, l.error || '']); }
function onAddedToSpace_(e) { return { text: "AvailabilityIQ added. Type \`register\` to enroll." }; }
`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Deployment Hub</h2>
          <p className="text-slate-500 font-medium">Setup your Google Sheets and Apps Script project.</p>
        </div>
        <button 
           onClick={() => {
              navigator.clipboard.writeText(code);
              alert("Production code copied to clipboard!");
           }}
           className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 shadow-xl shadow-slate-200 active:scale-95 transition-all"
        >
          Copy Script Code
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-[#1e1e1e] border-none shadow-2xl">
            <div className="flex gap-2 mb-4 items-center">
               <div className="w-3 h-3 rounded-full bg-rose-500"></div>
               <div className="w-3 h-3 rounded-full bg-amber-500"></div>
               <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
               <span className="text-[10px] text-slate-500 font-mono ml-2 uppercase tracking-widest">availability-iq-production.gs</span>
            </div>
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <pre className="text-[11px] font-mono text-indigo-200 p-4 leading-relaxed">
                {code}
              </pre>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Sheet Schema</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-indigo-600 mb-1">Tab: "Users"</p>
                <code className="text-[10px] block bg-slate-50 p-2 rounded border border-slate-100 font-mono text-slate-500">
                  Email, Name, DM Space ID, Active
                </code>
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-600 mb-1">Tab: "Responses"</p>
                <code className="text-[10px] block bg-slate-50 p-2 rounded border border-slate-100 font-mono text-slate-500">
                  Date, Poll ID, Email, Name, Status, Start Time, End Time, Notes, Responded At, Space Name
                </code>
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-600 mb-1">Tab: "PollLog"</p>
                <code className="text-[10px] block bg-slate-50 p-2 rounded border border-slate-100 font-mono text-slate-500">
                  Date, Poll ID, Email, Space ID, Sent At, Send Status, Error
                </code>
              </div>
            </div>
          </div>

          <div className="p-6 bg-indigo-600 rounded-3xl text-white">
            <h3 className="font-bold mb-2">Pro Tip</h3>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Don't forget to enable the <strong>"Google Chat API"</strong> in your GCP Console and the <strong>"Advanced Chat Service"</strong> in your Apps Script Editor.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
            { step: 1, title: 'Project Creation', desc: 'Paste the script at script.google.com' },
            { step: 2, title: 'Schema Setup', desc: 'Create the 3 tabs listed above with their exact headers' },
            { step: 3, title: 'Triggers', desc: 'Set time-based triggers for 9:00 AM, 12:00 PM, and 12:05 PM' },
         ].map(step => (
            <div key={step.step} className="glass-panel p-6 rounded-3xl">
               <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center mb-3">
                  {step.step}
               </div>
               <h4 className="font-bold text-slate-800 mb-1">{step.title}</h4>
               <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
         ))}
      </div>
    </div>
  );
};

export default BotCode;
