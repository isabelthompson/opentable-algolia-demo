import { useState } from 'react';
import { useLocalNotes } from './useLocalNotes';
import { StepCard } from './StepCard';

// Wording taken from the prospect context (AE discovery notes), not rewritten
const SECTIONS = [
  {
    id: 'known',
    title: 'Users who know exactly what they are looking for',
    hint: 'They often know the restaurant name and want to find it quickly so they can book a table.',
    items: [
      'Restaurant names can be hard to spell or remember',
      'Typos, concatenated words, partial names, or alternate spellings can lead to poor results',
      'Some restaurant chains have multiple locations in the same city, making it hard to identify the correct one',
    ],
  },
  {
    id: 'explore',
    title: 'Users who do not know what they are looking for yet',
    hint: 'They want to browse, compare options, and get inspired.',
    items: [
      'The current experience does not support discovery well',
      'Users have limited ways to browse, refine, or get inspired',
      'The experience feels less modern than what users expect from consumer discovery platforms',
    ],
  },
  {
    id: 'goals',
    title: 'Business goals',
    hint: 'Increase usage of the platform and improve conversion into bookings.',
    items: [
      'Higher search quality',
      'A more modern user experience',
      'Better support for restaurant discovery and inspiration',
      'Increased platform usage',
      'Increased conversion from search or discovery sessions into bookings',
    ],
  },
];

const QUESTIONS = [
  { id: 'success', text: 'How do you measure search success today?', hint: 'Bookings from search? Searches with no results?' },
  { id: 'cuisine', text: 'Can we split combined cuisines into separate filters?', hint: 'Example: "Creole / Cajun / Southern" becomes three filters.' },
  { id: 'categories', text: 'Do you have an official list of cuisine categories?', hint: 'Steakhouse, for example, is a restaurant type, not a cuisine.' },
  { id: 'phone', text: 'Which file has the correct phone numbers?', hint: 'The two files use different formats.' },
  { id: 'price', text: 'Price level or price range: which one is right?', hint: 'They disagree for about 220 restaurants.' },
];

// "Saved" check that appears after an edit and fades out
function useSavedFlash() {
  const [flash, setFlash] = useState(null);
  function show(key) {
    setFlash(key);
    setTimeout(() => setFlash((current) => (current === key ? null : current)), 1500);
  }
  return [flash, show];
}

// Makes a textarea as tall as its text, so long bullets wrap instead of being cut
function autoGrow(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

// A list where every bullet can be edited, removed, or added during the call
function EditableList({ section, items, onChange, onSaved }) {
  const [draft, setDraft] = useState('');

  function update(index, text) {
    const next = [...items];
    next[index] = text;
    onChange(next);
  }
  function remove(index) {
    onChange(items.filter((_, i) => i !== index));
    onSaved();
  }
  function add(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    onChange([...items, draft.trim()]);
    setDraft('');
    onSaved();
  }

  return (
    <div className="heard-section">
      <h3>{section.title}</h3>
      <p className="hint">{section.hint}</p>
      <ul className="editable">
        {items.map((item, i) => (
          <li key={i}>
            <textarea
              rows={1}
              value={item}
              ref={autoGrow}
              onInput={(e) => autoGrow(e.currentTarget)}
              onChange={(e) => update(i, e.target.value)}
              onBlur={onSaved}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())}
            />
            <button type="button" className="remove" onClick={() => remove(i)} aria-label="Remove">×</button>
          </li>
        ))}
        <li className="add-row">
          <form onSubmit={add}>
            <input type="text" placeholder="Add something they said" value={draft} onChange={(e) => setDraft(e.target.value)} />
          </form>
        </li>
      </ul>
    </div>
  );
}

export function WhatWeHeard({ onContinue }) {
  // Everything typed here is kept in this browser, so it survives a refresh during the call
  const defaults = Object.fromEntries(SECTIONS.map((s) => [s.id, s.items]));
  const [lists, setLists] = useLocalNotes('heard-lists-v3', defaults);
  const [flash, showFlash] = useSavedFlash();

  return (
    <StepCard
      step={1}
      title="What we heard"
      subtitle="Based on your conversations with our team. Let's make sure we got it right."
      nextLabel="Looks right, next"
      onNext={onContinue}
    >
      {flash === 'heard' && <span className="saved-flash floating">Saved</span>}
      {SECTIONS.map((section) => (
        <EditableList
          key={section.id}
          section={section}
          items={lists[section.id] || section.items}
          onChange={(items) => setLists({ ...lists, [section.id]: items })}
          onSaved={() => showFlash('heard')}
        />
      ))}
    </StepCard>
  );
}

export function Questions({ onContinue, onBack }) {
  const [answers, setAnswers] = useLocalNotes('call-answers', {});
  const [flash, showFlash] = useSavedFlash();
  const answered = QUESTIONS.filter((q) => (answers[q.id] || '').trim()).length;

  return (
    <StepCard
      step={2}
      title="A few questions for you"
      subtitle={`Things I'd like to confirm before the demo. ${answered}/${QUESTIONS.length} answered.`}
      nextLabel="See it live"
      onNext={onContinue}
      onBack={onBack}
    >
      <ol className="qa">
        {QUESTIONS.map((q) => (
          <li key={q.id} className={(answers[q.id] || '').trim() ? 'done' : ''}>
            <div className="q-text">
              <p>{q.text}</p>
              <span className="hint">{q.hint}</span>
            </div>
            <div className="answer-row">
              <input
                type="text"
                placeholder="Type the answer and press Enter"
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                onBlur={() => (answers[q.id] || '').trim() && showFlash(q.id)}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              />
              {flash === q.id && <span className="saved-flash">Saved</span>}
            </div>
          </li>
        ))}
      </ol>
    </StepCard>
  );
}
