import React, { useState, useEffect } from 'react';
import '../style/search.css';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allPeople, setAllPeople] = useState([]);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await fetch('https://api.example.com/people');
        const data = await response.json();
        setAllPeople(data);
        setResults(data);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };

    fetchPeople();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const value = query.toLowerCase();
      const filtered = allPeople.filter(person =>
        person.name.toLowerCase().includes(value) ||
        person.username.toLowerCase().includes(value) ||
        person.email?.toLowerCase().includes(value) ||
        person.city?.toLowerCase().includes(value)
      );
      setResults(filtered);
    }, 300); // Espera 300ms antes de aplicar el filtro

    return () => clearTimeout(timeoutId);
  }, [query, allPeople]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        className="search-input"
        placeholder="Buscar por nombre, username, email o ciudad..."
        value={query}
        onChange={handleInputChange}
      />
      <ul>
        {results.map(person => (
          <li key={person.id}>
            {person.name} <span style={{ color: '#888' }}>({person.username})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Search;