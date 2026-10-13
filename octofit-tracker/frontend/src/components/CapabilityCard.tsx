import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Props = {
  title: string;
  description: string;
  endpoint: string;
  dataKey: string;
  emptyText: string;
  itemText?: (item: Record<string, unknown>) => string;
};

export function CapabilityCard({ title, description, endpoint, dataKey, emptyText, itemText }: Props) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const data = await getJson<Record<string, unknown>>(endpoint);
        const collection = Array.isArray((data as Record<string, unknown>)[dataKey])
          ? ((data as Record<string, unknown>)[dataKey] as Record<string, unknown>[])
          : [];

        if (isMounted) {
          setItems(collection);
        }
      } catch (_error) {
        if (isMounted) {
          setItems([]);
          setError(`Unable to load ${title.toLowerCase()}.`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [dataKey, endpoint, title]);

  if (loading) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">{title}</h2>
          <p>{description}</p>
          <p role="status">Loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">{title}</h2>
          <p>{description}</p>
          <p role="alert">{error}</p>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">{title}</h2>
          <p>{description}</p>
          <p>{emptyText}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        <ul className="list-unstyled mb-0">
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>
              {itemText ? itemText(item) : String(item.name ?? item.title ?? item.type ?? item.teamName ?? 'Item')}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
