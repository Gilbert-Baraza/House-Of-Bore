import React, { useState, useContext } from 'react';
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
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import BrandLogo from '../common/BrandLogo';
import { siteContent } from '../../data/siteContent';

const TopNav = () => {
  const [topText, setTopText] = useState(true);
  const [show, setShow] = useState(false);
  const { cart } = useContext(CartContext);
  const { promoBar, navigation } = siteContent;
  const totalQty = cart.reduce((acc, product) => acc + product.quantity, 0);

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
            <div className='d-lg-none d-block'>
              <Link to='/cart' className='text-decoration-none text-dark position-relative'>
                Cart
                {totalQty > 0 ? <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-dark">{totalQty}</span> : ''}
              </Link>
            </div>
          </div>
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
                          {navigation.shopGroups.map((item) => (
                            <li key={item.title} className='ms-1 py-2'>
                              <Link to='/shop' className='text-decoration-none text-dark'>{item.title}</Link>
                            </li>
                          ))}
                        </ul>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </li>
                {navigation.links.map((item) => (
                  <li key={item} className='py-2'>
                    <Link to='/shop' className='text-decoration-none text-dark'>{item}</Link>
                  </li>
                ))}
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
                  {navigation.shopGroups.map((item) => (
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
              {navigation.links.map((item) => (
                <Link key={item} to='/shop' className='text-decoration-none fw-semibold'>
                  <Nav.Link href="/shop">{item}</Nav.Link>
                </Link>
              ))}
            </Nav>
            <Form className="d-flex align-items-center">
              <Form.Control
                type="search"
                placeholder="Search products"
                className={`${topnavStyles.navsearch} me-lg-5`}
                aria-label="Search"
              />
              <span className='me-lg-3'>
                <Link to='/cart' className='text-decoration-none text-dark position-relative'>
                  Cart
                  {totalQty > 0 ? <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-dark">{totalQty}</span> : ''}
                </Link>
              </span>
            </Form>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default TopNav;
