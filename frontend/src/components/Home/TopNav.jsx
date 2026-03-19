import React, { useState, useContext, useEffect, useMemo } from 'react';
import topnavStyles from './TopNav.module.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Accordion from 'react-bootstrap/Accordion';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { ProductContext } from '../../context/ProductContext';
import { ProductMoreContext } from '../../context/ProductMoreContext';
import BrandLogo from '../common/BrandLogo';
import { siteContent } from '../../data/siteContent';
import { fetchCategories } from '../../api/categories';
import { fetchProducts } from '../../api/products';

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3.75 4.5H5.3175C6.1725 4.5 6.6 4.5 6.93 4.65975C7.22025 4.80075 7.46775 5.01675 7.64625 5.286C7.8495 5.5935 7.9365 6.012 8.10975 6.849L8.25 7.5H18.8595C19.8735 7.5 20.3805 7.5 20.6715 7.80975C20.9625 8.1195 20.886 8.5965 20.7315 9.5505L20.2635 12.4425C20.058 13.7145 19.956 14.3498 19.52 14.724C19.0837 15.0983 18.4417 15.0983 17.1578 15.0983H9.6405C8.391 15.0983 7.76625 15.0983 7.33875 14.7413C6.91125 14.3843 6.76125 13.7783 6.4605 12.5663L5.47575 8.59575" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.75 19.5C9.75 20.1213 9.24632 20.625 8.625 20.625C8.00368 20.625 7.5 20.1213 7.5 19.5C7.5 18.8787 8.00368 18.375 8.625 18.375C9.24632 18.375 9.75 18.8787 9.75 19.5ZM18 19.5C18 20.1213 17.4963 20.625 16.875 20.625C16.2537 20.625 15.75 20.1213 15.75 19.5C15.75 18.8787 16.2537 18.375 16.875 18.375C17.4963 18.375 18 18.8787 18 19.5Z" fill="currentColor" />
  </svg>
);

const AccountIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 12C14.0711 12 15.75 10.3211 15.75 8.25C15.75 6.17893 14.0711 4.5 12 4.5C9.92893 4.5 8.25 6.17893 8.25 8.25C8.25 10.3211 9.92893 12 12 12Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M5.25 19.125C5.25 16.6397 8.27208 14.625 12 14.625C15.7279 14.625 18.75 16.6397 18.75 19.125" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const DeliveryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M2.25 7.5C2.25 6.87868 2.75368 6.375 3.375 6.375H13.5V15.75H3.375C2.75368 15.75 2.25 15.2463 2.25 14.625V7.5Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M13.5 9H17.268C17.6948 9 18.1005 9.1815 18.3855 9.4995L20.7405 12.126C20.9235 12.3307 21.0248 12.5955 21.0248 12.8708V14.625C21.0248 15.2463 20.521 15.75 19.8998 15.75H18.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.125 18.375C7.74632 18.375 8.25 17.8713 8.25 17.25C8.25 16.6287 7.74632 16.125 7.125 16.125C6.50368 16.125 6 16.6287 6 17.25C6 17.8713 6.50368 18.375 7.125 18.375Z" fill="currentColor" />
    <path d="M17.625 18.375C18.2463 18.375 18.75 17.8713 18.75 17.25C18.75 16.6287 18.2463 16.125 17.625 16.125C17.0037 16.125 16.5 16.6287 16.5 17.25C16.5 17.8713 17.0037 18.375 17.625 18.375Z" fill="currentColor" />
  </svg>
);

const HeaderAction = ({ label, to, children, className = '', showBadge = null }) => (
  <OverlayTrigger
    placement="bottom"
    overlay={<Tooltip id={`tooltip-${label.toLowerCase().replace(/\s+/g, '-')}`}>{label}</Tooltip>}
  >
    <Link
      to={to}
      aria-label={label}
      className={`${topnavStyles.iconOnlyLink} text-decoration-none text-dark position-relative ${className}`.trim()}
    >
      {children}
      {showBadge}
    </Link>
  </OverlayTrigger>
);

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [topText, setTopText] = useState(true);
  const [show, setShow] = useState(false);
  const [storeCategories, setStoreCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [liveResults, setLiveResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cart } = useContext(CartContext);
  const { isAuthenticated, signOut } = useContext(AuthContext);
  const { setProductID } = useContext(ProductContext);
  const { setProductMore } = useContext(ProductMoreContext);
  const { promoBar, navigation } = siteContent;
  const totalQty = cart.reduce((acc, product) => acc + product.quantity, 0);

  useEffect(() => {
    const queryValue = new URLSearchParams(location.search).get("search") || "";

    if (location.pathname === "/shop") {
      setSearchTerm(queryValue);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const results = await fetchCategories();
        setStoreCategories(results);
      } catch (error) {
        console.error(error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const trimmedTerm = searchTerm.trim();

    if (!trimmedTerm) {
      setLiveResults([]);
      setSearchOpen(false);
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      try {
        const results = await fetchProducts({ q: trimmedTerm, sort: "createdAt", order: "desc" });
        setLiveResults(results.slice(0, 5));
        setSearchOpen(true);
      } catch (error) {
        console.error(error);
        setLiveResults([]);
        setSearchOpen(true);
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const shopGroups = useMemo(() => {
    if (!storeCategories.length) {
      return navigation.shopGroups;
    }

    return storeCategories.map((category) => ({
      title: category.name,
      description: category.description || `Shop the latest picks in ${category.name}.`
    }));
  }, [navigation.shopGroups, storeCategories]);

  const quickLinks = useMemo(() => {
    if (!storeCategories.length) {
      return navigation.links;
    }

    return storeCategories.slice(0, 3).map((category) => category.name);
  }, [navigation.links, storeCategories]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const trimmedTerm = searchTerm.trim();

    navigate(trimmedTerm ? `/shop?search=${encodeURIComponent(trimmedTerm)}` : "/shop");
    setSearchOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleResultSelect = (product) => {
    setSearchOpen(false);
    setProductID(product.id);
    setProductMore([]);
    localStorage.setItem("productID", product.id);
    localStorage.setItem("productMore", JSON.stringify([]));
    navigate("/shop/product");
  };

  return (
    <div className='fixed-top'>
      <Container fluid className='px-0 mx-0 overflow-hidden'>
        <Row>
          <Col>
            {topText && (
              <div className={topnavStyles.topbarcon}>
                <span>{promoBar.text} <Link to={promoBar.ctaHref}>{promoBar.ctaLabel}</Link></span>
                <span>
                  <svg onClick={() => setTopText(false)} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.2882 14.9617C16.4644 15.1378 16.5633 15.3767 16.5633 15.6258C16.5633 15.8749 16.4644 16.1137 16.2882 16.2898C16.1121 16.466 15.8733 16.5649 15.6242 16.5649C15.3751 16.5649 15.1362 16.466 14.9601 16.2898L9.99997 11.3281L5.03825 16.2883C4.86213 16.4644 4.62326 16.5633 4.37418 16.5633C4.12511 16.5633 3.88624 16.4644 3.71012 16.2883C3.534 16.1122 3.43506 15.8733 3.43506 15.6242C3.43506 15.3751 3.534 15.1363 3.71012 14.9602L8.67184 10L3.71168 5.03828C3.53556 4.86216 3.43662 4.62329 3.43662 4.37422C3.43662 4.12515 3.53556 3.88628 3.71168 3.71016C3.8878 3.53404 4.12668 3.43509 4.37575 3.43509C4.62482 3.43509 4.86369 3.53404 5.03981 3.71016L9.99997 8.67188L14.9617 3.70938C15.1378 3.53326 15.3767 3.43431 15.6257 3.43431C15.8748 3.43431 16.1137 3.53326 16.2898 3.70938C16.4659 3.8855 16.5649 4.12437 16.5649 4.37344C16.5649 4.62251 16.4659 4.86138 16.2898 5.0375L11.3281 10L16.2882 14.9617Z" fill="white" />
                  </svg>
                </span>
              </div>
            )}
          </Col>
        </Row>
      </Container>
      <Navbar expand="lg" className="bg-white py-4">
        <Container fluid className={topnavStyles.navcontainer}>
          <div className='d-flex align-items-baseline justify-content-between d-lg-none w-100'>
            <div className='d-lg-none d-block'>
              <span className='me-3'>
                <svg onClick={() => setShow(true)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.375 12C21.375 12.2984 21.2565 12.5845 21.0455 12.7955C20.8345 13.0065 20.5484 13.125 20.25 13.125H3.75C3.45163 13.125 3.16548 13.0065 2.9545 12.7955C2.74353 12.5845 2.625 12.2984 2.625 12C2.625 11.7016 2.74353 11.4155 2.9545 11.2045C3.16548 10.9935 3.45163 10.875 3.75 10.875H20.25C20.5484 10.875 20.8345 10.9935 21.0455 11.2045C21.2565 11.4155 21.375 11.7016 21.375 12ZM3.75 7.125H20.25C20.5484 7.125 20.8345 7.00647 21.0455 6.7955C21.2565 6.58452 21.375 6.29837 21.375 6C21.375 5.70163 21.2565 5.41548 21.0455 5.2045C20.8345 4.99353 20.5484 4.875 20.25 4.875H3.75C3.45163 4.875 3.16548 4.99353 2.9545 5.2045C2.74353 5.41548 2.625 5.70163 2.625 6C2.625 6.29837 2.74353 6.58452 2.9545 6.7955C3.16548 7.00647 3.45163 7.125 3.75 7.125ZM20.25 16.875H3.75C3.45163 16.875 3.16548 16.9935 2.9545 17.2045C2.74353 17.4155 2.625 17.7016 2.625 18C2.625 18.2984 2.74353 18.5845 2.9545 18.7955C3.16548 19.0065 3.45163 19.125 3.75 19.125H20.25C20.5484 19.125 20.8345 19.0065 21.0455 18.7955C21.2565 18.5845 21.375 18.2984 21.375 18C21.375 17.7016 21.2565 17.4155 21.0455 17.2045C20.8345 16.9935 20.5484 16.875 20.25 16.875Z" fill="black" />
                </svg>
              </span>
              <Navbar.Brand className='d-lg-none d-inline-block'>
                <BrandLogo />
              </Navbar.Brand>
            </div>
            <div className={topnavStyles.mobileActions}>
              <HeaderAction
                to='/cart'
                label='Cart'
                showBadge={totalQty > 0 ? <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-dark">{totalQty}</span> : null}
              >
                <CartIcon />
              </HeaderAction>
              <HeaderAction to={isAuthenticated ? '/account' : '/signin'} label={isAuthenticated ? 'Account' : 'Sign In'}>
                <AccountIcon />
              </HeaderAction>
              <HeaderAction to='/track-order' label='Track Order'>
                <DeliveryIcon />
              </HeaderAction>
            </div>
          </div>
          <Form className={`${topnavStyles.mobileSearchWrap} d-lg-none`} onSubmit={handleSearchSubmit}>
            <Form.Control
              type="search"
              placeholder="Search products"
              className={topnavStyles.navsearch}
              aria-label="Search"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchTerm.trim()) {
                  setSearchOpen(true);
                }
              }}
              onBlur={() => {
                window.setTimeout(() => setSearchOpen(false), 120);
              }}
            />
            {searchOpen ? (
              <div className={topnavStyles.searchDropdown}>
                {liveResults.length ? (
                  <>
                    {liveResults.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        className={topnavStyles.searchResult}
                        onMouseDown={() => handleResultSelect(product)}
                      >
                        <img src={product.image} alt={product.title} className={topnavStyles.searchThumb} />
                        <span className={topnavStyles.searchMeta}>
                          <strong>{product.title}</strong>
                          <span>{product.category}</span>
                        </span>
                        <span className={topnavStyles.searchPrice}>${product.discountedPrice}</span>
                      </button>
                    ))}
                    <button type="submit" className={topnavStyles.searchViewAll}>
                      View all results for "{searchTerm.trim()}"
                    </button>
                  </>
                ) : (
                  <div className={topnavStyles.searchEmpty}>No products match "{searchTerm.trim()}".</div>
                )}
              </div>
            ) : null}
          </Form>
          <Offcanvas show={show} onHide={() => setShow(false)} className='w-75'>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title><BrandLogo /></Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <ul className='list-unstyled'>
                <li className='py-2'>
                  <Accordion>
                    <Accordion.Item eventKey="0" className='border-0'>
                      <Accordion.Header>Shop</Accordion.Header>
                      <Accordion.Body>
                        <ul className='list-unstyled'>
                          {shopGroups.map((item) => (
                            <li key={item.title} className='ms-1 py-2'>
                              <Link to='/shop' className='text-decoration-none text-dark'>{item.title}</Link>
                            </li>
                          ))}
                        </ul>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </li>
                {quickLinks.map((item) => (
                  <li key={item} className='py-2'>
                    <Link to='/shop' className='text-decoration-none text-dark'>{item}</Link>
                  </li>
                ))}
                <li className='py-2'>
                  <Link to={isAuthenticated ? '/account' : '/signin'} className={`${topnavStyles.iconLink} text-decoration-none text-dark`}>
                    <AccountIcon />
                    {isAuthenticated ? 'My Account' : 'Sign In'}
                  </Link>
                </li>
                <li className='py-2'>
                  <Link to='/track-order' className='text-decoration-none text-dark'>
                    Track Order
                  </Link>
                </li>
                {isAuthenticated ? (
                  <li className='py-2'>
                    <button type="button" className='border-0 bg-transparent p-0 text-dark' onClick={signOut}>
                      Sign Out
                    </button>
                  </li>
                ) : null}
              </ul>
            </Offcanvas.Body>
          </Offcanvas>
          <Navbar.Brand className='me-lg-5 d-lg-block d-none'>
            <BrandLogo />
          </Navbar.Brand>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto pt-2" id="nav-dropdown">
              <NavDropdown title={<span className='d-flex align-items-baseline fw-semibold' style={{ color: '#000' }}>Shop</span>}>
                <Row>
                  {shopGroups.map((item) => (
                    <Col lg={6} key={item.title}>
                      <Link to='/shop' className='text-decoration-none text-dark'>
                        <NavDropdown.Item href="/shop" className='pb-3'>
                          <span className='fw-semibold'>{item.title}</span>
                          <span className='d-block' style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)' }}>{item.description}</span>
                        </NavDropdown.Item>
                      </Link>
                    </Col>
                  ))}
                </Row>
              </NavDropdown>
              {quickLinks.map((item) => (
                <Link key={item} to='/shop' className='text-decoration-none fw-semibold'>
                  <Nav.Link href="/shop">{item}</Nav.Link>
                </Link>
              ))}
            </Nav>
            <Form className={`d-flex align-items-center ${topnavStyles.navSearchWrap}`} onSubmit={handleSearchSubmit}>
              <Form.Control
                type="search"
                placeholder="Search products"
                className={topnavStyles.navsearch}
                aria-label="Search"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchTerm.trim()) {
                    setSearchOpen(true);
                  }
                }}
                onBlur={() => {
                  window.setTimeout(() => setSearchOpen(false), 120);
                }}
              />
              {searchOpen ? (
                <div className={topnavStyles.searchDropdown}>
                  {liveResults.length ? (
                    <>
                      {liveResults.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          className={topnavStyles.searchResult}
                          onMouseDown={() => handleResultSelect(product)}
                        >
                          <img src={product.image} alt={product.title} className={topnavStyles.searchThumb} />
                          <span className={topnavStyles.searchMeta}>
                            <strong>{product.title}</strong>
                            <span>{product.category}</span>
                          </span>
                          <span className={topnavStyles.searchPrice}>${product.discountedPrice}</span>
                        </button>
                      ))}
                      <button type="submit" className={topnavStyles.searchViewAll}>
                        View all results for "{searchTerm.trim()}"
                      </button>
                    </>
                  ) : (
                    <div className={topnavStyles.searchEmpty}>No products match "{searchTerm.trim()}".</div>
                  )}
                </div>
              ) : null}
            </Form>
          </Navbar.Collapse>
          <div className={`${topnavStyles.desktopActions} d-none d-lg-inline-flex`}>
            <HeaderAction
              to='/cart'
              label='Cart'
              showBadge={totalQty > 0 ? <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-dark">{totalQty}</span> : null}
            >
              <CartIcon />
            </HeaderAction>
            <HeaderAction to={isAuthenticated ? '/account' : '/signin'} label={isAuthenticated ? 'Account' : 'Sign In'}>
              <AccountIcon />
            </HeaderAction>
            <HeaderAction to='/track-order' label='Track Order'>
              <DeliveryIcon />
            </HeaderAction>
          </div>
        </Container>
      </Navbar>
    </div>
  );
};

export default TopNav;
