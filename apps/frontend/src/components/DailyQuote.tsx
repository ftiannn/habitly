import { useState, useEffect } from 'react';
import { Quote } from '@/types';
import { quotes } from '@/constants/quotes';

export const DailyQuote = () => {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);

  if (!quote) return null;

  return (
    <div className="mx-4 mb-4 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
      <p className="text-sm italic text-gray-700 dark:text-gray-100">
        “{quote.quote}”
      </p>
      <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
        — {quote.author}
      </p>
    </div>

  );
};
