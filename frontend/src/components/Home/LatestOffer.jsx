import React from 'react';
import latestofferStyles from './LatestOffer.module.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { siteContent } from '../../data/siteContent';

const LatestOffer = () => {
    const { newsletter } = siteContent;

    return (
        <section className={latestofferStyles.latestoffercontainer}>
            <Container fluid className={`${latestofferStyles.latestofferbg} py-lg-5 p-4`}>
                <Row className='justify-content-evenly'>
                    <Col lg={6} className='mb-lg-0 mb-3'>
                        <div>
                            <h2 className={`${latestofferStyles.latestoffertitle} text-white`}>{newsletter.title}</h2>
                        </div>
                    </Col>
                    <Col lg={4} className='mb-lg-0 mb-3'>
                        <Form>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Control className={latestofferStyles.formcontrol} type="email" placeholder={newsletter.placeholder} />
                            </Form.Group>
                            <Button variant="light" className={`${latestofferStyles.formbtn} d-block w-100`}>
                                {newsletter.buttonLabel}
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default LatestOffer;
