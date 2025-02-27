import React, { useState } from 'react';

function EditProfile({ profile, onUpdate, onCancel }) {
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [profileImageUrl, setProfileImageUrl] = useState(profile.profile_image_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState(false);
  
  // 处理图片URL验证
  const validateImageUrl = (url) => {
    if (!url) return true;
    
    // 简单的URL验证
    const urlPattern = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i;
    return urlPattern.test(url);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (profileImageUrl && !validateImageUrl(profileImageUrl)) {
      return setError('请输入有效的图片URL');
    }
    
    setLoading(true);
    
    try {
      await onUpdate({
        fullName,
        bio,
        profileImageUrl
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('更新资料失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  const handleImageError = () => {
    setPreviewError(true);
  };
  
  const handleImageLoad = () => {
    setPreviewError(false);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      
      <div className="mb-3">
        <label htmlFor="profileImageUrl" className="form-label">头像URL</label>
        <input
          type="url"
          id="profileImageUrl"
          className="form-control"
          placeholder="https://example.com/avatar.jpg"
          value={profileImageUrl}
          onChange={(e) => setProfileImageUrl(e.target.value)}
        />
      </div>
      
      {profileImageUrl && (
        <div className="mb-3 text-center">
          <img 
            src={profileImageUrl} 
            alt="头像预览" 
            className={`rounded-circle ${previewError ? 'd-none' : ''}`}
            style={{ width: '120px', height: '120px', objectFit: 'cover' }} 
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {previewError && (
            <div className="alert alert-warning">
              无法加载头像预览，请检查URL是否正确
            </div>
          )}
        </div>
      )}
      
      <div className="mb-3">
        <label htmlFor="fullName" className="form-label">全名</label>
        <input
          type="text"
          id="fullName"
          className="form-control"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      
      <div className="mb-3">
        <label htmlFor="bio" className="form-label">个人简介</label>
        <textarea
          id="bio"
          className="form-control"
          rows="3"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        ></textarea>
      </div>
      
      <div className="d-flex justify-content-end gap-2">
        <button 
          type="button" 
          className="btn btn-outline-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          取消
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
}

export default EditProfile;