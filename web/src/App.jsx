import { useRef, useState } from 'react';
import { InstantSearch } from 'react-instantsearch';
import { searchClient, INDEXES } from './search/searchClient';
import { basicSearchClient } from './search/basicSearchClient';
import { SearchExperience } from './search/SearchExperience';
import { CompareStrip } from './search/CompareStrip';
import { LOCATIONS } from './search/locations';
import { TopBar } from './story/TopBar';
import { WhatWeHeard, Questions } from './story/WhatWeHeard';
import { Scenarios } from './story/Scenarios';

export default function App() {
  const [page, setPage] = useState('heard');
  const [mode, setMode] = useState('after');
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [activeScenario, setActiveScenario] = useState(null);
  // Latest search state (query, filters), written from InstantSearch's change handler
  const lastUiState = useRef({});
  // State handed to InstantSearch when it remounts on a mode switch
  const [initialUiState, setInitialUiState] = useState({});

  // Switching Before/After keeps the same query and filters on the other side
  function changeMode(nextMode) {
    const current = lastUiState.current[INDEXES[mode]] || {};
    setInitialUiState({ [INDEXES[nextMode]]: current });
    setMode(nextMode);
  }

  return (
    <>
      <TopBar page={page} onPageChange={setPage} />
      {page === 'heard' && <WhatWeHeard onContinue={() => setPage('questions')} />}
      {page === 'questions' && <Questions onContinue={() => setPage('demo')} onBack={() => setPage('heard')} />}
      {page === 'demo' && (
        <main className="page demo-page">
          <InstantSearch
            key={mode}
            searchClient={mode === 'before' ? basicSearchClient : searchClient}
            indexName={INDEXES[mode]}
            initialUiState={initialUiState}
            onStateChange={({ uiState, setUiState }) => {
              lastUiState.current = uiState;
              setUiState(uiState);
            }}
          >
            <div className="demo-head">
              <div>
                <span className="step-kicker">Step 3 of 3</span>
                <h1>Live demo</h1>
                <p className="subtle">5,000 OpenTable restaurants. Before: the data as it came, with a basic search. After: cleaned data on Algolia.</p>
              </div>
            </div>
            <Scenarios onLocationChange={setLocation} active={activeScenario} setActive={setActiveScenario} />
            <CompareStrip mode={mode} onModeChange={changeMode} location={location} scenario={activeScenario} onClose={() => setActiveScenario(null)} />
            <SearchExperience location={location} onLocationChange={setLocation} mode={mode} />
          </InstantSearch>
        </main>
      )}
    </>
  );
}
