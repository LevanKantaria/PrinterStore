import "./App.css";
import React, { Suspense } from 'react';
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Materials from "./pages/Material";
import Marketplace from "./pages/Marketplace";
import About from "./pages/About";
import Footer from "./components/footer/Footer";
import UploadItem from "./components/uploadItem/UploadItem";
import ProductPage from "./components/productPage/ProductPage";
import ShoppingCartExpanded from "./components/shoppingCartExpnded/ShoppingCartExpanded";
import MarketplaceItemsList from "./components/marketplaceItemsList/MarketplaceItemsList";

const StlViewerV2 = React.lazy(() => import('./components/stlViewer/StlViewerV2'));


function App() {
  return (
    <div className="App">
      <Navbar />  
      <Routes>
        <Route path="/" element={<Home />} />        
        <Route path="/materials" element={<Materials />} />        
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/about" element={<About />} />
        <Route path="/upload" element={<UploadItem />} />
        <Route path="/marketplace/:category/" element={<MarketplaceItemsList />} />
        <Route path="/marketplace/:category/:subCategory" element={<MarketplaceItemsList />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="/cart" element={<ShoppingCartExpanded />} />
        <Route path="/cart/:id" element={<ShoppingCartExpanded />} />        
        <Route path="/quote" element={
           <Suspense fallback={<div>Loading...</div>}>
              <StlViewerV2 />
            </Suspense>} /> 
      </Routes>
        <Footer />
      
    </div>
  );
}

export default App;

