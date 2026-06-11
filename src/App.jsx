import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";
import api from "./api";

import CreatePost from "./pages/CreatePost";
import Feed from "./pages/Feed";
import {
  HomeIcon,
  PlusIcon,
  SparklesIcon,
  LinkedInIcon,
  MailIcon,
  GlobeIcon
} from "./Icons";

// Sidebar component displaying creator profile and stats
function Sidebar() {
  const [postCount, setPostCount] = useState(0);
  const [likedCount, setLikedCount] = useState(0);

  const fetchStats = () => {
    // Fetch posts from backend to show total post count
    api.get("/posts")
      .then((res) => {
        if (res.data && res.data.posts) {
          setPostCount(res.data.posts.length);
        }
      })
      .catch((err) => console.log("Sidebar post count error:", err));

    // Calculate liked posts from localStorage
    try {
      const liked = JSON.parse(localStorage.getItem("pixelwave_liked") || "{}");
      const count = Object.values(liked).filter(Boolean).length;
      setLikedCount(count);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();

    // Listen to changes in localStorage (for cross-component communication)
    const handleStorageChange = () => {
      try {
        const liked = JSON.parse(localStorage.getItem("pixelwave_liked") || "{}");
        setLikedCount(Object.values(liked).filter(Boolean).length);
      } catch (e) {}
    };

    window.addEventListener("storage", handleStorageChange);
    // Custom events for same-window updates
    window.addEventListener("likesUpdated", handleStorageChange);
    window.addEventListener("postCreated", fetchStats);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("likesUpdated", handleStorageChange);
      window.removeEventListener("postCreated", fetchStats);
    };
  }, []);

  return (
    <aside className="creator-sidebar">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">K</div>
          <div className="profile-info">
            <h3>Karansinh</h3>
            <p>
              <span className="status-dot"></span> Active Now
            </p>
          </div>
        </div>
        <p className="profile-bio">
          Full Stack Developer passionate about crafting premium web solutions, clean interfaces, and fluid micro-animations.
        </p>
        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-val">{postCount}</div>
            <div className="stat-lbl">Posts</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">{likedCount}</div>
            <div className="stat-lbl">Liked</div>
          </div>
        </div>
        <div className="profile-socials">
          <a
            href="https://www.linkedin.com/in/karansinh-desai-a249a0289"
            target="_blank"
            rel="noreferrer"
            className="social-btn social-linkedin"
            title="LinkedIn Profile"
          >
            <LinkedInIcon className="w-4 h-4" /> LinkedIn
          </a>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=karansinhdesai91@gmail.com"
            target="_blank"
            rel="noreferrer"
            className="social-btn social-mail"
            title="Send Email"
          >
            <MailIcon className="w-4 h-4" /> Email
          </a>
        </div>
      </div>
    </aside>
  );
}

// Navigation Header
function Header() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo-link">
          <SparklesIcon className="w-6 h-6" />
          <span>PixelWave</span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className={`nav-link ${path === "/" ? "active" : ""}`}>
            <HomeIcon className="w-4 h-4" /> Home
          </Link>
          <Link to="/feed" className={`nav-link ${path === "/feed" ? "active" : ""}`}>
            <GlobeIcon className="w-4 h-4" /> Feed
          </Link>
          <Link to="/create-post" className={`nav-link ${path === "/create-post" ? "active" : ""}`}>
            <PlusIcon className="w-4 h-4" /> Share
          </Link>
        </nav>
      </div>
    </header>
  );
}

// Layout wrapper that handles showing/hiding the sidebar
function AppContentWrapper({ children, showSidebar = true }) {
  return (
    <div className={`app-content ${showSidebar ? "with-sidebar" : ""}`}>
      <main className="main-content-flow">{children}</main>
      {showSidebar && <Sidebar />}
    </div>
  );
}

function Home() {
  return (
    <div className="home">
      <div className="home-badge">
        <SparklesIcon className="w-4 h-4" /
      </div>
      <h1>Share Your Story,<br />Vibe in Real-Time</h1>
      <p>
        Welcome to post creation. A high-fidelity, interactive social space where your pictures meet beautiful layout animations. Crafted with state-of-the-art visual styling.
      </p>
      <div className="home-buttons">
        <Link to="/feed" className="btn btn-primary">
          <GlobeIcon className="w-5 h-5" /> Explore Feed
        </Link>
        <Link to="/create-post" className="btn btn-secondary">
          <PlusIcon className="w-5 h-5" /> Share a Moment
        </Link>
      </div>
    </div>
  );
}

const App = () => {
  return (
    <Router>
      <div className="app-layout">
        {/* Glowing Background Blobs */}
        <div className="bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>

        <Header />

        <Routes>
          <Route
            path="/"
            element={
              <AppContentWrapper showSidebar={false}>
                <Home />
              </AppContentWrapper>
            }
          />
          <Route
            path="/create-post"
            element={
              <AppContentWrapper showSidebar={true}>
                <CreatePost />
              </AppContentWrapper>
            }
          />
          <Route
            path="/feed"
            element={
              <AppContentWrapper showSidebar={true}>
                <Feed />
              </AppContentWrapper>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
