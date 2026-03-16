import React from 'react';
import footerStyles from './Footer.module.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import BrandLogo from '../common/BrandLogo';
import { siteContent } from '../../data/siteContent';

const Footer = () => {
    const { footer } = siteContent;

    return (
        <section className={footerStyles.footercontainer}>
            <Container fluid className='py-lg-5 mt-lg-5 mt-3 py-3'>
                <Row>
                    <Col>
                        <div className={footerStyles.footergrid}>
                            <div>
                                <div className='mb-4'>
                                    <BrandLogo />
                                </div>
                                <p className={footerStyles.desctext}>{footer.description}</p>
                                <div className={footerStyles.socialiconscontainer}>
                                    <span><button type="button" className={footerStyles.footerAction}>X</button></span>
                                    <span><button type="button" className={footerStyles.footerAction}>Fb</button></span>
                                    <span><button type="button" className={footerStyles.footerAction}>Ig</button></span>
                                    <span><button type="button" className={footerStyles.footerAction}>Gh</button></span>
                                </div>
                            </div>
                            {footer.columns.map((column) => (
                                <div key={column.title}>
                                    <p className='text-uppercase fw-semibold'>{column.title}</p>
                                    <ul className='list-unstyled'>
                                        {column.links.map((item) => (
                                            <li key={item} className='py-2'>
                                                <button type="button" className={`${footerStyles.footerlinks} ${footerStyles.footerAction} text-capitalize`}>
                                                    {item}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className='mb-3'>
                            <svg width="auto" height="1" viewBox="0 0 1240 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <line x1="-4.37114e-08" y1="0.5" x2="1240" y2="0.499892" stroke="black" strokeOpacity="0.1" />
                            </svg>
                        </div>
                        <div className='d-flex align-items-center justify-content-between flex-lg-row flex-column'>
                            <span className={`d-block mb-lg-0 mb-3 ${footerStyles.footerlinks}`}>{footer.copyright}</span>
                            <span className={footerStyles.footerlinks}>Visa | Mastercard | PayPal | Apple Pay | GPay</span>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Footer;
