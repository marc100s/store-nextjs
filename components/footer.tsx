import { APP_NAME } from "@/lib/constants";
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return ( <footer className="border-t">
        <div className="p-5 flex-center">
            <p>© {currentYear} {APP_NAME}</p>
        </div>
    </footer>  
    );
}
 
export default Footer;