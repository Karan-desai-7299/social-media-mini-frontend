import React, { useState, useEffect } from "react";
import api from "../api";
import { 
  SearchIcon, 
  HeartIcon, 
  CloseIcon, 
  GlobeIcon, 
  ExternalLinkIcon,
  PlusIcon
} from "../Icons";
import { Link } from "react-router-dom";

const Feed = () => {
  // Core states
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState("all"); // "all" | "favorites"
  
  // Likes and overlay animations
  const [likedPosts, setLikedPosts] = useState({});
  const [activeHeartPop, setActiveHeartPop] = useState({});
  
  // Lightbox & details state
  const [activeLightbox, setActiveLightbox] = useState(null);
  
  // Custom toast notification state
  const [toast, setToast] = useState({ show: false, message: "", isError: false });

  const showToast = (message, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast({ show: false, message: "", isError: false });
    }, 3000);
  };

  // On mount: fetch posts and load likes
  useEffect(() => {
    // Load liked posts from localStorage
    try {
      const savedLikes = JSON.parse(localStorage.getItem("pixelwave_liked") || "{}");
      setLikedPosts(savedLikes);
    } catch (e) {
      console.error("Error loading liked posts:", e);
    }

    // Fetch posts from backend
    api.get("/posts")
      .then((res) => {
        if (res.data && res.data.posts) {
          // Keep newest posts on top
          setPosts(res.data.posts.reverse());
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setLoading(false);
        showToast("Error loading posts. Please check server.", true);
      });
  }, []);

  // Handle direct Heart Icon click
  const toggleLike = (postId, e) => {
    if (e) e.stopPropagation();
    const isLiked = !likedPosts[postId];
    const newLikes = { ...likedPosts, [postId]: isLiked };
    
    setLikedPosts(newLikes);
    localStorage.setItem("pixelwave_liked", JSON.stringify(newLikes));
    
    // Dispatch custom event to notify App Sidebar to reload stats count
    window.dispatchEvent(new Event("likesUpdated"));
  };

  // Handle double tap on image (toggles like and pops visual heart)
  const handleImageDoubleTap = (postId) => {
    // If not liked already, toggle it to liked
    if (!likedPosts[postId]) {
      toggleLike(postId);
    }
    
    // Pop heart animation
    setActiveHeartPop(prev => ({ ...prev, [postId]: true }));
    
    // Reset animation state
    setTimeout(() => {
      setActiveHeartPop(prev => ({ ...prev, [postId]: false }));
    }, 800);
  };

  // Generate dynamic premium gradient avatars based on MongoDB ID
  const getGradientAvatar = (id) => {
    const gradients = [
      "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
      "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
      "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
      "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    ];
    // Simple hashing using ID
    if (!id || id.length < 4) return gradients[0];
    const index = parseInt(id.slice(-4), 16) % gradients.length;
    return gradients[isNaN(index) ? 0 : index];
  };

  // Create clean usernames based on ID
  const getUsername = (id) => {
    if (!id || id.length < 6) return "@user";
    return `@user_${id.slice(-6)}`;
  };

  // Generate simulated time stamps
  const getSimulatedDate = (index) => {
    const dates = ["Just now", "8m ago", "45m ago", "2h ago", "5h ago", "12h ago", "Yesterday", "2 days ago", "4 days ago", "1 week ago"];
    return dates[index % dates.length];
  };

  // Action: Copy image link
  const copyLink = (imageUrl, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(imageUrl)
      .then(() => {
        showToast("Image URL copied to clipboard!");
      })
      .catch(() => {
        showToast("Failed to copy link.", true);
      });
  };

  // Filter posts based on search input and favorites toggle
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.caption.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = filterActive === "favorites" ? !!likedPosts[post._id] : true;
    return matchesSearch && matchesFavorite;
  });

  return (
    <div className="feed-container">
      
      {/* Search and Filters Header */}
      <div className="feed-header">
        <div className="search-wrapper">
          <SearchIcon />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search posts by caption..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filterActive === "all" ? "active" : ""}`}
            onClick={() => setFilterActive("all")}
          >
            All Posts
          </button>
          <button 
            className={`filter-tab ${filterActive === "favorites" ? "active" : ""}`}
            onClick={() => setFilterActive("favorites")}
          >
            Favorites ({Object.values(likedPosts).filter(Boolean).length})
          </button>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        // Skeleton pulsing cards
        <div className="feed-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="skeleton-card">
              <div className="skeleton-header">
                <div className="skeleton-avatar skeleton-shimmer"></div>
                <div className="skeleton-meta">
                  <div className="skeleton-line skeleton-shimmer" style={{ width: "40%" }}></div>
                  <div className="skeleton-line skeleton-shimmer" style={{ width: "25%" }}></div>
                </div>
              </div>
              <div className="skeleton-image skeleton-shimmer"></div>
              <div className="skeleton-caption">
                <div className="skeleton-line skeleton-shimmer" style={{ width: "90%" }}></div>
                <div className="skeleton-line skeleton-shimmer" style={{ width: "60%" }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="feed-grid">
          {filteredPosts.map((post, idx) => (
            <article key={post._id} className="post-card">
              {/* Card Header */}
              <div className="card-header">
                <div 
                  className="card-avatar" 
                  style={{ background: getGradientAvatar(post._id) }}
                >
                  {getUsername(post._id).charAt(1).toUpperCase()}
                </div>
                <div className="card-meta">
                  <h4>{getUsername(post._id)}</h4>
                  <span>{getSimulatedDate(idx)}</span>
                </div>
              </div>

              {/* Image Container with Double Tap Trigger */}
              <div 
                className="image-container"
                onClick={() => setActiveLightbox(post)}
                onDoubleClick={() => handleImageDoubleTap(post._id)}
              >
                <img src={post.image} alt={post.caption} loading="lazy" />
                
                {/* Visual Double Tap Heart pop */}
                <div className={`like-overlay-heart ${activeHeartPop[post._id] ? "active" : ""}`}>
                  <HeartIcon fill="currentColor" className="w-full h-full" />
                </div>
              </div>

              {/* Body */}
              <div className="card-body">
                <p className="card-caption">{post.caption}</p>
                
                {/* Actions */}
                <div className="card-actions">
                  <button 
                    onClick={(e) => toggleLike(post._id, e)}
                    className={`action-btn ${likedPosts[post._id] ? "liked" : ""}`}
                  >
                    <HeartIcon className="w-5 h-5" />
                    <span>{likedPosts[post._id] ? "Liked" : "Like"}</span>
                  </button>

                  <button 
                    onClick={(e) => copyLink(post.image, e)}
                    className="action-btn"
                    title="Copy image URL"
                  >
                    <ExternalLinkIcon className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="empty-state">
          <GlobeIcon />
          <h3>No posts found</h3>
          <p>
            {filterActive === "favorites" 
              ? "You haven't liked any posts yet. Go to 'All Posts' and double-click an image to like it!"
              : "No posts match your search query. Try typing something else or make a new post."}
          </p>
          {filterActive === "favorites" ? (
            <button className="btn btn-secondary" onClick={() => setFilterActive("all")}>
              View All Posts
            </button>
          ) : (
            <Link to="/create-post" className="btn btn-primary">
              <PlusIcon className="w-5 h-5" /> Share First Post
            </Link>
          )}
        </div>
      )}

      {/* Lightbox / Post Detail Modal */}
      {activeLightbox && (
        <div className="lightbox-overlay" onClick={() => setActiveLightbox(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setActiveLightbox(null)}>
              <CloseIcon className="w-5 h-5" />
            </button>
            
            <div className="lightbox-media">
              <img src={activeLightbox.image} alt={activeLightbox.caption} />
            </div>

            <div className="lightbox-info">
              <div className="lightbox-author">
                <div 
                  className="card-avatar"
                  style={{ background: getGradientAvatar(activeLightbox._id) }}
                >
                  {getUsername(activeLightbox._id).charAt(1).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ fontWeight: 700 }}>{getUsername(activeLightbox._id)}</h4>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Posted recently</span>
                </div>
              </div>

              <div className="lightbox-desc">
                {activeLightbox.caption}
              </div>

              <div className="lightbox-actions">
                <button 
                  onClick={() => toggleLike(activeLightbox._id)}
                  className={`btn ${likedPosts[activeLightbox._id] ? "btn-primary" : "btn-secondary"}`}
                  style={{ width: "100%", gap: "0.5rem" }}
                >
                  <HeartIcon className="w-5 h-5" fill={likedPosts[activeLightbox._id] ? "currentColor" : "none"} />
                  {likedPosts[activeLightbox._id] ? "Liked" : "Like Post"}
                </button>
                
                <button 
                  onClick={(e) => copyLink(activeLightbox.image, e)}
                  className="btn btn-secondary"
                  style={{ width: "100%", gap: "0.5rem" }}
                >
                  <ExternalLinkIcon className="w-5 h-5" /> Copy Image URL
                </button>

                <a 
                  href={activeLightbox.image} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-secondary"
                  style={{ width: "100%", gap: "0.5rem", textDecoration: "none" }}
                >
                  Open Original Image
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom toast alerts */}
      {toast.show && (
        <div className={`custom-toast ${toast.isError ? "error" : ""}`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Feed;