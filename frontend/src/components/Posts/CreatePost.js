import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postApi } from '../../services/api';

function CreatePost() {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const navigate = useNavigate();
  
  // Handle image URL validation
  const validateImageUrl = (url) => {
    if (!url) return true;
    
    // Simple URL validation
    const urlPattern = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i;
    return urlPattern.test(url);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return setError('Post content cannot be empty');
    }
    
    if (imageUrl && !validateImageUrl(imageUrl)) {
      return setError('Please enter a valid image URL');
    }
    
    try {
      setLoading(true);
      
      // Create post
      await postApi.createPost({
        content,
        imageUrl: imageUrl.trim() || null
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post, please try again');
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
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Create New Post</h5>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="content" className="form-label">Content</label>
                <textarea
                  id="content"
                  className="form-control"
                  rows="5"
                  placeholder="Share your thoughts..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                ></textarea>
              </div>
              
              <div className="mb-3">
                <label htmlFor="imageUrl" className="form-label">Image URL (Optional)</label>
                <input
                  type="url"
                  id="imageUrl"
                  className="form-control"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <small className="text-muted">Enter the complete URL of the image</small>
              </div>
              
              {imageUrl && !previewError && (
                <div className="mb-3">
                  <p className="mb-1">Image Preview:</p>
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="img-fluid rounded border" 
                    style={{ maxHeight: '200px' }}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                </div>
              )}
              
              {imageUrl && previewError && (
                <div className="alert alert-warning mb-3">
                  Unable to load image preview, please check the URL
                </div>
              )}
              
              <div className="d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;