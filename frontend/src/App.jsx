import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'


export default function App() {
return (
<div className="min-h-screen bg-gray-50">
<div className="container mx-auto p-4">
<header className="mb-6">
<h1 className="text-2xl font-bold">Experian XML Reports</h1>
</header>
<Routes>
<Route path="/" element={<Home />} />
</Routes>
</div>
</div>
)
}