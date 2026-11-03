import React from 'react';
import { CodedexApp } from './components/CodedexView/CodedexApp';
import { MusicPlayer } from './components/AudioPlayer/MusicPlayer';
import { useAuth } from './contexts/AuthContext';

export const App: React.FC = () => {
  const { user } = useAuth();
  return (
    <>
      <CodedexApp key={user?.id ?? 'guest'} />
      <MusicPlayer />
    </>
  );
};

export default App;
