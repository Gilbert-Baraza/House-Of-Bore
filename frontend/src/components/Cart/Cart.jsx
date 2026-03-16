import React, { useContext, useEffect, useMemo, useState } from 'react'
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
import Alert from 'react-bootstrap/Alert'
import { createOrder } from '../../api/orders';
import { AuthContext } from '../../context/AuthContext';


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
    const { clearCart } = useContext(CartContext)
    const { customer, isAuthenticated, refreshOrders } = useContext(AuthContext)
    const [checkout, setCheckout] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        fullName: '',
        line1: '',
        line2: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'Kenya',
        deliveryMethod: 'standard',
        isSubscribed: true
    });
    const [submittingOrder, setSubmittingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [orderError, setOrderError] = useState('');

    console.log(cart);

    const subtotalCost = cart.reduce((acc, product) => acc + (product.oldPrice * product.quantity), 0);

    const totalCost = cart.reduce((acc, product) => acc + (product.discountedPrice * product.quantity), 0);

    const totalDiscountPercent = (subtotalCost - totalCost) / subtotalCost

    const totalQty = cart.reduce((acc, product) => acc + product.quantity, 0)
    const hasCartItems = cart && cart.length > 0;
    const shippingAddress = useMemo(() => ({
        fullName: checkout.fullName || checkout.customerName,
        line1: checkout.line1,
        line2: checkout.line2,
        city: checkout.city,
        region: checkout.region,
        postalCode: checkout.postalCode,
        country: checkout.country
    }), [checkout]);

    console.log(totalQty);

    const { setEmptyCart } = useContext(EmptyCartContext)

    console.log(emptyCart)

    console.log(cart.length)

    const showEmptyCart = () => {
        setEmptyCart(true)
    }

    useEffect(() => {
        if (!customer) {
            return;
        }

        setCheckout((previous) => ({
            ...previous,
            customerName: customer.name || previous.customerName,
            customerEmail: customer.email || previous.customerEmail,
            customerPhone: customer.phone || previous.customerPhone,
            fullName: customer.defaultAddress?.fullName || previous.fullName,
            line1: customer.defaultAddress?.line1 || previous.line1,
            line2: customer.defaultAddress?.line2 || previous.line2,
            city: customer.defaultAddress?.city || previous.city,
            region: customer.defaultAddress?.region || previous.region,
            postalCode: customer.defaultAddress?.postalCode || previous.postalCode,
            country: customer.defaultAddress?.country || previous.country,
            isSubscribed: typeof customer.isSubscribed === 'boolean' ? customer.isSubscribed : previous.isSubscribed
        }));
    }, [customer]);

    const handleCheckoutChange = (event) => {
        const { name, value, type, checked } = event.target;
        setCheckout((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCheckoutSubmit = async (event) => {
        event.preventDefault();
        setOrderError('');
        setOrderSuccess(null);
        setSubmittingOrder(true);

        try {
            const payload = {
                customerName: checkout.customerName,
                customerEmail: checkout.customerEmail,
                customerPhone: checkout.customerPhone,
                deliveryMethod: checkout.deliveryMethod,
                isSubscribed: checkout.isSubscribed,
                shippingAddress,
                items: cart.map((item) => ({
                    productId: item.id || item._id,
                    quantity: item.quantity,
                    selectedColor: item.selectedColor || '',
                    selectedSize: item.selectedSize || ''
                }))
            };

            const response = await createOrder(payload);
            clearCart();
            setEmptyCart(true);
            setOrderSuccess(response.data);
            if (isAuthenticated) {
                refreshOrders().catch(console.error);
            }
        } catch (error) {
            setOrderError(error.message);
        } finally {
            setSubmittingOrder(false);
        }
    };

    return (
        <section className={cartStyles.cartcontainer}>
            <Container fluid className='py-4'>
                <Row>
                    {orderSuccess ? (
                        <Col lg={12}>
                            <Alert variant='success' className={cartStyles.successalert}>
                                Order {orderSuccess.orderNumber} placed successfully. Total: ${Math.round(orderSuccess.totalAmount)}
                            </Alert>
                        </Col>
                    ) : null}
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
                    {hasCartItems ?
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
                    {hasCartItems ?
                        <div className='mb-3'>
                            <h2 className={`${cartStyles.carttitle} text-uppercase`}>Your cart</h2>
                        </div>
                        : ''
                    }
                    {hasCartItems ?
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
                    {hasCartItems ?
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
                                    <form onSubmit={handleCheckoutSubmit} className={cartStyles.checkoutform}>
                                        <div className='mb-3'>
                                            <h4 className={cartStyles.checkouttitle}>Checkout Details</h4>
                                            <p className={cartStyles.checkoutsubtitle}>Create a live order and push it into your admin dashboard.</p>
                                        </div>
                                        {orderError ? <Alert variant='danger'>{orderError}</Alert> : null}
                                        <div className={cartStyles.checkoutgrid}>
                                            <Form.Group controlId="checkoutName">
                                                <Form.Control name="customerName" value={checkout.customerName} onChange={handleCheckoutChange} type="text" placeholder="Full name" className={cartStyles.checkoutinput} required />
                                            </Form.Group>
                                            <Form.Group controlId="checkoutEmail">
                                                <Form.Control name="customerEmail" value={checkout.customerEmail} onChange={handleCheckoutChange} type="email" placeholder="Email address" className={cartStyles.checkoutinput} required />
                                            </Form.Group>
                                            <Form.Group controlId="checkoutPhone">
                                                <Form.Control name="customerPhone" value={checkout.customerPhone} onChange={handleCheckoutChange} type="text" placeholder="Phone number" className={cartStyles.checkoutinput} required />
                                            </Form.Group>
                                            <Form.Group controlId="checkoutDelivery">
                                                <Form.Select name="deliveryMethod" value={checkout.deliveryMethod} onChange={handleCheckoutChange} className={cartStyles.checkoutinput}>
                                                    <option value="standard">Standard delivery</option>
                                                    <option value="express">Express delivery</option>
                                                    <option value="pickup">Pickup station</option>
                                                </Form.Select>
                                            </Form.Group>
                                            <Form.Group controlId="shippingFullName" className={cartStyles.checkoutfull}>
                                                <Form.Control name="fullName" value={checkout.fullName} onChange={handleCheckoutChange} type="text" placeholder="Shipping recipient name" className={cartStyles.checkoutinput} />
                                            </Form.Group>
                                            <Form.Group controlId="shippingLine1" className={cartStyles.checkoutfull}>
                                                <Form.Control name="line1" value={checkout.line1} onChange={handleCheckoutChange} type="text" placeholder="Street address" className={cartStyles.checkoutinput} required />
                                            </Form.Group>
                                            <Form.Group controlId="shippingLine2" className={cartStyles.checkoutfull}>
                                                <Form.Control name="line2" value={checkout.line2} onChange={handleCheckoutChange} type="text" placeholder="Apartment, suite, landmark" className={cartStyles.checkoutinput} />
                                            </Form.Group>
                                            <Form.Group controlId="shippingCity">
                                                <Form.Control name="city" value={checkout.city} onChange={handleCheckoutChange} type="text" placeholder="City" className={cartStyles.checkoutinput} required />
                                            </Form.Group>
                                            <Form.Group controlId="shippingRegion">
                                                <Form.Control name="region" value={checkout.region} onChange={handleCheckoutChange} type="text" placeholder="Region / County" className={cartStyles.checkoutinput} required />
                                            </Form.Group>
                                            <Form.Group controlId="shippingPostal">
                                                <Form.Control name="postalCode" value={checkout.postalCode} onChange={handleCheckoutChange} type="text" placeholder="Postal code" className={cartStyles.checkoutinput} />
                                            </Form.Group>
                                            <Form.Group controlId="shippingCountry">
                                                <Form.Control name="country" value={checkout.country} onChange={handleCheckoutChange} type="text" placeholder="Country" className={cartStyles.checkoutinput} required />
                                            </Form.Group>
                                        </div>
                                        <Form.Check
                                            className={cartStyles.subscribebox}
                                            type="checkbox"
                                            id="checkoutSubscribe"
                                            name="isSubscribed"
                                            checked={checkout.isSubscribed}
                                            onChange={handleCheckoutChange}
                                            label="Send me offers and order updates from House of bore"
                                        />
                                        <Button type='submit' variant='dark' className={`${cartStyles.checkoutbtn} d-block w-100`} disabled={submittingOrder}>
                                            {submittingOrder ? 'Placing Order...' : `Place Order (${totalQty} item${totalQty > 1 ? 's' : ''})`}
                                        </Button>
                                    </form>
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
