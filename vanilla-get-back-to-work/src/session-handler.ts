import Config from "./config"

type Session = {
    startTimestamp: number
    secondsLeft: number
    cooldownUntil: number
    timer: NodeJS.Timeout
    activeTab: number
}

type DailySession = {
    secondsLeft: number
    isoDate: string
}

let currentSession: Session = undefined as unknown as Session;
let dailySession: DailySession = undefined as unknown as DailySession;

export async function StartSession(tabId: number){
    console.log(`${JSON.stringify(currentSession)}, ${JSON.stringify(dailySession)}`)
    console.log(tabId)
    await _LoadLocalStorage(false);

    if (dailySession.isoDate != _IsoDate()){
        dailySession.isoDate = _IsoDate();
        dailySession.secondsLeft = Config.DAILY_TIMEOUT
    }

    if (currentSession.activeTab !== 0){
        throw new Error('Trying to start a new session, when another one is active. something went wrong.');
    }

    if (dailySession.secondsLeft <= 0) { // Daily limit reached
        onAccessBlocked('daily', tabId);
        return;
    }
    if (currentSession.secondsLeft > 0) { // Session can be resumed
        if (Date.now() <= currentSession.cooldownUntil) { // Cooldown didnt pass yet, no need to reset session
            _ResumeSession(tabId);
        } else {
            _StartNewSession(tabId);
        }
    } else { // Check if cooldown is active
        if (Date.now() <= currentSession.cooldownUntil){
            console.log('access denied')
            onAccessBlocked('session', tabId);
            return;
        } else {
            _StartNewSession(tabId);
        }
    }
}

export async function StopSession(){
    console.log('StopSession')
    await _LoadLocalStorage(false);
    clearInterval(currentSession.timer);
    currentSession.activeTab = 0;
}
function onSessionTimeout(){
    _Redirect(`Session Timeout.\nTime left today: ${_GenerateTimerText(dailySession.secondsLeft)}`)
    StopSession();
}
function onDailyTimeout(){
    _Redirect('Daily Timeout');
    StopSession();
}
function onAccessBlocked(reason: 'session' | 'daily', tabId: number){
    if (reason == 'session'){
        const timeLeft = _GenerateTimerText(Math.floor((currentSession.cooldownUntil - Date.now()) / 1000));
        _Redirect(`Access blocked - Session expired. \nYou will regain access in ${timeLeft}`, tabId);
    } else {
        _Redirect(`Access blocked - Daily limit reached. \nYou will regain access at midnight`, tabId);
    }
}

function _StartNewSession(tabId: number){
    console.log('StartNewSession')
    currentSession = {
        startTimestamp: Date.now(),
        secondsLeft: Config.SESSION_TIMEOUT,
        cooldownUntil: newCooldown(),
        timer: setInterval(_tick, 1000),
        activeTab: tabId
    }
}

function _ResumeSession(tabId: number){
    console.log('ResumeSession')

    currentSession.activeTab = tabId;
    currentSession.timer = setInterval(_tick, 1000);
    currentSession.cooldownUntil = newCooldown();
}

async function _tick(){
    currentSession.secondsLeft--;
    dailySession.secondsLeft--;
    await _SyncLocalStorage(currentSession, dailySession);
    if (currentSession.secondsLeft <= 0){
        onSessionTimeout();
        return;
    }
    if (dailySession.secondsLeft <= 0) {
        onDailyTimeout();
        return;
    }
    _UpdateTimer();
    console.log(JSON.stringify(currentSession))
}

async function _SyncLocalStorage(_session: Session, _dailySession: DailySession){
    await chrome.storage.local.set({
        session: _session,
        dailySession: _dailySession
    });
}

async function _LoadLocalStorage(force: boolean = false): Promise<{session: Session, dailySession: DailySession}> {
    if (force || (currentSession === undefined || dailySession.secondsLeft === undefined)) {
        const fromStorage = await chrome.storage.local.get(['session', 'dailySession'])
        currentSession = fromStorage['session'] || {
            startTimestamp: Date.now(),
            secondsLeft: 0,
            cooldownUntil: 0,
            timer: undefined as unknown as NodeJS.Timeout,
            activeTab: 0
        };
        dailySession = fromStorage['dailySession'] || {
            secondsLeft: Config.DAILY_TIMEOUT,
            isoDate: _IsoDate()
        }
    }
    return {
        session: currentSession,
        dailySession: dailySession
    };
}

async function _UpdateTimer(){
    const secondsLeft = Math.min(currentSession.secondsLeft, dailySession.secondsLeft);
    await chrome.tabs.sendMessage(currentSession.activeTab, {
        action: 'updateTimer', 
        text: _GenerateTimerText(secondsLeft)
    });
}

async function _Redirect(message: string, tabId: number = currentSession.activeTab){
    chrome.scripting.executeScript({
        target: {
            tabId: tabId
        },
        args: [tabId, message],
        func: (_tabId: number, _message: string): number => {
            alert(_message)
            return _tabId;
        }
    }, (result) => {
        chrome.tabs.update(result[0].result!, { url: 'https://www.google.com' });
    })
}

// Utilities

const newCooldown = (): number => Date.now() + Config.SESSION_COOLDOWN * 1000;

function _GenerateTimerText(secondsLeft: number): string {
    const padLeft = (string: string, pad = '0', length = 2) => {
        return (new Array(length + 1).join(pad) + string).slice(-length);
    }
    const minutes = Math.floor(secondsLeft / 60)
    const seconds = secondsLeft - minutes * 60;
    return `${padLeft(minutes.toString())}:${padLeft(seconds.toString())}`;
}

/**
 * 
 * @param date 
 * @returns date provided (or new Date() if not provided) as a ISO String (YYYY-MM-DD)
 */
function _IsoDate(date: Date = new Date()){
    return date.toISOString().split('T')[0];
}