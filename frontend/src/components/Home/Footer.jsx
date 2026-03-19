import React from 'react';
import footerStyles from './Footer.module.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link, useLocation } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { FaPaypal } from 'react-icons/fa6';
import BrandLogo from '../common/BrandLogo';
import { siteContent } from '../../data/siteContent';

const socialLinks = [
    {
        label: 'WhatsApp',
        href: 'https://wa.me/254714663058',
        icon: FaWhatsapp
    },
    {
        label: 'Facebook',
        href: 'https://www.facebook.com/share/16vszsjpMT/',
        icon: FaFacebookF
    },
    {
        label: 'Instagram',
        href: 'https://www.instagram.com/houseofbore.ke/?utm_source=qr&r=nametag',
        icon: FaInstagram
    },
    {
        label: 'TikTok',
        href: 'https://www.tiktok.com/@labanbore?_r=1&_d=eeiak4idaia17j&sec_uid=MS4wLjABAAAAdJeck6hcFAoCAlurLYT_QcLwd4H0OzAGLETMoEhQjeojdhmEJLabrX3651SQseWD&share_author_id=7289060357144986629&sharer_language=en&source=h5_m&u_code=eae1db1ii55g89&timestamp=1761642948&user_id=7289060357144986629&sec_user_id=MS4wLjABAAAAdJeck6hcFAoCAlurLYT_QcLwd4H0OzAGLETMoEhQjeojdhmEJLabrX3651SQseWD&item_author_type=1&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7565227870038968076&share_link_id=c43514a4-fbff-43e4-a818-0e1322c4bf1a&share_app_id=1233&ugbiz_name=ACCOUNT&ug_btm=b8727%2Cb7360&social_share_type=5&enable_checksum=1',
        icon: FaTiktok
    }
];

const paymentMethods = [
    {
        label: 'M-Pesa'
    },
    {
        label: 'PayPal',
        icon: FaPaypal
    }
];

const Footer = () => {
    const { footer } = siteContent;
    const { pathname } = useLocation();

    const handleFooterLinkClick = (event, targetPath) => {
        if (pathname === targetPath) {
            event.preventDefault();
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
    };

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
                                    {socialLinks.map(({ label, href, icon: Icon }) => (
                                        <a
                                            key={label}
                                            href={href}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={label}
                                            className={footerStyles.socialIconLink}
                                        >
                                            <Icon />
                                        </a>
                                    ))}
                                </div>
                            </div>
                            {footer.columns.map((column) => (
                                <div key={column.title}>
                                    <p className='text-uppercase fw-semibold'>{column.title}</p>
                                    <ul className='list-unstyled'>
                                        {column.links.map((item) => {
                                            const targetPath = typeof item === 'string' ? '/' : item.href;

                                            return (
                                                <li key={typeof item === 'string' ? item : item.label} className='py-2'>
                                                    <Link
                                                        to={targetPath}
                                                        onClick={(event) => handleFooterLinkClick(event, targetPath)}
                                                        className={`${footerStyles.footerlinks} ${footerStyles.footerAction} text-capitalize text-decoration-none`}
                                                    >
                                                        {typeof item === 'string' ? item : item.label}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className='mb-3'>
                            <svg width="100%" height="1" viewBox="0 0 1240 1" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                <line x1="-4.37114e-08" y1="0.5" x2="1240" y2="0.499892" stroke="black" strokeOpacity="0.1" />
                            </svg>
                        </div>
                        <div className='d-flex align-items-center justify-content-between flex-lg-row flex-column'>
                            <span className={`d-block mb-lg-0 mb-3 ${footerStyles.footerlinks}`}>{footer.copyright}</span>
                            <div className={footerStyles.paymentMethods}>
                                {paymentMethods.map(({ label, icon: Icon }) => (
                                    <span key={label} className={footerStyles.paymentBadge}>
                                        {Icon ? <Icon /> : null}
                                        <span>{label}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Footer;
