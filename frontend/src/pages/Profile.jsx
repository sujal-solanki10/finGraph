import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, User as UserIcon, Save, ArrowLeft } from 'lucide-react';
import { getProfile, updateProfile } from '../services/profile';
import Navbar from '../components/Navbar';

export default function Profile() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    bio: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        if (data) {
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
            dateOfBirth: data.dateOfBirth || '',
            bio: data.bio || ''
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    if (formData.phone && !/^\d{10,15}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      setError('Phone number is invalid. Must be 10-15 digits.');
      return false;
    }
    if (formData.dateOfBirth && new Date(formData.dateOfBirth) > new Date()) {
      setError('Date of birth cannot be in the future.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validate()) return;
    
    setSaving(true);
    try {
      const data = await updateProfile(formData);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth || '',
        bio: data.bio || ''
      });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center">
        <Activity size={32} className="text-primary animate-pulse mb-4" />
        <p className="text-text-secondary">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12 font-sans">
      <Navbar />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl mt-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
          
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <UserIcon size={24} className="text-primary" />
            <h1 className="text-2xl font-bold text-text">User Profile</h1>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error/10 border border-error text-error px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline text-sm">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-primary/10 border border-primary text-primary px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline text-sm">{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-text-secondary">
                  First Name
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full appearance-none rounded-md border border-border bg-secondary px-3 py-2 text-text placeholder-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-text-secondary">
                  Last Name
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full appearance-none rounded-md border border-border bg-secondary px-3 py-2 text-text placeholder-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text-secondary">
                  Phone
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full appearance-none rounded-md border border-border bg-secondary px-3 py-2 text-text placeholder-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-text-secondary">
                  Date of Birth
                </label>
                <div className="mt-1">
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="block w-full appearance-none rounded-md border border-border bg-secondary px-3 py-2 text-text placeholder-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-text-secondary">
                Bio
              </label>
              <div className="mt-1">
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className="block w-full appearance-none rounded-md border border-border bg-secondary px-3 py-2 text-text placeholder-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="submit"
                disabled={saving}
                className="flex justify-center items-center gap-2 rounded-md border border-transparent bg-primary py-2 px-6 text-sm font-medium text-secondary shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
