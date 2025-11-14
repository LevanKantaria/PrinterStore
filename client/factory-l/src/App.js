import "./App.css";
import React, { Suspense, useEffect } from "react";
import Home from "./pages/Home";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "./components/navbar/Navbar";
import Materials from "./pages/Material";
import Marketplace from "./pages/Marketplace";
import About from "./pages/About";
import Contact from "./pages/Contact";
import UploadItem from "./components/uploadItem/UploadItem";
import ProductPage from "./components/productPage/ProductPage";
import ShoppingCartExpanded from "./components/shoppingCartExpnded/ShoppingCartExpanded";
import MarketplaceItemsList from "./components/marketplaceItemsList/MarketplaceItemsList";
import Footer from "./components/footer/Footer";
import SignIn from "./components/signIn/SignIn";
import SignUp from "./components/signUp/SignUp";
import Blog from "./pages/Blog";
import Profile from "./pages/Profile";
import AdminListings from "./pages/AdminListings";
import AdminOrders from "./pages/AdminOrders";
import ScrollToTop from "./components/scrollToTop/ScrollToTop";
import { auth } from "./firebase";
import { clearUser, setAuthError, setAuthStatus, setUser, setUserRole } from "./features/auth/authSlice";
import { getProfile } from "./api/profile";

const StlViewer = React.lazy(() => import("./components/stlViewer/STLViewer"));

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const authStatus = useSelector((state) => state.auth.status);
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Language initialization is handled by langSlice
    const currentLang = localStorage.getItem("lang");
    if (!currentLang) {
      localStorage.setItem("lang", "KA");
    }
  }, []);

  useEffect(() => {
    dispatch(setAuthStatus("loading"));
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          dispatch(
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              phoneNumber: firebaseUser.phoneNumber,
              emailVerified: firebaseUser.emailVerified,
              providerId: firebaseUser.providerData[0]?.providerId ?? null,
              createdAt: firebaseUser.metadata?.creationTime ?? null,
            })
          );
          dispatch(setAuthStatus("authenticated"));
        } else {
          dispatch(clearUser());
          dispatch(setAuthStatus("unauthenticated"));
        }
      },
      (error) => {
        dispatch(setAuthError(error.message));
        dispatch(setAuthStatus("unauthenticated"));
      }
    );

    return () => unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;

    const loadPermissions = async () => {
      try {
        const profile = await getProfile();
        if (!cancelled && profile) {
          dispatch(setUserRole({ isAdmin: profile.isAdmin === true }));
        }
      } catch (error) {
        console.warn("[app] profile fetch failed", error);
      }
    };

    if (authStatus === "authenticated" && currentUser) {
      loadPermissions();
    }

    return () => {
      cancelled = true;
    };
  }, [authStatus, currentUser?.uid, dispatch]);

  const hideChrome = location.pathname.startsWith("/sign-in") || location.pathname.startsWith("/sign-up");

  return (
    <div className="App">
      <ScrollToTop>
        {!hideChrome && <Navbar />}
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/upload" element={<UploadItem />} />
        <Route path="/admin/listings" element={<AdminListings />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/marketplace/:category/" element={<MarketplaceItemsList />} />
        <Route path="/marketplace/:category/:subCategory" element={<MarketplaceItemsList />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="/cart" element={<ShoppingCartExpanded />} />
        <Route path="/cart/:id" element={<ShoppingCartExpanded />} />
        <Route
          path="/quote"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <StlViewer />
            </Suspense>
          }
        />
        </Routes>
        {!hideChrome && <Footer />}
      </ScrollToTop>
    </div>
  );
}

export default App;
