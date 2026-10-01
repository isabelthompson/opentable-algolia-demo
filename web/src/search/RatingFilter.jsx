import { useNumericMenu } from 'react-instantsearch';

// React InstantSearch has no ready-made rating widget, so I built one with the
// useNumericMenu hook: the hook handles the search logic, I only draw the buttons.
export function RatingFilter() {
  const { items, refine } = useNumericMenu({
    attribute: 'stars_count',
    items: [
      { label: 'Any rating' },
      { label: '4.5 and up', start: 4.5 },
      { label: '4.0 and up', start: 4 },
    ],
  });

  return (
    <div className="rating-filter">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className={item.isRefined ? 'chip active' : 'chip'}
          onClick={() => refine(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
