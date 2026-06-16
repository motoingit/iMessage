

import { ThemeProvider } from './context/ThemeContext';
import { WallpaperProvider } from './context/WallpaperContext';

import { useAuth } from '@clerk/react';
import {Navigate, Route, Routes} from 'react-router';

import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';

import PageLoader from './components/PageLoader';

function App() {

  const{isSignedIn, isLoaded} = useAuth();


  if(!isLoaded) return <PageLoader/>;

  return (
    <ThemeProvider>
      <WallpaperProvider>
        <Routes>
          <Route path='/' element={isSignedIn ? <ChatPage /> : <Navigate to="/auth" replace />} />
          <Route path='/auth' element={!isSignedIn ? <AuthPage /> : <Navigate to="/" replace />} />
        </Routes>
      </WallpaperProvider>
    </ThemeProvider>
  )
}

export default App;


/*
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import { Button } from '@heroui/react';

<h1 className='text-4xl text-red-500 bg-blue-500'>hello</h1>
<Button> My Button </Button>
<header>
  <Show when="signed-out">
    <SignInButton mode='modal'/>
    <SignUpButton mode='modal'/>
  </Show>

  <Show when="signed-in">
    <UserButton mode='modal'/>
  </Show>
</header>
 */
