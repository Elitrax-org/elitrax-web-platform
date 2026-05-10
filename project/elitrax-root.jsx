// Root App — receives tweaks as props from Root in HTML
const {
  C, font,
  SplashScreen, LoginScreen, OnboardingScreen,
  BottomNav, HomeScreen, SessionsScreen, LiveScreen,
  SessionDetailScreen, HeatmapScreen, ProfileScreen, AIChatOverlay,
  SessionWizard,
} = window;

function App({ tweaks = {} }) {
  // Apply tweaks to shared USER
  React.useEffect(() => {
    if (tweaks.plan)     window.USER.plan = tweaks.plan;
    if (tweaks.userName) window.USER.name = tweaks.userName;
  }, [tweaks.plan, tweaks.userName]);

  // Auth flow
  const [authStep, setAuthStep] = React.useState('splash');

  // Main nav
  const [tab,     setTab]     = React.useState('home');
  const [subView, setSubView] = React.useState(null);
  const [session, setSession] = React.useState(null);
  const [aiOpen,  setAiOpen]  = React.useState(false);

  const [animKey, setAnimKey] = React.useState(0);
  const navigate = (fn) => { fn(); setAnimKey(k => k + 1); };

  // Auth
  const [deporte, setDeporte] = React.useState(null);

  const goLogin   = () => navigate(() => setAuthStep('login'));
  const goBack    = () => navigate(() => setAuthStep('splash'));
  const goOnboard = () => navigate(() => setAuthStep('onboarding'));
  const goSport   = () => navigate(() => setAuthStep('sport'));
  const goApp     = () => navigate(() => { setAuthStep('app'); setTab('home'); setSubView(null); });
  const handleSportSelect = (d) => { setDeporte(d); navigate(() => { setAuthStep('app'); setTab('home'); setSubView(null); }); };
  const signOut   = () => navigate(() => { setAuthStep('splash'); setTab('home'); setSubView(null); setAiOpen(false); });

  // App nav
  const goTab       = (t) => navigate(() => { setTab(t); setSubView(null); });
  const startLive   = ()  => navigate(() => setSubView('wizard'));
  const stopLive    = ()  => navigate(() => { setSubView(null); setTab('sessions'); });
  const openDetail  = (s) => navigate(() => { setSession(s); setSubView('detail'); });
  const openHeatmap = ()  => navigate(() => setSubView('heatmap'));
  const backDetail  = ()  => navigate(() => setSubView('detail'));
  const backToList  = ()  => navigate(() => setSubView(null));

  const fs = tweaks.fontSize || 1;

  const Screen = ({ children }) => (
    <div key={animKey} style={{
      height:'100%', background:C.bg, display:'flex', flexDirection:'column',
      animation:'screenIn 0.28s cubic-bezier(0.25,0.46,0.45,0.94)',
      position:'relative', overflow:'hidden',
      fontSize: `${fs}em`,
    }}>
      {children}
    </div>
  );

  const showNav   = authStep === 'app' && subView !== 'live';
  const showAIFab = authStep === 'app' && subView !== 'live' && !aiOpen;
  const { VitrinaScreen } = window;
  const glowAlpha = tweaks.liveGlowIntensity || 0.45;

  return (
    <Screen>
      {/* ── Auth ─────────────────────────────────────────────── */}
      {authStep !== 'app' && (
        <div style={{ paddingTop:60, height:'100%', boxSizing:'border-box' }}>
          {authStep === 'splash'     && <SplashScreen onLogin={goLogin} onRegister={goLogin} />}
          {authStep === 'login'      && <LoginScreen  onBack={goBack}   onSuccess={goOnboard} />}
          {authStep === 'onboarding' && <OnboardingScreen onDone={goSport} />}
          {authStep === 'sport'      && <SportSelectionScreen onSelect={handleSportSelect} />}
        </div>
      )}

      {/* ── Main app ─────────────────────────────────────────── */}
      {authStep === 'app' && (
        <>
          <div style={{ height:60, flexShrink:0 }} />
          <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
            {subView === 'wizard'  && <SessionWizard onCancel={backToList} onStart={(d) => { navigate(() => setSubView('live')); }} />}
            {subView === 'live'    && <LiveScreen onStop={stopLive} />}
            {subView === 'detail'  && session && (
              <SessionDetailScreen
                session={session}
                onBack={backToList}
                onHeatmap={openHeatmap}
                showExplosivity={tweaks.showExplosivity !== false}
              />
            )}
            {subView === 'heatmap' && session && <HeatmapScreen session={session} onBack={backDetail} />}
            {!subView && tab === 'home'     && <HomeScreen onStartLive={startLive} onSessionDetail={openDetail} />}
            {!subView && tab === 'sessions' && <SessionsScreen onDetail={openDetail} />}
            {!subView && tab === 'vitrina'  && <VitrinaScreen />}
            {!subView && tab === 'profile'  && <ProfileScreen onSignOut={signOut} />}
          </div>

          {showNav && (
            <BottomNav tab={subView ? null : tab} onChange={goTab} onAI={() => setAiOpen(true)} />
          )}

          {aiOpen && <AIChatOverlay onClose={() => setAiOpen(false)} />}

          {showAIFab && (
            <button onClick={() => setAiOpen(true)} style={{
              position:'absolute', bottom:88, right:16, zIndex:50,
              width:52, height:52, borderRadius:'50%',
              background:`linear-gradient(135deg, ${C.naranja} 0%, #D4502A 100%)`,
              border:'none', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:`0 6px 20px rgba(243,108,58,${glowAlpha})`,
            }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="9" r="6" stroke="white" strokeWidth="1.6"/>
                <circle cx="8.5" cy="9" r="1" fill="white"/>
                <circle cx="13.5" cy="9" r="1" fill="white"/>
                <path d="M5.5 14C4 15.5 3.5 18 3.5 18h15s-.5-2.5-2-4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </>
      )}
    </Screen>
  );
}

Object.assign(window, { ElitraxApp: App });
