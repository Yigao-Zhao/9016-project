import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../services/api';
import PostList from '../Posts/PostList';
import EditProfile from './EditProfile';

function Profile() {
  const { username } = useParams();
  console.log("Extracted username from URL:", username);
  const { userProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        // Find user by username
        const usersResponse = await userApi.getUsers();
        console.log("Users response:", usersResponse.data);
        console.log("Looking for username:", username);
        const foundUser = usersResponse.data.find(user => user.username === username);
        
        if (!foundUser) {
          setError('User not found');
          setLoading(false);
          return;
        }
        
        setUserId(foundUser.user_id);
        
        // Get user profile
        const profileResponse = await userApi.getUser(foundUser.user_id);
        setProfile(profileResponse.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [username]);
  
  const handleProfileUpdate = async (updatedData) => {
    try {
      await userApi.updateUser(profile.user_id, updatedData);
      setProfile({
        ...profile,
        ...updatedData
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile, please try again');
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }
  
  const isOwnProfile = userProfile && profile && userProfile.user_id === profile.user_id;
  
  return (
    <div>
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 text-center">
              <img 
                src={profile.profile_image_url || '/default-avatar.png'} 
                alt={`${profile.username}Profile Photo`} 
                className="rounded-circle mb-3" 
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
            </div>
            
            <div className="col-md-9">
              {isEditing ? (
                <EditProfile 
                  profile={profile}
                  onUpdate={handleProfileUpdate}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3>{profile.username}</h3>
                    {isOwnProfile && (
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setIsEditing(true)}
                      >
                        Editing Profile
                      </button>
                    )}
                  </div>
                  
                  <h5>{profile.full_name}</h5>
                  <p className="text-muted mb-3">
                    Join in {new Date(profile.created_at).toLocaleDateString('zh-CN')}
                  </p>
                  <p>{profile.bio || 'The user did not upload any personal profile'}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <h4 className="mb-3">Post</h4>
      <PostList userId={userId} />
    </div>
  );
}

export default Profile;