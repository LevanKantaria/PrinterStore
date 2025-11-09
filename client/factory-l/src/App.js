import "./App.css";
import React, { Suspense, useEffect } from "react";
import Home from "./pages/Home";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "./components/navbar/Navbar";
import Materials from "./pages/Material";
import Marketplace from "./pages/Marketplace";
import About from "./pages/About";
import UploadItem from "./components/uploadItem/UploadItem";
import ProductPage from "./components/productPage/ProductPage";
import ShoppingCartExpanded from "./components/shoppingCartExpnded/ShoppingCartExpanded";
import MarketplaceItemsList from "./components/marketplaceItemsList/MarketplaceItemsList";
import Footer from "./components/footer/Footer";
import SignIn from "./components/signIn/SignIn";
import SignUp from "./components/signUp/SignUp";
import Blog from "./pages/Blog";
import Profile from "./pages/Profile";
import { auth } from "./firebase";
import { clearUser, setAuthError, setAuthStatus, setUser } from "./features/auth/authSlice";

const StlViewer = React.lazy(() => import("./components/stlViewer/STLViewer"));

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
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

  const hideChrome = location.pathname.startsWith("/sign-in") || location.pathname.startsWith("/sign-up");

  return (
    <div className="App">
      {!hideChrome && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/upload" element={<UploadItem />} />
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
    </div>
  );
}

export default App;
