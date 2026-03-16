import React, { useContext, useEffect, useState } from 'react';
import topsellingStyles from './TopSelling.module.css';
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

const TopSelling = () => {
    const { setProductID } = useContext(ProductContext);
    const [topSelling, setTopSelling] = useState([]);

    useEffect(() => {
        const loadTopSelling = async () => {
            try {
                const products = await fetchProducts({ featured: 'top' });
                setTopSelling(products);
            } catch (error) {
                console.error(error);
            }
        };

        loadTopSelling();
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
        <section className={topsellingStyles.newarrivalcontainer}>
            <Container fluid>
                <Row>
                    <Col>
                        <div className='text-center mb-5'>
                            <h2 className={topsellingStyles.newarrivaltitle}>top selling</h2>
                        </div>
                        <div className="slider-container" id='newarrivalslider'>
                            <Slider {...settings}>
                                {topSelling.map((item) => (
                                    <div key={item.id}>
                                        <Link
                                            to='/shop/product'
                                            className='text-decoration-none text-dark'
                                            onClick={() => {
                                                localStorage.setItem('productID', item.id);
                                                setProductID(item.id);
                                            }}
                                        >
                                            <div className={topsellingStyles.slidercard}>
                                                <Image src={item.image} fluid />
                                            </div>
                                            <div className='pt-3'>
                                                <p className={`${topsellingStyles.slidercardtitle} fw-bold m-0 mb-1`}>{item.title}</p>
                                                <span className={`${topsellingStyles.sliderratingtext} mb-2 d-block`}>
                                                    {item.rating}/5
                                                </span>
                                                <h5 className={`${topsellingStyles.sliderprice} d-flex fw-semibold`}>
                                                    ${item.discountedPrice}
                                                    <span className={`${topsellingStyles.slideroldprice} text-decoration-line-through px-2`}>${item.oldPrice}</span>
                                                    <span className={topsellingStyles.sliderdiscountbg}>
                                                        <span className={topsellingStyles.sliderdiscounttext}>
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
                                <Button variant="outline-dark" className={topsellingStyles.viewbtn}>View All</Button>
                            </Link>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default TopSelling;
