// components/FamilyFinance.jsx
import React, { useState } from 'react';
import { DollarSign, Home, Car, Landmark, FileText, Shield, TrendingUp } from 'lucide-react';

function FamilyFinance({ familyId }) {
  const [assets, setAssets] = useState({
    properties: [],
    investments: [],
    businesses: [],
    inheritance: [],
    debts: []
  });

  return (
    <div className="space-y-6">
      {/* Financial Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5 rounded-xl">
          <DollarSign size={24} className="mb-3" />
          <p className="text-sm opacity-90">Total Assets</p>
          <p className="text-2xl font-bold">$2.4M</p>
          <p className="text-xs mt-2">+12% from last year</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-5 rounded-xl">
          <Home size={24} className="mb-3" />
          <p className="text-sm opacity-90">Properties</p>
          <p className="text-2xl font-bold">8</p>
          <p className="text-xs mt-2">Total value: $1.8M</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-5 rounded-xl">
          <TrendingUp size={24} className="mb-3" />
          <p className="text-sm opacity-90">Investments</p>
          <p className="text-2xl font-bold">$420K</p>
          <p className="text-xs mt-2">Stocks, Bonds, Crypto</p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 rounded-xl">
          <FileText size={24} className="mb-3" />
          <p className="text-sm opacity-90">Wills Updated</p>
          <p className="text-2xl font-bold">65%</p>
          <p className="text-xs mt-2">5 of 8 adults</p>
        </div>
      </div>

      {/* Inheritance Planning */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Shield className="mr-2 text-blue-600" />
          Inheritance & Will Tracker
        </h3>
        
        <div className="space-y-4">
          {[
            { name: 'Grandfather Smith', status: 'Will Complete', lastUpdated: '2024-01-15', attorney: 'Johnson Law', share: '40%' },
            { name: 'Aunt Maria', status: 'Will Needed', lastUpdated: 'Never', attorney: 'None', share: '15%' },
            { name: 'Uncle Robert', status: 'Will Incomplete', lastUpdated: '2023-08-22', attorney: 'Smith & Co', share: '20%' }
          ].map((person, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  person.status === 'Will Complete' ? 'bg-green-500' : 
                  person.status === 'Will Needed' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <p className="font-medium">{person.name}</p>
                  <p className="text-sm text-gray-600">Inheritance share: {person.share}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-medium ${
                  person.status === 'Will Complete' ? 'text-green-600' : 
                  person.status === 'Will Needed' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {person.status}
                </p>
                <p className="text-sm text-gray-600">Last: {person.lastUpdated}</p>
              </div>
              
              <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                {person.status === 'Will Complete' ? 'View' : 'Setup'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Distribution Calculator */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
        <h3 className="text-xl font-bold mb-4">💰 Asset Distribution Calculator</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold mb-3">Family Assets</h4>
            <div className="space-y-3">
              {[
                { name: 'Family House', value: 850000, type: 'property' },
                { name: 'Lake Cabin', value: 320000, type: 'property' },
                { name: 'Investment Portfolio', value: 420000, type: 'investment' },
                { name: 'Family Business', value: 650000, type: 'business' },
                { name: 'Vehicles', value: 95000, type: 'other' }
              ].map((asset, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center">
                    {asset.type === 'property' ? <Home size={18} className="mr-2 text-blue-500" /> :
                     asset.type === 'investment' ? <TrendingUp size={18} className="mr-2 text-green-500" /> :
                     <Car size={18} className="mr-2 text-gray-500" />}
                    <span>{asset.name}</span>
                  </div>
                  <span className="font-bold">${asset.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-3">Distribution Preview</h4>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Total Estate: $2.4M</label>
                <input type="range" min="0" max="100" className="w-full" defaultValue="100" />
              </div>
              
              {[
                { name: 'John (Eldest Son)', percentage: 40, amount: 960000 },
                { name: 'Sarah (Daughter)', percentage: 30, amount: 720000 },
                { name: 'Mike (Youngest)', percentage: 20, amount: 480000 },
                { name: 'Charity', percentage: 10, amount: 240000 }
              ].map((recipient, idx) => (
                <div key={idx} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{recipient.name}</span>
                    <span className="text-sm font-medium">{recipient.percentage}% (${recipient.amount.toLocaleString()})</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${recipient.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              
              <button className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
                Generate Distribution Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Planning & Deadlines */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Landmark className="mr-2 text-red-600" />
          Tax Planning & Deadlines
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { type: 'Estate Tax Filing', due: 'Apr 15, 2024', status: 'Upcoming', amount: '$12,500' },
            { type: 'Property Tax', due: 'Dec 31, 2024', status: 'Due Soon', amount: '$8,200' },
            { type: 'Gift Tax Return', due: 'Completed', status: 'Done', amount: '$0' }
          ].map((tax, idx) => (
            <div key={idx} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold">{tax.type}</p>
                  <p className="text-sm text-gray-600">Due: {tax.due}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  tax.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  tax.status === 'Due Soon' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {tax.status}
                </span>
              </div>
              <p className="text-lg font-bold">{tax.amount}</p>
              <button className="w-full mt-3 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50">
                {tax.status === 'Completed' ? 'View Receipt' : 'Pay Now'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}