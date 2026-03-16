import React, { useContext, useEffect, useState } from 'react';
import productStyles from './Product.module.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link, useLocation } from 'react-router-dom';
import Image from 'react-bootstrap/Image';
import { EmptyCartContext } from '../../context/EmptyCartContext';
import { ProductDetailContext } from '../../context/ProductDetailContext';
import { CartContext } from '../../context/CartContext';
import { ProductSpecsContext } from '../../context/ProductSpecsContext';
import { ProductMoreContext } from '../../context/ProductMoreContext';
import { fetchProductById, fetchProducts } from '../../api/products';

const Product = ({ productID }) => {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const { setEmptyCart } = useContext(EmptyCartContext);
    const { setProductDetail } = useContext(ProductDetailContext);
    const { addToCart } = useContext(CartContext);
    const { setProductSpecs } = useContext(ProductSpecsContext);
    const { setProductMore } = useContext(ProductMoreContext);
    const [product, setProduct] = useState(null);
    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState(0);
    const [productQty, setProductQty] = useState(1);

    useEffect(() => {
        const loadProduct = async () => {
            if (!productID) {
                return;
            }

            try {
                const productData = await fetchProductById(productID);
                setProduct(productData);
                setProductDetail(productData);
                setProductSpecs([
                    {
                        quantity: 1,
                        color: productData.colors[0]?.name || '',
                        size: productData.sizes[0] || ''
                    }
                ]);

                const relatedProducts = await fetchProducts({ category: productData.category });
                const filteredRelated = relatedProducts.filter((item) => item.id !== productData.id);
                setProductMore(filteredRelated);
                localStorage.setItem('productMore', JSON.stringify(filteredRelated));
            } catch (error) {
                console.error(error);
            }
        };

        loadProduct();
    }, [productID, setProductDetail, setProductMore, setProductSpecs]);

    if (!product) {
        return null;
    }

    let currentPath = '';
    const crumbs = pathSegments.map((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === pathSegments.length - 1;

        return (
            <span key={currentPath}>
                {isLast ? (
                    <span>{product.title}</span>
                ) : (
                    <>
                        <Link to={currentPath} className='text-decoration-none text-muted'>
                            {segment.charAt(0).toUpperCase() + segment.slice(1)}
                        </Link>
                        <span className='mx-2'>/</span>
                    </>
                )}
            </span>
        );
    });

    const handleAddToCart = () => {
        const cartProduct = {
            ...product,
            quantity: productQty,
            selectedColor: product.colors[selectedColor]?.name,
            selectedSize: product.sizes[selectedSize]
        };

        setEmptyCart(false);
        setProductDetail(cartProduct);
        addToCart(cartProduct);
    };

    return (
        <section className={productStyles.productcontainer}>
            <Container fluid className='py-lg-5 py-3'>
                <Row>
                    <Col lg={12} className='border-top border-tertiary py-lg-4 pt-4'>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb" style={{ fontSize: '14px' }}>
                                <li className="breadcrumb-item me-2">
                                    <Link to="/" className='text-decoration-none text-muted'>Home</Link>
                                </li>
                                <span className='me-2'>/</span>
                                {crumbs.length > 0 && crumbs}
                            </ol>
                        </nav>
                    </Col>
                    <Col lg={6} md={6}>
                        <div className='w-100'>
                            <Image src={product.image} fluid className={`${productStyles.productimg} rounded-4 ms-lg-3 mb-lg-0 mb-3`} />
                        </div>
                    </Col>
                    <Col lg={6} md={6} className='ps-lg-4'>
                        <div>
                            <h2 className={`${productStyles.producttitle} text-uppercase`}>{product.title}</h2>
                        </div>
                        <div className='d-flex align-items-center pb-2'>
                            <div className={`${productStyles.ratingtext} pt-1`}>{product.rating}/5</div>
                        </div>
                        <div className='d-flex align-items-center pb-2'>
                            <div className='pt-2'>
                                <h2 className={`${productStyles.sliderprice} me-2 fw-semibold`}>${product.discountedPrice}</h2>
                            </div>
                            <div className='pt-2'>
                                <h2 className={`${productStyles.slideroldprice} me-2 fw-semibold`}>${product.oldPrice}</h2>
                            </div>
                            <div className={productStyles.sliderdiscountbg}>
                                <span className={productStyles.sliderdiscounttext}>
                                    -{100 - Math.round(product.discountedPrice / product.oldPrice * 100)}%
                                </span>
                            </div>
                        </div>
                        <div className='border-bottom border-tertiary'>
                            <p className={productStyles.productdesctext}>{product.description}</p>
                        </div>
                        <div className='py-4 border-bottom border-tertiary'>
                            <p className={productStyles.productdesctext}>Select Colors</p>
                            <div className={productStyles['color-picker']}>
                                {product.colors.map((item, index) => (
                                    <div key={item.name}>
                                        <input
                                            type="radio"
                                            id={item.name}
                                            name="color"
                                            checked={selectedColor === index}
                                            onChange={() => setSelectedColor(index)}
                                        />
                                        <label htmlFor={item.name} style={{ backgroundColor: item.value, border: '1px solid rgba(0,0,0,0.2)' }}></label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='py-4 border-bottom border-tertiary'>
                            <p className={productStyles.productdesctext}>Choose Size</p>
                            <div className={productStyles.sizebtncontainer}>
                                {product.sizes.map((item, index) => (
                                    <div key={item}>
                                        <button className={selectedSize === index ? productStyles.activesizebtn : productStyles.sizebtn} onClick={() => setSelectedSize(index)}>
                                            {item}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='py-4 d-flex'>
                            <div className='me-3'>
                                <button className={productStyles.qtybtn}>
                                    <span onClick={() => setProductQty((prev) => Math.max(1, prev - 1))}>-</span>
                                    <span>{productQty}</span>
                                    <span onClick={() => setProductQty((prev) => prev + 1)}>+</span>
                                </button>
                            </div>
                            <div>
                                <button className={productStyles.addtocartbtn} onClick={handleAddToCart}>Add to Cart</button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section >
    );
};

export default Product;
