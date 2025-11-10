import { Route, Routes } from "react-router-dom";
import SignUp from "./ProductsAuth/SignUp.jsx";
import LogIn from "./ProductsAuth/LogIn.jsx";
import AllProducts from "./ProductsPages/AllProducts.jsx";
import NewProducts from "./ProductsPages/NewProducts.jsx";
import Products from "./ProductsPages/Products.jsx";
import EditProducts from "./ProductsPages/EditProducts.jsx";
import Navbar from "./ProductsPages/Navbar.jsx";
import CartProducts from "./ProductsCarts/CartProducts.jsx";

function App() {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container-fluid py-4">
        <Routes>
          <Route path="/auth/login" element={<LogIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/" element={<AllProducts />} />
          <Route path="/api/products" element={<AllProducts />} />
          <Route path="/api/products/new" element={<NewProducts />} />
          <Route path="/api/products/:productsId" element={<Products />} />
          <Route path="/api/products/:productsId/edit" element={<EditProducts />} />
          <Route path="/api/products/carts-show/:usersId" element={<CartProducts />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
