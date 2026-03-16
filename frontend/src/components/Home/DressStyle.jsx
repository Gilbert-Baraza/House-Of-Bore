import React from 'react'
import dressstyleStyles from './DressStyle.module.css'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card'
import { Link } from 'react-router-dom'
import { siteContent } from '../../data/siteContent';

const DressStyle = () => {
    const browseCards = [
        {
            title: 'Shoes',
            description: 'Everyday pairs, standout sneakers, and clean finishing touches.',
            className: dressstyleStyles.dressstylecard1
        },
        {
            title: 'Men',
            description: 'Sharp essentials and relaxed fits built for daily wear.',
            className: dressstyleStyles.dressstylecard2
        },
        {
            title: 'Women',
            description: 'Bold staples, event-ready looks, and confident everyday style.',
            className: dressstyleStyles.dressstylecard3
        },
        {
            title: 'Jeweleries',
            description: 'Small details that elevate every outfit.',
            className: dressstyleStyles.dressstylecard4
        }
    ];

    return (
        <section className={dressstyleStyles.dressstylecontainer}>
            <Container fluid className='p-lg-5 p-md-5'>
                <div className='text-center mb-5 pt-lg-3 pt-5'>
                    <span className={dressstyleStyles.sectionTag}>{siteContent.brand.name}</span>
                    <h2 className={`${dressstyleStyles.dressstyletitle} text-uppercase`}>Browse House of bore Categories</h2>
                    <p className={dressstyleStyles.sectionText}>
                        Start with the collections your customers will shop most and keep the homepage focused on what House of bore sells best.
                    </p>
                </div>
                <Row>
                    {browseCards.map((item, index) => (
                        <Col lg={index === 0 || index === 3 ? 5 : 7} md={index === 0 || index === 3 ? 5 : 7} className='mb-3' key={item.title}>
                            <Link to='/shop' className='text-decoration-none'>
                                <Card className={item.className}>
                                    <Card.Body className={dressstyleStyles.cardOverlay}>
                                        <Card.Title className={dressstyleStyles.dressstylecardtitle}>{item.title}</Card.Title>
                                        <Card.Text className={dressstyleStyles.cardText}>{item.description}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    )
}

export default DressStyle
