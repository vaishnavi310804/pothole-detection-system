import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import ReportPothole from "./pages/ReportPothole";
import PotholeDetails from "./pages/PotholeDetails";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/report" element={<ReportPothole />} />
            <Route path="/potholes/:id" element={<PotholeDetails />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} OK Driver — Smart Pothole Detection and Reporting System</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
