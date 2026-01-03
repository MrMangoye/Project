// components/FamilyHealth.jsx
import React, { useState } from 'react';
import { Heart, Calendar, Pill, Activity, Stethoscope, AlertCircle } from 'lucide-react';

function FamilyHealth({ familyId }) {
  const [healthRecords, setHealthRecords] = useState({
    appointments: [],
    medications: [],
    conditions: [],
    caregivers: []
  });

  // Helper function to safely calculate deductible percentage
  const calculateDeductiblePercentage = (deductible) => {
    if (!deductible || deductible === '—' || deductible === 'N/A') {
      return 0;
    }
    
    try {
      // Check if deductible has the expected format (e.g., "$1,200/$2,000")
      if (!deductible.includes('/')) {
        return 0;
      }
      
      const [usedStr, totalStr] = deductible.split('/');
      
      // Safely parse the amounts
      const parseAmount = (str) => {
        if (!str) return 0;
        // Remove $ and commas, then parse
        const cleaned = str.replace('$', '').replace(',', '').trim();
        const num = parseInt(cleaned, 10);
        return isNaN(num) ? 0 : num;
      };
      
      const usedAmount = parseAmount(usedStr);
      const totalAmount = parseAmount(totalStr);
      
      if (totalAmount <= 0) return 0;
      
      const percentage = (usedAmount / totalAmount) * 100;
      return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100%
      
    } catch (error) {
      console.error('Error calculating deductible percentage:', error);
      return 0;
    }
  };

  // Insurance data with safe deductible values
  const insuranceData = [
    { 
      member: 'John Smith', 
      provider: 'Blue Cross', 
      plan: 'Gold PPO', 
      deductible: '$1,200/$2,000', 
      renewal: 'Dec 31, 2024', 
      status: 'Active' 
    },
    { 
      member: 'Sarah Smith', 
      provider: 'Aetna', 
      plan: 'Silver HMO', 
      deductible: '$800/$1,500', 
      renewal: 'Nov 15, 2024', 
      status: 'Active' 
    },
    { 
      member: 'Grandma Smith', 
      provider: 'Medicare', 
      plan: 'Advantage', 
      deductible: '$450/$1,000', 
      renewal: 'Annual', 
      status: 'Active' 
    },
    { 
      member: 'Uncle Bob', 
      provider: 'None', 
      plan: '—', 
      deductible: '—', 
      renewal: '—', 
      status: 'Needs Coverage' 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Health Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-red-50 to-pink-100 p-4 rounded-xl border">
          <div className="flex items-center">
            <Heart className="text-red-500 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Conditions</p>
              <p className="text-xl font-bold">12</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-100 p-4 rounded-xl border">
          <div className="flex items-center">
            <Pill className="text-blue-500 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Medications</p>
              <p className="text-xl font-bold">24</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-100 p-4 rounded-xl border">
          <div className="flex items-center">
            <Calendar className="text-green-500 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Appointments</p>
              <p className="text-xl font-bold">8</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-100 p-4 rounded-xl border">
          <div className="flex items-center">
            <Activity className="text-purple-500 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Caregivers</p>
              <p className="text-xl font-bold">4</p>
            </div>
          </div>
        </div>
      </div>

      {/* Medication Tracker */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Pill className="mr-2 text-blue-600" />
          Medication Schedule
        </h3>
        
        <div className="space-y-3">
          {[
            { 
              person: 'Grandma Smith', 
              medication: 'Lisinopril 10mg', 
              time: '8:00 AM', 
              days: 'Daily', 
              taken: true 
            },
            { 
              person: 'Dad Johnson', 
              medication: 'Metformin 500mg', 
              time: '9:00 AM', 
              days: 'Mon-Fri', 
              taken: true 
            },
            { 
              person: 'Mom Johnson', 
              medication: 'Levothyroxine', 
              time: '7:00 AM', 
              days: 'Daily', 
              taken: false 
            },
            { 
              person: 'Uncle Bob', 
              medication: 'Warfarin 5mg', 
              time: '6:00 PM', 
              days: 'Daily', 
              taken: null 
            }
          ].map((med, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  med.taken === true ? 'bg-green-100 text-green-600' :
                  med.taken === false ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <Pill size={20} />
                </div>
                <div>
                  <p className="font-medium">{med.person}</p>
                  <p className="text-sm text-gray-600">{med.medication}</p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="font-bold">{med.time}</p>
                <p className="text-sm text-gray-600">{med.days}</p>
              </div>
              
              <div className="flex space-x-2">
                <button className={`px-4 py-2 rounded-lg ${
                  med.taken === true ? 'bg-green-100 text-green-700' :
                  med.taken === false ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {med.taken === true ? 'Taken' : med.taken === false ? 'Missed' : 'Pending'}
                </button>
                <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                  Remind
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Caregiver Schedule */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl">
        <h3 className="text-xl font-bold mb-4">👵 Elderly Care Coordination</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold mb-3">Weekly Care Schedule</h4>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Day</th>
                    <th className="p-3 text-left">Caregiver</th>
                    <th className="p-3 text-left">Tasks</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { day: 'Mon', caregiver: 'Sarah', tasks: 'Medication, Groceries' },
                    { day: 'Tue', caregiver: 'John', tasks: 'Doctor Visit' },
                    { day: 'Wed', caregiver: 'Maria', tasks: 'Cleaning, Meal Prep' },
                    { day: 'Thu', caregiver: 'David', tasks: 'Medication, Walk' },
                    { day: 'Fri', caregiver: 'Sarah', tasks: 'Groceries, Social' }
                  ].map((schedule, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{schedule.day}</td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                            {schedule.caregiver.charAt(0)}
                          </div>
                          {schedule.caregiver}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                          {schedule.tasks}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-3">Emergency Information</h4>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center mb-3">
                  <AlertCircle className="text-red-500 mr-2" />
                  <h5 className="font-bold">Medical Alerts</h5>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Grandma: Severe penicillin allergy
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Dad: Type 2 Diabetes (insulin dependent)
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Uncle: Pacemaker installed 2022
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h5 className="font-bold mb-2">Emergency Contacts</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Primary Doctor</span>
                    <span className="font-medium">Dr. Wilson: (555) 123-4567</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nearest Hospital</span>
                    <span className="font-medium">General Hospital: (555) 987-6543</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pharmacy</span>
                    <span className="font-medium">CVS 24hr: (555) 456-7890</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Insurance Tracker - FIXED SECTION */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-bold mb-4">🏥 Insurance & Coverage</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Member</th>
                <th className="p-3 text-left">Provider</th>
                <th className="p-3 text-left">Plan</th>
                <th className="p-3 text-left">Deductible Used</th>
                <th className="p-3 text-left">Renewal Date</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {insuranceData.map((insurance, idx) => {
                const deductiblePercentage = calculateDeductiblePercentage(insurance.deductible);
                
                return (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{insurance.member}</td>
                    <td className="p-3">{insurance.provider}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        {insurance.plan}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${deductiblePercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{insurance.deductible}</span>
                      </div>
                    </td>
                    <td className="p-3">{insurance.renewal}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        insurance.status === 'Active' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {insurance.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Deductible progress shows how much of the annual deductible has been used. 
            Values are calculated from insurance claims data.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FamilyHealth;