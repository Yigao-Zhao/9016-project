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
        // 先根据用户名查找用户
        const usersResponse = await userApi.getUsers();
        console.log("Users response:", usersResponse.data);
        console.log("Looking for username:", username);
        const foundUser = usersResponse.data.find(user => user.username === username);
        
        if (!foundUser) {
          setError('用户不存在');
          setLoading(false);
          return;
        }
        
        setUserId(foundUser.user_id);
        
        // 获取详细资料
        const profileResponse = await userApi.getUser(foundUser.user_id);
        setProfile(profileResponse.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('加载用户资料失败');
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
      alert('更新资料失败，请重试');
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">加载中...</span>
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
                alt={`${profile.username}的头像`} 
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
                        编辑资料
                      </button>
                    )}
                  </div>
                  
                  <h5>{profile.full_name}</h5>
                  <p className="text-muted mb-3">
                    加入于 {new Date(profile.created_at).toLocaleDateString('zh-CN')}
                  </p>
                  <p>{profile.bio || '这个用户还没有添加个人简介'}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <h4 className="mb-3">帖子</h4>
      <PostList userId={userId} />
    </div>
  );
}

export default Profile;