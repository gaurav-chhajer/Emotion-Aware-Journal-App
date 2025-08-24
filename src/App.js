import React, { useState, useEffect, createContext, useContext } from "react";
import { initializeApp } from "firebase/app";
// *UPDATED*: Added GoogleAuthProvider and signInWithPopup
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit2,
  LogOut,
  Plus,
  Save,
  Trash2,
  User,
  BarChart2,
  Smile,
  Frown,
  Meh,
  Angry,
  Heart,
  Loader,
} from "lucide-react";

// --- Firebase Configuration ---
// In your firebase configuration file
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Authentication Context ---
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = { user, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};

// --- Main App Component ---
function App() {
  const { user } = useAuth();
  return user ? <JournalApp /> : <AuthScreen />;
}

// --- Google Icon SVG ---
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    ></path>
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    ></path>
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.586,44,31.023,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
  </svg>
);

// --- Authentication Screen ---
const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // *NEW*: Function to handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">Emotion Journal</h1>
          <p className="mt-2 text-gray-600">
            Your personal space to reflect and understand.
          </p>
        </div>

        {/* *NEW*: Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center py-3 font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50"
        >
          <GoogleIcon />
          Sign in with Google
        </button>

        {/* *NEW*: Separator */}
        <div className="flex items-center">
          <div className="flex-grow bg-gray-200 h-px"></div>
          <span className="mx-4 text-sm text-gray-400">OR</span>
          <div className="flex-grow bg-gray-200 h-px"></div>
        </div>

        <form className="space-y-6" onSubmit={handleEmailAuth}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full px-4 py-3 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 flex items-center justify-center"
          >
            {loading && <Loader className="animate-spin w-5 h-5 mr-2" />}
            {isLogin ? "Log In with Email" : "Sign Up with Email"}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 font-semibold text-blue-600 hover:underline"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>
      </div>
    </div>
  );
};

// --- Journal Application ---
const JournalApp = () => {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => { 
    if (user) {
      const q = query(
        collection(db, "journals"),
        where("userId", "==", user.uid)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const entriesData = [];
        querySnapshot.forEach((doc) => {
          entriesData.push({ id: doc.id, ...doc.data() });
        });
        entriesData.sort(
          (a, b) => b.timestamp?.toDate() - a.timestamp?.toDate()
        );
        setEntries(entriesData);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const analyzeAndSaveEntry = async () => {
    if (currentEntry.trim() === "" || isSaving) return;
    setIsSaving(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL; 
      const response = await fetch(${apiUrl}/analyze, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentEntry }),
      });

      if (!response.ok) {
        throw new Error("Analysis API call failed");
      }

      const analysis = await response.json();

      const newEntryData = {
        userId: user.uid,
        text: currentEntry,
        emotion: analysis.emotion,
        keywords: analysis.keywords,
        timestamp: serverTimestamp(),
      };

      if (editingEntry) {
        const entryRef = doc(db, "journals", editingEntry.id);
        await updateDoc(entryRef, {
          text: currentEntry,
          emotion: analysis.emotion,
          keywords: analysis.keywords,
        });
        setEditingEntry(null);
      } else {
        await addDoc(collection(db, "journals"), newEntryData);
      }
      setCurrentEntry("");
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Sorry, there was an error saving your entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (entry) => {
    setEditingEntry(entry);
    setCurrentEntry(entry.text);
  };

  const cancelEdit = () => {
    setEditingEntry(null);
    setCurrentEntry("");
  };

  const deleteEntry = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      await deleteDoc(doc(db, "journals", id));
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
      <Navbar
        onToggleDashboard={() => setShowDashboard(!showDashboard)}
        showDashboard={showDashboard}
      />
      <main className="p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {showDashboard ? (
            <Dashboard entries={entries} />
          ) : (
            <>
              <JournalEditor
                currentEntry={currentEntry}
                setCurrentEntry={setCurrentEntry}
                onSave={analyzeAndSaveEntry}
                isEditing={!!editingEntry}
                onCancelEdit={cancelEdit}
                isSaving={isSaving}
              />
              <JournalFeed
                entries={entries}
                onEdit={startEdit}
                onDelete={deleteEntry}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// --- Components ---

const Navbar = ({ onToggleDashboard, showDashboard }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-blue-600">Emotion Journal</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleDashboard}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              {showDashboard ? "Journal" : "Dashboard"}
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <User className="w-6 h-6 text-gray-600" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    {user.email}
                  </div>
                  <button
                    onClick={() => signOut(auth)}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const JournalEditor = ({
  currentEntry,
  setCurrentEntry,
  onSave,
  isEditing,
  onCancelEdit,
  isSaving,
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? "Edit Your Entry" : "How are you feeling today?"}
      </h2>
      <textarea
        value={currentEntry}
        onChange={(e) => setCurrentEntry(e.target.value)}
        placeholder="Write about your day, your thoughts, your feelings..."
        className="w-full h-40 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        disabled={isSaving}
      ></textarea>
      <div className="flex justify-end items-center mt-4 space-x-3">
        {isEditing && (
          <button
            onClick={onCancelEdit}
            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            disabled={isSaving}
          >
            Cancel
          </button>
        )}
        <button
          onClick={onSave}
          className="flex items-center justify-center px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader className="animate-spin w-4 h-4 mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isSaving
            ? "Analyzing..."
            : isEditing
            ? "Update Entry"
            : "Save Entry"}
        </button>
      </div>
    </div>
  );
};

const JournalFeed = ({ entries, onEdit, onDelete }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Past Entries</h2>
      {entries.length > 0 ? (
        entries.map((entry) => (
          <JournalEntryCard
            key={entry.id}
            entry={entry}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      ) : (
        <div className="text-center py-10 bg-white rounded-2xl shadow-md">
          <p className="text-gray-500">You have no entries yet.</p>
          <p className="text-gray-400 text-sm mt-1">
            Write one above to get started!
          </p>
        </div>
      )}
    </div>
  );
};

const EmotionIcon = ({ emotion, size = "w-8 h-8" }) => {
  const emotionMap = {
    Joy: <Smile className={`text-yellow-500 ${size}`} />,
    Sadness: <Frown className={`text-blue-500 ${size}`} />,
    Anger: <Angry className={`text-red-500 ${size}`} />,
    Love: <Heart className={`text-pink-500 ${size}`} />,
    Neutral: <Meh className={`text-gray-500 ${size}`} />,
    default: <Meh className={`text-gray-400 ${size}`} />,
  };
  return emotionMap[emotion] || emotionMap.default;
};

const JournalEntryCard = ({ entry, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const formattedDate = entry.timestamp
    ? new Date(entry.timestamp.toDate()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Just now";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <EmotionIcon emotion={entry.emotion} />
            <div>
              <p className="font-bold text-lg">{entry.emotion}</p>
              <p className="text-sm text-gray-500">{formattedDate}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(entry)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-gray-700 whitespace-pre-wrap">{entry.text}</p>
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Keywords:</p>
            <div className="flex flex-wrap gap-2">
              {entry.keywords?.map((kw, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Dashboard & Charts ---
const Dashboard = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Your Dashboard Awaits</h2>
        <p className="text-gray-600">
          Write some journal entries to see your emotional insights here!
        </p>
      </div>
    );
  }

  // Process data for charts
  const emotionCounts = entries.reduce((acc, entry) => {
    acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
    return acc;
  }, {});

  const emotionData = Object.keys(emotionCounts).map((key) => ({
    name: key,
    value: emotionCounts[key],
  }));

  const COLORS = {
    Joy: "#FFBB28",
    Sadness: "#0088FE",
    Anger: "#FF8042",
    Love: "#FF4560",
    Neutral: "#A0AEC0",
  };

  const entriesByDay = entries.reduce((acc, entry) => {
    if (!entry.timestamp) return acc;
    const day = new Date(entry.timestamp.toDate()).toLocaleDateString("en-CA"); // YYYY-MM-DD
    if (!acc[day]) {
      acc[day] = 0;
    }
    acc[day]++;
    return acc;
  }, {});

  const activityData = Object.keys(entriesByDay)
    .sort()
    .map((day) => ({
      name: new Date(day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      entries: entriesByDay[day],
    }));

  const allKeywords = entries.flatMap((entry) => entry.keywords || []);
  const keywordCounts = allKeywords.reduce((acc, kw) => {
    acc[kw] = (acc[kw] || 0) + 1;
    return acc;
  }, {});

  const radarData = Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([subject, A]) => ({
      subject,
      A,
      fullMark: Math.max(...Object.values(keywordCounts)),
    }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold mb-4">Emotion Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={emotionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {emotionData.map((entry, index) => (
                  <Cell 
                    key={cell-${index}}
                    fill={COLORS[entry.name] || "#8884d8"}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold mb-4">Journaling Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData.slice(-15)}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="entries" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold mb-4">Keyword Focus</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis />
            <Radar
              name="Keywords"
              dataKey="A"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// The root component needs to be wrapped in the AuthProvider
const Root = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default Root;