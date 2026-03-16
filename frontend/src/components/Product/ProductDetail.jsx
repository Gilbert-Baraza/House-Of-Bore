import React, { useContext } from 'react';
import productdetailStyles from './ProductDetail.module.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import { ProductDetailContext } from '../../context/ProductDetailContext';

const ProductDetail = () => {
    const { productDetail } = useContext(ProductDetailContext);

    if (!productDetail || !productDetail.title) {
        return null;
    }

    const ratingsContent = [
        {
            id: 1,
            name: 'Amina K.',
            text: `I love how the ${productDetail.title.toLowerCase()} feels in person. The quality is solid and it looks even better styled.`,
            date: 'March 10, 2026',
        },
        {
            id: 2,
            name: 'Brian M.',
            text: `House of bore nailed the finish on this item. It feels premium and the fit is exactly what I expected.`,
            date: 'March 12, 2026',
        }
    ];

    const faqsData = [
        {
            id: 1,
            question: `What material is used for the ${productDetail.title.toLowerCase()}?`,
            answer: productDetail.material,
        },
        {
            id: 2,
            question: 'How should I care for this item?',
            answer: productDetail.care,
        },
        {
            id: 3,
            question: 'What kind of fit should I expect?',
            answer: productDetail.fit,
        }
    ];

    return (
        <section className={productdetailStyles.productdetailcontainer}>
            <Container fluid className='pb-4'>
                <Row>
                    <Col>
                        <Tabs defaultActiveKey="product-details" id="product-details-tabs" className="mb-4 border-0" justify>
                            <Tab eventKey="product-details" title="Product Details">
                                <h4 className='fw-semibold mb-4'>Product specifications</h4>
                                <Row>
                                    <Col lg={5} xs={6}>
                                        <p className={`${productdetailStyles.productspecstext} border-bottom border-tertiary pb-3`}>Material composition</p>
                                        <p className={`${productdetailStyles.productspecstext} border-bottom border-tertiary pb-3`}>Care instructions</p>
                                        <p className={`${productdetailStyles.productspecstext} border-bottom border-tertiary pb-3`}>Fit type</p>
                                        <p className={`${productdetailStyles.productspecstext} border-bottom border-tertiary pb-3`}>Pattern</p>
                                    </Col>
                                    <Col lg={7} xs={6}>
                                        <p className='border-bottom border-tertiary pb-3 fw-semibold'>{productDetail.material}</p>
                                        <p className='border-bottom border-tertiary pb-3 fw-semibold'>{productDetail.care}</p>
                                        <p className='border-bottom border-tertiary pb-3 fw-semibold'>{productDetail.fit}</p>
                                        <p className='border-bottom border-tertiary pb-3 fw-semibold'>{productDetail.pattern}</p>
                                    </Col>
                                </Row>
                            </Tab>
                            <Tab eventKey="rating-reviews" title="Rating & Reviews">
                                <Row className='py-4'>
                                    {ratingsContent.map((item) => (
                                        <Col lg={6} md={6} className='mb-4' key={item.id}>
                                            <Card className={productdetailStyles.slidercard}>
                                                <Card.Body>
                                                    <Card.Title className='fw-semibold mb-3'>{item.name}</Card.Title>
                                                    <Card.Text className={productdetailStyles.slidertext}>{item.text}</Card.Text>
                                                    <p className={`${productdetailStyles.slidertext} fw-medium`}>Posted on {item.date}</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Tab>
                            <Tab eventKey="faqs" title="FAQs">
                                <Row>
                                    <Col>
                                        <Accordion id='product-faq'>
                                            {faqsData.map((item) => (
                                                <Accordion.Item key={item.id} eventKey={`${item.id}`} className='border-0 border-bottom border-tertiary'>
                                                    <Accordion.Header>{item.question}</Accordion.Header>
                                                    <Accordion.Body>{item.answer}</Accordion.Body>
                                                </Accordion.Item>
                                            ))}
                                        </Accordion>
                                    </Col>
                                </Row>
                            </Tab>
                        </Tabs>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default ProductDetail;
