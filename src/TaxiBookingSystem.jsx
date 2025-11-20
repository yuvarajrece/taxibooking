import React, { useState, useEffect } from 'react';
import { Star, MapPin, DollarSign, LogOut, Menu, X, Phone, MessageSquare } from 'lucide-react';

const TaxiBookingSystem = () => {
  const [userType, setUserType] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rides, setRides] = useState([]);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginData, setLoginData] = useState({ id: '', name: '', email: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({ pickup: '', dropoff: '' });
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [showDriverList, setShowDriverList] = useState(false);
  const [ratingForm, setRatingForm] = useState({ rideId: '', rating: 0, feedback: '' });

  // Initialize demo data
  useEffect(() => {
    const demoDrivers = [
      { id: 'd1', name: 'John Smith', email: 'john@taxi.com', totalEarnings: 2450, completedRides: 120, avgRating: 4.8, location: 'Downtown' },
      { id: 'd2', name: 'Sarah Johnson', email: 'sarah@taxi.com', totalEarnings: 1980, completedRides: 95, avgRating: 4.6, location: 'Midtown' },
      { id: 'd3', name: 'Mike Chen', email: 'mike@taxi.com', totalEarnings: 2100, completedRides: 110, avgRating: 4.7, location: 'Uptown' },
      { id: 'd4', name: 'Lisa Brown', email: 'lisa@taxi.com', totalEarnings: 1850, completedRides: 85, avgRating: 4.5, location: 'Harbor' },
    ];
    
    const demoCustomers = [
      { id: 'c1', name: 'Alice Wilson', email: 'alice@email.com' },
      { id: 'c2', name: 'Bob Davis', email: 'bob@email.com' },
    ];
    
    const demoRides = [
      { id: 'r1', customerId: 'c1', driverId: 'd1', pickup: 'Central Station', dropoff: 'Airport', fare: 35, status: 'completed', rating: 5, feedback: 'Excellent driver!' },
      { id: 'r2', customerId: 'c1', driverId: 'd2', pickup: 'Park Avenue', dropoff: 'Beach', fare: 28, status: 'completed', rating: 4, feedback: 'Good service' },
    ];

    setDrivers(demoDrivers);
    setCustomers(demoCustomers);
    setRides(demoRides);
  }, []);

  // ========== CRUD OPERATIONS ==========
  
  // CREATE / LOGIN Driver
  const handleAddDriver = () => {
    if (!loginData.name || !loginData.email) return;
    
    // Check if driver already exists by email
    const existingDriver = drivers.find(d => d.email === loginData.email);
    
    if (existingDriver) {
      // Login existing driver
      setCurrentUser({ ...existingDriver, type: 'driver' });
    } else {
      // Create new driver
      const newDriver = {
        id: `d${Date.now()}`,
        name: loginData.name,
        email: loginData.email,
        totalEarnings: 0,
        completedRides: 0,
        avgRating: 0,
        location: 'Downtown'
      };
      setDrivers([...drivers, newDriver]);
      setCurrentUser({ ...newDriver, type: 'driver' });
    }
    
    setShowLoginForm(false);
    setLoginData({ id: '', name: '', email: '' });
  };

  // CREATE / LOGIN Customer
  const handleAddCustomer = () => {
    if (!loginData.name || !loginData.email) return;
    
    // Check if customer already exists by email
    const existingCustomer = customers.find(c => c.email === loginData.email);
    
    if (existingCustomer) {
      // Login existing customer
      setCurrentUser({ ...existingCustomer, type: 'customer' });
    } else {
      // Create new customer
      const newCustomer = {
        id: `c${Date.now()}`,
        name: loginData.name,
        email: loginData.email
      };
      setCustomers([...customers, newCustomer]);
      setCurrentUser({ ...newCustomer, type: 'customer' });
    }
    
    setShowLoginForm(false);
    setLoginData({ id: '', name: '', email: '' });
  };

  // READ & RECOMMENDATION ENGINE
  const getRecommendedDrivers = () => {
    return drivers
      .map(driver => {
        const driverRides = rides.filter(r => r.driverId === driver.id && r.rating);
        const avgRating = driverRides.length > 0 
          ? driverRides.reduce((sum, r) => sum + r.rating, 0) / driverRides.length 
          : driver.avgRating;
        
        const proximityScore = Math.random() * 100;
        const costEffectiveness = Math.random() * 100;
        const experienceScore = driver.completedRides;

        const finalScore = (avgRating * 30) + (100 - proximityScore * 0.3) + (costEffectiveness * 0.2) + (Math.min(experienceScore / 100, 1) * 20);
        
        return { ...driver, recommendationScore: finalScore };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);
  };

  // READ Rides for Customer
  const handleBookRide = () => {
    if (!bookingForm.pickup || !bookingForm.dropoff) {
      alert('Please enter pickup and dropoff locations');
      return;
    }

    const recommended = getRecommendedDrivers();
    setAvailableDrivers(recommended);
    setShowDriverList(true);
  };

  // CREATE Ride
  const handleConfirmRide = (selectedDriver) => {
    const fare = Math.floor(Math.random() * 40) + 15;
    const newRide = {
      id: `r${Date.now()}`,
      customerId: currentUser.id,
      driverId: selectedDriver.id,
      pickup: bookingForm.pickup,
      dropoff: bookingForm.dropoff,
      fare: fare,
      status: 'completed',
      rating: 0,
      feedback: ''
    };
    setRides([...rides, newRide]);
    updateDriverEarnings(selectedDriver.id, fare);
    setShowDriverList(false);
    setBookingForm({ pickup: '', dropoff: '' });
    alert(`Ride booked! Fare: $${fare}`);
  };

  // UPDATE Ride Rating
  const handleSubmitRating = () => {
    if (ratingForm.rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    const updatedRides = rides.map(r => 
      r.id === ratingForm.rideId 
        ? { ...r, rating: ratingForm.rating, feedback: ratingForm.feedback }
        : r
    );
    setRides(updatedRides);
    
    const ride = rides.find(r => r.id === ratingForm.rideId);
    const driverRidesToRate = updatedRides.filter(r => r.driverId === ride.driverId && r.rating > 0);
    if (driverRidesToRate.length > 0) {
      const newAvgRating = driverRidesToRate.reduce((sum, r) => sum + r.rating, 0) / driverRidesToRate.length;
      setDrivers(drivers.map(d => d.id === ride.driverId ? { ...d, avgRating: newAvgRating } : d));
    }
    
    setRatingForm({ rideId: '', rating: 0, feedback: '' });
    alert('Rating submitted!');
  };

  // UPDATE Driver Earnings & Completed Rides
  const updateDriverEarnings = (driverId, amount) => {
    setDrivers(drivers.map(d => 
      d.id === driverId 
        ? { ...d, totalEarnings: d.totalEarnings + amount, completedRides: d.completedRides + 1 }
        : d
    ));
  };

  // DELETE Driver
  const deleteDriver = (driverId) => {
    setDrivers(drivers.filter(d => d.id !== driverId));
    alert('Driver deleted');
  };

  // DELETE Customer
  const deleteCustomer = (customerId) => {
    setCustomers(customers.filter(c => c.id !== customerId));
    alert('Customer deleted');
  };

  // DELETE Ride
  const deleteRide = (rideId) => {
    setRides(rides.filter(r => r.id !== rideId));
    alert('Ride deleted');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserType(null);
  };

  // LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-2 text-blue-600">TaxiHub</h1>
          <p className="text-center text-gray-600 mb-8">Book rides or earn as a driver</p>

          {!showLoginForm ? (
            <div className="space-y-4">
              <button
                onClick={() => { setUserType('customer'); setShowLoginForm(true); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
              >
                Login as Customer
              </button>
              <button
                onClick={() => { setUserType('driver'); setShowLoginForm(true); }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
              >
                Login as Driver
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter ID (optional)"
                value={loginData.id}
                onChange={(e) => setLoginData({ ...loginData, id: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-600 outline-none"
              />
              <input
                type="text"
                placeholder="Full Name"
                value={loginData.name}
                onChange={(e) => setLoginData({ ...loginData, name: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-600 outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-600 outline-none"
              />
              <button
                onClick={userType === 'customer' ? handleAddCustomer : handleAddDriver}
                className={`w-full text-white py-3 rounded-lg font-semibold transition ${
                  userType === 'customer' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Create Account & Login
              </button>
              <button
                onClick={() => { setShowLoginForm(false); setLoginData({ id: '', name: '', email: '' }); }}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // CUSTOMER PORTAL
  if (currentUser.type === 'customer') {
    const customerRides = rides.filter(r => r.customerId === currentUser.id);

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">TaxiHub Customer</h1>
            <div className="flex items-center gap-4">
              <span className="font-semibold">{currentUser.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded flex items-center gap-2 font-semibold"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Book a Ride</h2>
            <div className="space-y-4">
              <div className="flex gap-4 flex-col md:flex-row">
                <input
                  type="text"
                  placeholder="Pickup Location"
                  value={bookingForm.pickup}
                  onChange={(e) => setBookingForm({ ...bookingForm, pickup: e.target.value })}
                  className="flex-1 border-2 border-gray-300 rounded-lg p-3 focus:border-blue-600 outline-none"
                />
                <input
                  type="text"
                  placeholder="Dropoff Location"
                  value={bookingForm.dropoff}
                  onChange={(e) => setBookingForm({ ...bookingForm, dropoff: e.target.value })}
                  className="flex-1 border-2 border-gray-300 rounded-lg p-3 focus:border-blue-600 outline-none"
                />
              </div>
              <button
                onClick={handleBookRide}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
              >
                Find Available Drivers
              </button>
            </div>
          </div>

          {showDriverList && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Recommended Drivers</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableDrivers.map(driver => (
                  <div key={driver.id} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{driver.name}</h3>
                        <p className="text-gray-600 text-sm">{driver.completedRides} rides completed</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded">
                        <Star size={16} className="text-yellow-500" />
                        <span className="font-semibold">{driver.avgRating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                      <MapPin size={16} /> {driver.location}
                    </p>
                    <button
                      onClick={() => handleConfirmRide(driver)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition"
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Rides</h2>
            {customerRides.length === 0 ? (
              <p className="text-gray-600">No rides yet. Book your first ride!</p>
            ) : (
              <div className="space-y-4">
                {customerRides.map(ride => {
                  const driver = drivers.find(d => d.id === ride.driverId);
                  return (
                    <div key={ride.id} className="border-l-4 border-blue-600 bg-gray-50 p-4 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{driver?.name}</p>
                          <p className="text-sm text-gray-600">{ride.pickup} → {ride.dropoff}</p>
                        </div>
                        <p className="text-lg font-bold text-green-600">${ride.fare}</p>
                      </div>
                      {ride.rating === 0 ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                onClick={() => setRatingForm({ rideId: ride.id, rating: star, feedback: '' })}
                                className="text-2xl hover:text-yellow-400 transition"
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          {ratingForm.rideId === ride.id && (
                            <div className="space-y-2 mt-2">
                              <textarea
                                placeholder="Share your feedback..."
                                value={ratingForm.feedback}
                                onChange={(e) => setRatingForm({ ...ratingForm, feedback: e.target.value })}
                                className="w-full border-2 border-gray-300 rounded p-2 text-sm focus:border-blue-600 outline-none"
                              />
                              <button
                                onClick={handleSubmitRating}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition text-sm"
                              >
                                Submit Rating
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(ride.rating)].map((_, i) => (
                              <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">"{ride.feedback}"</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // DRIVER PORTAL
  if (currentUser.type === 'driver') {
    const driverData = drivers.find(d => d.id === currentUser.id);
    const driverRides = rides.filter(r => r.driverId === currentUser.id);

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-600 text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">TaxiHub Driver</h1>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="hidden md:flex items-center gap-4">
              <span>{currentUser.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded flex items-center gap-2"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-4">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                <DollarSign size={18} /> Total Earnings
              </p>
              <p className="text-3xl font-bold text-green-600">${driverData?.totalEarnings || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-2">Completed Rides</p>
              <p className="text-3xl font-bold text-blue-600">{driverData?.completedRides || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                <Star size={18} /> Average Rating
              </p>
              <p className="text-3xl font-bold text-yellow-500">{driverData?.avgRating || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Ride Summaries</h2>
            {driverRides.length === 0 ? (
              <p className="text-gray-600">No rides yet. Become available to receive ride requests!</p>
            ) : (
              <div className="space-y-4">
                {driverRides.map(ride => {
                  const customer = customers.find(c => c.id === ride.customerId);
                  return (
                    <div key={ride.id} className="border-l-4 border-green-600 bg-gray-50 p-4 rounded">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold flex items-center gap-2">
                            <Phone size={18} /> {customer?.name}
                          </p>
                          <p className="text-sm text-gray-600">{ride.pickup} → {ride.dropoff}</p>
                        </div>
                        <p className="text-lg font-bold text-green-600">${ride.fare}</p>
                      </div>
                      {ride.rating > 0 && (
                        <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(ride.rating)].map((_, i) => (
                                <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <span className="text-sm font-semibold">{ride.rating}/5</span>
                          </div>
                          <p className="text-sm text-gray-700 flex items-center gap-2">
                            <MessageSquare size={16} /> "{ride.feedback}"
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default TaxiBookingSystem;