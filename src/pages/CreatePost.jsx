import React, { useState, useRef } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { UploadIcon, CloseIcon, SparklesIcon } from "../Icons";

const CreatePost = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // States
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: "", isError: false });

  const showToast = (message, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast({ show: false, message: "", isError: false });
    }, 4000);
  };

  // Drag and Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    // Validate type (must be image)
    if (!selectedFile.type.startsWith("image/")) {
      showToast("Please upload an image file (PNG, JPG, WebP, etc.)", true);
      return;
    }

    // Validate size (limit to 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (selectedFile.size > maxSizeInBytes) {
      showToast("File size too large. Please select an image under 5MB.", true);
      return;
    }

    setFile(selectedFile);
    
    // Revoke old object URL if exists to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      showToast("Please upload an image for your post", true);
      return;
    }

    if (!caption.trim()) {
      showToast("Please write a caption", true);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption.trim());

    api.post("/create-post", formData)
      .then((res) => {
        setLoading(false);
        // Dispatch custom event to notify App Sidebar to reload counts
        window.dispatchEvent(new Event("postCreated"));
        
        // Clean up preview URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        
        navigate("/feed");
      })
      .catch((err) => {
        console.error("Error creating post:", err);
        setLoading(false);
        showToast("Error creating post. Please try again.", true);
      });
  };

  return (
    <div className="create-post-container">
      <div className="create-post-card">
        <h1>Create Post</h1>
        <p>Express yourself and share it with the world</p>

        <form onSubmit={handleSubmit} className="create-post-form">
          
          {/* Custom File Upload Dropzone */}
          <div 
            className={`drag-drop-zone ${dragActive ? "drag-active" : ""}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              name="image" 
              accept="image/*" 
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {previewUrl ? (
              <div className="preview-container">
                <img src={previewUrl} alt="Upload preview" />
                <button 
                  type="button" 
                  onClick={removeFile} 
                  className="remove-preview-btn"
                  title="Remove image"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <UploadIcon className="w-10 h-10" />
                <span className="drag-drop-label">Drag & drop your image here, or click to browse</span>
                <span className="drag-drop-subtext">Supports PNG, JPG, JPEG, WEBP or GIF (max 5MB)</span>
              </>
            )}
          </div>

          {/* Caption Input Field */}
          <div className="caption-group">
            <label htmlFor="caption" className="caption-label">Caption</label>
            <textarea
              id="caption"
              className="caption-textarea"
              placeholder="What's on your mind? Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
            />
          </div>

          {/* Glowing Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary btn-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="spinner" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: 0.75 }}></path>
                </svg>
                Posting...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5" /> Submit Post
              </>
            )}
          </button>
        </form>
      </div>

      {/* Beautiful Toast Notifications */}
      {toast.show && (
        <div className={`custom-toast ${toast.isError ? "error" : ""}`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default CreatePost;