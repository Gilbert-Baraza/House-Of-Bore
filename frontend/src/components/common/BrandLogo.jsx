import { Link } from "react-router-dom";
import { siteContent } from "../../data/siteContent";

const BrandLogo = () => (
  <Link
    to="/"
    className="text-decoration-none text-dark fw-bold"
    style={{ fontSize: "1.75rem", letterSpacing: "-0.04em" }}
  >
    {siteContent.brand.name}
  </Link>
);

export default BrandLogo;
