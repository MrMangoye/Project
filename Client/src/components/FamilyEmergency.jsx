// components/FamilyEmergency.jsx
function FamilyEmergency({ familyId }) {
    const [emergencyPlan, setEmergencyPlan] = useState({
      meetingPoints: [],
      contacts: [],
      documents: [],
      supplies: []
    });
  
    return (
      <div className="space-y-6">
        {/* Emergency Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-5 rounded-xl">
            <p className="text-sm opacity-90">Emergency Contacts</p>
            <p className="text-2xl font-bold">18</p>
            <p className="text-xs mt-2">Updated: Today</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-5 rounded-xl">
            <p className="text-sm opacity-90">Digital Documents</p>
            <p className="text-2xl font-bold">24</p>
            <p className="text-xs mt-2">Passports, Wills, Deeds</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-5 rounded-xl">
            <p className="text-sm opacity-90">Emergency Kits</p>
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs mt-2">Home, Car, Go-bags</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-5 rounded-xl">
            <p className="text-sm opacity-90">Plan Ready</p>
            <p className="text-2xl font-bold">85%</p>
            <p className="text-xs mt-2">Complete your plan</p>
          </div>
        </div>
  
        {/* Emergency Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow">
            <h4 className="font-bold mb-3 flex items-center">
              <Phone className="mr-2 text-green-600" />
              Immediate Family
            </h4>
            {[
              { name: 'John (Dad)', phone: '(555) 123-4567', relation: 'Primary', location: 'Home' },
              { name: 'Sarah (Mom)', phone: '(555) 987-6543', relation: 'Secondary', location: 'Work' },
              { name: 'Mike (Son)', phone: '(555) 456-7890', relation: 'Emergency', location: 'College' }
            ].map((contact, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg mb-2 hover:bg-gray-50">
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.relation}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{contact.phone}</p>
                  <p className="text-sm text-gray-600">{contact.location}</p>
                </div>
              </div>
            ))}
          </div>
  
          <div className="bg-white p-5 rounded-xl shadow">
            <h4 className="font-bold mb-3 flex items-center">
              <Heart className="mr-2 text-red-600" />
              Medical Contacts
            </h4>
            {[
              { name: 'Dr. Wilson', phone: '(555) 111-2222', type: 'Primary Care' },
              { name: 'General Hospital', phone: '(555) 333-4444', type: 'Emergency' },
              { name: 'CVS Pharmacy', phone: '(555) 555-6666', type: '24hr Pharmacy' }
            ].map((contact, idx) => (
              <div key={idx} className="p-3 border rounded-lg mb-2 hover:bg-gray-50">
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-gray-600">{contact.type}</p>
                <p className="font-bold text-blue-600">{contact.phone}</p>
              </div>
            ))}
          </div>
  
          <div className="bg-white p-5 rounded-xl shadow">
            <h4 className="font-bold mb-3 flex items-center">
              <Home className="mr-2 text-blue-600" />
              Service Contacts
            </h4>
            {[
              { name: 'Electric Company', phone: '(555) 777-8888', issue: 'Power Outage' },
              { name: 'Water Dept', phone: '(555) 999-0000', issue: 'Water Main' },
              { name: 'Gas Company', phone: '(555) 222-3333', issue: 'Gas Leak' }
            ].map((contact, idx) => (
              <div key={idx} className="p-3 border rounded-lg mb-2 hover:bg-gray-50">
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-gray-600">For: {contact.issue}</p>
                <p className="font-bold">{contact.phone}</p>
              </div>
            ))}
          </div>
        </div>
  
        {/* Emergency Meeting Points */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl">
          <h3 className="text-xl font-bold mb-4">📍 Emergency Meeting Points</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Primary: Home', address: '123 Maple St', scenario: 'Fire/General', gps: 'Link', notes: 'Front yard oak tree' },
              { name: 'Secondary: School', address: '456 Oak Ave', scenario: 'Earthquake', gps: 'Link', notes: 'Parking lot near flagpole' },
              { name: 'Tertiary: Park', address: '789 Park Rd', scenario: 'Flood/Evacuation', gps: 'Link', notes: 'North picnic tables' }
            ].map((point, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold">{point.name}</h4>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {point.scenario}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{point.address}</p>
                <p className="text-sm text-gray-500 mb-3">{point.notes}</p>
                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Get Directions
                  </button>
                  <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50">
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
  
        {/* Important Documents Vault */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold mb-4">📁 Digital Document Vault</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Passports', count: 4, color: 'bg-blue-100', icon: '📘' },
              { name: 'Birth Certificates', count: 8, color: 'bg-green-100', icon: '🎂' },
              { name: 'Wills', count: 5, color: 'bg-purple-100', icon: '⚖️' },
              { name: 'Property Deeds', count: 3, color: 'bg-yellow-100', icon: '🏠' },
              { name: 'Insurance Policies', count: 12, color: 'bg-red-100', icon: '🛡️' },
              { name: 'Medical Records', count: 18, color: 'bg-pink-100', icon: '🏥' }
            ].map((doc, idx) => (
              <div key={idx} className={`${doc.color} p-4 rounded-lg text-center hover:shadow-md cursor-pointer`}>
                <div className="text-2xl mb-2">{doc.icon}</div>
                <p className="font-medium">{doc.name}</p>
                <p className="text-2xl font-bold mt-2">{doc.count}</p>
                <p className="text-xs text-gray-600 mt-1">documents</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-bold mb-2">🔒 Security Status</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Encryption: AES-256</p>
                <p className="text-sm">Last backup: 2 hours ago</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Access logged: 12 users</p>
                <p className="text-sm">Download allowed: Admin only</p>
              </div>
            </div>
            <button className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
              Upload New Document
            </button>
          </div>
        </div>
  
        {/* Emergency Kit Checklist */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
          <h3 className="text-xl font-bold mb-4">🎒 Emergency Kit Checklist</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-3">Home Kit (72-hour)</h4>
              <div className="space-y-2">
                {[
                  { item: 'Water (1 gal/person/day)', checked: true },
                  { item: 'Non-perishable food', checked: true },
                  { item: 'First aid kit', checked: true },
                  { item: 'Flashlights + batteries', checked: false },
                  { item: 'Radio (battery/crank)', checked: true },
                  { item: 'Blankets', checked: true },
                  { item: 'Important documents', checked: false },
                  { item: 'Cash ($1000 small bills)', checked: false }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={item.checked}
                      className="mr-3 h-5 w-5"
                      onChange={() => {}}
                    />
                    <span className={item.checked ? 'line-through text-gray-500' : ''}>
                      {item.item}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-3">Progress: 5/8 items (63%)</p>
            </div>
            
            <div>
              <h4 className="font-bold mb-3">Go-bag (Each vehicle)</h4>
              <div className="space-y-2">
                {[
                  { item: 'Water bottles', checked: true },
                  { item: 'Energy bars', checked: true },
                  { item: 'Basic first aid', checked: true },
                  { item: 'Warm clothes', checked: false },
                  { item: 'Phone charger (car)', checked: true },
                  { item: 'Local maps', checked: false },
                  { item: 'Multi-tool', checked: true },
                  { item: 'Emergency blanket', checked: true }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={item.checked}
                      className="mr-3 h-5 w-5"
                      onChange={() => {}}
                    />
                    <span className={item.checked ? 'line-through text-gray-500' : ''}>
                      {item.item}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-3">Progress: 6/8 items (75%)</p>
            </div>
          </div>
          
          <button className="w-full mt-6 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700">
            Print Emergency Checklist
          </button>
        </div>
      </div>
    );
  }