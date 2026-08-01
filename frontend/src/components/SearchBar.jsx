import { useState } from 'react';

export default function SearchBar({ categories, filters, onChange }) {
  const [search, setSearch] = useState(filters.search || '');

  function handleSubmit(e) {
    e.preventDefault();
    onChange({ ...filters, search, page: 1 });
  }

  function handleFieldChange(field, value) {
    onChange({ ...filters, [field]: value, page: 1 });
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search courses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search courses"
      />

      <select
        value={filters.category || ''}
        onChange={(e) => handleFieldChange('category', e.target.value || undefined)}
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <input
        type="number"
        min="0"
        placeholder="Min price"
        value={filters.minPrice ?? ''}
        onChange={(e) => handleFieldChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
        aria-label="Minimum price"
      />

      <input
        type="number"
        min="0"
        placeholder="Max price"
        value={filters.maxPrice ?? ''}
        onChange={(e) => handleFieldChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
        aria-label="Maximum price"
      />

      <button type="submit" className="btn btn-primary">
        Search
      </button>
    </form>
  );
}
