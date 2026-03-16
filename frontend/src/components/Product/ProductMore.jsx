import React, { useContext } from 'react';
import productmoreStyles from './ProductMore.module.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import { ProductContext } from '../../context/ProductContext';
import { Link } from 'react-router-dom';

const ProductMore = ({ productMore }) => {
    const { setProductID } = useContext(ProductContext);

    const settings = {
        dots: false,
        arrows: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        initialSlide: 0,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1, infinite: true, dots: false } },
            { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 1, initialSlide: 1 } },
            { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 1 } }
        ]
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    };

    return (
        <section className={productmoreStyles.productmorecontainer}>
            <Container fluid className='py-4'>
                <Row>
                    <Col>
                        <div className='text-center mb-4'>
                            <h2 className={`${productmoreStyles.productmoretitle} text-uppercase`}>You might also like</h2>
                        </div>
                        <div className="slider-container" id='newarrivalslider'>
                            <Slider {...settings}>
                                {productMore.map((item) => (
                                    <div key={item.id}>
                                        <Link
                                            to='/shop/product'
                                            className='text-decoration-none text-dark'
                                            onClick={() => {
                                                setProductID(item.id);
                                                localStorage.setItem('productID', item.id);
                                                scrollToTop();
                                            }}
                                        >
                                            <Card className='border-0'>
                                                <Card.Body className='p-0'>
                                                    <div className='mb-3'>
                                                        <Image src={item.image} fluid className={productmoreStyles.productimg} />
                                                    </div>
                                                    <Card.Title className='fw-semibold text-capitalize'>{item.title}</Card.Title>
                                                    <div className='d-flex align-items-center pb-2'>
                                                        <div className={`${productmoreStyles.ratingtext} ms-2 pt-1`}>{item.rating}/5</div>
                                                    </div>
                                                    <div className='d-flex align-items-center pb-4'>
                                                        <div>
                                                            <span className={`${productmoreStyles.sliderprice} me-2 fw-semibold`}>${item.discountedPrice}</span>
                                                        </div>
                                                        <div>
                                                            <span className={`${productmoreStyles.slideroldprice} me-2 fw-semibold`}>${item.oldPrice}</span>
                                                        </div>
                                                        <div className={productmoreStyles.sliderdiscountbg}>
                                                            <span className={productmoreStyles.sliderdiscounttext}>
                                                                -{100 - Math.round(item.discountedPrice / item.oldPrice * 100)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Link>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default ProductMore;
