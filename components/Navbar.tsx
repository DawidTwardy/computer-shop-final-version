import NavLink from '@/components/nav-link';

export default function Navbar() {
    return (
        <nav>
            <ul>
                <li>
                    <NavLink href="/">Strona Główna</NavLink>
                </li>
                <li>
                    <NavLink href="/product-list">Lista Produktów</NavLink>
                </li>
                <li>
                    <NavLink href="/basket">Koszyk</NavLink>
                </li>
                <li>
                    <NavLink href="/order-history">Historia Zakupów</NavLink>
                </li>
                <li>
                    <NavLink href="/about">O Sklepie</NavLink>
                </li>
            </ul>
        </nav>
    );
}