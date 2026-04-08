import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from "@clerk/clerk-react";

import Home from './pages/Home';
import SignInPage from './pages/SignInPage';

const Structure = lazy(() => import('./pages/Structure'));
const Reactions = lazy(() => import('./pages/Reactions'));
const Elements = lazy(() => import('./pages/Elements'));
const Theory = lazy(() => import('./pages/Theory'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const Trajectory = lazy(() => import('./pages/Trajectory'));

const LoadingFallback = () => (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617', color: '#0ea5e9' }}>
    <span className="material-symbols-outlined" style={{ fontSize: '48px', animation: 'spin 2s linear infinite' }}>science</span>
    <h2 style={{ marginTop: '20px', letterSpacing: '2px', fontWeight: 'bold' }}>科研舱体正在接入...</h2>
    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><Navigate to="/sign-in" replace /></SignedOut>
    </>
  );
};

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#020617' }}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/structure/*" element={<Structure />} />
          <Route path="/reactions/*" element={<ProtectedRoute><Reactions /></ProtectedRoute>} />
          <Route path="/elements/*" element={<ProtectedRoute><Elements /></ProtectedRoute>} />
          <Route path="/theory/*" element={<ProtectedRoute><Theory /></ProtectedRoute>} />
          <Route path="/ai-assistant/*" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
          <Route path="/trajectory/*" element={<ProtectedRoute><Trajectory /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}