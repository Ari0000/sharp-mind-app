
import React, { useState, useEffect } from 'react';
import './App.css';

// Manifest.json powinien być już skonfigurowany w public/manifest.json
// z odpowiednimi ikonami i ustawieniami

// Aby zainstalować aplikację na iPhone:
// 1. Otwórz aplikację w Safari (inne przeglądarki nie obsługują instalacji PWA na iOS)
// 2. Kliknij ikonę "Udostępnij" na dole ekranu (kwadrat ze strzałką)
// 3. Przewiń w dół i wybierz opcję "Dodaj do ekranu początkowego"
// 4. Nadaj nazwę skrótowi i kliknij "Dodaj"
// 5. Aplikacja pojawi się na ekranie głównym jako osobna ikona

function SharpMindApp() {
  const [exercise, setExercise] = useState({});
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIOS] = useState(/iPad|iPhone|iPod/.test(navigator.userAgent));

  // Obsługa instalacji PWA
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    });

    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    // Rejestracja Service Workera
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => console.log('ServiceWorker zarejestrowany:', registration))
        .catch((error) => console.log('Błąd rejestracji ServiceWorker:', error));
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallButton(false);
      }
      setDeferredPrompt(null);
    }
  };

  const generateExercise = () => {
    const operators = ['+', '-', '*', '/'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1 = Math.floor(Math.random() * 501);
    let num2 = Math.floor(Math.random() * 501);
    
    if (operator === '/') {
      num2 = Math.floor(Math.random() * 20) + 1;
      num1 = num2 * Math.floor(Math.random() * 25);
    }

    let correctAnswer;
    switch(operator) {
      case '+': correctAnswer = num1 + num2; break;
      case '-': correctAnswer = num1 - num2; break;
      case '*': correctAnswer = num1 * num2; break;
      case '/': correctAnswer = num1 / num2; break;
      default: correctAnswer = 0;
    }

    return { num1, operator, num2, correctAnswer };
  };

  const checkAnswer = () => {
    const isCorrect = Number(userAnswer) === exercise.correctAnswer;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1)
    }));
    setUserAnswer('');
    setExercise(generateExercise());
  };

  useEffect(() => {
    setExercise(generateExercise());
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>SharpMind - Trening Matematyczny</h1>
        {isIOS ? (
          <div className="ios-install-info">
            Aby zainstalować aplikację:
            <ol>
              <li>Otwórz w Safari</li>
              <li>Kliknij ikonę Udostępnij</li>
              <li>Wybierz "Dodaj do ekranu początkowego"</li>
            </ol>
          </div>
        ) : (
          showInstallButton && (
            <button 
              onClick={handleInstallClick}
              className="install-button"
            >
              Zainstaluj aplikację
            </button>
          )
        )}
        {!isOnline && (
          <div className="offline-message">
            Tryb offline - aplikacja nadal działa!
          </div>
        )}
        <div className="exercise">
          <span>{exercise.num1}</span>
          <span>{exercise.operator}</span>
          <span>{exercise.num2}</span>
          <span>=</span>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
          />
        </div>
        <button onClick={checkAnswer}>Sprawdź</button>
        <div className="score">
          <p>Poprawne: {score.correct}</p>
          <p>Błędne: {score.wrong}</p>
        </div>
      </header>
    </div>
  );
}

export default SharpMindApp;