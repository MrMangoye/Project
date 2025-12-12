// components/FamilyAssets.jsx
import React, { useState } from 'react';
import { Home, Key, Car, Gem, Tools, Wrench, Droplets } from 'lucide-react';

function FamilyAssets({ familyId }) {
  const [properties, setProperties] = useState([
    {
      id: 1,
      name: 'Main Family Home',
      address: '123 Maple St, Anytown',
      value: 850000,
      type: 'house',
      mortgage: { balance: 320000, payment: 2200, due: '1st of month' },
      maintenance: [
        { task: 'Roof Inspection', due: 'Jun 2024', priority: 'high' },
        { task: 'HVAC Service', due: 'Aug 2024', priority: 'medium' }
      ]
    },
    {
      id: 2,
      name: 'Lake Cabin',
      address: 'Lake Rd, Mountains',
      value: 320000,
      type: 'cabin',
      mortgage: { balance: 0, payment: 0, due: 'Paid off' },
      maintenance: [
        { task: 'Winterization', due: 'Oct 2024', priority: 'high' },
        { task: 'Deck Repair', due: 'May 2024', priority: 'medium' }
      ]
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Property Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-xl border">
          <div className="flex items-center">
            <Home className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Value: $2.1M</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border">
          <div className="flex items-center">
            <Key className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Mortgage Debt</p>
              <p className="text-2xl font-bold">$420K</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Monthly: $3,200</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl border">
          <div className="flex items-center">
            <Car className="text-purple-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Vehicles</p>
              <p className="text-2xl font-bold">5</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Insurance due: 2 vehicles</p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-5 rounded-xl border">
          <div className="flex items-center">
            <Gem className="text-orange-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Valuables</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Jewelry, Art, Collectibles</p>
        </div>
      </div>

      {/* Property Details with Maintenance */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Home className="mr-2 text-blue-600" />
          Property Management
        </h3>
        
        <div className="space-y-6">
          {properties.map(property => (
            <div key={property.id} className="border rounded-lg p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold">{property.name}</h4>
                  <p className="text-gray-600">{property.address}</p>
                  <p className="text-blue-600 font-bold">${property.value.toLocaleString()}</p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center mb-2">
                    <span className="text-sm text-gray-600 mr-2">Mortgage:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      property.mortgage.balance > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {property.mortgage.balance > 0 ? `$${property.mortgage.balance.toLocaleString()} remaining` : 'Paid off'}
                    </span>
                  </div>
                  {property.mortgage.payment > 0 && (
                    <p className="text-sm">Payment: ${property.mortgage.payment}/mo</p>
                  )}
                </div>
              </div>
              
              {/* Maintenance Schedule */}
              <div className="mt-4">
                <h5 className="font-bold mb-2 flex items-center">
                  <Wrench className="mr-2" size={18} />
                  Upcoming Maintenance
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {property.maintenance.map((task, idx) => (
                    <div key={idx} className={`p-3 rounded-lg ${
                      task.priority === 'high' ? 'bg-red-50 border-l-4 border-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                      'bg-blue-50 border-l-4 border-blue-500'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{task.task}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Due: {task.due}</p>
                      <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                        Schedule Service →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Utility Trackers */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Droplets className="mx-auto text-blue-500 mb-2" />
                  <p className="text-sm text-gray-600">Water Bill</p>
                  <p className="font-bold">$85/mo</p>
                  <p className="text-xs text-gray-500">Due: 15th</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="mx-auto mb-2 text-lg">⚡</div>
                  <p className="text-sm text-gray-600">Electricity</p>
                  <p className="font-bold">$120/mo</p>
                  <p className="text-xs text-gray-500">Due: 20th</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="mx-auto mb-2 text-lg">🔥</div>
                  <p className="text-sm text-gray-600">Gas</p>
                  <p className="font-bold">$65/mo</p>
                  <p className="text-xs text-gray-500">Due: 18th</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Tools className="mx-auto text-green-500 mb-2" />
                  <p className="text-sm text-gray-600">Insurance</p>
                  <p className="font-bold">$180/mo</p>
                  <p className="text-xs text-gray-500">Renews: Dec</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Management */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl">
        <h3 className="text-xl font-bold mb-4">🚗 Family Vehicles</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Vehicle</th>
                <th className="p-3 text-left">Owner</th>
                <th className="p-3 text-left">Insurance</th>
                <th className="p-3 text-left">Registration</th>
                <th className="p-3 text-left">Maintenance</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { vehicle: '2020 Toyota Camry', owner: 'John', insurance: 'State Farm', expires: 'Jun 2024', maintenance: 'Oil change due', status: 'Good' },
                { vehicle: '2018 Honda CR-V', owner: 'Sarah', insurance: 'Geico', expires: 'Aug 2024', maintenance: 'Tires 65%', status: 'Good' },
                { vehicle: '2015 Ford F-150', owner: 'Dad', insurance: 'Allstate', expires: 'May 2024', maintenance: 'Brakes needed', status: 'Warning' },
                { vehicle: '2022 Tesla Model 3', owner: 'Mike', insurance: 'Tesla', expires: 'Dec 2024', maintenance: 'All good', status: 'Excellent' }
              ].map((car, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{car.vehicle}</td>
                  <td className="p-3">{car.owner}</td>
                  <td className="p-3">
                    <div>
                      <p>{car.insurance}</p>
                      <p className="text-sm text-gray-600">Expires: {car.expires}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      car.expires.includes('2024') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {car.expires.includes('2024') ? 'Current' : 'Renew Soon'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            car.status === 'Excellent' ? 'bg-green-500' :
                            car.status === 'Good' ? 'bg-blue-500' : 'bg-red-500'
                          }`}
                          style={{ width: car.status === 'Excellent' ? '90%' : car.status === 'Good' ? '75%' : '40%' }}
                        ></div>
                      </div>
                      {car.maintenance}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      car.status === 'Excellent' ? 'bg-green-100 text-green-800' :
                      car.status === 'Good' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {car.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}