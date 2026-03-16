import React, { useContext } from 'react'
import cartStyles from './Cart.module.css'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { TbShoppingCartX } from "react-icons/tb";
import { Link, useLocation } from 'react-router-dom'
import { CartContext } from '../../context/CartContext'
import { EmptyCartContext } from '../../context/EmptyCartContext';
import Image from 'react-bootstrap/Image'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'


const Cart = ({ emptyCart, productDetail, productSpecs }) => {

    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);

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

    console.log(productDetail);

    const { cart, updateQuantity, removeFromCart } = useContext(CartContext)

    console.log(cart);

    const subtotalCost = cart.reduce((acc, product) => acc + (product.oldPrice * product.quantity), 0);

    const totalCost = cart.reduce((acc, product) => acc + (product.discountedPrice * product.quantity), 0);

    const totalDiscountPercent = (subtotalCost - totalCost) / subtotalCost

    const totalQty = cart.reduce((acc, product) => acc + product.quantity, 0)

    console.log(totalQty);

    const { setEmptyCart } = useContext(EmptyCartContext)

    console.log(emptyCart)

    console.log(cart.length)

    const showEmptyCart = () => {
        setEmptyCart(true)
    }

    return (
        <section className={cartStyles.cartcontainer}>
            <Container fluid className='py-4'>
                <Row>
                    {emptyCart && cart.length === 0 &&
                        <Col lg={12}>
                            <div className={`${cartStyles.emptycartcontainer} text-center position relative`}>
                                <div className='position-absolute top-50 start-50 translate-middle'>
                                    <TbShoppingCartX size={50} color='#000' className='mb-2' />
                                    <p>Your shopping cart is empty</p>
                                    <Link to='/shop'>
                                        <button className={cartStyles.shopbtn}>Shop</button>
                                    </Link>
                                </div>
                            </div>
                        </Col>
                    }
                    {cart && cart.length > 0 ?
                        <Col lg={12} className='border-top border-tertiary py-lg-4 py-3'>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb" style={{ fontSize: '14px' }}>
                                    <li className="breadcrumb-item me-2">
                                        <Link to="/" className='text-decoration-none text-muted'>Home</Link>
                                    </li>
                                    <span className='me-2'>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6.53073 2.46937L11.5307 7.46937C11.6007 7.53905 11.6561 7.62184 11.694 7.71301C11.7318 7.80417 11.7513 7.90191 11.7513 8.00062C11.7513 8.09933 11.7318 8.19707 11.694 8.28824C11.6561 8.3794 11.6007 8.46219 11.5307 8.53187L6.53073 13.5319C6.38984 13.6728 6.19874 13.7519 5.99948 13.7519C5.80023 13.7519 5.60913 13.6728 5.46823 13.5319C5.32734 13.391 5.24818 13.1999 5.24818 13.0006C5.24818 12.8014 5.32734 12.6103 5.46823 12.4694L9.93761 8L5.46761 3.53062C5.32671 3.38973 5.24756 3.19863 5.24756 2.99937C5.24756 2.80011 5.32671 2.60902 5.46761 2.46812C5.60851 2.32723 5.7996 2.24807 5.99886 2.24807C6.19812 2.24807 6.38921 2.32723 6.53011 2.46812L6.53073 2.46937Z" fill="black" fill-opacity="0.6" />
                                        </svg>
                                    </span>
                                    {crumbs.length > 0 && crumbs}
                                </ol>
                            </nav>
                        </Col>
                        : ''}
                    {cart && cart.length > 0 ?
                        <div className='mb-3'>
                            <h2 className={`${cartStyles.carttitle} text-uppercase`}>Your cart</h2>
                        </div>
                        : ''
                    }
                    {cart && cart.length > 0 ?
                        <Col lg={7} className='mb-lg-0 mb-3'>
                            <div>
                                <Card className='rounded-4 border border-tertiary'>
                                    <Card.Body>
                                        {cart.map((product) => (
                                            <div key={product.id || product._id}>
                                                <div className={`d-flex justify-content-between ${cart.length > 1 ? 'border-bottom border-tertiary mb-3 pb-3' : ''}`}>
                                                    <div className='d-flex'>
                                                        <Image src={product.image} fluid className={`${cartStyles.productimg} rounded-4 me-3`} />
                                                        <div>
                                                            <h2 className={`${cartStyles.producttitle} fw-semibold text-capitalize mb-5`}>{product.title}</h2>
                                                            <div className='d-flex align-items-center pb-2'>
                                                                <div className='pt-2'>
                                                                    <h2 className={`${cartStyles.sliderprice} me-2 fw-semibold`}>${Math.round(product.discountedPrice)}</h2>
                                                                </div>
                                                                <div className='pt-2'>
                                                                    <h2 className={`${cartStyles.slideroldprice} me-2 fw-semibold`}>${product.oldPrice}</h2>
                                                                </div>
                                                                <div className={cartStyles.sliderdiscountbg}>
                                                                    <span className={cartStyles.sliderdiscounttext}>{100 - Math.round(product.discountedPrice / product.oldPrice * 100)}%</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='text-end'>
                                                        <button className='border-0 mb-5 bg-transparent' onClick={() => { removeFromCart(product.id || product._id); showEmptyCart() }}>
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M20.25 4.5H16.5V3.75C16.5 3.15326 16.2629 2.58097 15.841 2.15901C15.419 1.73705 14.8467 1.5 14.25 1.5H9.75C9.15326 1.5 8.58097 1.73705 8.15901 2.15901C7.73705 2.58097 7.5 3.15326 7.5 3.75V4.5H3.75C3.55109 4.5 3.36032 4.57902 3.21967 4.71967C3.07902 4.86032 3 5.05109 3 5.25C3 5.44891 3.07902 5.63968 3.21967 5.78033C3.36032 5.92098 3.55109 6 3.75 6H4.5V19.5C4.5 19.8978 4.65804 20.2794 4.93934 20.5607C5.22064 20.842 5.60218 21 6 21H18C18.3978 21 18.7794 20.842 19.0607 20.5607C19.342 20.2794 19.5 19.8978 19.5 19.5V6H20.25C20.4489 6 20.6397 5.92098 20.7803 5.78033C20.921 5.63968 21 5.44891 21 5.25C21 5.05109 20.921 4.86032 20.7803 4.71967C20.6397 4.57902 20.4489 4.5 20.25 4.5ZM10.5 15.75C10.5 15.9489 10.421 16.1397 10.2803 16.2803C10.1397 16.421 9.94891 16.5 9.75 16.5C9.55109 16.5 9.36032 16.421 9.21967 16.2803C9.07902 16.1397 9 15.9489 9 15.75V9.75C9 9.55109 9.07902 9.36032 9.21967 9.21967C9.36032 9.07902 9.55109 9 9.75 9C9.94891 9 10.1397 9.07902 10.2803 9.21967C10.421 9.36032 10.5 9.55109 10.5 9.75V15.75ZM15 15.75C15 15.9489 14.921 16.1397 14.7803 16.2803C14.6397 16.421 14.4489 16.5 14.25 16.5C14.0511 16.5 13.8603 16.421 13.7197 16.2803C13.579 16.1397 13.5 15.9489 13.5 15.75V9.75C13.5 9.55109 13.579 9.36032 13.7197 9.21967C13.8603 9.07902 14.0511 9 14.25 9C14.4489 9 14.6397 9.07902 14.7803 9.21967C14.921 9.36032 15 9.55109 15 9.75V15.75ZM15 4.5H9V3.75C9 3.55109 9.07902 3.36032 9.21967 3.21967C9.36032 3.07902 9.55109 3 9.75 3H14.25C14.4489 3 14.6397 3.07902 14.7803 3.21967C14.921 3.36032 15 3.55109 15 3.75V4.5Z" fill="#FF3333" />
                                                            </svg>
                                                        </button>
                                                        <button className={cartStyles.qtybtn} >
                                                            <svg onClick={() => updateQuantity(product.id || product._id, product.quantity > 1 ? product.quantity - 1 : product.quantity)} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M17.8125 10C17.8125 10.2486 17.7137 10.4871 17.5379 10.6629C17.3621 10.8387 17.1236 10.9375 16.875 10.9375H3.125C2.87636 10.9375 2.6379 10.8387 2.46209 10.6629C2.28627 10.4871 2.1875 10.2486 2.1875 10C2.1875 9.75136 2.28627 9.5129 2.46209 9.33709C2.6379 9.16127 2.87636 9.0625 3.125 9.0625H16.875C17.1236 9.0625 17.3621 9.16127 17.5379 9.33709C17.7137 9.5129 17.8125 9.75136 17.8125 10Z" fill="black" />
                                                            </svg>
                                                            {product.quantity}
                                                            <svg onClick={() => updateQuantity(product.id || product._id, product.quantity + 1)} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M17.8125 10C17.8125 10.2486 17.7137 10.4871 17.5379 10.6629C17.3621 10.8387 17.1236 10.9375 16.875 10.9375H10.9375V16.875C10.9375 17.1236 10.8387 17.3621 10.6629 17.5379C10.4871 17.7137 10.2486 17.8125 10 17.8125C9.75136 17.8125 9.5129 17.7137 9.33709 17.5379C9.16127 17.3621 9.0625 17.1236 9.0625 16.875V10.9375H3.125C2.87636 10.9375 2.6379 10.8387 2.46209 10.6629C2.28627 10.4871 2.1875 10.2486 2.1875 10C2.1875 9.75136 2.28627 9.5129 2.46209 9.33709C2.6379 9.16127 2.87636 9.0625 3.125 9.0625H9.0625V3.125C9.0625 2.87636 9.16127 2.6379 9.33709 2.46209C9.5129 2.28627 9.75136 2.1875 10 2.1875C10.2486 2.1875 10.4871 2.28627 10.6629 2.46209C10.8387 2.6379 10.9375 2.87636 10.9375 3.125V9.0625H16.875C17.1236 9.0625 17.3621 9.16127 17.5379 9.33709C17.7137 9.5129 17.8125 9.75136 17.8125 10Z" fill="black" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Card>

                            </div>
                        </Col>
                        : ''}
                    {cart && cart.length > 0 ?
                        <Col lg={5}>
                            <Card className='rounded-4 border border-tertiary'>
                                <Card.Body>
                                    <div className='mb-3'>
                                        <h3 className='fw-semibold'>Order Summary</h3>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <span className={cartStyles.carttext}>Subtotal</span>
                                        <span className={cartStyles.cartnumbertext}> ${Math.round(subtotalCost)}</span>
                                    </div>
                                    <div className='d-flex justify-content-between py-3'>
                                        <span className={`${cartStyles.carttext} d-block`}>Discount (-{Math.round(totalDiscountPercent * 100)}%)</span>
                                        <span className={`${cartStyles.totaldiscount} d-block`}> -${Math.round(subtotalCost - totalCost)}</span>
                                    </div>
                                    <div className='d-flex justify-content-between pb-3 border-bottom border-tertiary'>
                                        <span className={`${cartStyles.carttext} d-block`}>Delivery Fee</span>
                                        <span className={`${cartStyles.cartnumbertext} d-block`}>Free</span>
                                    </div>
                                    <div className='d-flex justify-content-between align-items-center py-3'>
                                        <span className={`${cartStyles.cartnumbertext} d-block fw-normal`}>Total</span>
                                        <span className={`${cartStyles.carttotaltext} d-block`}>${Math.round(totalCost)}</span>
                                    </div>
                                    <div className='mb-2'>
                                        <Form className='d-flex justify-content-between align-items-start'>
                                            <Form.Group className="mb-3 w-100 pe-3" controlId="exampleForm.ControlInput1">
                                                <Form.Control type="text" placeholder="Add promo code" className={cartStyles.formcontrol} />
                                            </Form.Group>
                                            <div>
                                                <Button variant="dark" className={cartStyles.applybtn}>Apply</Button>
                                            </div>
                                        </Form>
                                    </div>
                                    <div>
                                        <Button variant='dark' className={`${cartStyles.checkoutbtn} d-block w-100`}>Go to Checkout <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M14.7959 4.4541L21.5459 11.2041C21.6508 11.3086 21.734 11.4328 21.7908 11.5696C21.8476 11.7063 21.8768 11.8529 21.8768 12.001C21.8768 12.149 21.8476 12.2957 21.7908 12.4324C21.734 12.5691 21.6508 12.6933 21.5459 12.7979L14.7959 19.5479C14.5846 19.7592 14.2979 19.8779 13.9991 19.8779C13.7002 19.8779 13.4135 19.7592 13.2022 19.5479C12.9908 19.3365 12.8721 19.0499 12.8721 18.751C12.8721 18.4521 12.9908 18.1654 13.2022 17.9541L18.0313 13.125L4.25 13.125C3.95163 13.125 3.66548 13.0065 3.4545 12.7955C3.24353 12.5846 3.125 12.2984 3.125 12C3.125 11.7017 3.24353 11.4155 3.45451 11.2045C3.66548 10.9936 3.95163 10.875 4.25 10.875L18.0313 10.875L13.2013 6.04598C12.9899 5.83463 12.8712 5.54799 12.8712 5.2491C12.8712 4.95022 12.9899 4.66357 13.2013 4.45223C13.4126 4.24088 13.6992 4.12215 13.9981 4.12215C14.297 4.12215 14.5837 4.24088 14.795 4.45223L14.7959 4.4541Z" fill="white" />
                                        </svg>
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        : ''}
                </Row>
            </Container>
        </section>
    )
}

export default Cart
