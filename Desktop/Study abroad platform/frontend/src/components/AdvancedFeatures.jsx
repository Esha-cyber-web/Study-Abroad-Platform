import React, { useState } from 'react';

// ─── 1. ELIGIBILITY PREDICTOR ────────────────────────────────────────────────
export const EligibilityPredictor = () => {
  const [formData, setFormData] = useState({ cgpa: '', ielts: '', gre: '', budget: '', country: '', program: '' });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/ai/predict-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) setResults(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 my-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 AI Admission Eligibility Predictor</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input type="number" step="0.01" placeholder="CGPA (e.g. 3.5)" value={formData.cgpa} onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })} className="p-3 border rounded-lg w-full" required />
        <input type="number" step="0.5" placeholder="IELTS Score (e.g. 7.0)" value={formData.ielts} onChange={(e) => setFormData({ ...formData, ielts: e.target.value })} className="p-3 border rounded-lg w-full" required />
        <input type="number" placeholder="GRE Score (Optional)" value={formData.gre} onChange={(e) => setFormData({ ...formData, gre: e.target.value })} className="p-3 border rounded-lg w-full" />
        <input type="number" placeholder="Max Budget ($/yr)" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="p-3 border rounded-lg w-full" />
        <input type="text" placeholder="Target Country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="p-3 border rounded-lg w-full" />
        <input type="text" placeholder="Program/Major" value={formData.program} onChange={(e) => setFormData({ ...formData, program: e.target.value })} className="p-3 border rounded-lg w-full" />
        <button type="submit" disabled={loading} className="md:col-span-3 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition">
          {loading ? 'Analyzing Profile...' : 'Predict Admission Chances'}
        </button>
      </form>

      {results && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-700">Matched Universities:</h3>
          {results.map((res, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h4 className="text-lg font-bold text-blue-900">{res.university?.name || res.name}</h4>
                <p className="text-sm text-gray-600">{res.university?.country || 'Global'} | Rank: {res.university?.ranking || 'N/A'}</p>
                {res.tip && <p className="text-xs text-amber-700 mt-1">💡 Tip: {res.tip}</p>}
              </div>
              <div className="mt-2 md:mt-0 text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${res.likelihood === 'High' ? 'bg-green-100 text-green-800' : res.likelihood === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {res.likelihood} Likelihood ({res.matchScore}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── 2. VISA GUIDE ───────────────────────────────────────────────────────────
export const VisaGuide = () => {
  const [country, setCountry] = useState('');
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchGuide = async () => {
    if (!country) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ai/visa-guide/${country}`);
      const data = await res.json();
      if (data.success) setGuide(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 my-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📜 AI Student Visa Assistant</h2>
      <div className="flex gap-2 mb-6">
        <input type="text" placeholder="Enter Country (e.g. Germany, UK, USA)" value={country} onChange={(e) => setCountry(e.target.value)} className="p-3 border rounded-lg flex-1" />
        <button onClick={fetchGuide} disabled={loading} className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700">
          {loading ? 'Fetching...' : 'Get Visa Roadmap'}
        </button>
      </div>

      {guide && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
          <div>
            <h4 className="font-bold text-gray-700 mb-2">📋 Required Documents:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              {guide.documents?.map((doc, i) => <li key={i}>{doc}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-700 mb-2">💡 Embassy Tips:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              {guide.tips?.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── 3. BUDGET PLANNER ───────────────────────────────────────────────────────
export const BudgetPlanner = () => {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBudget = async () => {
    if (!country) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/plan-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, city }),
      });
      const data = await res.json();
      if (data.success) setBudget(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 my-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">💰 AI Cost & Living Budget Calculator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} className="p-3 border rounded-lg" />
        <input type="text" placeholder="City (Optional)" value={city} onChange={(e) => setCity(e.target.value)} className="p-3 border rounded-lg" />
      </div>
      <button onClick={fetchBudget} disabled={loading} className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 mb-6">
        {loading ? 'Calculating Expenses...' : 'Calculate Monthly Living Budget'}
      </button>

      {budget && budget.monthlyBreakdown && (
        <div className="p-4 bg-purple-50 rounded-lg">
          <h4 className="text-lg font-bold text-purple-900 mb-3">Estimated Monthly Breakdown ({budget.currencySymbol || '$'})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white rounded shadow-sm"><span className="text-xs text-gray-500">Rent</span><p className="font-bold">{budget.monthlyBreakdown.rent}</p></div>
            <div className="p-3 bg-white rounded shadow-sm"><span className="text-xs text-gray-500">Food</span><p className="font-bold">{budget.monthlyBreakdown.food}</p></div>
            <div className="p-3 bg-white rounded shadow-sm"><span className="text-xs text-gray-500">Transport</span><p className="font-bold">{budget.monthlyBreakdown.transport}</p></div>
            <div className="p-3 bg-white rounded shadow-sm"><span className="text-xs text-gray-500">Utilities</span><p className="font-bold">{budget.monthlyBreakdown.utilities}</p></div>
          </div>
          <p className="mt-4 text-right text-lg font-bold text-purple-900">Total Monthly: {budget.totalMonthly} / month</p>
        </div>
      )}
    </div>
  );
};

// ─── ALIAS EXPORTS FOR UNIVERSITYDETAIL COMPATIBILITY ───────────────────────
export const AdmissionPredictor = EligibilityPredictor;
export const DocumentChecklist = VisaGuide;
export const CurrencyConverter = BudgetPlanner;

export default {
  EligibilityPredictor,
  VisaGuide,
  BudgetPlanner,
  AdmissionPredictor,
  DocumentChecklist,
  CurrencyConverter,
};