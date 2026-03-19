import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import DressStyle from './components/Home/DressStyle';
import Footer from './components/Home/Footer';
import HappyCustomer from './components/Home/HappyCustomer';
import Hero from './components/Home/Hero';
import LatestOffer from './components/Home/LatestOffer';
import NewArrival from './components/Home/NewArrival';
import TopNav from './components/Home/TopNav';
import TopSelling from './components/Home/TopSelling';
import Shop from './components/Shop/Shop';
import Product from './components/Product/Product';
import { useEffect, useState } from 'react';
import { ProductContext } from './context/ProductContext';
import ProductDetail from './components/Product/ProductDetail';
import ProductMore from './components/Product/ProductMore';
import { ProductMoreContext } from './context/ProductMoreContext';
import Cart from './components/Cart/Cart';
import { EmptyCartContext } from './context/EmptyCartContext';
import { ProductDetailContext } from './context/ProductDetailContext'
import { CartProvider } from './context/CartContext';
import { ProductSpecsContext } from './context/ProductSpecsContext';
import { AuthProvider } from './context/AuthContext';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import Account from './components/Auth/Account';
import TrackOrder from './components/Auth/TrackOrder';
import PolicyPage from './components/Legal/PolicyPage';
import { legalContent } from './data/legalContent';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};
function App() {
  const [productID, setProductID] = useState(() => {
    const savedID = localStorage.getItem('productID');
    return savedID;
  })

  const [productMore, setProductMore] = useState(() => {
    const savedProducts = localStorage.getItem('productMore');
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  console.log(productMore);

  const [emptyCart, setEmptyCart] = useState(true)

  const [productDetail, setProductDetail] = useState([])

  const [productSpecs, setProductSpecs] = useState([{ quantity: '', color: '', size: '' }])

  console.log(productSpecs)

  return (
    <div className="App">
      <ProductContext.Provider value={{ productID, setProductID }}>
        <ProductMoreContext.Provider value={{ productMore, setProductMore }}>
          <EmptyCartContext.Provider value={{ emptyCart, setEmptyCart }}>
            <ProductDetailContext.Provider value={{ productDetail, setProductDetail }}>
              <AuthProvider>
                <CartProvider>
                  <ProductSpecsContext.Provider value={{ productSpecs, setProductSpecs }}>
                    <Router>
                      <ScrollToTop />
                      <Routes>
                      <Route path='/'
                        element={<div>
                          <TopNav />
                          <Hero />
                          <NewArrival />
                          <TopSelling />
                          <DressStyle />
                          <HappyCustomer />
                          <LatestOffer />
                          <Footer />
                        </div>}>
                      </Route>
                      <Route path='/shop'
                        element={<div>
                          <TopNav />
                          <Shop />
                          <LatestOffer />
                          <Footer />
                        </div>}>
                      </Route>
                      <Route path='/shop/product'
                        element={<div>
                          <TopNav />
                          <Product productID={productID} />
                          <ProductDetail />
                          <ProductMore productMore={productMore} />
                          <LatestOffer />
                          <Footer />
                        </div>}>
                      </Route>
                      <Route path='/cart'
                        element={<div>
                          <TopNav />
                          <Cart emptyCart={emptyCart} productDetail={productDetail} productSpecs={productSpecs} />
                          <LatestOffer />
                          <Footer />
                        </div>}>
                      </Route>
                      <Route path='/signin'
                        element={<div>
                          <TopNav />
                          <SignIn />
                          <Footer />
                        </div>}>
                      </Route>
                      <Route path='/signup'
                        element={<div>
                          <TopNav />
                          <SignUp />
                          <Footer />
                        </div>}>
                      </Route>
                      <Route path='/account'
                        element={<div>
                          <TopNav />
                          <Account />
                          <Footer />
                        </div>}>
                      </Route>
                      <Route path='/track-order'
                        element={<div>
                          <TopNav />
                          <TrackOrder />
                          <Footer />
                        </div>}>
                      </Route>
                      <Route path='/privacy-policy'
                        element={<div>
                          <TopNav />
                          <PolicyPage {...legalContent.privacy} />
                          <Footer />
                        </div>}>
                      </Route>
                      <Route path='/terms'
                        element={<div>
                          <TopNav />
                          <PolicyPage {...legalContent.terms} />
                          <Footer />
                        </div>}>
                      </Route>
                      <Route path='/return-refund-policy'
                        element={<div>
                          <TopNav />
                          <PolicyPage {...legalContent.returns} />
                          <Footer />
                        </div>}>
                      </Route>
                      <Route path='/shipping-policy'
                        element={<div>
                          <TopNav />
                          <PolicyPage {...legalContent.shipping} />
                          <Footer />
                        </div>}>
                      </Route>
                      </Routes>
                    </Router>
                  </ProductSpecsContext.Provider>
                </CartProvider>
              </AuthProvider>
            </ProductDetailContext.Provider>
          </EmptyCartContext.Provider>
        </ProductMoreContext.Provider>
      </ProductContext.Provider>
    </div>
  );
}

export default App;
