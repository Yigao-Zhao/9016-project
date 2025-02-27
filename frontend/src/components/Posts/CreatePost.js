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
  
  // 处理图片URL验证
  const validateImageUrl = (url) => {
    if (!url) return true;
    
    // 简单的URL验证
    const urlPattern = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i;
    return urlPattern.test(url);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return setError('帖子内容不能为空');
    }
    
    if (imageUrl && !validateImageUrl(imageUrl)) {
      return setError('请输入有效的图片URL');
    }
    
    try {
      setLoading(true);
      
      // 创建帖子
      await postApi.createPost({
        content,
        imageUrl: imageUrl.trim() || null
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error);
      setError('发布帖子失败，请重试');
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
            <h5 className="mb-0">发布新帖子</h5>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="content" className="form-label">内容</label>
                <textarea
                  id="content"
                  className="form-control"
                  rows="5"
                  placeholder="分享你的想法..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                ></textarea>
              </div>
              
              <div className="mb-3">
                <label htmlFor="imageUrl" className="form-label">图片URL（可选）</label>
                <input
                  type="url"
                  id="imageUrl"
                  className="form-control"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <small className="text-muted">输入图片的完整URL地址</small>
              </div>
              
              {imageUrl && !previewError && (
                <div className="mb-3">
                  <p className="mb-1">图片预览：</p>
                  <img 
                    src={imageUrl} 
                    alt="预览" 
                    className="img-fluid rounded border" 
                    style={{ maxHeight: '200px' }}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                </div>
              )}
              
              {imageUrl && previewError && (
                <div className="alert alert-warning mb-3">
                  无法加载图片预览，请检查URL是否正确
                </div>
              )}
              
              <div className="d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? '发布中...' : '发布'}
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