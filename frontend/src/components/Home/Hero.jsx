import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import heroStyles from './Hero.module.css';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import { siteContent } from '../../data/siteContent';

const Hero = () => {
    const { hero } = siteContent;

    return (
        <section className={`${heroStyles.herobg} my-3`}>
            <Container className={`${heroStyles.herocontainer} py-lg-5 pt-5`}>
                <Row>
                    <Col lg={6}>
                        <div>
                            <span className={heroStyles.eyebrow}>{hero.eyebrow}</span>
                            <h2 className={heroStyles.herotitle}>{hero.title}</h2>
                            <p className='my-3'>{hero.description}</p>
                            <Button variant="dark" className={`${heroStyles.herobtn} my-3`}>
                                <Link to={hero.ctaHref} className='text-decoration-none text-white'>
                                    {hero.ctaLabel}
                                </Link>
                            </Button>
                        </div>
                        <div className='d-flex my-lg-5 my-3' id={heroStyles.herostats}>
                            {hero.stats.map((stat, index) => (
                                <div
                                    key={stat.label}
                                    className={index < hero.stats.length - 1 ? 'border-end border-tertiary me-lg-4 pe-lg-4 me-md-3 pe-md-3 pe-3 me-3' : ''}
                                >
                                    <h3 className={`${heroStyles.herostatstitle} fw-semibold`}>{stat.value}</h3>
                                    <span>{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </Col>
                    <Col lg={6}>
                        <div className={`${heroStyles.heroimg} position-relative`}>
                            <div className='position-absolute top-0 start-100' id={heroStyles.icon1}>
                                <svg width="104" height="104" viewBox="0 0 104 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M52 0C53.7654 27.955 76.0448 50.2347 104 52C76.0448 53.7654 53.7654 76.0448 52 104C50.2347 76.0448 27.955 53.7654 0 52C27.955 50.2347 50.2347 27.955 52 0Z" fill="black" />
                                </svg>
                            </div>
                            <div className='position-absolute top-50'>
                                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M28 0C28.9506 15.0527 40.9472 27.0495 56 28C40.9472 28.9506 28.9506 40.9472 28 56C27.0495 40.9472 15.0527 28.9506 0 28C15.0527 27.0495 27.0495 15.0527 28 0Z" fill="black" />
                                </svg>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
            <div className={heroStyles.brandscon}>
                {hero.featuredBrands.map((brand) => (
                    <div key={brand} className={heroStyles.brandPill}>
                        {brand}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Hero;
