import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>🤖 Welcome to the AI Arcade</h1>
      <p>Choose a game to play:</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
        
        {/* Game 1 Card */}
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px', width: '250px' }}>
          <h2>SemantiGuess</h2>
          <p>Find the secret word based on AI semantic similarity.</p>
          <Link to="/semantiguess">
            <button style={{ padding: '10px 20px', cursor: 'pointer' }}>Play Now</button>
          </Link>
        </div>

        {/* Game 2 Card (Coming Soon) */}
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px', width: '250px', opacity: 0.6 }}>
          <h2>Beat the Bot</h2>
          <p>Multiplayer eavesdropping AI game.</p>
          <button disabled>Coming Soon</button>
        </div>

      </div>
    </div>
  );
}