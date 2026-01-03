// src/components/TailwindTestSimple.jsx
export default function TailwindTestSimple() {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gradient mb-4">Tailwind CSS Working Perfectly!</h1>
        
        {/* Buttons */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary">Primary</button>
            <button className="btn-secondary">Secondary</button>
            <button className="btn-success">Success</button>
            <button className="btn-danger">Danger</button>
            <button className="btn-outline">Outline</button>
            <button className="btn-primary" disabled>Disabled</button>
          </div>
        </div>
        
        {/* Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-padded">
              <div className="card-header">
                <h3 className="card-title">Standard Card</h3>
                <p className="card-subtitle">With header and content</p>
              </div>
              <p className="text-gray-600">This card uses all the card components.</p>
            </div>
            
            <div className="card-padded hover-lift">
              <h3 className="text-lg font-semibold mb-2">Hover Lift Card</h3>
              <p className="text-gray-600">Hover over me to see the lift effect!</p>
            </div>
          </div>
        </div>
        
        {/* Forms */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Forms</h2>
          <div className="max-w-md space-y-4">
            <div className="form-group">
              <label className="form-label form-label-required">Email</label>
              <input type="email" className="form-input" placeholder="test@example.com" />
              <p className="form-hint">We'll never share your email.</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-textarea" placeholder="Your message..."></textarea>
              <p className="form-error">⚠ This field is required</p>
            </div>
            
            <div className="flex items-center gap-2">
              <input type="checkbox" id="terms" className="form-checkbox" />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the terms
              </label>
            </div>
          </div>
        </div>
        
        {/* Alerts & Badges */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Alerts & Badges</h2>
          <div className="space-y-3">
            <div className="alert alert-info">
              <strong>Info:</strong> This is an informational message.
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-primary">New</span>
              <span className="badge badge-success">Active</span>
              <span className="badge badge-warning">Pending</span>
              <span className="badge badge-danger">Error</span>
              <span className="badge badge-gray">Default</span>
            </div>
          </div>
        </div>
        
        {/* Animations */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Animations</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-10 h-10 spinner"></div>
            <div className="w-10 h-10 bg-blue-100 rounded animate-pulse"></div>
            <div className="p-3 bg-green-100 rounded animate-fadeIn">
              Fade In
            </div>
            <div className="p-3 bg-yellow-100 rounded animate-slideIn">
              Slide In
            </div>
          </div>
        </div>
        
        {/* Utilities */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Utilities</h2>
          <div className="space-y-3">
            <div className="p-4 bg-gray-100 rounded">
              <p className="truncate-2">
                This text will be truncated after 2 lines. Lorem ipsum dolor sit amet, 
                consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
              </p>
            </div>
            
            <div className="flex-center h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded text-white">
              Centered with Gradient
            </div>
            
            <div className="p-4 bg-white border rounded scrollbar-thin overflow-y-auto h-24">
              <div className="h-48">
                Scrollable area with custom scrollbar. Try scrolling!
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal Example */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Modal Components</h2>
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Modal Example</h3>
                <button className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="modal-body">
                <p>This simulates how a modal would look.</p>
              </div>
              <div className="modal-footer flex-between">
                <button className="btn-secondary">Cancel</button>
                <button className="btn-primary">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }