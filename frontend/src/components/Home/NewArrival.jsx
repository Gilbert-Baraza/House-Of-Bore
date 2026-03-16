import React, { useContext, useEffect, useState } from 'react';
import newarrivalStyles from './NewArrival.module.css';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import { ProductContext } from '../../context/ProductContext';
import { fetchProducts } from '../../api/products';

const NewArrival = () => {
    const { setProductID } = useContext(ProductContext);
    const [newArrivals, setNewArrivals] = useState([]);

    useEffect(() => {
        const loadNewArrivals = async () => {
            try {
                const products = await fetchProducts({ featured: 'new' });
                setNewArrivals(products);
            } catch (error) {
                console.error(error);
            }
        };

        loadNewArrivals();
    }, []);

    const settings = {
        dots: false,
        arrows: false,
        infinite: false,
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

    return (
        <section className={newarrivalStyles.newarrivalcontainer}>
            <Container fluid className='py-5'>
                <Row>
                    <Col>
                        <div className='text-center mb-5'>
                            <h2 className={newarrivalStyles.newarrivaltitle}>NEW ARRIVALS</h2>
                        </div>
                        <div className="slider-container" id='newarrivalslider'>
                            <Slider {...settings}>
                                {newArrivals.map((item) => (
                                    <div key={item.id}>
                                        <Link
                                            to='/shop/product'
                                            className='text-decoration-none text-dark'
                                            onClick={() => {
                                                localStorage.setItem('productID', item.id);
                                                setProductID(item.id);
                                            }}
                                        >
                                            <div className={newarrivalStyles.slidercard}>
                                                <Image src={item.image} fluid />
                                            </div>
                                            <div className='pt-3'>
                                                <p className={`${newarrivalStyles.slidercardtitle} fw-bold m-0 mb-1`}>{item.title}</p>
                                                <span className={`${newarrivalStyles.sliderratingtext} mb-2 d-block`}>
                                                    {item.rating}/5
                                                </span>
                                                <h5 className={`${newarrivalStyles.sliderprice} fw-semibold d-flex`}>
                                                    ${item.discountedPrice}
                                                    <span className={`${newarrivalStyles.slideroldprice} text-decoration-line-through px-2`}>${item.oldPrice}</span>
                                                    <span className={newarrivalStyles.sliderdiscountbg}>
                                                        <span className={newarrivalStyles.sliderdiscounttext}>
                                                            -{100 - Math.round(item.discountedPrice / item.oldPrice * 100)}%
                                                        </span>
                                                    </span>
                                                </h5>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                        <div className='text-center py-5'>
                            <Link to='/shop' className='text-decoration-none'>
                                <Button variant="outline-dark" className={newarrivalStyles.viewbtn}>View All</Button>
                            </Link>
                        </div>
                        <svg width="1240" height="1" viewBox="0 0 1240 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="-4.37114e-08" y1="0.500122" x2="1240" y2="0.500014" stroke="black" strokeOpacity="0.1" />
                        </svg>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default NewArrival;
