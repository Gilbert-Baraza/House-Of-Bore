import React, { useContext, useEffect, useMemo, useState } from 'react';
import shopStyles from './Shop.module.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import Form from 'react-bootstrap/Form';
import { ProductContext } from '../../context/ProductContext';
import { ProductMoreContext } from '../../context/ProductMoreContext';
import { fetchProducts } from '../../api/products';
import { fetchCategories } from '../../api/categories';

const PRODUCTS_PER_PAGE = 6;

const Shop = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const { setProductID } = useContext(ProductContext);
    const { setProductMore } = useContext(ProductMoreContext);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');
    const [page, setPage] = useState(1);
    const searchTerm = searchParams.get('search') || '';

    let currentPath = '';
    const crumbs = pathSegments.map((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === pathSegments.length - 1;

        return (
            <span key={currentPath}>
                {isLast ? (
                    <span>{segment.charAt(0).toUpperCase() + segment.slice(1)}</span>
                ) : (
                    <>
                        <Link to={currentPath}>{segment}</Link>
                        <span> / </span>
                    </>
                )}
            </span>
        );
    });

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const results = await fetchCategories();
                setCategories(['All', ...results.map((category) => category.name)]);
            } catch (error) {
                console.error(error);
            }
        };

        loadCategories();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const sortMap = {
                    featured: { sort: 'createdAt', order: 'desc' },
                    rating: { sort: 'rating', order: 'desc' },
                    'price-high': { sort: 'price', order: 'desc' },
                    'price-low': { sort: 'price', order: 'asc' }
                };

                const results = await fetchProducts({
                    category: selectedCategory,
                    q: searchTerm,
                    ...sortMap[sortBy]
                });
                setProducts(results);
                setPage(1);
            } catch (error) {
                console.error(error);
            }
        };

        loadProducts();
    }, [selectedCategory, sortBy, searchTerm]);

    const filteredProducts = useMemo(() => products, [products]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
    const paginatedProducts = filteredProducts.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const handleSelectProduct = (product) => {
        setProductID(product.id);
        setProductMore(filteredProducts.filter((item) => item.id !== product.id));
        localStorage.setItem('productID', product.id);
        localStorage.setItem('productMore', JSON.stringify(filteredProducts.filter((item) => item.id !== product.id)));
    };

    return (
        <section className={shopStyles.shopcontainer}>
            <Container fluid className='py-lg-5 py-3'>
                <Row>
                    <Col lg={12} className='border-top border-tertiary py-lg-4 py-3'>
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
                    <Col lg={3} md={4} className='mb-4'>
                        <div className={shopStyles.filterscontainer}>
                            <div className='d-flex justify-content-between border-bottom border-tertiary pb-3'>
                                <h5 className='fw-semibold'>Categories</h5>
                                <span style={{ color: 'var(--brand-primary)' }}>{filteredProducts.length}</span>
                            </div>
                            <div className='pt-4 pb-2'>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        className={selectedCategory === category ? shopStyles.applyfilterbtn : shopStyles.sizebtn}
                                        style={{ width: '100%', marginBottom: '10px' }}
                                        onClick={() => handleCategoryChange(category)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Col>
                    <Col lg={9} md={8}>
                        <div className='mb-4 d-flex align-items-lg-center justify-content-between flex-lg-row flex-column'>
                            <div>
                                <h2 className='fw-semibold mb-2'>{selectedCategory === 'All' ? 'All Products' : selectedCategory}</h2>
                                <span style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)' }}>
                                    Showing {paginatedProducts.length} of {filteredProducts.length} House of bore products{searchTerm ? ` for "${searchTerm}"` : ''}
                                </span>
                            </div>
                            <div className='d-flex align-items-center mt-lg-0 mt-3'>
                                <span style={{ fontSize: '12px' }} className='d-flex align-items-center'>
                                    Sort by:
                                    <Form.Select
                                        value={sortBy}
                                        onChange={(event) => setSortBy(event.target.value)}
                                        className='w-75 border-0'
                                        style={{ fontSize: '13px' }}
                                    >
                                        <option value="featured">Featured</option>
                                        <option value="rating">Top Rated</option>
                                        <option value="price-high">High Price</option>
                                        <option value="price-low">Low Price</option>
                                    </Form.Select>
                                </span>
                            </div>
                        </div>
                        <Row className='border-bottom border-tertiary pb-4'>
                            {paginatedProducts.length ? paginatedProducts.map((item) => (
                                <Col lg={4} md={6} xs={6} key={item.id} className={shopStyles.prodresults}>
                                    <Link
                                        to='/shop/product'
                                        className='text-decoration-none'
                                        onClick={() => handleSelectProduct(item)}
                                    >
                                        <Card className='border-0'>
                                            <Card.Body className='p-0'>
                                                <div className='mb-3'>
                                                    <Image src={item.image} fluid className={shopStyles.productimg} />
                                                </div>
                                                <Card.Title className='fw-semibold text-capitalize text-dark'>{item.title}</Card.Title>
                                                <div className='pb-2 text-muted'>{item.category}</div>
                                                <div className='d-flex align-items-center pb-2'>
                                                    <div className={`${shopStyles.ratingtext} pt-1`}>{item.rating}/5</div>
                                                </div>
                                                <div className='d-flex align-items-center pb-4'>
                                                    <div>
                                                        <span className={`${shopStyles.sliderprice} me-2 fw-semibold`}>${item.discountedPrice}</span>
                                                    </div>
                                                    <div>
                                                        <span className={`${shopStyles.slideroldprice} me-2 fw-semibold`}>${item.oldPrice}</span>
                                                    </div>
                                                    <div className={shopStyles.sliderdiscountbg}>
                                                        <span className={shopStyles.sliderdiscounttext}>
                                                            -{100 - Math.round(item.discountedPrice / item.oldPrice * 100)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </Col>
                            )) : (
                                <Col lg={12}>
                                    <div style={{ padding: '28px 0', color: 'rgba(0,0,0,0.6)' }}>
                                        No products found{searchTerm ? ` for "${searchTerm}"` : ''}.
                                    </div>
                                </Col>
                            )}
                        </Row>
                        <div className='d-flex justify-content-between align-items-center py-4'>
                            <button
                                className={shopStyles.paginatebtn}
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            >
                                Previous
                            </button>
                            <div>
                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        className={`${page === pageNumber ? shopStyles.activenumbtn : shopStyles.numbtn} me-2`}
                                        onClick={() => setPage(pageNumber)}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}
                            </div>
                            <button
                                className={shopStyles.paginatebtn}
                                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                            >
                                Next
                            </button>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Shop;
