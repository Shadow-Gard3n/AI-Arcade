// import { useState } from 'react';
// import { Link } from 'react-router-dom';

// export default function SemantiGuess() {
//   const [sessionId] = useState(() => {
//     let id = localStorage.getItem('ai_arcade_session');
//     if (!id) {
//       id = 'user_' + Math.random().toString(36).substr(2, 9);
//       localStorage.setItem('ai_arcade_session', id);
//     }
//     return id;
//   });

//   const [guess, setGuess] = useState('');
//   const [history, setHistory] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [hasWon, setHasWon] = useState(false);
  
//   // NEW STATE: For tracking the Top 50 list
//   const [topWords, setTopWords] = useState([]);
//   const [showingTop, setShowingTop] = useState(false);

//   const API_URL = 'https://aryangahlot-ai-arcade.hf.space/api/contexto';

//   const handleGuess = async (e, forceWord = null) => {
//     if (e) e.preventDefault();
//     const wordToGuess = forceWord || guess.trim();
//     if (!wordToGuess || hasWon) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(`${API_URL}/guess`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ word: wordToGuess.toLowerCase(), session_id: sessionId })
//       });

//       const data = await response.json();

//       if (data.error) {
//         setError(data.error);
//       } else {
//         if (data.rank === 1) setHasWon(true);
//         setHistory(prev => {
//           if (prev.some(item => item.guess === data.guess)) return prev;
//           return [...prev, data].sort((a, b) => a.rank - b.rank);
//         });
//       }
//     } catch (err) {
//       setError("Failed to connect to the server.");
//     } finally {
//       setLoading(false);
//       setGuess('');
//     }
//   };

//   const handleHint = async () => {
//     setLoading(true);
//     const bestRank = history.length > 0 ? Math.min(...history.map(h => h.rank)) : -1;

//     try {
//       const response = await fetch(`${API_URL}/hint`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ session_id: sessionId, best_rank: bestRank })
//       });
//       const data = await response.json();
      
//       setHistory(prev => {
//         const isDuplicate = prev.some(item => item.guess === data.guess || item.guess === `💡 ${data.guess}`);
//         if (isDuplicate) return prev; 
        
//         // FIX: Create a completely new object for the hint so Strict Mode doesn't double-mutate it
//         const newHintItem = {
//           ...data,
//           guess: `💡 ${data.guess}`
//         };
        
//         return [...prev, newHintItem].sort((a, b) => a.rank - b.rank);
//       });
//     } catch (err) {
//       setError("Failed to get hint.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGiveUp = async () => {
//     try {
//       const response = await fetch(`${API_URL}/give-up`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ session_id: sessionId })
//       });
//       const data = await response.json();
//       handleGuess(null, data.secret_word);
//     } catch (err) {
//       setError("Failed to reveal word.");
//     }
//   };

//   const handleNewGame = async () => {
//     try {
//       await fetch(`${API_URL}/new-game`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ session_id: sessionId })
//       });
//       setHistory([]);
//       setHasWon(false);
//       setError(null);
      
//       // Clear the top words when starting a new game
//       setTopWords([]);
//       setShowingTop(false);
//     } catch (err) {
//       setError("Failed to start new game.");
//     }
//   };

//   // NEW FUNCTION: Fetch the Top 50 list
//   const handleShowTopWords = async () => {
//     if (showingTop) {
//       setShowingTop(false);
//       return;
//     }
    
//     setLoading(true);
//     try {
//       const response = await fetch(`${API_URL}/top-words`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ session_id: sessionId })
//       });
//       const data = await response.json();
//       setTopWords(data.words);
//       setShowingTop(true);
//     } catch (err) {
//       setError("Failed to fetch top words.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getRankStyle = (rank) => {
//     if (rank === 1) return { bg: '#2563eb', text: 'white', border: '#3b82f6', bar: 'white' }; 
//     if (rank <= 100) return { bg: '#1e3a8a', text: '#e0e7ff', border: '#2563eb', bar: '#60a5fa' }; 
//     if (rank <= 1000) return { bg: '#1e293b', text: '#94a3b8', border: '#334155', bar: '#3b82f6' }; 
//     return { bg: '#121212', text: '#64748b', border: '#27272a', bar: '#1e293b' }; 
//   };

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#05050a', padding: '40px 20px', width: '100%' }}>
//       <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        
//         <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
//           <Link to="/" style={{ textDecoration: 'none', color: '#60a5fa', fontWeight: 'bold', fontSize: '1.1rem' }}>← Arcade</Link>
//           <button onClick={handleNewGame} style={{ background: 'transparent', border: '1px solid #3b82f6', color: '#60a5fa', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' }}>
//             New Game
//           </button>
//         </header>

//         <div style={{ textAlign: 'center', marginBottom: '40px' }}>
//           <h1 style={{ color: '#ffffff', fontSize: '3rem', margin: '0 0 10px 0', letterSpacing: '-1px' }}>Semanti<span style={{ color: '#3b82f6' }}>Guess</span></h1>
//           <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem' }}>Find the secret word.</p>
//         </div>

//         {hasWon && (
//           <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', border: '2px solid #3b82f6', padding: '25px', borderRadius: '16px', textAlign: 'center', marginBottom: '30px', boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' }}>
//             <h2 style={{ color: '#60a5fa', margin: '0 0 10px 0' }}>🎯 Target Acquired!</h2>
//             <p style={{ color: '#e2e8f0', margin: '0 0 20px 0' }}>Total guesses: {history.length}</p>
            
//             {/* NEW BUTTON: Toggle Top 50 */}
//             <button onClick={handleShowTopWords} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
//               {showingTop ? 'Hide Top 50 Words' : 'View Top 50 Words'}
//             </button>
//           </div>
//         )}

//         {/* NEW COMPONENT: Top 50 Grid */}
//         {showingTop && (
//           <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e3a8a', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
//             <h3 style={{ color: '#60a5fa', marginTop: 0, textAlign: 'center' }}>Top 50 Closest Words</h3>
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
//               {topWords.map((item, index) => (
//                 <div key={index} style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <span style={{ color: '#e2e8f0', textTransform: 'capitalize', fontSize: '0.9rem' }}>{item.word}</span>
//                   <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '0.9rem' }}>{item.rank}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Only show the guess form if they haven't won and aren't looking at the top list */}
//         {!hasWon && (
//           <form onSubmit={handleGuess} style={{ display: 'flex', gap: '12px', marginBottom: '25px' }}>
//             <input 
//               type="text" 
//               value={guess}
//               onChange={(e) => setGuess(e.target.value)}
//               placeholder="Type your guess..."
//               disabled={loading}
//               style={{ flex: 1, padding: '18px 25px', fontSize: '18px', borderRadius: '12px', border: '2px solid #1e293b', backgroundColor: '#0f172a', color: 'white', outline: 'none' }}
//               autoFocus
//             />
//             <button type="submit" disabled={loading} style={{ padding: '0 35px', fontSize: '18px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
//               {loading ? '...' : 'Guess'}
//             </button>
//           </form>
//         )}

//         {!hasWon && (
//           <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
//             <button onClick={handleHint} disabled={loading} style={{ background: '#0f172a', color: '#60a5fa', border: '1px solid #1e3a8a', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
//               💡 Hint
//             </button>
//             <button onClick={handleGiveUp} disabled={loading} style={{ background: 'transparent', color: '#64748b', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>
//               I Give Up
//             </button>
//           </div>
//         )}

//         {error && <p style={{ color: '#ef4444', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</p>}

//         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//           {history.map((item, index) => {
//             const style = getRankStyle(item.rank);
//             return (
//               <div key={index} style={{ 
//                 display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                 padding: '18px 24px',
//                 backgroundColor: style.bg, color: style.text,
//                 borderRadius: '12px', border: `1px solid ${style.border}`,
//               }}>
//                 <strong style={{ fontSize: '1.2rem', textTransform: 'capitalize', letterSpacing: '0.5px' }}>{item.guess}</strong>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
//                   <div style={{ height: '8px', width: '120px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
//                     <div style={{ height: '100%', width: `${Math.max(0, 100 - (item.rank / 100))}%`, backgroundColor: style.bar, transition: 'width 0.5s ease-out' }} />
//                   </div>
//                   <span style={{ fontSize: '1.2rem', fontWeight: 'bold', minWidth: '55px', textAlign: 'right' }}>{item.rank}</span>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SemantiGuess() {
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('ai_arcade_session');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ai_arcade_session', id);
    }
    return id;
  });

  const [guess, setGuess] = useState('');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  
  const [topWords, setTopWords] = useState([]);
  const [showingTop, setShowingTop] = useState(false);

  const API_URL = 'https://aryangahlot-ai-arcade.hf.space/api/contexto';

  const handleGuess = async (e, forceWord = null) => {
    if (e) e.preventDefault();
    const wordToGuess = forceWord || guess.trim();
    if (!wordToGuess || hasWon) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: wordToGuess.toLowerCase(), session_id: sessionId })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        if (data.rank === 1) setHasWon(true);
        setHistory(prev => {
          if (prev.some(item => item.guess === data.guess)) return prev;
          return [...prev, data].sort((a, b) => a.rank - b.rank);
        });
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
      setGuess('');
    }
  };

  const handleHint = async () => {
    setLoading(true);
    const bestRank = history.length > 0 ? Math.min(...history.map(h => h.rank)) : -1;

    try {
      const response = await fetch(`${API_URL}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, best_rank: bestRank })
      });
      const data = await response.json();
      
      setHistory(prev => {
        const isDuplicate = prev.some(item => item.guess === data.guess || item.guess === `💡 ${data.guess}`);
        if (isDuplicate) return prev; 
        
        const newHintItem = {
          ...data,
          guess: `💡 ${data.guess}`
        };
        
        return [...prev, newHintItem].sort((a, b) => a.rank - b.rank);
      });
    } catch (err) {
      setError("Failed to get hint.");
    } finally {
      setLoading(false);
    }
  };

  const handleGiveUp = async () => {
    try {
      const response = await fetch(`${API_URL}/give-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });
      const data = await response.json();
      handleGuess(null, data.secret_word);
    } catch (err) {
      setError("Failed to reveal word.");
    }
  };

  const handleNewGame = async () => {
    try {
      await fetch(`${API_URL}/new-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });
      setHistory([]);
      setHasWon(false);
      setError(null);
      
      setTopWords([]);
      setShowingTop(false);
    } catch (err) {
      setError("Failed to start new game.");
    }
  };

  const handleShowTopWords = async () => {
    if (showingTop) {
      setShowingTop(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/top-words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });
      const data = await response.json();
      setTopWords(data.words);
      setShowingTop(true);
    } catch (err) {
      setError("Failed to fetch top words.");
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return { bg: '#2563eb', text: 'white', border: '#3b82f6', bar: 'white' }; 
    if (rank <= 100) return { bg: '#1e3a8a', text: '#e0e7ff', border: '#2563eb', bar: '#60a5fa' }; 
    if (rank <= 1000) return { bg: '#1e293b', text: '#94a3b8', border: '#334155', bar: '#3b82f6' }; 
    return { bg: '#121212', text: '#64748b', border: '#27272a', bar: '#1e293b' }; 
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#05050a', padding: 'clamp(20px, 5vh, 40px) clamp(15px, 4vw, 20px)', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto', boxSizing: 'border-box' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(20px, 5vh, 40px)' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#60a5fa', fontWeight: 'bold', fontSize: '1.1rem' }}>← Arcade</Link>
          <button onClick={handleNewGame} style={{ background: 'transparent', border: '1px solid #3b82f6', color: '#60a5fa', padding: '8px clamp(15px, 4vw, 20px)', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' }}>
            New Game
          </button>
        </header>

        <div style={{ textAlign: 'center', marginBottom: 'clamp(25px, 6vh, 40px)' }}>
          <h1 style={{ color: '#ffffff', fontSize: 'clamp(2.2rem, 8vw, 3rem)', margin: '0 0 10px 0', letterSpacing: '-1px' }}>Semanti<span style={{ color: '#3b82f6' }}>Guess</span></h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: 'clamp(0.95rem, 3vw, 1.1rem)' }}>Find the secret word.</p>
        </div>

        {hasWon && (
          <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', border: '2px solid #3b82f6', padding: 'clamp(15px, 4vw, 25px)', borderRadius: '16px', textAlign: 'center', marginBottom: '30px', boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' }}>
            <h2 style={{ color: '#60a5fa', margin: '0 0 10px 0', fontSize: 'clamp(1.2rem, 5vw, 1.5rem)' }}>🎯 Target Acquired!</h2>
            <p style={{ color: '#e2e8f0', margin: '0 0 20px 0' }}>Total guesses: {history.length}</p>
            
            <button onClick={handleShowTopWords} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px clamp(15px, 4vw, 24px)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', maxWidth: '250px' }}>
              {showingTop ? 'Hide Top 50 Words' : 'View Top 50 Words'}
            </button>
          </div>
        )}

        {showingTop && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e3a8a', borderRadius: '12px', padding: 'clamp(15px, 4vw, 20px)', marginBottom: '30px' }}>
            <h3 style={{ color: '#60a5fa', marginTop: 0, textAlign: 'center' }}>Top 50 Closest Words</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 130px), 1fr))', gap: '10px' }}>
              {topWords.map((item, index) => (
                <div key={index} style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#e2e8f0', textTransform: 'capitalize', fontSize: '0.9rem' }}>{item.word}</span>
                  <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '0.9rem' }}>{item.rank}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasWon && (
          <form onSubmit={handleGuess} style={{ display: 'flex', gap: '10px', marginBottom: '25px', width: '100%' }}>
            <input 
              type="text" 
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Type your guess..."
              disabled={loading}
              style={{ flex: '1 1 0%', padding: 'clamp(14px, 3vw, 18px) clamp(15px, 4vw, 25px)', fontSize: 'clamp(16px, 4vw, 18px)', borderRadius: '12px', border: '2px solid #1e293b', backgroundColor: '#0f172a', color: 'white', outline: 'none', minWidth: '0' }}
              autoFocus
            />
            <button type="submit" disabled={loading} style={{ padding: '0 clamp(16px, 4vw, 35px)', fontSize: 'clamp(16px, 4vw, 18px)', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              {loading ? '...' : 'Guess'}
            </button>
          </form>
        )}

        {!hasWon && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(15px, 4vw, 20px)', marginBottom: '40px', flexWrap: 'wrap' }}>
            <button onClick={handleHint} disabled={loading} style={{ background: '#0f172a', color: '#60a5fa', border: '1px solid #1e3a8a', padding: '10px clamp(16px, 4vw, 24px)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              💡 Hint
            </button>
            <button onClick={handleGiveUp} disabled={loading} style={{ background: 'transparent', color: '#64748b', border: 'none', textDecoration: 'underline', cursor: 'pointer', padding: '10px 0' }}>
              I Give Up
            </button>
          </div>
        )}

        {error && <p style={{ color: '#ef4444', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.map((item, index) => {
            const style = getRankStyle(item.rank);
            return (
              <div key={index} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 'clamp(14px, 3vw, 18px) clamp(15px, 4vw, 24px)',
                backgroundColor: style.bg, color: style.text,
                borderRadius: '12px', border: `1px solid ${style.border}`,
                gap: '10px'
              }}>
                <strong style={{ fontSize: 'clamp(1rem, 4vw, 1.2rem)', textTransform: 'capitalize', letterSpacing: '0.5px', wordBreak: 'break-word', flex: '1 1 auto' }}>{item.guess}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 3vw, 20px)' }}>
                  <div style={{ height: '8px', width: 'clamp(50px, 15vw, 120px)', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.max(0, 100 - (item.rank / 100))}%`, backgroundColor: style.bar, transition: 'width 0.5s ease-out' }} />
                  </div>
                  <span style={{ fontSize: 'clamp(1rem, 4vw, 1.2rem)', fontWeight: 'bold', minWidth: 'clamp(40px, 10vw, 55px)', textAlign: 'right' }}>{item.rank}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}