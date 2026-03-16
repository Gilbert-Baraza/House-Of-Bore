import React, { useRef } from 'react';
import happycustomerStyles from './HappyCustomer.module.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Slider from "react-slick";
import Card from 'react-bootstrap/Card';
import { siteContent } from '../../data/siteContent';

const HappyCustomer = () => {
    let sliderRef = useRef(null);

    const next = () => {
        sliderRef.slickNext();
    };

    const previous = () => {
        sliderRef.slickPrev();
    };

    const settings = {
        dots: false,
        autoplay: true,
        arrows: false,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        initialSlide: 0,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1, infinite: true, dots: false } },
            { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2, initialSlide: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } }
        ]
    };

    const slidesContent = [
        {
            id: 1,
            name: 'Mariam A.',
            text: '"House of bore made it easy to shop across shoes and fashion in one place. The pieces felt curated instead of random, and delivery was smooth."'
        },
        {
            id: 2,
            name: 'Kevin O.',
            text: '"I picked up sneakers and a men\'s outfit from House of bore, and both looked exactly like the photos. The whole experience felt clean and trustworthy."'
        },
        {
            id: 3,
            name: 'Sharon N.',
            text: '"What stood out to me was how easy it was to move from women\'s fashion to jeweleries and still feel like I was shopping one cohesive brand."'
        },
        {
            id: 4,
            name: 'Derrick T.',
            text: '"House of bore feels like the kind of store you bookmark. The prices are accessible, the styling is modern, and the top sellers actually make sense."'
        },
        {
            id: 5,
            name: 'Faith W.',
            text: '"I ordered a bag and jeweleries for an event look and got compliments all night. The product pages gave me enough confidence to buy quickly."'
        },
        {
            id: 6,
            name: 'Joan C.',
            text: '"I like that House of bore doesn\'t feel overcrowded. It highlights the right categories and makes discovering new arrivals really simple."'
        }
    ];

    return (
        <section className={happycustomerStyles.happycustomercontainer}>
            <Container fluid className='py-5'>
                <Row>
                    <Col>
                        <div className='d-flex align-items-lg-center align-items-end justify-content-between mb-4'>
                            <div>
                                <span className={happycustomerStyles.sectionTag}>{siteContent.brand.name}</span>
                                <h2 className={happycustomerStyles.happycustomertitle}>WHY CUSTOMERS COME BACK</h2>
                                <p className={happycustomerStyles.sectionText}>
                                    Social proof matters on an ecommerce homepage, so this section now sounds like real feedback for House of bore.
                                </p>
                            </div>
                            <div className='d-flex'>
                                <button className={happycustomerStyles.sliderarrows} onClick={previous}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.70406 4.4541L2.95406 11.2041C2.84918 11.3086 2.76597 11.4328 2.70919 11.5696C2.6524 11.7063 2.62317 11.8529 2.62317 12.001C2.62317 12.149 2.6524 12.2957 2.70919 12.4324C2.76597 12.5691 2.84918 12.6933 2.95406 12.7979L9.70406 19.5479C9.91541 19.7592 10.2021 19.8779 10.5009 19.8779C10.7998 19.8779 11.0865 19.7592 11.2978 19.5479C11.5092 19.3365 11.6279 19.0499 11.6279 18.751C11.6279 18.4521 11.5092 18.1654 11.2978 17.9541L6.46875 13.125L20.25 13.125C20.5484 13.125 20.8345 13.0065 21.0455 12.7955C21.2565 12.5846 21.375 12.2984 21.375 12C21.375 11.7017 21.2565 11.4155 21.0455 11.2045C20.8345 10.9936 20.5484 10.875 20.25 10.875L6.46875 10.875L11.2987 6.04598C11.5101 5.83463 11.6288 5.54799 11.6288 5.2491C11.6288 4.95022 11.5101 4.66357 11.2987 4.45223C11.0874 4.24088 10.8008 4.12215 10.5019 4.12215C10.203 4.12215 9.91634 4.24088 9.705 4.45223L9.70406 4.4541Z" fill="black" />
                                    </svg>
                                </button>
                                <button className={happycustomerStyles.sliderarrows} onClick={next}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.2959 4.4541L21.0459 11.2041C21.1508 11.3086 21.234 11.4328 21.2908 11.5696C21.3476 11.7063 21.3768 11.8529 21.3768 12.001C21.3768 12.149 21.3476 12.2957 21.2908 12.4324C21.234 12.5691 21.1508 12.6933 21.0459 12.7979L14.2959 19.5479C14.0846 19.7592 13.7979 19.8779 13.4991 19.8779C13.2002 19.8779 12.9135 19.7592 12.7022 19.5479C12.4908 19.3365 12.3721 19.0499 12.3721 18.751C12.3721 18.4521 12.4908 18.1654 12.7022 17.9541L17.5313 13.125L3.75 13.125C3.45163 13.125 3.16548 13.0065 2.9545 12.7955C2.74353 12.5846 2.625 12.2984 2.625 12C2.625 11.7017 2.74353 11.4155 2.95451 11.2045C3.16548 10.9936 3.45163 10.875 3.75 10.875L17.5313 10.875L12.7013 6.04598C12.4899 5.83463 12.3712 5.54799 12.3712 5.2491C12.3712 4.95022 12.4899 4.66357 12.7013 4.45223C12.9126 4.24088 13.1992 4.12215 13.4981 4.12215C13.797 4.12215 14.0837 4.24088 14.295 4.45223L14.2959 4.4541Z" fill="black" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="slider-container" id='happycustomerslider'>
                            <Slider
                                ref={slider => {
                                    sliderRef = slider;
                                }}
                                {...settings}
                            >
                                {slidesContent.map((item) => (
                                    <div key={item.id}>
                                        <Card className={happycustomerStyles.slidercard}>
                                            <Card.Body>
                                                <div className='mb-2'>
                                                    <svg width="139" height="23" viewBox="0 0 139 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M11.2895 0L14.4879 6.8872L22.0264 7.80085L16.4647 12.971L17.9253 20.4229L11.2895 16.731L4.6537 20.4229L6.11428 12.971L0.552547 7.80085L8.09104 6.8872L11.2895 0Z" fill="#FFC633" />
                                                        <path d="M40.3553 0L43.5537 6.8872L51.0922 7.80085L45.5305 12.971L46.9911 20.4229L40.3553 16.731L33.7195 20.4229L35.1801 12.971L29.6183 7.80085L37.1568 6.8872L40.3553 0Z" fill="#FFC633" />
                                                        <path d="M69.421 0L72.6195 6.8872L80.158 7.80085L74.5962 12.971L76.0568 20.4229L69.421 16.731L62.7852 20.4229L64.2458 12.971L58.6841 7.80085L66.2226 6.8872L69.421 0Z" fill="#FFC633" />
                                                        <path d="M98.4868 0L101.685 6.8872L109.224 7.80085L103.662 12.971L105.123 20.4229L98.4868 16.731L91.851 20.4229L93.3116 12.971L87.7498 7.80085L95.2883 6.8872L98.4868 0Z" fill="#FFC633" />
                                                        <path d="M127.553 0L130.751 6.8872L138.289 7.80085L132.728 12.971L134.188 20.4229L127.553 16.731L120.917 20.4229L122.377 12.971L116.816 7.80085L124.354 6.8872L127.553 0Z" fill="#FFC633" />
                                                    </svg>
                                                </div>
                                                <Card.Title className='d-flex align-items-end fw-semibold mb-3'>
                                                    {item.name}
                                                    <span className='ms-1'>
                                                        <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12 2.8291C10.0716 2.8291 8.18657 3.40093 6.58319 4.47227C4.97982 5.54362 3.73013 7.06636 2.99218 8.84794C2.25422 10.6295 2.06114 12.5899 2.43735 14.4812C2.81355 16.3725 3.74215 18.1098 5.10571 19.4734C6.46928 20.837 8.20656 21.7656 10.0979 22.1418C11.9892 22.518 13.9496 22.3249 15.7312 21.5869C17.5127 20.849 19.0355 19.5993 20.1068 17.9959C21.1782 16.3925 21.75 14.5075 21.75 12.5791C21.7473 9.99408 20.7192 7.51571 18.8913 5.68783C17.0634 3.85994 14.585 2.83183 12 2.8291ZM16.2806 10.8597L11.0306 16.1097C10.961 16.1795 10.8783 16.2348 10.7872 16.2725C10.6962 16.3103 10.5986 16.3297 10.5 16.3297C10.4014 16.3297 10.3038 16.3103 10.2128 16.2725C10.1218 16.2348 10.039 16.1795 9.96938 16.1097L7.71938 13.8597C7.57865 13.719 7.49959 13.5281 7.49959 13.3291C7.49959 13.1301 7.57865 12.9392 7.71938 12.7985C7.86011 12.6577 8.05098 12.5787 8.25 12.5787C8.44903 12.5787 8.6399 12.6577 8.78063 12.7985L10.5 14.5188L15.2194 9.79848C15.2891 9.72879 15.3718 9.67352 15.4628 9.63581C15.5539 9.59809 15.6515 9.57868 15.75 9.57868C15.8486 9.57868 15.9461 9.59809 16.0372 9.63581C16.1282 9.67352 16.2109 9.72879 16.2806 9.79848C16.3503 9.86816 16.4056 9.95088 16.4433 10.0419C16.481 10.133 16.5004 10.2306 16.5004 10.3291C16.5004 10.4276 16.481 10.5252 16.4433 10.6163C16.4056 10.7073 16.3503 10.79 16.2806 10.8597Z" fill="#01AB31" />
                                                        </svg>
                                                    </span>
                                                </Card.Title>
                                                <Card.Text className={happycustomerStyles.slidertext}>
                                                    {item.text}
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
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

export default HappyCustomer;
